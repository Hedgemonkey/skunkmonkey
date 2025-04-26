"""
Integration tests for staff app
"""
import logging
from datetime import datetime

from django.contrib.auth.models import User
from django.test import Client, TestCase
from django.urls import reverse
from django.utils import timezone

from products.models import Category, Product
from shop.models import Order, OrderItem
from staff.models import OrderAction, OrderNote, StaffProfile

# Set up logger
logger = logging.getLogger(__name__)


class StaffShopIntegrationTestCase(TestCase):
    """Integration tests between staff and shop apps"""

    def setUp(self):
        """Set up test data"""
        # Create staff user
        self.staff_user = User.objects.create_user(
            username='staffuser',
            email='staff@example.com',
            password='password123',
            is_staff=True
        )

        # Create staff profile
        self.staff_profile = StaffProfile.objects.create(
            user=self.staff_user,
            department='orders'
        )

        # Create product category
        self.category = Category.objects.create(
            name='Test Category',
            slug='test-category'
        )

        # Create product
        self.product = Product.objects.create(
            category=self.category,
            name='Test Product',
            slug='test-product',
            description='Test product description',
            price=99.99,
            stock_quantity=10
        )

        # Create order with complete address details to satisfy template
        self.order = Order.objects.create(
            full_name='Test Customer',
            email='customer@example.com',
            phone_number='1234567890',
            shipping_address1='123 Test St',
            shipping_city='Test City',
            shipping_state='Test State',
            shipping_zipcode='TE12 3ST',
            shipping_country='GB',
            billing_name='Test Customer',
            billing_address1='123 Test St',
            billing_city='Test City',
            billing_state='Test State',
            billing_zipcode='TE12 3ST',
            billing_country='GB',
            status='created',
            payment_status='pending',
            order_number='TEST001',
            tracking_number='',
            total_price=99.99,
            shipping_cost=10.00,
            grand_total=109.99
        )

        # Add additional fields needed by template to avoid debug warnings
        # These are dynamically added properties to satisfy the template
        # rather than modifying the template with conditionals
        self.order.address_line_1 = self.order.shipping_address1
        self.order.town_or_city = self.order.shipping_city
        self.order.postcode = self.order.shipping_zipcode
        self.order.county = self.order.shipping_state
        self.order.subtotal_price = self.order.total_price
        self.order.shipping_price = self.order.shipping_cost
        self.order.discount_amount = 0.00

        # Create country object that has a name attribute
        class MockCountry:
            def __init__(self, code):
                self.name = {'GB': 'United Kingdom'}.get(code, 'Unknown')

        self.order.country = MockCountry(self.order.shipping_country)

        # Add order item - removed total_price as it's a property
        self.order_item = OrderItem.objects.create(
            order=self.order,
            product=self.product,
            quantity=1,
            price=99.99
        )

        # Add product_variant attribute to satisfy template
        self.order_item.product_variant = None

        # URLs to test
        self.order_detail_url = reverse(
            'staff:order_detail',
            args=[self.order.id]
        )
        self.order_update_url = reverse('staff:order_update', args=[self.order.id])
        self.shipping_update_url = reverse('staff:shipping_update', args=[self.order.id])
        self.note_create_url = reverse('staff:add_note', args=[self.order.id])

        # Set up client
        self.client = Client()
        self.client.login(username='staffuser', password='password123')

    def test_update_order_status(self):
        """Test updating order status"""
        # Ensure order starts with 'created' status
        self.order.status = 'created'
        self.order.save()

        # Send POST to update order status
        response = self.client.post(
            self.order_update_url,
            {
                'status': 'paid',
                'payment_status': 'completed'  # Use 'completed' instead of 'paid'
            },
            follow=True
        )

        # Check redirect
        self.assertEqual(response.status_code, 200)

        # Check order status was updated
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'paid')

        # Check action was logged
        action = OrderAction.objects.filter(
            order=self.order,
            action_type='status_change'
        ).first()
        self.assertIsNotNone(action)
        self.assertEqual(action.new_status, 'paid')
        self.assertEqual(action.old_status, 'created')

    def test_update_shipping_info(self):
        """Test updating shipping information"""
        # Define shipped and delivered dates
        shipped_date = timezone.now()
        delivered_date = timezone.now()

        # Ensure the original tracking number is empty for comparison
        self.order.tracking_number = ''
        self.order.save()

        # Send POST to update shipping info
        response = self.client.post(
            self.shipping_update_url,
            {
                'tracking_number': 'TRACK123456',
                'shipped_at': shipped_date.strftime('%Y-%m-%dT%H:%M:%S'),
                'delivered_at': delivered_date.strftime('%Y-%m-%dT%H:%M:%S'),
                'shipping_notes': 'Shipped via express delivery',
                'shipping_carrier': 'Express Shipping',
                'notify_customer': True
            },
            follow=True
        )

        # Check redirect
        self.assertEqual(response.status_code, 200)

        # Check order shipping info was updated
        self.order.refresh_from_db()
        self.assertEqual(self.order.tracking_number, 'TRACK123456')
        self.assertIsNotNone(self.order.shipped_at)
        self.assertIsNotNone(self.order.delivered_at)

        # Check action was logged
        action = OrderAction.objects.filter(
            order=self.order,
            action_type='shipping_update'
        ).first()
        self.assertIsNotNone(action)
        self.assertIn('Tracking number updated', action.description)

    def test_add_note_to_order(self):
        """Test adding a note to an order"""
        # Send POST to create a new note
        response = self.client.post(
            self.note_create_url,
            {
                'content': 'Customer requested gift wrapping',
                'is_important': True
            },
            follow=True
        )

        # Check redirect and success message
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Note has been added to the order')

        # Check note was created and associated with order
        note = OrderNote.objects.filter(order=self.order).first()
        self.assertIsNotNone(note)
        self.assertEqual(note.content, 'Customer requested gift wrapping')
        self.assertTrue(note.is_important)
        self.assertEqual(note.staff_user, self.staff_user)

        # Check action was logged
        action = OrderAction.objects.filter(
            order=self.order,
            action_type='note_added'
        ).first()
        self.assertIsNotNone(action)
        self.assertIn('Note added to order', action.description)


class StaffProductsIntegrationTestCase(TestCase):
    """Integration tests between staff and products apps"""

    def setUp(self):
        """Set up test data"""
        # Create staff user
        self.staff_user = User.objects.create_user(
            username='staffuser',
            email='staff@example.com',
            password='password123',
            is_staff=True
        )

        # Create staff profile with manager role
        self.staff_profile = StaffProfile.objects.create(
            user=self.staff_user,
            department='admin',
            is_manager=True
        )

        # Create test category
        self.category = Category.objects.create(
            name='Test Category',
            slug='test-category'
        )

        # Create test products
        self.product = Product.objects.create(
            category=self.category,
            name='Test Product',
            slug='test-product',
            description='Test product description',
            price=99.99,
            stock_quantity=10
        )

        # Create order with product
        self.order = Order.objects.create(
            full_name='Test Customer',
            email='customer@example.com',
            phone_number='1234567890',
            shipping_address1='123 Test St',
            shipping_city='Test City',
            shipping_state='Test State',
            shipping_zipcode='TE12 3ST',
            shipping_country='GB',
            billing_name='Test Customer',
            billing_address1='123 Test St',
            billing_city='Test City',
            billing_state='Test State',
            billing_zipcode='TE12 3ST',
            billing_country='GB',
            status='created',
            payment_status='pending',
            order_number='TEST001',
            tracking_number='',
            total_price=99.99,
            shipping_cost=10.00,
            grand_total=109.99
        )

        # Add order item - removed total_price as it's a property
        self.order_item = OrderItem.objects.create(
            order=self.order,
            product=self.product,
            quantity=1,
            price=99.99
        )

        # Set up client
        self.client = Client()
        self.client.login(username='staffuser', password='password123')

        # URLs to test
        self.order_detail_url = reverse('staff:order_detail', args=[self.order.id])

    def test_order_product_relationship(self):
        """Test that order details show correct product information"""
        # Get order detail page
        response = self.client.get(self.order_detail_url)

        # Check response status
        self.assertEqual(response.status_code, 200)

        # Check that the product is shown in the order items
        self.assertContains(response, self.product.name)

        # Verify order item data is correct
        order_items = response.context['order_items']
        self.assertEqual(len(order_items), 1)
        self.assertEqual(order_items[0].product, self.product)
        self.assertEqual(order_items[0].quantity, 1)
        self.assertEqual(float(order_items[0].price), 99.99)
