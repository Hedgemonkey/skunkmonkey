# flake8: noqa
import os
import random
from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.contrib.auth.models import User
from django.core.files import File
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify

from products.models import Category, InventoryLog, Product
from shop.models import Cart, CartItem, Order, OrderItem, WishlistItem
from skunkmonkey.utils.s3_utils import upload_base64_to_model_field


class Command(BaseCommand):
    help = 'Clears the database and generates dummy CBD shop data using Hedge directory images'

    def add_arguments(self, parser):
        parser.add_argument(
            '--no-clear',
            action='store_true',
            help='Do not clear existing data before generating new data'
        )

    def handle(self, *args, **options):
        # Define the path to the Hedge directory with images
        hedge_dir = Path('/home/hedgemonkey/Downloads/Hedge')

        # Check if the Hedge directory exists
        if not hedge_dir.exists():
            self.stdout.write(self.style.ERROR(f'Directory not found: {hedge_dir}'))
            return

        # Get image files from the Hedge directory
        image_files = list(hedge_dir.glob('*.jpeg')) + list(hedge_dir.glob('*.avif'))
        if not image_files:
            self.stdout.write(self.style.ERROR('No image files found in the Hedge directory'))
            return

        self.stdout.write(self.style.SUCCESS(f'Found {len(image_files)} images in the Hedge directory'))

        # Clear existing data if --no-clear is not provided
        if not options['no_clear']:
            self.clear_data()

        # Generate dummy data
        try:
            with transaction.atomic():
                # Create CBD categories
                categories = self.create_categories()

                # Create products using images from Hedge directory
                products = self.create_products(categories, image_files)

                # Create test users
                users = self.create_users()

                # Create orders for users
                orders = self.create_orders(users, products)

                # Create wishlists
                self.create_wishlists(users, products)

                # Create carts
                self.create_carts(users, products)

            self.stdout.write(self.style.SUCCESS('Successfully generated dummy CBD shop data'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error generating dummy data: {str(e)}'))

    def clear_data(self):
        """Clear existing data from the database"""
        self.stdout.write('Clearing existing data...')

        # Delete all products (this will cascade to related models)
        Product.objects.all().delete()

        # Delete all categories
        Category.objects.all().delete()

        # Delete all orders and order items
        Order.objects.all().delete()

        # Delete all wishlists items
        WishlistItem.objects.all().delete()

        # Delete all carts and cart items
        Cart.objects.all().delete()

        self.stdout.write(self.style.SUCCESS('Existing data cleared'))

    def create_categories(self):
        """Create CBD product categories"""
        self.stdout.write('Creating CBD product categories...')

        categories = [
            {
                'name': 'CBD Oils',
                'friendly_name': 'CBD Oils & Tinctures',
                'description': 'High-quality CBD oils and tinctures for sublingual use'
            },
            {
                'name': 'CBD Edibles',
                'friendly_name': 'CBD Edibles & Gummies',
                'description': 'Delicious CBD-infused edibles and gummy products'
            },
            {
                'name': 'CBD Topicals',
                'friendly_name': 'CBD Creams & Balms',
                'description': 'CBD-infused creams, balms and salves for topical application'
            },
            {
                'name': 'CBD Capsules',
                'friendly_name': 'CBD Capsules & Pills',
                'description': 'Easy-to-use CBD capsules with precise dosing'
            },
            {
                'name': 'CBD Vapes',
                'friendly_name': 'CBD Vape Products',
                'description': 'CBD vape cartridges, pens, and e-liquids'
            }
        ]

        created_categories = []

        for i, category_data in enumerate(categories):
            category = Category.objects.create(
                name=category_data['name'],
                slug=slugify(category_data['name']),
                friendly_name=category_data['friendly_name'],
                order=i,
                is_active=True
            )
            created_categories.append(category)
            self.stdout.write(f'  Created category: {category.name}')

        return created_categories

    def create_products(self, categories, image_files):
        """Create CBD products using images from the Hedge directory"""
        self.stdout.write('Creating CBD products...')

        cbd_products = [
            # CBD Oils
            {
                'name': 'Full Spectrum CBD Oil 500mg',
                'description': 'Our full spectrum CBD oil contains the complete range of cannabinoids for maximum effect.',
                'category': 'CBD Oils',
                'price': '39.99',
                'compare_at_price': '49.99',
                'sku': 'CBD-OIL-FS-500'
            },
            {
                'name': 'CBD Isolate Tincture 1000mg',
                'description': 'Pure CBD isolate tincture with MCT oil for enhanced absorption. THC-free formula.',
                'category': 'CBD Oils',
                'price': '59.99',
                'compare_at_price': None,
                'sku': 'CBD-OIL-ISO-1000'
            },
            {
                'name': 'Broad Spectrum CBD Oil 750mg',
                'description': 'Our broad spectrum CBD oil offers the benefits of multiple cannabinoids without THC.',
                'category': 'CBD Oils',
                'price': '49.99',
                'compare_at_price': '59.99',
                'sku': 'CBD-OIL-BS-750'
            },

            # CBD Edibles
            {
                'name': 'CBD Gummies 300mg',
                'description': 'Delicious fruit-flavored CBD gummies with 10mg of CBD per piece. Vegan-friendly.',
                'category': 'CBD Edibles',
                'price': '24.99',
                'compare_at_price': '29.99',
                'sku': 'CBD-GUM-300'
            },
            {
                'name': 'CBD Chocolate Squares 200mg',
                'description': 'Premium dark chocolate infused with CBD. Each square contains 20mg of CBD.',
                'category': 'CBD Edibles',
                'price': '19.99',
                'compare_at_price': None,
                'sku': 'CBD-CHO-200'
            },
            {
                'name': 'CBD Honey Sticks 250mg',
                'description': 'Organic honey infused with CBD. Perfect for tea or as a sweet treat.',
                'category': 'CBD Edibles',
                'price': '22.99',
                'compare_at_price': '24.99',
                'sku': 'CBD-HON-250'
            },

            # CBD Topicals
            {
                'name': 'CBD Pain Relief Cream 500mg',
                'description': 'Fast-acting CBD cream with menthol and eucalyptus for targeted pain relief.',
                'category': 'CBD Topicals',
                'price': '44.99',
                'compare_at_price': '54.99',
                'sku': 'CBD-CRM-500'
            },
            {
                'name': 'CBD Muscle Rub 250mg',
                'description': 'Deep-tissue CBD muscle rub with warming properties for post-workout recovery.',
                'category': 'CBD Topicals',
                'price': '29.99',
                'compare_at_price': None,
                'sku': 'CBD-RUB-250'
            },
            {
                'name': 'CBD Facial Serum 150mg',
                'description': 'Rejuvenating CBD facial serum with hyaluronic acid and vitamin C.',
                'category': 'CBD Topicals',
                'price': '34.99',
                'compare_at_price': '39.99',
                'sku': 'CBD-SRM-150'
            },

            # CBD Capsules
            {
                'name': 'CBD Softgel Capsules 750mg',
                'description': 'Easy-to-swallow CBD softgels with 25mg per capsule. 30 count bottle.',
                'category': 'CBD Capsules',
                'price': '54.99',
                'compare_at_price': None,
                'sku': 'CBD-CAP-750'
            },
            {
                'name': 'CBD Sleep Capsules 450mg',
                'description': 'CBD capsules with melatonin for improved sleep. 15mg CBD per capsule.',
                'category': 'CBD Capsules',
                'price': '39.99',
                'compare_at_price': '44.99',
                'sku': 'CBD-SLP-450'
            },

            # CBD Vapes
            {
                'name': 'CBD Vape Cartridge 250mg',
                'description': 'Terpene-infused CBD vape cartridge. Compatible with standard 510 thread batteries.',
                'category': 'CBD Vapes',
                'price': '29.99',
                'compare_at_price': '34.99',
                'sku': 'CBD-VPE-250'
            },
            {
                'name': 'CBD Vape Pen Kit',
                'description': 'Complete CBD vape pen kit with battery and 125mg CBD cartridge.',
                'category': 'CBD Vapes',
                'price': '39.99',
                'compare_at_price': None,
                'sku': 'CBD-VPK-125'
            },
            {
                'name': 'CBD E-Liquid 500mg',
                'description': 'CBD-infused e-liquid for use in refillable vape devices. Various flavors available.',
                'category': 'CBD Vapes',
                'price': '49.99',
                'compare_at_price': '59.99',
                'sku': 'CBD-ELQ-500'
            }
        ]

        created_products = []

        # Create a category mapping for easier lookup
        category_map = {cat.name: cat for cat in categories}

        # Distribute available images among products
        # If we have fewer images than products, we'll reuse some images
        image_cycle = image_files.copy()
        random.shuffle(image_cycle)

        for i, product_data in enumerate(cbd_products):
            # Get the next image from our shuffled list
            if not image_cycle:  # If we've used all images, reshuffle
                image_cycle = image_files.copy()
                random.shuffle(image_cycle)

            image_file = image_cycle.pop(0)

            # Find the category object
            category = category_map.get(product_data['category'])
            if not category:
                self.stdout.write(self.style.WARNING(f"Category {product_data['category']} not found, skipping product"))
                continue

            # Create the product
            product = Product(
                name=product_data['name'],
                slug=slugify(product_data['name']),
                category=category,
                description=product_data['description'],
                price=Decimal(product_data['price']),
                compare_at_price=Decimal(product_data['compare_at_price']) if product_data['compare_at_price'] else None,
                stock_quantity=random.randint(10, 100),
                sku=product_data['sku'],
                is_active=True
            )

            # Save product first to get an ID
            product.save()

            # Add image file to the product
            try:
                with open(image_file, 'rb') as f:
                    # If using AWS S3, handle image upload differently
                    if settings.USE_S3:
                        # Read the image file in binary mode
                        image_data = f.read()
                        # Generate a base64 string from the binary data
                        import base64
                        base64_image = f"data:image/jpeg;base64,{base64.b64encode(image_data).decode('utf-8')}"

                        # Use the S3 utility function to upload the image
                        result = upload_base64_to_model_field(
                            product,
                            'image',
                            base64_image,
                            'product_images',
                            f"product_{slugify(product.name)}"
                        )

                        if not result['success']:
                            self.stdout.write(self.style.WARNING(f"Failed to upload image for {product.name}: {result['message']}"))
                    else:
                        # For local storage, use Django's File
                        product.image.save(
                            f"{slugify(product.name)}{os.path.splitext(image_file.name)[1]}",
                            File(f),
                            save=True
                        )

                    self.stdout.write(f"  Added image {image_file.name} to product {product.name}")

            except Exception as e:
                self.stdout.write(self.style.WARNING(f"Error adding image to {product.name}: {str(e)}"))

            # Create an inventory log entry
            InventoryLog.objects.create(
                product=product,
                change=product.stock_quantity,
                reason='Initial stock'
            )

            created_products.append(product)
            self.stdout.write(f"  Created product: {product.name} ({product.category.name})")

        return created_products

    def create_users(self):
        """Create test users"""
        self.stdout.write('Creating test users...')

        test_users = [
            {
                'username': 'testcustomer',
                'email': 'customer@example.com',
                'password': 'testpassword',
                'first_name': 'Test',
                'last_name': 'Customer'
            },
            {
                'username': 'janedoe',
                'email': 'jane@example.com',
                'password': 'testpassword',
                'first_name': 'Jane',
                'last_name': 'Doe'
            },
            {
                'username': 'johndoe',
                'email': 'john@example.com',
                'password': 'testpassword',
                'first_name': 'John',
                'last_name': 'Doe'
            }
        ]

        created_users = []

        for user_data in test_users:
            # Check if the user already exists
            if not User.objects.filter(username=user_data['username']).exists():
                user = User.objects.create_user(
                    username=user_data['username'],
                    email=user_data['email'],
                    password=user_data['password'],
                    first_name=user_data['first_name'],
                    last_name=user_data['last_name']
                )
                created_users.append(user)
                self.stdout.write(f"  Created user: {user.username}")
            else:
                user = User.objects.get(username=user_data['username'])
                created_users.append(user)
                self.stdout.write(f"  User already exists: {user.username}")

        return created_users

    def create_orders(self, users, products):
        """Create orders for test users"""
        self.stdout.write('Creating test orders...')

        created_orders = []

        # Create 1-3 orders per user
        for user in users:
            num_orders = random.randint(1, 3)

            for i in range(num_orders):
                # Get random products for this order (2-5 products)
                order_products = random.sample(products, random.randint(2, 5))

                # Calculate order totals
                items_total = Decimal('0.00')
                shipping_cost = Decimal('5.99')

                # Create the order
                order = Order.objects.create(
                    user=user,
                    full_name=f"{user.first_name} {user.last_name}",
                    email=user.email,
                    phone_number='555-123-4567',
                    # Shipping address
                    shipping_address1='123 Main Street',
                    shipping_address2='Apt 4B',
                    shipping_city='Anytown',
                    shipping_state='CA',
                    shipping_zipcode='90210',
                    shipping_country='United States',
                    # Billing address (same as shipping for simplicity)
                    billing_name=f"{user.first_name} {user.last_name}",
                    billing_address1='123 Main Street',
                    billing_address2='Apt 4B',
                    billing_city='Anytown',
                    billing_state='CA',
                    billing_zipcode='90210',
                    billing_country='United States',
                    # Order details
                    status=random.choice(['created', 'paid', 'shipped', 'delivered']),
                    payment_status='completed',
                    shipping_cost=shipping_cost,
                    total_price=Decimal('0.00'),  # Will be calculated after adding items
                    grand_total=Decimal('0.00'),  # Will be calculated after adding items
                    is_paid=True,
                    paid_at=timezone.now() - timezone.timedelta(days=random.randint(1, 30))
                )

                # Add items to the order
                for product in order_products:
                    quantity = random.randint(1, 3)
                    price = product.price
                    item_total = price * quantity
                    items_total += item_total

                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=quantity,
                        price=price
                    )

                # Update order totals
                order.total_price = items_total
                order.grand_total = items_total + shipping_cost

                # Set shipped and delivered dates if applicable
                if order.status == 'shipped' or order.status == 'delivered':
                    order.shipped_at = order.paid_at + timezone.timedelta(days=random.randint(1, 3))
                    if order.status == 'delivered':
                        order.delivered_at = order.shipped_at + timezone.timedelta(days=random.randint(1, 5))

                order.save()
                created_orders.append(order)
                self.stdout.write(f"  Created order {order.order_number} for {user.username} with {len(order_products)} products")

        return created_orders

    def create_wishlists(self, users, products):
        """Create wishlists for test users"""
        self.stdout.write('Creating wishlists...')

        for user in users:
            # Add 1-4 random products to wishlist
            wishlist_products = random.sample(products, random.randint(1, 4))

            for product in wishlist_products:
                WishlistItem.objects.create(
                    user=user,
                    product=product
                )

            self.stdout.write(f"  Added {len(wishlist_products)} products to {user.username}'s wishlist")

    def create_carts(self, users, products):
        """Create shopping carts for test users"""
        self.stdout.write('Creating shopping carts...')

        for user in users:
            # Create a cart for the user
            cart = Cart.objects.create(
                user=user
            )

            # Add 1-3 random products to cart
            cart_products = random.sample(products, random.randint(1, 3))

            for product in cart_products:
                quantity = random.randint(1, 2)
                CartItem.objects.create(
                    cart=cart,
                    product=product,
                    quantity=quantity
                )

            self.stdout.write(f"  Added {len(cart_products)} products to {user.username}'s cart")
