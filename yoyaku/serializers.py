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


class MyUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyUser
        fields = ['first_name', 'last_name', 'email']
