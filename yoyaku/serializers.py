from rest_framework import serializers

from .models import *


class EventSerializer(serializers.ModelSerializer):
    teacher_user = serializers.StringRelatedField(many=False)
    student_user = serializers.StringRelatedField(many=True)

    class Meta:
        model = Event
        fields = ['id', 'group_id', 'title', 'start', 'end', 'teacher_user', 'student_user']


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['subject_name']


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
        return data


class MyUserSerializer(serializers.ModelSerializer):
    student_profile = StudentProfileSerializer(many=False)
    teacher_profile = TeacherProfileSerializer(many=False)
    time_zone = TimezoneField()

    class Meta:
        model = MyUser
        fields = ['first_name', 'last_name', 'email', 'password', 'user_type', 'time_zone', 'student_profile',
                  'teacher_profile']
        extra_kwargs = {'password': {'write_only': True}}




