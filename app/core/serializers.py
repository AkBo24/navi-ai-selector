from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from rest_framework import serializers
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ChatRoom, Message

from .models import User

class UserCreateSerializer(BaseUserCreateSerializer):
    class Meta(BaseUserCreateSerializer):
        model = User
        fields = ['first_name', 'last_name', 'email', 'username', 'password']

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'role', 'content', 'created_at', 'input_tokens', 'output_tokens']
        read_only_fields = ['input_tokens', 'output_tokens']

class ChatRoomSerializer(serializers.ModelSerializer):
    # messages = MessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = ChatRoom
        fields = ['id', 'title', 'created_at', 'updated_at', 'provider', 'model_id', 'system_prompt']
        read_only_fields = ['created_at', 'updated_at']
    
class MessageRequestSerializer(serializers.Serializer):
    role = serializers.CharField()
    content = serializers.CharField()

class CompletionSerializer(serializers.Serializer):
    chatroom_id = serializers.UUIDField(required=False)
    system_prompt = serializers.CharField(required=False, allow_blank=True)
    message = serializers.CharField()