import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'milkman_day2.settings')
django.setup()

from product.models import Product

def update_images():
    # Mapping of product names (or partial names) to professional Unsplash images
    image_mapping = {
        "Standard Cow Milk": "https://images.unsplash.com/photo-1563636619-e910ef49e9cf?q=80&w=400&h=400&auto=format&fit=crop",
        "Premium Buffalo Milk": "https://images.unsplash.com/photo-1550583724-1255818c0533?q=80&w=400&h=400&auto=format&fit=crop",
        "Standard Milk": "https://images.unsplash.com/photo-1528498033373-3c6c08e93d79?q=80&w=400&h=400&auto=format&fit=crop",
        "Cow Milk": "https://images.unsplash.com/photo-1563636619-e910ef49e9cf?q=80&w=400&h=400&auto=format&fit=crop",
        "Buffalo Milk": "https://images.unsplash.com/photo-1550583724-1255818c0533?q=80&w=400&h=400&auto=format&fit=crop",
        "Butter Milk": "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?q=80&w=400&h=400&auto=format&fit=crop",
        "Ghee": "https://images.unsplash.com/photo-1631709497146-a239ef57355a?q=80&w=400&h=400&auto=format&fit=crop",
        "Cheese": "https://images.unsplash.com/photo-1485962391905-dc37bb33e24e?q=80&w=400&h=400&auto=format&fit=crop",
        "Butter": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?q=80&w=400&h=400&auto=format&fit=crop",
        "Paneer": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=400&h=400&auto=format&fit=crop",
        "Curd": "https://images.unsplash.com/photo-1571214506484-8849b2d7c0d0?q=80&w=400&h=400&auto=format&fit=crop"
    }

    print("Updating product images with professional photos...")
    
    products = Product.objects.all()
    updated_count = 0
    
    for product in products:
        for name, url in image_mapping.items():
            if name.lower() in product.name.lower():
                product.image_url = url
                product.save()
                print(f"✅ Updated: {product.name}")
                updated_count += 1
                break
                
    print(f"\nFinished! Updated {updated_count} products.")

if __name__ == "__main__":
    update_images()