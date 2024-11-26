from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter(trailing_slash=False)

urlpatterns = [
    path('', include(router.urls)),
    path('api/providers/', views.ProviderListView.as_view(), name='provider-list'),
    path('api/providers/<str:provider_name>/models/', views.ModelListView.as_view(), name='model-list'),
    path('api/providers/<str:provider_name>/models/<str:model_id>/completions/', views.CompletionView.as_view(), name='completion'),
]
