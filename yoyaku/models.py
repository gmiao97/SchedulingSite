import pytz

from timezone_field import TimeZoneField
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import ugettext_lazy as _


class MyUserManager(BaseUserManager):
    """Define a model manager for User model with no username field."""
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        """Create and save a User with the given email and password."""
        if not email:
            raise ValueError('The given email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular User with the given email and password."""
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)


class MyUser(AbstractUser):
    TEACHER = 'TEACHER'
    STUDENT = 'STUDENT'
    ADMIN = 'ADMIN'
    USER_TYPE_CHOICES = [
        (TEACHER, _('Teacher')),
        (STUDENT, _('Student')),
        (ADMIN, _('Admin')),
    ]
    username = None
    email = models.EmailField(_('email address'), unique=True)
    user_type = models.CharField(_('user type'), choices=USER_TYPE_CHOICES, max_length=10)
    time_zone = TimeZoneField(default='UTC', choices=[(tz, tz) for tz in pytz.all_timezones])

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = MyUserManager()

    def __str__(self):
        return "{} {} ({:05})".format(self.first_name, self.last_name, self.id)


class StudentProfile(models.Model):
    SCHOOL_GRADE_CHOICES = [
        (-1, _('Preschool')),
        (0, _('Kindergarten')),
        (1, _('First Grade')),
        (2, _('Second Grade')),
        (3, _('Third Grade')),
        (4, _('Fourth Grade')),
        (5, _('Fifth Grade')),
        (6, _('Sixth Grade')),
        (7, _('Seventh Grade')),
        (8, _('Eighth Grade')),
        (9, _('Ninth Grade')),
        (10, _('Tenth Grade')),
        (11, _('Eleventh Grade')),
        (12, _('Twelfth Grade')),
    ]
    user = models.OneToOneField(MyUser, on_delete=models.CASCADE, related_name='student_profile')
    school_name = models.CharField(_('school name'), max_length=200)
    school_grade = models.IntegerField(_('school grade'), choices=SCHOOL_GRADE_CHOICES)


class TeacherProfile(models.Model):
    user = models.OneToOneField(MyUser, on_delete=models.CASCADE, related_name='teacher_profile')
    association = models.CharField(_("group association"), max_length=200)


class Subject(models.Model):
    MID_JAPANESE = 'M_JA'
    MID_ENGLISH = 'M_EN'
    SUBJECT_OPTIONS = [
        (MID_JAPANESE, _('Middle School Japanese')),
        (MID_ENGLISH, _('Middle School English')),
    ]
    user = models.ManyToManyField(MyUser, related_name='subjects', related_query_name='subject')
    subject_name = models.CharField(_('subject name'), choices=SUBJECT_OPTIONS, max_length=200)

    def __str__(self):
        return self.subject_name


class Event(models.Model):
    teacher_user = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name='teacherEvents',
                                     related_query_name='teacherEvent')
    student_user = models.ManyToManyField(MyUser, related_name='studentEvents', related_query_name='studentEvent')
    group_id = models.BigIntegerField(_('group id'))
    title = models.CharField(_('event title'), max_length=200)
    start = models.DateTimeField(_('start datetime'))
    end = models.DateTimeField(_('end datetime'))

