from rest_framework import serializers

from .models import *


class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ['school_name', 'school_grade']


class TeacherProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherProfile
        fields = ['association']


class TimezoneField(serializers.Field):
    def to_representation(self, value):
        return value.zone

    def to_internal_value(self, data):
        return pytz.timezone(data)


class MyUserSerializer(serializers.ModelSerializer):
    student_profile = StudentProfileSerializer(many=False, required=False, allow_null=True)
    teacher_profile = TeacherProfileSerializer(many=False, required=False, allow_null=True)
    time_zone = TimezoneField()

    class Meta:
        model = MyUser
        fields = ['first_name', 'last_name', 'email', 'password', 'user_type', 'time_zone', 'student_profile',
                  'teacher_profile']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):  # TODO validate correct profile type
        student_profile = validated_data.pop('student_profile')
        teacher_profile = validated_data.pop('teacher_profile')
        password = validated_data.pop('password')
        user = self.Meta.model(**validated_data)
        user.set_password(password)
        user.save()

        if student_profile:
            StudentProfile.objects.create(user=user, **student_profile)
        if teacher_profile:
            TeacherProfile.objects.create(user=user, **teacher_profile)

        return user

    def update(self, instance, validated_data):  # TODO update student/teacher profile
        student_profile = validated_data.pop('student_profile')
        teacher_profile = validated_data.pop('teacher_profile')

        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.first_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.time_zone = validated_data.get('time_zone', instance.time_zone)
        instance.save()
        return instance


class EventSerializer(serializers.ModelSerializer):
    teacher_user = serializers.StringRelatedField()
    student_user = serializers.StringRelatedField(many=True)
    # teacher_user = MyUserSerializer()
    # student_user = MyUserSerializer(many=True)

    class Meta:
        model = Event
        fields = ['id', 'group_id', 'title', 'start', 'end', 'teacher_user', 'student_user']


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['subject_name']