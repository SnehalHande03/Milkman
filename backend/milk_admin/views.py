from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser

class AdminDashboard(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        return Response({
            'message': 'Welcome to the Admin Dashboard',
            'stats': {
                'total_users': 100, # Placeholder
                'system_status': 'Operational'
            }
        })
