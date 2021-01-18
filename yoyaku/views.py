from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, Http404
from django.utils.dateparse import parse_datetime
from django.db.models import Q
from django.core import mail
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import status, viewsets
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.parsers import FileUploadParser
from rest_framework.exceptions import ParseError
from rest_framework.decorators import api_view, action, parser_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
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

from .models import MyUser, Recurrence, Event, Subject, ClassInfo
from .serializers import MyUserSerializer, RecurrenceSerializer, EventSerializer, EventReadSerializer, SubjectSerializer, ClassInfoSerializer
from .permissions import IsAdminUser, IsLoggedInUserOrAdmin, IsLoggedInTeacherUser, IsLoggedInUserAndEventOwner


stripe.api_key = settings.STRIPE_SECRET


class ClassInfoViewSet(viewsets.ModelViewSet):
    queryset = ClassInfo.objects.all()
    serializer_class = ClassInfoSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            permission_classes = [IsLoggedInUserOrAdmin]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]


class UserViewSet(viewsets.ModelViewSet):
    queryset = MyUser.objects.all()
    serializer_class = MyUserSerializer

    def get_permissions(self):
        permission_classes = []
        if self.action in ('create', 'username_list', 'referral_code_list'):
            permission_classes = [AllowAny]
        elif self.action in ('retrieve', 'update', 'partial_update', 'events', 'change_password'):
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
            customer = None
            try:
                customer = stripe.Customer.create(email=request.data['email'],
                                                  name='{}, {}'.format(request.data['last_name'], request.data['first_name']),
                                                  payment_method=request.data['paymentMethodId'])
                stripe.Customer.modify(customer.id,
                                       invoice_settings={'default_payment_method': request.data['paymentMethodId']})

                trial_days = 30
                utc_now = datetime.now(timezone.utc)
                trial_end_datetime = utc_now + relativedelta.relativedelta(days=trial_days)
                datetime_next_month_first = utc_now + relativedelta.relativedelta(months=1)
                datetime_next_month_first = datetime_next_month_first.replace(day=1)
                datetime_next_month_first = datetime.combine(datetime_next_month_first.date(), time(12, 0), datetime_next_month_first.tzinfo)

                if datetime_next_month_first <= trial_end_datetime:
                    datetime_next_month_first = datetime_next_month_first + relativedelta.relativedelta(months=1)

                billing_cycle_anchor = int(datetime_next_month_first.timestamp())

                # Create the subscription
                subscription = stripe.Subscription.create(
                    customer=customer.id,
                    items=[
                        {
                            'price': request.data['priceId']
                        }
                    ],
                    trial_period_days=trial_days,
                    billing_cycle_anchor=billing_cycle_anchor,
                    expand=['latest_invoice.payment_intent', 'pending_setup_intent'],
                )

            except Exception as e:
                if customer:
                    stripe.Customer.delete(customer.id)
                print(e)
                return Response(data={'error': '登録できませんでした。サポートに連絡して下さい。'})
            serializer.save(stripeCustomerId=customer.id)
        else:
            self.perform_create(serializer)

        mail.send_mail(
            'Success Academy - {} {}様登録確認しました'.format(request.data['last_name'], request.data['first_name']),
            'ご登録ありがとうございます。\n{} {}様のログイン情報は以下のとおりです。\nユーザーID：{}\nパスワード：{}\n\n'
            '以下のページにログインしてクラスZoom情報を確認できます。\n{}\n\n＊このアドレスは送信専用です。ご返信いただいても回答はいたしかねます。'.format(
                request.data['last_name'], request.data['first_name'], request.data['username'], '*****', settings.BASE_URL),
            None,
            [request.data['email'], 'success.academy.us@gmail.com'],
            fail_silently=False,
        )
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=False)
    def teacher_list(self, request):
        teachers = MyUser.objects.filter(user_type='TEACHER')
        serializer = MyUserSerializer(teachers, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def student_list(self, request):
        students = MyUser.objects.filter(user_type='STUDENT')
        serializer = MyUserSerializer(students, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def username_list(self, request):
        users = MyUser.objects.all()
        username_list = []
        for user in users:
            username_list.append(user.username)
        return Response(username_list)

    @action(detail=False)
    def referral_code_list(self, request):
        users = MyUser.objects.all()
        referral_code_list = []
        for user in users:
            referral_code_list.append(user.referral_code)
        return Response(referral_code_list)

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

    @action(detail=True, methods=['post'])
    def change_password(self, request, pk=None):
        user = MyUser.objects.get(pk=pk)
        user.set_password(request.data['newPassword'])
        user.save()
        return Response()


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


class StripePriceList(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        r = stripe.Price.list(active=True, type='recurring', expand=['data.product'])
        return Response(r)


class StripeProduct(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        productId = request.query_params.get('productId')
        try:
            product = stripe.Product.retrieve(productId)
        except Exception as e:
            return Response(data={'error': 'product not found'})
        return Response(product)


class StripeSubscription(APIView):

    def get_permissions(self):
        permission_classes = [AllowAny]
        if self.request.method == 'GET':
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get(self, request, format=None):
        subscriptionId = request.query_params.get('subscriptionId')
        try:
            subscription = stripe.Subscription.retrieve(subscriptionId)
        except Exception as e:
            return Response(data={'error': 'subscription not found'})
        return Response(subscription)


class StripeSetupIntent(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        try:
            setup_intent = stripe.SetupIntent.create(
                payment_method_types=["card"],
            )
        except Exception:
            return Response(data={'error': '登録できませんでした。Stripe内部エラーが発生しました。もう一度お試し下さい。またはサポートに連絡して下さい。'})
        return Response(setup_intent)


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
        elif event.type == 'customer.deleted':
            print('customer.deleted')
            customer = event.data.object
        elif event.type == 'customer.subscription.created':
            print('customer.subscription.created')
            subscription = event.data.object
            user = MyUser.objects.get(stripeCustomerId=subscription['customer'])
            user.stripeSubscriptionId = subscription['id']
            user.stripeProductId = subscription['items']['data'][0]['price']['product']
            user.save()
        elif event.type == 'customer.subscription.trial_will_end':
            print('customer.subscription.trial_will_end')
            subscription = event.data.object
            user = MyUser.objects.get(stripeCustomerId=subscription['customer'])
            if user.student_profile.should_pay_signup_fee:
                mail.send_mail(
                    'Success Academy - {} {}様　トライアル期間がまもなく終了します'.format(request.data['last_name'], request.data['first_name']),
                    '30日のトライアル期間が3日後に終了します。$100の入会費を3日後に請求させていただきます。'
                    '\nご不明な点があればいつでもご連絡ください。\n\nSuccess Academy 南\n\nマイページ：{}'.format(settings.BASE_URL),
                    None,
                    [request.data['email'], 'success.academy.us@gmail.com'],
                    fail_silently=False,
                )
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

            previous = event.data.previous_attributes
            if previous.get('status') == 'trialing' and subscription['status'] in ('active', 'past_due') and user.student_profile.should_pay_signup_fee:
                signup_fee_id = stripe.Price.list(active=True, type='one_time')['data'][0]['id']
                stripe.InvoiceItem.create(
                    customer=subscription['customer'],
                    price=signup_fee_id,
                )
                stripe.Invoice.create(
                    customer=subscription['customer'],
                    auto_advance=True
                )
                user.student_profile.should_pay_signup_fee = False
                user.student_profile.save()
        elif event.type == 'customer.subscription.deleted':
            print('customer.subscription.deleted')
            subscription = event.data.object
            user = MyUser.objects.get(stripeCustomerId=subscription['customer'])
            user.stripeSubscriptionId = None
            user.stripeProductId = None
            user.stripeSubscriptionProvision = False
            user.save()
        elif event.type == 'product.updated':
            print('product.updated')
            product = event.data.object
        else:
            return Response(status=status.HTTP_204_NO_CONTENT)

        return Response(status=status.HTTP_200_OK)


class PasswordReset(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        try:
            user = MyUser.objects.get(username=request.data.get('username'))
            password_reset = MyUser.objects.make_random_password(length=8)
            mail.send_mail(
                'Success Academy - {}様の臨時パスワード'.format(request.data['username']),
                '''パスワードがリセットされました。以下の臨時パスワードでログインしてパスワードを変更して下さい。
                
臨時パスワード：{}
{}
                
＊このアドレスは送信専用です。ご返信いただいても回答はいたしかねます。'''.format(password_reset, settings.BASE_URL),
                None,
                [user.email],
                fail_silently=False,
            )
            user.set_password(password_reset)
            user.save()
        except ObjectDoesNotExist:
            return Response(status=status.HTTP_200_OK, data={'error': 'そのユーザーが見つかりませんでした。'})
        except Exception:
            return Response(status=status.HTTP_200_OK, data={'error': 'パスワードリセットできませんでした。アドミンに連絡して下さい。'})
        return Response(status=status.HTTP_201_CREATED)


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
