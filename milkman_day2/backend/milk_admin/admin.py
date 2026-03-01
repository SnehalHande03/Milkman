from django.contrib import admin

from customer.models import Customer
from category.models import Category
from product.models import Product
from staff.models import staff as Staff

admin.site.register(Customer)
admin.site.register(Category)
admin.site.register(Product)
admin.site.register(Staff)