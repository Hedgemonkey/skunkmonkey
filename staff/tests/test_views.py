"""
Test cases for staff app views
"""
import logging
from unittest.mock import MagicMock, patch

from django.contrib.auth.models import User
from django.contrib.messages.storage.fallback import FallbackStorage
from django.test import Client, RequestFactory, TestCase
from django.urls import reverse

from shop.models import Order
from staff.models import (
    OrderAction, OrderNote, StaffNotification, StaffProfile,
)
from staff.views import (
    DashboardView, NotificationListView, OrderDetailView, OrderListView,
)

# Set up logger
logger = logging.getLogger(__name__)


class StaffAccessMixinTestCase(TestCase):
    """Test cases for the StaffAccessMixin"""

    def setUp(self):
        """Set up test data"""
        # Create regular user
        self.regular_user = User.objects.create_user(
            username='regularuser',
            email='regular@example.com',
            password='password123'
        )

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

        # URLs to test
        self.dashboard_url = reverse('staff:dashboard')
        self.order_list_url = reverse('staff:order_list')
        self.notifications_url = reverse('staff:notifications')

        # Create client
        self.client = Client()

    def test_access_denied_for_anonymous_users(self):
        """Test that anonymous users are redirected to login"""
        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, 302)
        self.assertIn('login', response.url)

    def test_access_denied_for_regular_users(self):
        """Test that regular users get a 403 Forbidden response"""
        self.client.login(username='regularuser', password='password123')

        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, 403)

    def test_access_granted_for_staff_users(self):
        """Test that staff users can access staff pages"""
        self.client.login(username='staffuser', password='password123')

        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, 200)

        response = self.client.get(self.order_list_url)
        self.assertEqual(response.status_code, 200)

        response = self.client.get(self.notifications_url)
        self.assertEqual(response.status_code, 200)


class DashboardViewTestCase(TestCase):
    """Test cases for the Dashboard view"""

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

        # Create some test orders with current Order model structure
        self.order_created = Order.objects.create(
            full_name='Test Customer 1',
            email='customer1@example.com',
            shipping_address1='123 Test St',
            shipping_city='Test City',
            shipping_state='Test State',
            shipping_zipcode='TE12 3ST',
            shipping_country='GB',
            billing_name='Test Customer 1',
            billing_address1='123 Test St',
            billing_city='Test City',
            billing_state='Test State',
            billing_zipcode='TE12 3ST',
            billing_country='GB',
            total_price=100.00,
            grand_total=110.00,
            status='created',
            payment_status='pending'
        )

        self.order_paid = Order.objects.create(
            full_name='Test Customer 2',
            email='customer2@example.com',
            shipping_address1='456 Test St',
            shipping_city='Test City',
            shipping_state='Test State',
            shipping_zipcode='TE12 3ST',
            shipping_country='GB',
            billing_name='Test Customer 2',
            billing_address1='456 Test St',
            billing_city='Test City',
            billing_state='Test State',
            billing_zipcode='TE12 3ST',
            billing_country='GB',
            total_price=200.00,
            grand_total=220.00,
            status='paid',
            payment_status='completed'
        )

        # Create some test notifications
        self.notification = StaffNotification.objects.create(
            recipient=self.staff_user,
            title='Test Notification',
            message='This is a test notification',
            priority='medium'
        )

        # Set up client
        self.client = Client()
        self.client.login(username='staffuser', password='password123')

        # URL to test
        self.dashboard_url = reverse('staff:dashboard')

    def test_dashboard_loads_with_correct_statistics(self):
        """Test that the dashboard loads with correct order statistics"""
        response = self.client.get(self.dashboard_url)

        # Check response status
        self.assertEqual(response.status_code, 200)

        # Check template used
        self.assertTemplateUsed(response, 'staff/dashboard.html')

        # Check context data
        self.assertEqual(response.context['total_orders'], 2)
        self.assertEqual(response.context['pending_orders'], 1)  # created status
        self.assertEqual(response.context['paid_orders'], 1)  # paid payment_status
        self.assertEqual(len(response.context['recent_orders']), 2)
        self.assertEqual(len(response.context['notifications']), 1)


class OrderListViewTestCase(TestCase):
    """Test cases for the Order List view"""

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

        # Create some test orders with current Order model structure
        for i in range(1, 21):  # Create 20 orders for pagination testing
            # Status patterns
            if i % 3 == 0:
                status = 'created'
                payment_status = 'pending'
            elif i % 3 == 1:
                status = 'paid'
                payment_status = 'completed'
            else:
                status = 'shipped'
                payment_status = 'processing'

            Order.objects.create(
                full_name=f'Test Customer {i}',
                email=f'customer{i}@example.com',
                shipping_address1=f'{i}23 Test St',
                shipping_city='Test City',
                shipping_state='Test State',
                shipping_zipcode='TE12 3ST',
                shipping_country='GB',
                billing_name=f'Test Customer {i}',
                billing_address1=f'{i}23 Test St',
                billing_city='Test City',
                billing_state='Test State',
                billing_zipcode='TE12 3ST',
                billing_country='GB',
                total_price=100.00 * i,
                grand_total=110.00 * i,
                status=status,
                payment_status=payment_status
            )

        # Set up client
        self.client = Client()
        self.client.login(username='staffuser', password='password123')

        # URL to test
        self.order_list_url = reverse('staff:order_list')

    def test_order_list_loads_with_pagination(self):
        """Test that the order list loads with proper pagination"""
        response = self.client.get(self.order_list_url)

        # Check response status
        self.assertEqual(response.status_code, 200)

        # Check template used
        self.assertTemplateUsed(response, 'staff/order_list.html')

        # Check pagination (default should be 10 per page)
        self.assertTrue(response.context['is_paginated'])
        self.assertEqual(len(response.context['orders']), 10)

    def test_order_list_filtering(self):
        """Test that the order list can be filtered by status"""
        response = self.client.get(f"{self.order_list_url}?status=created")

        # Check filtered results
        self.assertEqual(response.status_code, 200)

        # There should be around 7 'created' orders (every third out of 20)
        created_orders = [
            order for order in response.context['orders']
            if order.status == 'created'
        ]
        self.assertTrue(len(created_orders) > 0)

        # Verify all returned orders have the filtered status
        for order in created_orders:
            self.assertEqual(order.status, 'created')


class OrderDetailViewTestCase(TestCase):
    """Test cases for the Order Detail view"""

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

        # Create test order with current Order model structure
        self.order = Order.objects.create(
            full_name='Test Customer',
            email='customer@example.com',
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
            payment_status='pending'
        )

        # Add order notes
        self.note = OrderNote.objects.create(
            order=self.order,
            staff_user=self.staff_user,
            content='Test note',
            is_important=True
        )

        # Set up client
        self.client = Client()
        self.client.login(username='staffuser', password='password123')

        # URL to test
        self.order_detail_url = reverse(
            'staff:order_detail',
            args=[self.order.id]
        )

    def test_order_detail_loads_with_correct_data(self):
        """Test that the order detail page loads with correct order data"""
        response = self.client.get(self.order_detail_url)

        # Check response status
        self.assertEqual(response.status_code, 200)

        # Check template used
        self.assertTemplateUsed(response, 'staff/order_detail.html')

        # Check context data
        self.assertEqual(response.context['order'], self.order)

        # Check for staff_notes instead of notes (updated related name)
        self.assertEqual(list(response.context['staff_notes']), [self.note])

        # Check forms are present
        self.assertTrue('update_form' in response.context)
        self.assertTrue('shipping_form' in response.context)
        self.assertTrue('contact_form' in response.context)
        self.assertTrue('note_form' in response.context)


class NotificationViewsTestCase(TestCase):
    """Test cases for the Notification views"""

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

        # Create some test notifications
        for i in range(5):
            priority = 'medium' if i % 2 == 0 else 'high'
            StaffNotification.objects.create(
                recipient=self.staff_user,
                title=f'Test Notification {i + 1}',
                message=f'This is test notification {i + 1}',
                priority=priority
            )

        # Set up client and request factory
        self.client = Client()
        self.client.login(username='staffuser', password='password123')
        self.factory = RequestFactory()

        # URLs to test
        self.notifications_url = reverse('staff:notifications')

    def test_notification_list_shows_all_notifications(self):
        """Test that the notification list shows all user notifications"""
        response = self.client.get(self.notifications_url)

        # Check response status
        self.assertEqual(response.status_code, 200)

        # Check template used
        self.assertTemplateUsed(response, 'staff/notifications.html')

        # Check context data
        self.assertEqual(len(response.context['notifications']), 5)

    def test_unread_only_filter(self):
        """Test that notifications can be filtered to show only unread ones"""
        # Mark one notification as read
        notification = StaffNotification.objects.first()
        notification.mark_as_read()

        url_with_filter = f"{self.notifications_url}?unread_only=true"
        response = self.client.get(url_with_filter)

        # Check response status
        self.assertEqual(response.status_code, 200)

        # Check filtered results (should be 4 unread notifications)
        self.assertEqual(len(response.context['notifications']), 4)

    def test_mark_notification_as_read(self):
        """Test marking a notification as read"""
        notification = StaffNotification.objects.first()
        mark_read_url = reverse(
            'staff:mark_notification_read',
            args=[notification.id]
        )

        # Add next parameter to simulate redirect back to notifications
        url_with_next = f"{mark_read_url}?next={self.notifications_url}"
        response = self.client.get(url_with_next)

        # Check redirect
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, self.notifications_url)

        # Verify notification is marked as read
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)
