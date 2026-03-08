from django.urls import path
from .views import StaffList, StaffDetail, StaffLogin, StaffSignup

urlpatterns = [
    path('login/', StaffLogin.as_view(), name='staff-login'),
    path('signup/', StaffSignup.as_view(), name='staff-signup'),
    path('', StaffList.as_view(), name='staff-list'),
    path('<int:pk>/', StaffDetail.as_view(), name='staff-detail'),
    
]
