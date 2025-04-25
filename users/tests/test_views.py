"""
Tests for user views.
"""
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import Client, TestCase
from django.urls import reverse
from django.utils import timezone

from users.models import ContactMessage, MessageNote, MessageResponse

User = get_user_model()


class UserViewsBaseTestCase(TestCase):
    """Base test case with common setup for user views tests."""

    def setUp(self):
        """Set up test data."""
        # Create regular user
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='password123'
        )

        # Create staff user
        self.staff_user = User.objects.create_user(
            username='staffuser',
            email='staff@example.com',
            password='password123',
            is_staff=True
        )

        # Create test clients
        self.client = Client()
        self.user_client = Client()
        self.staff_client = Client()

        # Log in users
        self.user_client.login(username='testuser', password='password123')
        self.staff_client.login(username='staffuser', password='password123')

        # Create contact messages
        self.user_message = ContactMessage.objects.create(
            user=self.user,
            email='testuser@example.com',
            subject='User Test Message',
            message='This is a test message from a user.',
            category='general',
            priority='medium'
        )

        self.anonymous_message = ContactMessage.objects.create(
            email='anonymous@example.com',
            subject='Anonymous Test Message',
            message='This is a test message from an anonymous user.',
            category='support',
            priority='high'
        )


class PublicUserViewsTestCase(UserViewsBaseTestCase):
    """Test cases for public user views."""

    def test_contact_view_get(self):
        """Test GET request to contact view."""
        url = reverse('users:contact')

        # Test unauthenticated access
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'users/contact.html')

        # Test authenticated access
        response = self.user_client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'users/contact.html')

        # Check if form is in context
        self.assertIn('form', response.context)

    def test_contact_view_post(self):
        """Test POST request to contact view."""
        url = reverse('users:contact')
        form_data = {
            'email': 'contact@example.com',
            'subject': 'Test Contact Form',
            'message': 'This is a test message from the contact form.',
            'category': 'general',
            'priority': 'medium'
        }

        # Test unauthenticated submission
        response = self.client.post(url, form_data)
        self.assertEqual(response.status_code, 302)  # Should redirect

        # Test authenticated submission
        response = self.user_client.post(url, form_data)
        self.assertEqual(response.status_code, 302)  # Should redirect

        # Check that messages were created in the database
        self.assertEqual(ContactMessage.objects.count(), 4)  # 2 from setup + 2 new ones

    def test_manage_email_view(self):
        """Test email management view."""
        url = reverse('users:manage_email')

        # Unauthenticated access should redirect
        response = self.client.get(url)
        self.assertEqual(response.status_code, 302)

        # Authenticated access should succeed
        response = self.user_client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'users/email.html')

    def test_manage_password_view(self):
        """Test password management view."""
        url = reverse('users:manage_password')

        # Unauthenticated access should redirect
        response = self.client.get(url)
        self.assertEqual(response.status_code, 302)

        # Authenticated access should succeed
        response = self.user_client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'users/password_change.html')


class AuthenticatedUserViewsTestCase(UserViewsBaseTestCase):
    """Test cases for authenticated user views."""

    def test_user_messages_list_view(self):
        """Test the user messages list view."""
        url = reverse('users:message_list')

        # Test unauthenticated access - should redirect to login
        response = self.client.get(url)
        self.assertEqual(response.status_code, 302)
        self.assertIn('login', response.url)

        # Test authenticated access
        response = self.user_client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'users/messages/message_list.html')

        # Check if user messages are in context
        self.assertIn('contact_messages', response.context)
        self.assertEqual(len(response.context['contact_messages']), 1)
        self.assertEqual(response.context['contact_messages'][0], self.user_message)

    def test_user_message_detail_view(self):
        """Test the user message detail view."""
        url = reverse('users:message_detail', args=[self.user_message.id])

        # Test unauthenticated access - should redirect to login
        response = self.client.get(url)
        self.assertEqual(response.status_code, 302)
        self.assertIn('login', response.url)

        # Test authenticated access - message owner should have access
        response = self.user_client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'users/messages/message_detail.html')

        # Check if message is in context
        self.assertIn('message', response.context)
        self.assertEqual(response.context['message'], self.user_message)

    def test_unauthorized_message_access(self):
        """Test that users can't access other users' messages."""
        # Try to access another user's message
        url = reverse('users:message_detail', args=[self.anonymous_message.id])
        try:
            response = self.user_client.get(url)
            self.assertEqual(response.status_code, 403)  # Should be forbidden
        except PermissionError:
            # If view raises PermissionError directly, test passes
            pass

    def test_profile_view(self):
        """Test the profile view."""
        url = reverse('users:manage_profile')  # Updated URL name

        # Test unauthenticated access - should redirect to login
        response = self.client.get(url)
        self.assertEqual(response.status_code, 302)
        self.assertIn('login', response.url)

        # Test authenticated access
        response = self.user_client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'users/manage_profile.html')  # Updated template path

        # Check if form is in context
        self.assertIn('form', response.context)

    def test_profile_update(self):
        """Test updating user profile."""
        url = reverse('users:manage_profile')  # Updated URL name
        form_data = {
            'display_name': 'Test Display Name',
            'theme_preference': 'dark',
            'notification_preference': 'important',
        }

        response = self.user_client.post(url, form_data)
        self.assertEqual(response.status_code, 302)  # Should redirect after success

        # Check that profile was updated
        self.user.refresh_from_db()
        self.user.userprofile.refresh_from_db()
        self.assertEqual(self.user.userprofile.display_name, 'Test Display Name')
        self.assertEqual(self.user.userprofile.theme_preference, 'dark')


class StaffViewsTestCase(UserViewsBaseTestCase):
    """Test cases for staff views."""

    def test_staff_dashboard_view(self):
        """Test the staff dashboard view."""
        url = reverse('users:staff_dashboard')

        # Test non-staff access - should be forbidden
        response = self.user_client.get(url)
        self.assertEqual(response.status_code, 403)

        # Test staff access
        response = self.staff_client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'users/staff/dashboard.html')

    def test_staff_message_list_view(self):
        """Test the staff message list view."""
        url = reverse('users:staff_message_list')

        # Test non-staff access - should be forbidden
        response = self.user_client.get(url)
        self.assertEqual(response.status_code, 403)

        # Test staff access
        response = self.staff_client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(
            response,
            'users/staff/contact_message_list.html'
        )

        # Check if all messages are in context
        self.assertIn('contact_messages', response.context)
        self.assertEqual(len(response.context['contact_messages']), 2)

    def test_staff_message_detail_view(self):
        """Test the staff message detail view."""
        url = reverse(
            'users:staff_message_detail',
            args=[self.user_message.id]
        )

        # Test non-staff access - should be forbidden
        response = self.user_client.get(url)
        self.assertEqual(response.status_code, 403)

        # Test staff access
        response = self.staff_client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(
            response,
            'users/staff/contact_message_detail.html'
        )

        # Check if message is in context
        self.assertIn('message', response.context)
        self.assertEqual(response.context['message'], self.user_message)

    def test_staff_message_reply_view(self):
        """Test the staff message reply view."""
        url = reverse(
            'users:staff_message_reply',
            args=[self.user_message.id]
        )

        # Test non-staff access - should be forbidden or redirect to login
        response = self.user_client.get(url)
        # Either 403 Forbidden or 302 Redirect to login is acceptable
        self.assertIn(response.status_code, [403, 302])

        # Test staff GET request - should show form
        response = self.staff_client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(
            response,
            'users/staff/message_reply.html'
        )

        # Test staff POST request
        with patch('users.utils.email.send_response_email') as mock_send:
            response_data = {
                'response': 'This is a staff reply.',
                'status_after': 'resolved'
            }
            response = self.staff_client.post(url, response_data)

            # Should redirect after submission
            self.assertEqual(response.status_code, 302)

            # Check that response was created
            self.user_message.refresh_from_db()
            self.assertEqual(self.user_message.status, 'resolved')
            self.assertIsNotNone(self.user_message.resolved_date)

            # Check that email was attempted
            mock_send.assert_called_once()

    def test_staff_message_response(self):
        """Test adding a response via the staff_message_response view."""
        url = reverse(
            'users:staff_message_response',
            args=[self.user_message.id]
        )

        # Test adding a response
        response_data = {
            'content': 'This is a test response.',
            'response_type': 'message'
        }
        response = self.staff_client.post(url, response_data)
        self.assertEqual(response.status_code, 302)

        # Check that response was created
        self.assertEqual(MessageResponse.objects.count(), 1)
        response_obj = MessageResponse.objects.first()
        self.assertEqual(response_obj.content, 'This is a test response.')
        self.assertEqual(response_obj.response_type, 'message')
        self.assertEqual(response_obj.created_by, self.staff_user)

    def test_staff_message_status_update(self):
        """Test updating message status."""
        url = reverse(
            'users:staff_message_update_status',
            args=[self.user_message.id]
        )

        data = {
            'status': 'resolved',
            'priority': 'high',
            'category': 'support'
        }
        response = self.staff_client.post(url, data)
        self.assertEqual(response.status_code, 302)

        # Check that status was updated
        self.user_message.refresh_from_db()
        self.assertEqual(self.user_message.status, 'resolved')
        self.assertEqual(self.user_message.priority, 'high')
        self.assertEqual(self.user_message.category, 'support')
