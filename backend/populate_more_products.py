import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'milkman_day2.settings')
django.setup()

from category.models import Category
from product.models import Product

def populate_products():
    # Categories
    dairy_cat, _ = Category.objects.get_or_create(name="Dairy Products")
    milk_cat, _ = Category.objects.get_or_create(name="Milk")

    products = [
        {
            "name": "Cow Milk",
            "category": milk_cat,
            "price": 60.00,
            "unit": "Liter",
            "image_url": "https://images.unsplash.com/photo-1550583724-1255818c0533?auto=format&fit=crop&q=80&w=200&h=200"
        },
        {
            "name": "Buffalo Milk",
            "category": milk_cat,
            "price": 80.00,
            "unit": "Liter",
            "image_url": "https://images.unsplash.com/photo-1563636619-e910ef49e9cf?auto=format&fit=crop&q=80&w=200&h=200"
        },
        {
            "name": "Butter Milk",
            "category": dairy_cat,
            "price": 40.00,
            "unit": "Liter",
            "image_url": "https://images.unsplash.com/photo-1528498033373-3c6c08e93d79?auto=format&fit=crop&q=80&w=200&h=200"
        },
        {
            "name": "Ghee",
            "category": dairy_cat,
            "price": 650.00,
            "unit": "kg",
            "image_url": "https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&q=80&w=200&h=200"
        },
        {
            "name": "Cheese",
            "category": dairy_cat,
            "price": 450.00,
            "unit": "kg",
            "image_url": "https://images.unsplash.com/photo-1485962391905-dc37bb33e24e?auto=format&fit=crop&q=80&w=200&h=200"
        },
        {
            "name": "Butter",
            "category": dairy_cat,
            "price": 500.00,
            "unit": "kg",
            "image_url": "https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&q=80&w=200&h=200"
        }
    ]

    for p_data in products:
        prod, created = Product.objects.update_or_create(
            name=p_data["name"],
            defaults={
                "category": p_data["category"],
                "price": p_data["price"],
                "unit": p_data["unit"],
                "image_url": p_data["image_url"]
            }
        )
        print(f"{'Created' if created else 'Updated'}: {prod.name}")

if __name__ == "__main__":
    populate_products()
