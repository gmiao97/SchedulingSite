from django.urls import path
from django.conf.urls import url, include
from rest_framework import routers
from rest_framework.urlpatterns import format_suffix_patterns
from .views import UserViewSet

from . import views

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    url(r'^', include(router.urls)),
    path('events/', views.EventList.as_view()),
    path('subjects-by-teacher/', views.SubjectListByTeacher.as_view()),
    path('teachers-by-subject/', views.TeacherListBySubject.as_view()),
]

