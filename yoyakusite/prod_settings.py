import django_heroku

from .settings import *


SECRET_KEY = os.environ['SECRET_KEY']
DEBUG = False
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '[::1]']
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
django_heroku.settings(locals())
