from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse

@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'admin': reverse('admin:index', request=request, format=format),
        'staff': reverse('staff-list', request=request, format=format),
        'customer': reverse('customer-list', request=request, format=format),
        'category': reverse('category-list', request=request, format=format),
        'product': reverse('product-list', request=request, format=format),
        'subscription': reverse('subscription-list', request=request, format=format),
        'order_checkout': reverse('order-checkout', request=request, format=format),
        'order_payment': reverse('order-payment', request=request, format=format),
    })
