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
    AVATAR_CHOICES = [
        ('bear', _('Bear')),
        ('cat', _('Cat')),
        ('deer', _('Deer')),
        ('dog', _('Dog')),
        ('fox', _('Fox')),
        ('giraffe', _('Giraffe')),
        ('gorilla', _('Gorilla')),
        ('koala', _('Koala')),
        ('llama', _('Llama')),
        ('panda', _('Panda')),
        ('pug', _('Pug')),
        ('rabbit', _('Rabbit')),
        ('raccoon', _('Raccoon')),
        ('reindeer', _('Reindeer')),
        ('skunk', _('Skunk')),
        ('wolf', _('Wolf')),
        ('lion', _('Lion')),
        ('weasel', _('Weasel')),
        ('monkey', _('Monkey')),
        ('pig', _('Pig')),
    ]
    email = models.EmailField(_('email address'))
    user_type = models.CharField(_('user type'), choices=USER_TYPE_CHOICES, max_length=10)
    time_zone = TimeZoneField(default='UTC', choices=[(tz, tz) for tz in pytz.all_timezones])
    phone_number = models.CharField(_('phone number'), max_length=15)
    birthday = models.DateField(_('birthday'))
    description = models.CharField(_('personal description'), max_length=300, blank=True)
    avatar = models.CharField(_('avatar'), choices=AVATAR_CHOICES, max_length=10, blank=True)
    referral_code = models.CharField(_('referral code'), max_length=8, unique=True)

    stripeCustomerId = models.CharField(_('stripe customer id'), max_length=300, null=True)
    stripeProductId = models.CharField(_('stripe product id'), max_length=300, null=True)
    stripeSubscriptionId = models.CharField(_('stripe subscription id'), max_length=300, null=True)
    stripeSubscriptionProvision = models.BooleanField(default=False)

    # USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['email', 'user_type', 'time_zone', 'phone_number', 'birthday', 'description', 'first_name', 'last_name']

    objects = MyUserManager()

    def __str__(self):
        return "{} {} ({:05})".format(self.first_name, self.last_name, self.id)


class StudentProfile(models.Model):
    SCHOOL_GRADE_CHOICES = [
        (-1, _('未就学')),
        (0, _('幼稚園')),
        (1, _('小１')),
        (2, _('小２')),
        (3, _('小３')),
        (4, _('小４')),
        (5, _('小５')),
        (6, _('小６')),
        (7, _('中１')),
        (8, _('中２')),
        (9, _('中３')),
        (10, _('高１')),
        (11, _('高２')),
        (12, _('高３')),
        (13, _('高４')),
    ]
    user = models.OneToOneField(MyUser, on_delete=models.CASCADE, related_name='student_profile')
    school_name = models.CharField(_('school name'), max_length=200)
    school_grade = models.IntegerField(_('school grade'), choices=SCHOOL_GRADE_CHOICES)
    referrer = models.CharField(_('referrer'), max_length=20, blank=True)
    should_pay_signup_fee = models.BooleanField(default=False)


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


class Recurrence(models.Model):
    freq = models.CharField(_('frequency'), max_length=10)
    dtstart = models.DateTimeField(_('recurrence start'))
    until = models.DateTimeField(_('recurrence end'))
    interval = models.IntegerField(_('interval'))


class Event(models.Model):
    teacher_user = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name='teacherEvents',
                                     related_query_name='teacherEvent')
    student_user = models.ManyToManyField(MyUser, related_name='studentEvents', related_query_name='studentEvent')
    # group_id = models.BigIntegerField(_('group id'))
    title = models.CharField(_('event title'), max_length=200)
    start = models.DateTimeField(_('start datetime'))
    end = models.DateTimeField(_('end datetime'))
    isRecurrence = models.BooleanField(default=False)
    recurrence = models.ForeignKey(Recurrence, null=True, on_delete=models.CASCADE, related_name='recurrenceEvents',
                                   related_query_name='recurrenceEvent')
    comment = models.CharField(_('comment'), max_length=1000, null=True, blank=True)
    file = models.FileField(upload_to='hsw14yh841sr/public/media/eventFiles/', null=True)
    color = models.CharField(_('color'), max_length=10, default='blue')


class ClassInfo(models.Model):
    name = models.CharField(_('name'), max_length=200)
    link = models.CharField(_('link'), max_length=200)
    meeting_id = models.CharField(_('meeting id'), max_length=200)
    password = models.CharField(_('password'), max_length=200)
