from django.urls import path
from django.conf.urls import url, include
from rest_framework import routers
from rest_framework.urlpatterns import format_suffix_patterns
from .views import UserViewSet, EventList, SubjectListByTeacher, TeacherListBySubject, ValidateToken, LogoutAndBlacklistRefreshTokenForUserView


router = routers.DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    url(r'^', include(router.urls)),
    path('events/', EventList.as_view()),
    path('subjects-by-teacher/', SubjectListByTeacher.as_view()),
    path('teachers-by-subject/', TeacherListBySubject.as_view()),
    path('validate-token/', ValidateToken.as_view()),
    path('blacklist/', LogoutAndBlacklistRefreshTokenForUserView.as_view(), name='blacklist'),
]

