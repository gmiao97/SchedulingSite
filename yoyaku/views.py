from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, Http404
from django.utils.dateparse import parse_datetime
from rest_framework import status, viewsets
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.decorators import api_view, action
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from dateutil.rrule import rrule, FREQNAMES
from dateutil.parser import parse
from datetime import datetime, date, time, timezone, timedelta
import copy

from .models import MyUser, Recurrence, Event, Subject
from .serializers import MyUserSerializer, RecurrenceSerializer, EventSerializer, EventReadSerializer, SubjectSerializer
from .permissions import IsAdminUser, IsLoggedInUserOrAdmin, IsLoggedInTeacherUser, IsLoggedInUserAndEventOwner


class UserViewSet(viewsets.ModelViewSet):
    queryset = MyUser.objects.all()
    serializer_class = MyUserSerializer

    def get_permissions(self):
        permission_classes = []
        if self.action == 'create':
            permission_classes = [AllowAny]
        elif self.action in ('retrieve', 'update', 'partial_update', 'events'):
            permission_classes = [IsLoggedInUserOrAdmin]
        elif self.action == 'list' or self.action == 'destroy':
            permission_classes = [IsAdminUser]
        elif self.action == 'student_list':
            permission_classes = [IsLoggedInTeacherUser | IsAdminUser]
        return [permission() for permission in permission_classes]

    @action(detail=False)
    def student_list(self, request):
        students = self.queryset.filter(user_type='STUDENT')
        serializer = MyUserSerializer(students, many=True)
        return Response(serializer.data)

    @action(detail=True)
    def events(self, request, pk=None):
        """
        get a specific user's events between a start and end datetime
        :param request: request from the client
        :param pk: primary key of user whose events are to be returned
        :return: Response containing serialized list of events
        """
        events = None
        user = MyUser.objects.get(pk=pk)
        self.check_object_permissions(request, user)
        active_start = parse_datetime(request.query_params.get('start', None))
        active_end = parse_datetime(request.query_params.get('end', None))
        if user.user_type == 'TEACHER':
            events = user.teacherEvents.filter(start__gte=active_start).filter(end__lte=active_end)
        elif user.user_type == 'STUDENT':
            events = user.studentEvents.filter(start__gte=active_start).filter(end__lte=active_end)
        serializer = EventReadSerializer(events, many=True)
        return Response(serializer.data)


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def get_permissions(self):
        permission_classes = []
        if self.action in ('retrieve', 'create', 'update', 'partial_update', 'destroy'):
            permission_classes = [IsLoggedInUserAndEventOwner]
        elif self.action == 'list':
            permission_classes = [IsAdminUser]
        elif self.action == 'destroy_recurrence':
            permission_classes = [IsLoggedInTeacherUser]

        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return EventReadSerializer
        return EventSerializer

    # Override
    def create(self, request, *args, **kwargs):
        if request.data.get('isRecurrence'):
            data_to_serialize = []
            recurrence_data = request.data.pop('recurrence')
            dtstart = parse(recurrence_data.get('dtstart')).date()
            freq = recurrence_data.get('freq')
            interval = recurrence_data.get('interval')
            until = parse(recurrence_data.get('until')).date()
            start_time = parse(request.data.get('start')).time()
            end_time = parse(request.data.get('end')).time()
            tz_info = parse(request.data.get('start')).tzinfo

            recurrence_dates = [dt.date() for dt in rrule(dtstart=dtstart, freq=FREQNAMES.index(freq), interval=interval, until=until)]

            recurrence_serializer = RecurrenceSerializer(data=recurrence_data)
            recurrence_serializer.is_valid(raise_exception=True)
            recurrence_instance = recurrence_serializer.save()
            recurrence_instance_id = recurrence_instance.id
            request.data['recurrence'] = recurrence_instance_id

            for dt in recurrence_dates:
                start = datetime.combine(dt, start_time, tz_info)
                end = datetime.combine(dt, end_time, tz_info)
                request.data['start'] = start
                request.data['end'] = end
                data_to_serialize.append(copy.deepcopy(request.data))

            # Original code for create with 'many' set as True
            serializer = self.get_serializer(data=data_to_serialize, many=True)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            return super().create(request, *args, **kwargs)

    # Override
    def update(self, request, *args, **kwargs):
        if request.data.get('isRecurrence'):
            is_edit_series = request.data.get('editSeries')

            if is_edit_series:
                now_datetime = datetime.now(tz=timezone.utc)

                event_instance = self.get_object()
                recurrence_instance = event_instance.recurrence

                instance_recurrence_data = RecurrenceSerializer(recurrence_instance).data
                request_recurrence_data = request.data.get('recurrence')

                request_start_time = parse(request.data.get('start')).time()
                request_end_time = parse(request.data.get('end')).time()
                request_tz_info = parse(request.data.get('start')).tzinfo

                request_dtstart = parse(request_recurrence_data.get('dtstart')).date()
                request_interval = request_recurrence_data.get('interval')
                request_until = parse(request_recurrence_data.get('until')).date()
                request_freq = request_recurrence_data.get('freq')

                instance_dtstart = recurrence_instance.dtstart.date()
                instance_interval = recurrence_instance.interval
                instance_until = recurrence_instance.until.date()
                instance_freq = instance_recurrence_data.get('freq')

                if request_recurrence_data == instance_recurrence_data:
                    request_data = copy.deepcopy(request.data)
                    request_data.pop('isRecurrence')
                    request_data.pop('recurrence')
                    for event in recurrence_instance.recurrenceEvents.filter(start__gte=now_datetime):
                        instance = Event.objects.get(pk=event.id)
                        request_data['id'] = event.id
                        request_data['start'] = datetime.combine(instance.start.date(), request_start_time, request_tz_info)
                        request_data['end'] = datetime.combine(instance.end.date(), request_end_time, request_tz_info)
                        serializer = self.get_serializer(instance, data=request_data, partial=True)
                        serializer.is_valid(raise_exception=True)
                        self.perform_update(serializer)
                        if getattr(instance, '_prefetched_objects_cache', None):
                            # If 'prefetch_related' has been applied to a queryset, we need to
                            # forcibly invalidate the prefetch cache on the instance.
                            instance._prefetched_objects_cache = {}
                    return Response(status=status.HTTP_202_ACCEPTED)
                elif request_freq != instance_freq:
                    request.data['delete_from'] = datetime.combine(request_dtstart, time(), request_tz_info)
                    self.destroy_recurrence(request, pk=recurrence_instance.id)
                    request.data.pop('delete_from')
                    return self.create(request, *args, **kwargs)
                else:
                    data_to_serialize = []
                    recurrence_instance_id = recurrence_instance.id
                    recurrence_dates = []
                    request.data['recurrence'] = recurrence_instance_id

                    if request_dtstart < instance_dtstart:
                        recurrence_dates += [dt.date() for dt in rrule(dtstart=request_dtstart, freq=FREQNAMES.index(instance_freq),
                                                                       interval=instance_interval, until=instance_dtstart - timedelta(days=1))]
                        recurrence_instance.dtstart = datetime.combine(request_dtstart, request_start_time, request_tz_info)
                        recurrence_instance.save(update_fields=['dtstart'])
                    if request_dtstart > instance_dtstart:
                        recurrence_instance.recurrenceEvents.filter(start__gte=now_datetime, start__lte=datetime.combine(request_dtstart - timedelta(days=1), request_end_time, request_tz_info)).delete()
                        for event in recurrence_instance.recurrenceEvents.filter(start__lt=now_datetime):
                            event.isRecurrence = False
                            event.recurrence = None
                            event.save(update_fields=['isRecurrence', 'recurrence'])
                        recurrence_instance.dtstart = datetime.combine(request_dtstart, request_start_time, request_tz_info)
                        recurrence_instance.save(update_fields=['dtstart'])
                    if request_until < instance_until:
                        recurrence_instance.recurrenceEvents.filter(start__gte=datetime.combine(request_until + timedelta(days=1), request_start_time, request_tz_info)).delete()
                        recurrence_instance.until = datetime.combine(request_until, request_end_time, request_tz_info)
                        recurrence_instance.save(update_fields=['until'])
                    if request_until > instance_until:
                        recurrence_dates += [dt.date() for dt in rrule(dtstart=instance_until + timedelta(days=1), freq=FREQNAMES.index(instance_freq),
                                                                       interval=instance_interval, until=request_until)]
                        recurrence_instance.until = datetime.combine(request_until, request_end_time, request_tz_info)
                        recurrence_instance.save(update_fields=['until'])

                    for dt in recurrence_dates:
                        start = datetime.combine(dt, request_start_time, request_tz_info)
                        end = datetime.combine(dt, request_end_time, request_tz_info)
                        request.data['start'] = start
                        request.data['end'] = end
                        data_to_serialize.append(copy.deepcopy(request.data))

                    # Original code for create with 'many' set as True
                    serializer = self.get_serializer(data=data_to_serialize, many=True)
                    serializer.is_valid(raise_exception=True)
                    self.perform_create(serializer)
                    headers = self.get_success_headers(serializer.data)
                    return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            else:
                request.data.pop('isRecurrence')
                request.data.pop('recurrence')
                return self.partial_update(request, *args, **kwargs)
        else:
            return super().update(request, *args, **kwargs)

    # Override
    def destroy(self, request, *args, **kwargs):
        event_instance = self.get_object()
        recurrence_instance = event_instance.recurrence
        self.perform_destroy(event_instance)
        if recurrence_instance and recurrence_instance.recurrenceEvents.count() == 0:
            recurrence_instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def destroy_recurrence(self, request, pk=None):
        recurrence = Recurrence.objects.get(pk=pk)
        delete_from = request.data.get('delete_from')
        recurrence.recurrenceEvents.filter(start__gte=delete_from).delete()
        for event in recurrence.recurrenceEvents.filter(start__lt=delete_from):
            event.isRecurrence = False
            event.recurrence = None
            event.save(update_fields=['isRecurrence', 'recurrence'])
        recurrence.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ValidateToken(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        if request.user.is_authenticated:
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_401_UNAUTHORIZED)


class SubjectListByTeacher(APIView):
    def get(self, request, format=None):
        subjects = Subject.objects.filter(user__email=request.query_params.get('teacher_email'))
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)


class TeacherListBySubject(APIView):
    def get(self, request, format=None):
        teachers = MyUser.objects.filter(subject__subject_name=request.query_params.get('subject_name'))
        serializer = MyUserSerializer(teachers, many=True)
        return Response(serializer.data)


class LogoutAndBlacklistRefreshTokenForUserView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        try:
            refresh_token = request.data['refresh_token']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)
