from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from .serializers import ChatRoomSerializer, MessageSerializer, CompletionSerializer
from .models import ChatRoom, Message
from openai import OpenAI
from anthropic import Anthropic
import os

class ChatRoomViewSet(viewsets.ModelViewSet):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer

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
        try:
            models = [
                "claude-3-opus-20240229",
                "claude-3-sonnet-20240229",
                "claude-3-haiku-20240307"
            ]
            if not os.getenv("ANTHROPIC_API_KEY"):
                return {'error': 'ANTHROPIC_API_KEY not found'}
            return models
        except Exception as e:
            return {'error': str(e)}

class CompletionView(APIView):
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

        # Save user message
        Message.objects.create(
            chatroom=chatroom,
            role='user',
            content=message
        )

        # Get conversation history
        messages = chatroom.messages.all()
        
        if provider_name.lower() == 'openai':
            response = self.openai_completion(model_id, chatroom.system_prompt, messages)
        elif provider_name.lower() == 'anthropic':
            response = self.anthropic_completion(model_id, chatroom.system_prompt, messages)
        else:
            return Response(
                {'error': f'Provider not found. {provider_name}'},
                status=status.HTTP_404_NOT_FOUND
            )

        if 'error' in response:
            return Response(response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Save assistant's response
        assistant_message = Message.objects.create(
            chatroom=chatroom,
            role='assistant',
            content=response['content'],
            input_tokens=response['usage']['input_tokens'],
            output_tokens=response['usage']['output_tokens']
        )

        # Update chatroom's last modified time
        chatroom.save()

        return Response({
            'message': MessageSerializer(assistant_message).data,
            'chatroom': ChatRoomSerializer(chatroom).data
        }, status=status.HTTP_200_OK)

    def openai_completion(self, model_id, system_prompt, messages):
        try:
            client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            
            message_list = []
            if system_prompt:
                message_list.append({"role": "system", "content": system_prompt})
            
            for msg in messages:
                message_list.append({
                    "role": msg.role,
                    "content": msg.content
                })
            
            response = client.chat.completions.create(
                model=model_id,
                messages=message_list,
                max_tokens=1000
            )
            
            return {
                'id': response.id,
                'model': response.model,
                'content': response.choices[0].message.content,
                'usage': {
                    'input_tokens': response.usage.prompt_tokens,
                    'output_tokens': response.usage.completion_tokens
                },
                'finish_reason': response.choices[0].finish_reason
            }
        except Exception as e:
            return {'error': str(e)}

    def anthropic_completion(self, model_id, system_prompt, messages):
        try:
            client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
            
            message_list = []
            for msg in messages:
                if msg.role != 'system':
                    message_list.append({
                        "role": msg.role,
                        "content": msg.content
                    })
            
            response = client.messages.create(
                model=model_id,
                system=system_prompt,
                max_tokens=1000,
                messages=message_list
            )
            
            return {
                'id': response.id,
                'model': response.model,
                'content': response.content[0].text,
                'usage': {
                    'input_tokens': response.usage.input_tokens,
                    'output_tokens': response.usage.output_tokens
                },
                'finish_reason': response.stop_reason
            }
        except Exception as e:
            return {'error': str(e)}