from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import CompletionSerializer
from drf_spectacular.utils import extend_schema
from anthropic import Anthropic
from openai import OpenAI

import os
import requests

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
        Returns a list of available Anthropic model IDs.
        Since Anthropic doesn't provide a models endpoint, this returns
        the current set of available models.
        
        Returns:
            list: Available model IDs or dict with error message
        """
        try:
            # Current Claude 3 models
            models = [
                "claude-3-opus-20240229",
                "claude-3-sonnet-20240229",
                "claude-3-haiku-20240307"
            ]
            
            # Verify API key exists (optional validation)
            if not os.getenv("ANTHROPIC_API_KEY"):
                return {'error': 'ANTHROPIC_API_KEY not found in environment variables'}
                
            return models
            
        except Exception as e:
            return {'error': str(e)}

class CompletionView(APIView):
    @extend_schema(
        request={
            'application/json': {
                'type':'object',
                'properties': {
                    'system_prompt': {
                        'type': 'string',
                        'description':'The contextual input for the LLM'
                    },
                    'message': {
                        'type': 'string',
                        'description':'The message or question provided by the user'
                    },
                },
                'required': ['system_prompt', 'message'],
            }
        },
        responses={
            202: {
                'description': 'Successfully started machine, ansynchronously writing data'
            },
            404: {'description': "Bad request. 'telemetry_id' not provided"},
            404: {'description': "Bad request. Machine type is 'OTHER'"},
        }
    )
    def post(self, request, provider_name, model_id):
        serializer = CompletionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        system_prompt = serializer.validated_data['system_prompt']
        message = serializer.validated_data['message']
        provider_name = provider_name.lower()

        if provider_name == 'openai':
            response = self.openai_completion(model_id, system_prompt, message)
        elif provider_name == 'anthropic':
            response = self.anthropic_completion(model_id, system_prompt, message)
        else:
            return Response(
                {'error': 'Provider not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if 'error' in response:
            return Response(response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(response, status=status.HTTP_200_OK)

    def openai_completion(self, model_id, system_prompt, message):
        try:
            client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            
            response = client.chat.completions.create(
                model=model_id,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                max_tokens=150  # TODO: check if this is okay
            )
            
            formatted_response = {
                'id': response.id,
                'model': response.model,
                'content': response.choices[0].message.content,
                'usage': {
                    'input_tokens': response.usage.prompt_tokens,
                    'output_tokens': response.usage.completion_tokens
                },
                'finish_reason': response.choices[0].finish_reason
            }
            
            return formatted_response
        except Exception as e:
            return {'error': str(e)}

    def anthropic_completion(self, model_id, system_prompt, message):
        """
        Create a completion using the Anthropic API.
        
        Args:
            model_id (str): The Anthropic model ID to use (e.g., "claude-3-opus-20240229")
            system_prompt (str): The system prompt to set context
            message (str): The user's message to generate a completion for
        
        Returns:
            dict: The API response data or error message
        """
        try:
            client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
            
            response = client.messages.create(
                model=model_id,
                system=system_prompt,  # System prompt as a separate parameter
                max_tokens=1000,
                messages=[
                    {
                        "role": "user",
                        "content": message
                    }
                ]
            )
            
            # TODO: May need to format
            formatted_response = {
                'id': response.id,
                'model': response.model,
                'content': response.content[0].text,
                'usage': {
                    'input_tokens': response.usage.input_tokens,
                    'output_tokens': response.usage.output_tokens
                },
                'finish_reason': response.stop_reason
            }
            
            return formatted_response
        except Exception as e:
            return {'error': str(e)}