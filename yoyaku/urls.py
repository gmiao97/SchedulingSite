from django.urls import path
from django.conf.urls import url, include
from rest_framework import routers
from rest_framework.urlpatterns import format_suffix_patterns

from .views import UserViewSet, EventViewSet, SubjectListByTeacher, TeacherListBySubject, ValidateToken, \
    StripePriceList, StripeProduct, StripeSubscription, StripeSetupIntent, StripeCustomerPortal, StripeWebhook, \
    LogoutAndBlacklistRefreshTokenForUserView, PasswordReset, ClassInfoViewSet, PreschoolClassViewSet


router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'events', EventViewSet)
router.register(r'class-info', ClassInfoViewSet)
router.register(r'preschool-info', PreschoolClassViewSet)

urlpatterns = [
    url(r'^', include(router.urls)),
    path('subjects-by-teacher/', SubjectListByTeacher.as_view()),
    path('teachers-by-subject/', TeacherListBySubject.as_view()),
    path('validate-token/', ValidateToken.as_view()),
    path('stripe-prices/', StripePriceList.as_view()),
    path('stripe-product/', StripeProduct.as_view()),
    path('stripe-subscription/', StripeSubscription.as_view()),
    path('stripe-setup-intent/', StripeSetupIntent.as_view()),
    path('stripe-customer-portal/', StripeCustomerPortal.as_view()),
    path('stripe-webhook/', StripeWebhook.as_view()),
    path('password-reset/', PasswordReset.as_view()),
    path('blacklist/', LogoutAndBlacklistRefreshTokenForUserView.as_view(), name='blacklist'),
]
