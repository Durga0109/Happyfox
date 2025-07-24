from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyDriveViewSet, PersonalizedPrepPlanView,GenerateMockInterviewView

# Router setup for all ViewSets
router = DefaultRouter()
router.register(r'companydrives', CompanyDriveViewSet, basename='companydrive')

# URL patterns
urlpatterns = [
    path('', include(router.urls)),  # Includes all auto-generated ViewSet routes
    path('generate_prep_plan/', PersonalizedPrepPlanView.as_view(), name='generate-prep-plan'), 
    path('generate_mock_interview/', GenerateMockInterviewView.as_view(), name='generate-mock-interview'), # Custom API endpoint
]
