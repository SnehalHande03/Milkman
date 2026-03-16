import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'milkman_day2.settings')
django.setup()

from staff.models import staff

print(f"Total staff: {staff.objects.count()}")
for s in staff.objects.all():
    print(f"Email: {s.email}, Password: {s.password}")
