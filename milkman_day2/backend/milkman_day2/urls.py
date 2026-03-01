"""
URL configuration for milkman_day2 project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from .views import api_root

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('staff/', include('staff.urls')),
    
    # API URLs
    path('staff/', include('staff.urls')),
    path('customer/', include('customer.urls')),
    path('category/', include('category.urls')),
    path('product/', include('product.urls')),
    path('subscription/', include('subscription.urls')),
    path('milk-admin/', include('milk_admin.urls')),
    # path('order/', include('order.urls')),
]
