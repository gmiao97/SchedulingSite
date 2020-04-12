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
from datetime import datetime
import copy

from .models import MyUser, Event, Subject
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
        print(active_start, active_end)
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
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return EventReadSerializer
        return EventSerializer

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

            for date in recurrence_dates:
                start = datetime.combine(date, start_time, tz_info)
                end = datetime.combine(date, end_time, tz_info)
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
