from rest_framework import serializers
from .models import Subscription

class SubscriptionSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = Subscription
        fields = ['id', 'customer', 'customer_name', 'product', 'product_name', 'quantity', 'start_date', 'is_active']
