from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from rest_framework import serializers

from .models import Todo, User

class UserCreateSerializer(BaseUserCreateSerializer):
    class Meta(BaseUserCreateSerializer):
        model = User
        fields = ['first_name', 'last_name', 'email', 'username', 'password']

class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = ["id", "title", "description", "completed"]
        read_only_fields = ['id', 'created_at', 'updated_at', 'owner']