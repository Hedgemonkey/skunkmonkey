"""
Test cases for staff app models
"""
import logging
from datetime import timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone

from shop.models import Order
from staff.models import (
    OrderAction, OrderNote, StaffNotification, StaffProfile,
)

# Set up logger
logger = logging.getLogger(__name__)


class StaffProfileModelTestCase(TestCase):
    """Test cases for the StaffProfile model"""

    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='staffuser',
            email='staff@example.com',
            password='password123',
            is_staff=True
        )

    def test_profile_creation(self):
        """Test that a staff profile can be created"""
        profile = StaffProfile.objects.create(
            user=self.user,
            is_manager=True,
            department='orders',
            phone_extension='123',
            notes='Test notes'
        )

        self.assertEqual(profile.user, self.user)
        self.assertTrue(profile.is_manager)
        self.assertEqual(profile.department, 'orders')
        self.assertEqual(profile.phone_extension, '123')
        self.assertEqual(profile.notes, 'Test notes')

    def test_profile_string_representation(self):
        """Test the string representation of a staff profile"""
        profile = StaffProfile.objects.create(
            user=self.user,
            department='orders'
        )

        expected_string = f"{self.user.username} ({profile.get_department_display()})"
        self.assertEqual(str(profile), expected_string)


class OrderActionModelTestCase(TestCase):
    """Test cases for the OrderAction model"""

    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='staffuser',
            email='staff@example.com',
            password='password123',
            is_staff=True
        )

        # Create an order using the current Order model structure
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
            total_price=100.00,
            grand_total=110.00,
            status='created',
            payment_status='pending',
            stripe_pid='test_pid'
        )

    def test_order_action_creation(self):
        """Test that an order action can be created"""
        action = OrderAction.objects.create(
            order=self.order,
            staff_user=self.user,
            action_type='status_change',
            description='Status changed from created to paid',
            old_status='created',
            new_status='paid',
            ip_address='127.0.0.1'
        )

        self.assertEqual(action.order, self.order)
        self.assertEqual(action.staff_user, self.user)
        self.assertEqual(action.action_type, 'status_change')
        self.assertEqual(action.description, 'Status changed from created to paid')
        self.assertEqual(action.old_status, 'created')
        self.assertEqual(action.new_status, 'paid')
        self.assertEqual(action.ip_address, '127.0.0.1')

    def test_order_action_string_representation(self):
        """Test the string representation of an order action"""
        action = OrderAction.objects.create(
            order=self.order,
            staff_user=self.user,
            action_type='status_change',
            description='Status changed'
        )

        expected_string = f"Status Change on {self.order.order_number} by {self.user}"
        self.assertEqual(str(action), expected_string)


class StaffNotificationModelTestCase(TestCase):
    """Test cases for the StaffNotification model"""

    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='staffuser',
            email='staff@example.com',
            password='password123',
            is_staff=True
        )

        # Create an order using the current Order model structure
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
            total_price=100.00,
            grand_total=110.00,
            status='created',
            payment_status='pending',
            stripe_pid='test_pid'
        )

    def test_notification_creation(self):
        """Test that a staff notification can be created"""
        notification = StaffNotification.objects.create(
            recipient=self.user,
            title='New Order',
            message='A new order has been placed',
            priority='high',
            related_order=self.order
        )

        self.assertEqual(notification.recipient, self.user)
        self.assertEqual(notification.title, 'New Order')
        self.assertEqual(notification.message, 'A new order has been placed')
        self.assertEqual(notification.priority, 'high')
        self.assertEqual(notification.related_order, self.order)
        self.assertFalse(notification.is_read)
        self.assertIsNone(notification.read_at)

    def test_notification_mark_as_read(self):
        """Test marking a notification as read"""
        notification = StaffNotification.objects.create(
            recipient=self.user,
            title='New Order',
            message='A new order has been placed'
        )

        before_read = timezone.now()
        notification.mark_as_read()
        after_read = timezone.now()

        # Refresh from DB to get updated values
        notification.refresh_from_db()

        self.assertTrue(notification.is_read)
        self.assertIsNotNone(notification.read_at)
        self.assertTrue(before_read <= notification.read_at <= after_read)

    def test_notification_string_representation(self):
        """Test the string representation of a staff notification"""
        notification = StaffNotification.objects.create(
            recipient=self.user,
            title='New Order',
            message='A new order has been placed'
        )

        expected_string = f"{notification.title} for {notification.recipient}"
        self.assertEqual(str(notification), expected_string)


class OrderNoteModelTestCase(TestCase):
    """Test cases for the OrderNote model"""

    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='staffuser',
            email='staff@example.com',
            password='password123',
            is_staff=True
        )

        # Create an order using the current Order model structure
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
            total_price=100.00,
            grand_total=110.00,
            status='created',
            payment_status='pending',
            stripe_pid='test_pid'
        )

    def test_order_note_creation(self):
        """Test that an order note can be created"""
        note = OrderNote.objects.create(
            order=self.order,
            staff_user=self.user,
            content='This is a test note',
            is_important=True
        )

        self.assertEqual(note.order, self.order)
        self.assertEqual(note.staff_user, self.user)
        self.assertEqual(note.content, 'This is a test note')
        self.assertTrue(note.is_important)

    def test_order_note_string_representation(self):
        """Test the string representation of an order note"""
        note = OrderNote.objects.create(
            order=self.order,
            staff_user=self.user,
            content='This is a test note'
        )

        expected_string = f"Note on {self.order.order_number} by {self.user}"
        self.assertEqual(str(note), expected_string)
