import pytz
from django.core import mail
from rest_framework import serializers
from rest_framework.fields import FileField

from .models import StudentProfile, TeacherProfile, Recurrence, Event, Subject, MyUser


class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ['id', 'school_name', 'school_grade']


class TeacherProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherProfile
        fields = ['id', 'association']


class TimezoneField(serializers.Field):
    def to_representation(self, value):
        return value.zone

    def to_internal_value(self, data):
        return pytz.timezone(data)


class MyUserSerializer(serializers.ModelSerializer):
    student_profile = StudentProfileSerializer(many=False, required=False, allow_null=True)
    teacher_profile = TeacherProfileSerializer(many=False, required=False, allow_null=True)
    student_id = serializers.PrimaryKeyRelatedField(write_only=True, allow_null=True, required=False, queryset=StudentProfile.objects.all())
    teacher_id = serializers.PrimaryKeyRelatedField(write_only=True, allow_null=True, required=False, queryset=TeacherProfile.objects.all())
    time_zone = TimezoneField()

    class Meta:
        model = MyUser
        fields = ['id', 'first_name', 'last_name', 'email', 'username', 'password', 'user_type', 'time_zone', 'phone_number',
                  'birthday', 'description', 'stripeCustomerId', 'stripeProductId', 'stripeSubscriptionId', 'stripeSubscriptionProvision',
                  'student_profile', 'teacher_profile', 'student_id', 'teacher_id']
        extra_kwargs = {'password': {'write_only': True, 'required': False}, 'username': {'required': False}}

    def create(self, validated_data):
        student_profile = validated_data.pop('student_profile', None)
        teacher_profile = validated_data.pop('teacher_profile', None)
        username = validated_data.get('username', None)
        if username is None:
            username = validated_data.get('last_name') + '_' + validated_data.get('first_name')
            counter = 1
            while MyUser.objects.filter(username=username):
                username = validated_data.get('last_name') + '_' + validated_data.get('first_name') + '_' + str(counter)
                counter += 1
            validated_data['username'] = username
        password = validated_data.pop('password', None)
        if password is None:
            password = MyUser.objects.make_random_password(length=8)
            mail.get_connection()
            mail.send_mail(
                'Yoyaku site login credentials for new user {}, {}'.format(validated_data.get('last_name'), validated_data.get('first_name')),
                'username: {}\npassword: {}'.format(validated_data.get('username'), password),
                None,
                ['success.academy.us@gmail.com'],
                fail_silently=False,
            )
        user = self.Meta.model(**validated_data)
        user.set_password(password)
        user.save()

        if student_profile:
            StudentProfile.objects.create(user=user, **student_profile)
        if teacher_profile:
            TeacherProfile.objects.create(user=user, **teacher_profile)

        return user

    def update(self, instance, validated_data):
        student_data = validated_data.pop('student_profile')
        teacher_data = validated_data.pop('teacher_profile')
        student_instance = validated_data.pop('student_id')
        teacher_instance = validated_data.pop('teacher_id')

        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.time_zone = validated_data.get('time_zone', instance.time_zone)
        instance.phone_number = validated_data.get('phone_number', instance.phone_number)
        instance.birthday = validated_data.get('birthday', instance.birthday)
        instance.description = validated_data.get('description', instance.description)
        instance.save()

        if student_instance:
            student_instance.school_name = student_data.get('school_name', student_instance.school_name)
            student_instance.school_grade = student_data.get('school_grade', student_instance.school_grade)
            student_instance.save()
        if teacher_instance:
            teacher_instance.association = teacher_data.get('association', teacher_instance.association)
            teacher_instance.save()

        return instance


class RecurrenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recurrence
        fields = ['id', 'freq', 'dtstart', 'until', 'interval']


class EventSerializer(serializers.ModelSerializer):
    teacher_user = serializers.PrimaryKeyRelatedField(queryset=MyUser.objects.all())
    student_user = serializers.PrimaryKeyRelatedField(many=True, queryset=MyUser.objects.all())
    recurrence = serializers.PrimaryKeyRelatedField(allow_null=True, queryset=Recurrence.objects.all())
    file = FileField(allow_null=True, required=False)

    class Meta:
        model = Event
        fields = ['id', 'title', 'start', 'end', 'teacher_user', 'student_user', 'isRecurrence', 'recurrence', 'comment', 'file', 'color']


class EventReadSerializer(EventSerializer):
    teacher_user = MyUserSerializer()
    student_user = MyUserSerializer(many=True)
    recurrence = RecurrenceSerializer()
    file = serializers.SerializerMethodField()

    def get_file(self, obj):
        if obj.file:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.file.url)
        else:
            return None


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'subject_name']
