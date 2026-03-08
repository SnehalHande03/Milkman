import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'milkman_day2.settings')
django.setup()

from staff.models import staff

updated = staff.objects.filter(email='admin@milkman.com').update(role='admin')
print(f"Updated {updated} user(s) to admin role.")
