from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import CompletionSerializer
from drf_spectacular.utils import extend_schema 

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
        headers = {
            'Authorization': f'Bearer {os.getenv("OPENAI_API_KEY")}'
        }
        try:
            response = requests.get('https://api.openai.com/v1/models', headers=headers)
            response.raise_for_status()
            data = response.json()
            models = [model['id'] for model in data.get('data', [])]
            return models
        except requests.exceptions.RequestException as e:
            return {'error': str(e)}

    def get_anthropic_models(self):
        # Placeholder for the actual Anthropic API call
        """ Something like…
        headers = {
            'x-api-key': os.getenv('ANTHROPIC_API_KEY')
        }
        try:
            # Placeholder Anthropic endpoint
            response = requests.get('https://api.anthropic.com/v1/models', headers=headers)
            response.raise_for_status()
            data = response.json()
            models = [model['name'] for model in data.get('models', [])]
            return models
        except requests.exceptions.RequestException as e:
            return {'error': str(e)}
        """
        return {'error': 'NOT IMPLEMENTED'}

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
        headers = {
            'Authorization': f'Bearer {os.getenv("OPENAI_API_KEY")}',
            'Content-Type': 'application/json'
        }
        payload = {
            'model': model_id,
            'messages': [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': message}
            ],
            'max_tokens': 150, #TODO: check if this is okay
        }
        try:
            response = requests.post('https://api.openai.com/v1/chat/completions', headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            return data  # Todo: see if formating is required
        except requests.exceptions.RequestException as e:
            return {'error': str(e)}

    def anthropic_completion(self, model_id, system_prompt, message):
        # Implement the actual Anthropic completion logic based on their API
        """ something like…        
        headers = {
            'x-api-key': os.getenv('ANTHROPIC_API_KEY'),
            'Content-Type': 'application/json'
        }
        payload = {
            'model': model_id,
            'prompt': f"{system_prompt}\n{message}",
            'max_tokens_to_sample': 150,
        }
        try:
            response = requests.post('https://api.anthropic.com/v1/complete', headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            return data  # Format as needed
        except requests.exceptions.RequestException as e:
            return {'error': str(e)}
        """
        return {'error': 'NOT IMPLEMENTED'}
