from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from rest_framework import serializers

from .models import User

class UserCreateSerializer(BaseUserCreateSerializer):
    class Meta(BaseUserCreateSerializer):
        model = User
        fields = ['first_name', 'last_name', 'email', 'username', 'password']

class CompletionSerializer(serializers.Serializer):
    system_prompt = serializers.CharField()
    message = serializers.CharField()