from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, Http404
from django.utils.dateparse import parse_datetime
from django.db.models import Q
from django.conf import settings
from rest_framework import status, viewsets
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.parsers import FileUploadParser
from rest_framework.exceptions import ParseError
from rest_framework.decorators import api_view, action, parser_classes
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from dateutil.rrule import rrule, FREQNAMES
from dateutil.parser import parse
from datetime import datetime, date, time, timezone, timedelta
from dateutil import relativedelta
import copy
import requests
import stripe
import json

from .models import MyUser, Recurrence, Event, Subject
from .serializers import MyUserSerializer, RecurrenceSerializer, EventSerializer, EventReadSerializer, SubjectSerializer
from .permissions import IsAdminUser, IsLoggedInUserOrAdmin, IsLoggedInTeacherUser, IsLoggedInUserAndEventOwner


stripe.api_key = settings.STRIPE_SECRET


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
        elif self.action in ('student_list', 'teacher_list'):
            permission_classes = [IsLoggedInTeacherUser | IsAdminUser]
        return [permission() for permission in permission_classes]

    # Override
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(status=status.HTTP_200_OK, data={'error': str(serializer.errors)})
        if request.data['user_type'] == 'STUDENT':
            try:
                # Create a new customer object
                customer = stripe.Customer.create(email=request.data['email'],
                                                  name='{}, {}'.format(request.data['last_name'], request.data['first_name']))
            except Exception as e:
                return Response(status=status.HTTP_200_OK,
                                data={'error': 'Failed to register payment account. Please try again later or contact administrator'})
            serializer.save(stripeCustomerId=customer.id)
        else:
            self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=False)
    def teacher_list(self, request):
        teachers = self.queryset.filter(user_type='TEACHER')
        serializer = MyUserSerializer(teachers, many=True)
        return Response(serializer.data)

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
            events = user.teacherEvents.filter(start__gte=active_start, end__lte=active_end)
        elif user.user_type == 'STUDENT':
            events = user.studentEvents.filter(start__gte=active_start, end__lte=active_end)
        serializer = EventReadSerializer(events, many=True, context={'request': request})
        return Response(serializer.data)


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def get_permissions(self):
        permission_classes = []
        if self.action in ('retrieve', 'create', 'update', 'partial_update', 'destroy', 'update_file', 'destroy_file'):
            permission_classes = [IsLoggedInUserAndEventOwner | IsAdminUser]
        elif self.action in ('list', 'multiple_user_events'):
            permission_classes = [IsAdminUser]
        elif self.action == 'destroy_recurrence':
            permission_classes = [IsLoggedInTeacherUser | IsAdminUser]

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
            recurrence_data['dtstart'] = datetime.combine(recurrence_dates[0], start_time, tz_info)
            recurrence_data['until'] = datetime.combine(recurrence_dates[-1], end_time, tz_info)

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
                request.data.pop('comment')
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

                if request_freq != instance_freq:  # recreate recurrence from dtstart if frequency changes
                    request.data['delete_from'] = datetime.combine(max(request_dtstart, now_datetime.date()), time(), request_tz_info)
                    self.destroy_recurrence(request, pk=recurrence_instance.id)
                    request.data.pop('delete_from')
                    return self.create(request, *args, **kwargs)
                else:
                    # update all fields in future recurrence events
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

                    # extension or reduction of recurrence
                    if request_until != instance_until:
                        data_to_serialize = []
                        recurrence_instance_id = recurrence_instance.id
                        recurrence_dates = []
                        request.data['recurrence'] = recurrence_instance_id

                        if request_until < instance_until:
                            recurrence_instance.recurrenceEvents.filter(start__gte=datetime.combine(request_until + timedelta(days=1), request_start_time, request_tz_info)).delete()
                            updated_until = recurrence_instance.recurrenceEvents.order_by('-start')[0].end
                            recurrence_instance.until = updated_until
                            recurrence_instance.save(update_fields=['until'])
                        if request_until > instance_until:
                            recurrence_dates += [dt.date() for dt in rrule(dtstart=instance_until, freq=FREQNAMES.index(instance_freq),
                                                                           interval=instance_interval, until=request_until)][1:]
                            recurrence_instance.until = datetime.combine(recurrence_dates[-1], request_end_time, request_tz_info)
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

                    return Response(status=status.HTTP_202_ACCEPTED)
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

    @action(detail=False, methods=['post'])
    def multiple_user_events(self, request):
        user_list = request.data.get('selectedUsers')
        active_start = parse_datetime(request.data.get('start', None))
        active_end = parse_datetime(request.data.get('end', None))
        events = Event.objects.filter(
            Q(start__gte=active_start, end__lte=active_end) & (Q(teacher_user__in=user_list) | Q(student_user__in=user_list))).distinct()
        serializer = EventReadSerializer(events, many=True, context={'request': request})
        return Response(serializer.data)

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

    @action(detail=True, methods=['put'])
    def update_file(self, request, pk=None):
        event_instance = self.get_object()
        file = request.data.get('file')
        event_instance.file = file
        event_instance.save(update_fields=['file'])
        return Response(status=status.HTTP_202_ACCEPTED)

    @action(detail=True, methods=['delete'])
    def destroy_file(self, request, pk=None):
        event_instance = self.get_object()
        event_instance.file = None
        event_instance.save(update_fields=['file'])
        return Response(status=status.HTTP_204_NO_CONTENT)


class ValidateToken(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        if request.user.is_authenticated:
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_401_UNAUTHORIZED)


class SubscriptionPlan(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        r = requests.get(settings.PAYPAL_API_BASE_URL + '/v1/billing/plans', auth=(settings.PAYPAL_CLIENT_ID, settings.PAYPAL_SECRET))
        try:
            r.raise_for_status()
        except requests.exceptions.HTTPError as e:
            return Response(status=status.HTTP_424_FAILED_DEPENDENCY)
        return Response(r.json())


class StripePrice(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        r = stripe.Price.list(active=True, expand=['data.product'])
        return Response(r)


class StripeProduct(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        r = stripe.Product.list(active=True)
        return Response(r)


class StripeSubscription(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        try:
            # Attach the payment method to the customer
            stripe.PaymentMethod.attach(
                request.data['paymentMethodId'],
                customer=request.data['customerId'],
            )
            # Set the default payment method on the customer
            stripe.Customer.modify(
                request.data['customerId'],
                invoice_settings={
                    'default_payment_method': request.data['paymentMethodId'],
                },
            )

            utc_now = datetime.now(timezone.utc)
            datetime_next_month_first = datetime.combine(utc_now.date(), time(0, 0), utc_now.tzinfo).replace(day=1) + relativedelta.relativedelta(months=1)
            billing_cycle_anchor = int(datetime_next_month_first.timestamp())

            # Create the subscription
            subscription = stripe.Subscription.create(
                customer=request.data['customerId'],
                items=[
                    {
                        'price': request.data['priceId']
                    }
                ],
                trial_period_days=7,
                billing_cycle_anchor=billing_cycle_anchor,
                expand=['latest_invoice.payment_intent', 'pending_setup_intent'],
            )
            return Response(subscription, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(status=status.HTTP_200_OK, data={'error': str(e)})


class StripeCustomerPortal(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        customer_portal = stripe.billing_portal.Session.create(
            customer=request.data['customerId'],
            return_url=settings.STRIPE_RETURN_URL,
        )
        return Response(customer_portal)


class StripeWebhook(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        payload = request.body
        sig_header = request.META['HTTP_STRIPE_SIGNATURE']
        webhook_secret = settings.STRIPE_WEBHOOK_SECRET
        event = None

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        except ValueError as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # Handle the event
        if event.type == 'invoice.paid':
            print('invoice.paid')
            invoice = event.data.object
            user = MyUser.objects.get(stripeCustomerId=invoice['customer'])
            user.stripeSubscriptionProvision = True
            user.save()
        elif event.type == 'invoice.payment_failed':
            print('invoice.payment_failed')
            invoice = event.data.object
        elif event.type == 'invoice.payment_action_required':
            print('invoice.payment_action_required')
            invoice = event.data.object
        elif event.type == 'customer.created':
            print('customer.created')
            customer = event.data.object
        elif event.type == 'customer.subscription.created':
            print('customer.subscription.created')
            subscription = event.data.object
            user = MyUser.objects.get(stripeCustomerId=subscription['customer'])
            user.stripeSubscriptionId = subscription['id']
            user.stripeProductId = subscription['items']['data'][0]['price']['product']
            user.save()
        elif event.type == 'customer.subscription.updated':
            print('customer.subscription.updated')
            subscription = event.data.object
            user = MyUser.objects.get(stripeCustomerId=subscription['customer'])
            if subscription['status'] in ('active', 'past_due', 'trialing'):
                user.stripeSubscriptionProvision = True
            else:
                user.stripeSubscriptionProvision = False
            user.stripeSubscriptionId = subscription['id']
            user.stripeProductId = subscription['items']['data'][0]['price']['product']
            user.save()
        elif event.type == 'customer.subscription.deleted':
            print('customer.subscription.deleted')
            subscription = event.data.object
            user = MyUser.objects.get(stripeCustomerId=subscription['customer'])
            user.stripeSubscriptionId = None
            user.stripeProductId = None
            user.stripeSubscriptionProvision = False
            user.save()
        else:
            return Response(status=status.HTTP_204_NO_CONTENT)

        return Response(status=status.HTTP_200_OK)


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
