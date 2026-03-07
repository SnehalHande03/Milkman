from decimal import Decimal
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from product.models import Product
from django.contrib.auth.models import User
from .models import Order, OrderItem, Payment
from datetime import date, timedelta


class CheckoutView(APIView):

    def post(self, request):

        # get user
        if request.user.is_authenticated:
            user = request.user
        else:
            user = User.objects.first()

        items = request.data.get("items")

        if not items:
            return Response(
                {"error": "Items are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        order = Order.objects.create(
            user=user,
            total_amount=Decimal("0.00"),
            status="pending"
        )

        total = Decimal("0.00")
        order_items = []  

        for item in items:

            product = get_object_or_404(Product, id=item["product_id"])
            quantity = int(item.get("quantity", 1))

            price = product.price
            subtotal = price * quantity
            total += subtotal

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=price
            )
            order_items.append({
                "product_name": product.name,
                "price": str(price),
                "quantity": quantity,
                "subtotal": str(subtotal)
            })


        order.total_amount = total
        order.save()

        return Response({
            "message": "Checkout successful",
            "order_id": order.id,
            "items": order_items, 
            "total_amount": str(order.total_amount)
        }, status=201)


class PaymentView(APIView):

    def post(self, request):

        order_id = request.data.get("order_id")
        method = request.data.get("method")
        subscription = request.data.get("subscription")

        if not order_id:
            return Response(
                {"error": "Order ID required"},
                status=400
            )

        order = get_object_or_404(Order, id=order_id)

        # subscription dates
        start_date = date.today()

        if subscription == "1_month":
            end_date = start_date + timedelta(days=30)

        elif subscription == "6_months":
            end_date = start_date + timedelta(days=180)

        else:
            end_date = None

        payment = Payment.objects.create(
            order=order,
            amount=order.total_amount,
            method=method,
            status="paid",
            transaction_id=f"TXN-{order.id}",
            start_date=start_date,
            end_date=end_date
        )

        order.status = "paid"
        order.save()

        # payment slip
        slip = {
            "Payment Status": payment.status,
            "Transaction ID": payment.transaction_id,
            "Order ID": order.id,
            "Amount Paid": str(payment.amount),
            "Payment Method": payment.method,
            "Subscription": subscription,
            "Start Date": start_date,
            "End Date": end_date
        }

        return Response({
            "message": "Payment Successful",
            "payment_slip": slip
        }, status=200)