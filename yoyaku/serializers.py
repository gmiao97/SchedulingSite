from rest_framework import serializers

from .models import *


class EventSerializer(serializers.ModelSerializer):
    teacher_user = serializers.StringRelatedField(many=False)
    student_user = serializers.StringRelatedField(many=True)

    class Meta:
        model = Event
        fields = ['id', 'group_id', 'title', 'start', 'end', 'teacher_user', 'student_user']


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['subject_name']


class MyUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyUser
        fields = ['first_name', 'last_name', 'email']


# class MyUserSerializerWithToken(serializers.ModelSerializer):
#     token = serializers.SerializerMethodField()
#     password = serializers.CharField(write_only=True)
#
#     def get_token(self, obj):
#         jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
#         jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
#         payload = jwt_payload_handler(obj)
#         token = jwt_encode_handler(payload)
#         return token
#
#     def create(self, validated_data):
#         password = validated_data.pop('password', None)
#         instance = self.Meta.model(**validated_data)
#         if password is not None:
#             instance.set_password(password)
#         instance.save()
#         return instance
#
#     def update(self, instance, validated_data):
#         instance.email = validated_data.get('email', instance.email)
#         password = validated_data.get('password', instance.password)
#         if password is not None:
#             instance.set_password(password)
#         instance.first_name = validated_data.get('first_name', instance.first_name)
#         instance.last_name = validated_data.get('last_name', instance.last_name)
#         instance.time_zone = validated_data.get('time_zone', instance.time_zone)
#         return instance
#
#     class Meta:
#         model = MyUser
#         fields = ('token', 'username', 'password')
