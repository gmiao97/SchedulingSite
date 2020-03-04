from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from rest_framework import status
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.views import APIView

from .models import *
from .serializers import *


def index(request):
    return HttpResponse("Hello World")


class EventList(APIView):
    def get(self, request, format=None):
        if request.user.is_authenticated:
            if request.user.user_type == 'TEACHER':
                events = request.user.teacherEvents.all()
            elif request.user.user_type == 'STUDENT':
                events = request.user.studentEvents.all()
            serializer = EventSerializer(events, many=True)
            return Response(serializer.data)
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
