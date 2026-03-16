import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'milkman_day2.settings')
django.setup()

from category.models import Category
from product.models import Product

def fix_product_images():
    # Define accurate images for products
    accurate_products = [
        {
            "name": "Ghee",
            "image_url": "https://images.unsplash.com/photo-1631709497146-a239ef57355a?auto=format&fit=crop&q=80&w=300&h=300"
        },
        {
            "name": "Butter",
            "image_url": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=300&h=300"
        },
        {
            "name": "Cheese",
            "image_url": "https://images.unsplash.com/photo-1485962391905-dc37bb33e24e?auto=format&fit=crop&q=80&w=300&h=300"
        },
        {
            "name": "Paneer",
            "image_url": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=300&h=300"
        },
        {
            "name": "Curd",
            "image_url": "https://images.unsplash.com/photo-1571214506484-8849b2d7c0d0?auto=format&fit=crop&q=80&w=300&h=300"
        }
    ]

    for p_data in accurate_products:
        updated = Product.objects.filter(name=p_data["name"]).update(image_url=p_data["image_url"])
        if updated:
            print(f"Fixed image for: {p_data['name']}")
        else:
            print(f"Product not found: {p_data['name']}")

if __name__ == "__main__":
    fix_product_images()
