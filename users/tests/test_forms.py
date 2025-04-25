"""
Tests for user forms.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase

from users.forms import (
    ContactForm, ContactMessageReplyForm, CustomAddEmailForm, ProfileForm,
)
from users.models import ContactMessage

User = get_user_model()


class UsersFormsTestCase(TestCase):
    """Test cases for user forms."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='password123',
        )

        self.contact_message = ContactMessage.objects.create(
            email='contact@example.com',
            subject='Test Subject',
            message='This is a test message.',
            user=self.user
        )

    def test_contact_form_valid(self):
        """Test valid contact form submission."""
        form_data = {
            'email': 'contact@example.com',
            'subject': 'Test Subject',
            'message': 'This is a test message.',
            'category': 'general',
            'priority': 'medium',
        }
        form = ContactForm(data=form_data)
        self.assertTrue(form.is_valid())

    def test_contact_form_invalid(self):
        """Test invalid contact form submission."""
        # Test with missing required fields
        form_data = {
            'email': 'contact@example.com',
            # Missing subject and message
        }
        form = ContactForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('subject', form.errors)
        self.assertIn('message', form.errors)

        # Test with invalid email
        form_data = {
            'email': 'invalid-email',
            'subject': 'Test Subject',
            'message': 'This is a test message.'
        }
        form = ContactForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('email', form.errors)

    def test_custom_add_email_form_valid(self):
        """Test valid custom add email form submission."""
        form_data = {
            'email': 'newemail@example.com',
            'email2': 'newemail@example.com',
        }
        form = CustomAddEmailForm(data=form_data)
        self.assertTrue(form.is_valid())

    def test_custom_add_email_form_invalid(self):
        """Test invalid custom add email form submission."""
        # Test with mismatching emails
        form_data = {
            'email': 'newemail@example.com',
            'email2': 'differentemail@example.com',
        }
        form = CustomAddEmailForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('email2', form.errors)

        # Test with invalid email
        form_data = {
            'email': 'invalid-email',
            'email2': 'invalid-email',
        }
        form = CustomAddEmailForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('email', form.errors)

    def test_contact_message_reply_form_valid(self):
        """Test valid contact message reply form submission."""
        form_data = {
            'message': 'This is a reply to the contact message.',
        }
        form = ContactMessageReplyForm(data=form_data)
        self.assertTrue(form.is_valid())

    def test_contact_message_reply_form_invalid(self):
        """Test invalid contact message reply form submission."""
        # Test with missing message
        form_data = {}
        form = ContactMessageReplyForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('message', form.errors)

    def test_profile_form_valid(self):
        """Test valid profile form submission."""
        # Test valid form with optional fields
        form_data = {
            'display_name': 'Test Display Name',
            'phone_number': '1234567890',
            'bio': 'This is a test bio.',
            'notification_preference': 'all',
            'receive_marketing_emails': False,
            'theme_preference': 'dark',
        }
        form = ProfileForm(data=form_data)
        self.assertTrue(form.is_valid())

    def test_profile_form_save(self):
        """Test saving profile form updates user profile."""
        form_data = {
            'display_name': 'New Name',
            'theme_preference': 'dark',
            'notification_preference': 'important',
        }

        # Save form with user profile instance
        form = ProfileForm(data=form_data, instance=self.user.userprofile)
        if form.is_valid():
            form.save()

        # Refresh from database and check values
        self.user.userprofile.refresh_from_db()
        self.assertEqual(self.user.userprofile.display_name, 'New Name')
        self.assertEqual(self.user.userprofile.theme_preference, 'dark')
        self.assertEqual(
            self.user.userprofile.notification_preference,
            'important'
        )
