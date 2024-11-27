from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

# Create a router and register the viewset
router = DefaultRouter(trailing_slash=False)
router.register(r'api/chatrooms', views.ChatRoomViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('api/providers', views.ProviderListView.as_view(), name='provider-list'),
    path('api/providers/<str:provider_name>/models', views.ModelListView.as_view(), name='model-list'),
    path('api/providers/<str:provider_name>/models/<str:model_id>/complete', views.CompletionView.as_view(), name='completion'),
]