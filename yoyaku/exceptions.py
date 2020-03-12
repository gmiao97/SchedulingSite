from rest_framework import status
from rest_framework.views import exception_handler
from rest_framework_simplejwt.views import TokenRefreshView


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    # return a 403 if there is a refresh request with invalid token
    if response.status_code == status.HTTP_401_UNAUTHORIZED and isinstance(context['view'], TokenRefreshView):
        response.status_code = status.HTTP_403_FORBIDDEN
    return response
