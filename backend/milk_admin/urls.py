from django.urls import path, include
from .views import AdminDashboard

urlpatterns = [
    path('dashboard/', AdminDashboard.as_view(), name='admin-dashboard'),
    path('staff/', include('staff.urls')),
]
