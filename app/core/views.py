from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from drf_spectacular.utils import extend_schema
from .serializers import ChatRoomSerializer, MessageSerializer, CompletionSerializer
from django.http import StreamingHttpResponse
from rest_framework.decorators import action
from django.core.exceptions import ValidationError
from .models import ChatRoom, Message
from openai import OpenAI
from anthropic import Anthropic

import json
import os

class ChatRoomViewSet(viewsets.ModelViewSet):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        try:
            chatroom = self.get_object()
            messages = chatroom.messages.all()
            serializer = MessageSerializer(messages, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ChatRoom.DoesNotExist:
            return Response(
                {'error': 'Chatroom not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

class ProviderListView(APIView):
    def get(self, request):
        providers = ['OpenAI', 'Anthropic']
        return Response(providers, status=status.HTTP_200_OK)

class ModelListView(APIView):
    def get(self, request, provider_name):
        provider_name = provider_name.lower()
        if provider_name == 'openai':
            models = self.get_openai_models()
        elif provider_name == 'anthropic':
            models = self.get_anthropic_models()
        else:
            return Response(
                {'error': 'Provider not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        if 'error' in models:
            return Response(models, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(models, status=status.HTTP_200_OK)

    def get_openai_models(self):
        try:
            client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            models = client.models.list()
            return [model.id for model in models.data]
        except Exception as e:
            return {'error': str(e)}

    def get_anthropic_models(self):
        """
        Anthropic does not have an endpoint to retrieve all models.
        Models scrapped from: https://docs.anthropic.com/en/docs/about-claude/models
        """
        try:
            models = [
                "claude-3-5-sonnet-20241022",
                "claude-3-opus-20240229",
                "claude-3-haiku-20240307"
            ]
            if not os.getenv("ANTHROPIC_API_KEY"):
                return {'error': 'ANTHROPIC_API_KEY not found'}
            return models
        except Exception as e:
            return {'error': str(e)}

class CompletionView(APIView):
    """
    Routes the request for a message ("completion") to the appropriate router

    Each streaming function immediately forwards chunks from the provider to the frontend.
    """
    @extend_schema(
        request=CompletionSerializer,
        responses={200: MessageSerializer}
    )
    def post(self, request, provider_name, model_id):
        serializer = CompletionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        chatroom_id = serializer.validated_data.get('chatroom_id')
        system_prompt = serializer.validated_data.get('system_prompt', '')
        message = serializer.validated_data['message']
        
        # Get or create chatroom
        if chatroom_id:
            try:
                chatroom = ChatRoom.objects.get(id=chatroom_id)
            except ChatRoom.DoesNotExist:
                return Response({'error': 'Chat room not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            chatroom = ChatRoom.objects.create(
                title=message[:50],
                provider=provider_name,
                model_id=model_id,
                system_prompt=system_prompt
            )

        Message.objects.create(
            chatroom=chatroom,
            role='user',
            content=message
        )

        # Get conversation history
        messages = chatroom.messages.all()
        
        # Route the request to the correct provider
        if provider_name.lower() == 'openai':
            return StreamingHttpResponse(
                self.stream_openai_response(model_id, chatroom, system_prompt, messages),
                content_type='text/event-stream'
            )
        elif provider_name.lower() == 'anthropic':
            return StreamingHttpResponse(
                self.stream_anthropic_response(model_id, chatroom, system_prompt, messages),
                content_type='text/event-stream'
            )
        else:
            return Response(
                {'error': f'Provider not found: {provider_name}'},
                status=status.HTTP_404_NOT_FOUND
            )

    def stream_openai_response(self, model_id, chatroom, system_prompt, messages):
        try:
            client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            
            # Create the chat log history then stream the response
            message_list = []
            if system_prompt:
                message_list.append({"role": "system", "content": system_prompt})
            
            for msg in messages:
                message_list.append({
                    "role": msg.role,
                    "content": msg.content
                })

            full_content = ""
            stream = client.chat.completions.create(
                model=model_id,
                messages=message_list,
                stream=True,
                max_tokens=1000
            )

            # Immediately forward all chunks to the frontend
            for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    content = chunk.choices[0].delta.content
                    full_content += content
                    yield f"data: {json.dumps({'content': content, 'type': 'chunk'})}\n\n"

            # Save the complete message after streaming
            message = Message.objects.create(
                chatroom=chatroom,
                role='assistant',
                content=full_content
            )
            
            # Send final message with complete content
            yield f"data: {json.dumps({'type': 'done', 'message': MessageSerializer(message).data})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    def stream_anthropic_response(self, model_id, chatroom, system_prompt, messages):
        try:
            client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

            # Format messages for Anthropic's API
            message_list = []
            for msg in messages:
                if msg.role != 'system':
                    # Anthropic only accepts 'user' and 'assistant' roles
                    # role = 'user' if msg.role in ['user', 'human'] else 'assistant'
                    message_list.append({
                        "role": msg.role,
                        "content": msg.content
                    })

            stream = client.messages.create(
                max_tokens=1024,
                messages=message_list,
                model=model_id,
                stream=True,
            )

            full_content = ""
            for event in stream:
                print(event.type)
                if event.type == 'content_block_delta':
                    content = event.delta.text
                    full_content += content
                    yield f"data: {json.dumps({'content': content, 'type': 'chunk'})}\n\n"

            Message.objects.create(
                chatroom=chatroom,
                role='assistant',
                content=full_content,
                input_tokens=None,
                output_tokens=None
            )

            yield f"data: {json.dumps({'type': 'done', 'message': full_content})}\n\n"
            
        except Exception as e:
            print(f"Anthropic streaming error: {str(e)}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"