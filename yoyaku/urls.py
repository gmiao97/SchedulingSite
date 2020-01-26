from django.urls import path
from django.conf.urls import include
from rest_framework.urlpatterns import format_suffix_patterns

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('events/', views.EventList.as_view()),
    path('subjects-by-teacher/', views.SubjectListByTeacher.as_view()),
    path('teachers-by-subject/', views.TeacherListBySubject.as_view()),
    path('api-auth/', include('rest_framework.urls')),
]

urlpatterns = format_suffix_patterns(urlpatterns)
