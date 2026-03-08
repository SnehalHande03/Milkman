from django.urls import path
from .views import CheckoutView, PaymentView

urlpatterns = [
    path('checkout/', CheckoutView.as_view(), name='order-checkout'),
    path('payment/', PaymentView.as_view(), name='order-payment'),
]