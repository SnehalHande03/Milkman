from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import staff
from .serializers import StaffSerializer

from rest_framework.permissions import AllowAny
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

@method_decorator(csrf_exempt, name='dispatch')
class StaffSignup(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = StaffSerializer(data=request.data)
        if serializer.is_valid():
            # Check if email already exists
            email = request.data.get('email')
            if staff.objects.filter(email=email).exists():
                return Response({'status': 'error', 'message': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)
            
            serializer.save()
            return Response({'status': 'success', 'user': serializer.data}, status=status.HTTP_201_CREATED)
        return Response({'status': 'error', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class StaffLogin(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        print(f"Login attempt: email={email}, password={password}")
        try:
            user = staff.objects.get(email=email, password=password)
            print(f"Login success for {email}")
            return Response({'status': 'success', 'user': StaffSerializer(user).data})
        except staff.DoesNotExist:
            print(f"Login failed for {email}")
            return Response({'status': 'error', 'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class StaffList(APIView):
    def get(self, request):
        qs = staff.objects.all()
        serializer = StaffSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = StaffSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StaffDetail(APIView):
    def get(self, request, pk):
        obj = get_object_or_404(staff, pk=pk)
        serializer = StaffSerializer(obj)
        return Response(serializer.data)

    def put(self, request, pk):
        obj = get_object_or_404(staff, pk=pk)
        serializer = StaffSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        obj = get_object_or_404(staff, pk=pk)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
