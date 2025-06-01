# Flake8: noqa
"""
Tests for user account deletion functionality.
Ensures that orders are preserved when users are deleted.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase

from products.models import Category, Product
from shop.models import Order

User = get_user_model()


class AccountDeletionTestCase(TestCase):
    """Test cases for user account deletion and order preservation."""

    def setUp(self):
        """Set up test data."""
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

        # Create a test category and product (required for orders)
        self.category = Category.objects.create(
            name='Test Category',
            slug='test-category'
        )

        self.product = Product.objects.create(
            name='Test Product',
            slug='test-product',
            price=10.00,
            category=self.category,
            stock_quantity=10
        )

        # Create a test order associated with the user
        self.order = Order.objects.create(
            user=self.user,
            order_number='TEST123456',
            full_name='Test User',
            email='test@example.com',
            phone_number='1234567890',
            shipping_address1='123 Test St',
            shipping_city='Test City',
            shipping_state='Test State',
            shipping_zipcode='12345',
            shipping_country='Test Country',
            billing_name='Test User',
            billing_address1='123 Test St',
            billing_city='Test City',
            billing_state='Test State',
            billing_zipcode='12345',
            billing_country='Test Country',
            total_price=10.00,
            grand_total=10.00,
            status='paid'
        )

    def test_user_deletion_preserves_orders(self):
        """Test that deleting a user preserves their orders but sets user to NULL."""
        # Verify the order exists and is associated with the user
        self.assertTrue(Order.objects.filter(user=self.user).exists())
        self.assertEqual(self.order.user, self.user)

        # Store the order ID for later verification
        order_id = self.order.id

        # Delete the user
        self.user.delete()

        # Verify the user is deleted
        self.assertFalse(User.objects.filter(username='testuser').exists())

        # Verify the order still exists but user field is NULL
        order = Order.objects.get(id=order_id)
        self.assertIsNone(order.user)
        self.assertEqual(order.order_number, 'TEST123456')
        self.assertEqual(order.full_name, 'Test User')
        self.assertEqual(order.email, 'test@example.com')

    def test_multiple_orders_preserved_on_user_deletion(self):
        """Test that multiple orders are all preserved when user is deleted."""
        # Create additional orders for the same user
        Order.objects.create(
            user=self.user,
            order_number='TEST789012',
            full_name='Test User',
            email='test@example.com',
            phone_number='1234567890',
            shipping_address1='456 Another St',
            shipping_city='Another City',
            shipping_state='Another State',
            shipping_zipcode='67890',
            shipping_country='Another Country',
            billing_name='Test User',
            billing_address1='456 Another St',
            billing_city='Another City',
            billing_state='Another State',
            billing_zipcode='67890',
            billing_country='Another Country',
            total_price=25.00,
            grand_total=25.00,
            status='shipped'
        )

        # Verify both orders exist and are associated with the user
        self.assertEqual(Order.objects.filter(user=self.user).count(), 2)

        # Delete the user
        self.user.delete()

        # Verify both orders still exist but user fields are NULL
        orders = Order.objects.filter(order_number__in=['TEST123456', 'TEST789012'])
        self.assertEqual(orders.count(), 2)

        for order in orders:
            self.assertIsNone(order.user)
            self.assertEqual(order.full_name, 'Test User')
            self.assertEqual(order.email, 'test@example.com')

    def test_orders_without_users_remain_intact(self):
        """Test that orders without associated users are not affected by user deletion."""
        # Create an order without a user (anonymous order)
        Order.objects.create(
            user=None,  # No user associated
            order_number='ANON123456',
            full_name='Anonymous User',
            email='anon@example.com',
            phone_number='9876543210',
            shipping_address1='789 Anonymous St',
            shipping_city='Anonymous City',
            shipping_state='Anonymous State',
            shipping_zipcode='54321',
            shipping_country='Anonymous Country',
            billing_name='Anonymous User',
            billing_address1='789 Anonymous St',
            billing_city='Anonymous City',
            billing_state='Anonymous State',
            billing_zipcode='54321',
            billing_country='Anonymous Country',
            total_price=15.00,
            grand_total=15.00,
            status='paid'
        )

        # Verify we have one order with user and one without
        self.assertEqual(Order.objects.filter(user=self.user).count(), 1)
        self.assertEqual(Order.objects.filter(user=None).count(), 1)

        # Delete the user
        self.user.delete()

        # Verify anonymous order is still intact
        anon_order = Order.objects.get(order_number='ANON123456')
        self.assertIsNone(anon_order.user)
        self.assertEqual(anon_order.full_name, 'Anonymous User')

        # Verify user order still exists but user is NULL
        user_order = Order.objects.get(order_number='TEST123456')
        self.assertIsNone(user_order.user)
        self.assertEqual(user_order.full_name, 'Test User')
