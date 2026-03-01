from decimal import Decimal
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from staff.models import staff
from product.models import Product
from .models import Order, OrderItem, Payment

class CheckoutView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        items = request.data.get('items', [])
        if not user_id or not items:
            return Response({'message': 'user_id and items required'}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(staff, pk=user_id)
        order = Order.objects.create(user=user, total_amount=Decimal('0.00'), status='pending')

        total = Decimal('0.00')
        created = []
        for item in items:
            product = get_object_or_404(Product, pk=item.get('product_id'))
            qty = int(item.get('quantity', 1))
            price = product.price
            total += price * qty
            OrderItem.objects.create(order=order, product=product, quantity=qty, price=price)
            created.append({'product': product.name, 'quantity': qty, 'price': str(price)})

        order.total_amount = total
        order.save()

        return Response({'order_id': order.id, 'total_amount': str(total), 'items': created}, status=status.HTTP_201_CREATED)

class PaymentView(APIView):
    def post(self, request):
        order_id = request.data.get('order_id')
        method = request.data.get('method')
        if not order_id or not method:
            return Response({'message': 'order_id and method required'}, status=status.HTTP_400_BAD_REQUEST)

        order = get_object_or_404(Order, pk=order_id)
        payment = Payment.objects.create(
            order=order,
            amount=order.total_amount,
            method=method,
            status='paid' if method in ('card', 'cod') else 'pending',
            transaction_id=f"TXN-{order.id}"
        )
        order.status = 'paid' if payment.status == 'paid' else 'pending'
        order.save()

        return Response({'status': f'Payment {payment.status} via {payment.method}', 'transaction_id': payment.transaction_id}, status=status.HTTP_200_OK)
