import django_heroku
import os

from .settings import *

INSTALLED_APPS += ['storages']
DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"
# STATICFILES_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"

AWS_ACCESS_KEY_ID = os.environ.get("CLOUDCUBE_ACCESS_KEY_ID", "")
AWS_SECRET_ACCESS_KEY = os.environ.get("CLOUDCUBE_SECRET_ACCESS_KEY", "")
AWS_STORAGE_BUCKET_NAME = os.environ.get("CLOUDCUBE_STORAGE_BUCKET_NAME", "")

AWS_QUERYSTRING_AUTH = False

AWS_S3_CUSTOM_DOMAIN = AWS_STORAGE_BUCKET_NAME + '.s3.amazonaws.com'

AWS_DEFAULT_ACL = None

#static media settings
MEDIA_URL = 'https://' + AWS_STORAGE_BUCKET_NAME + '.s3.amazonaws.com/'
# MEDIA_URL = STATIC_URL
# STATICFILES_DIRS = (os.path.join(BASE_DIR, "static"),)
# STATIC_ROOT = 'staticfiles'
# ADMIN_MEDIA_PREFIX = STATIC_URL + 'admin/'

STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
)

# SECRET_KEY = os.environ['SECRET_KEY']
# DEBUG = False
# ALLOWED_HOSTS = ['localhost', '127.0.0.1', '[::1]']
# SECURE_SSL_REDIRECT = True
# SESSION_COOKIE_SECURE = True
# CSRF_COOKIE_SECURE = True
# django_heroku.settings(locals())
