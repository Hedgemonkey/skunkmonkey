"""
Tests for contact message response functionality.
"""
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import Client, TestCase
from django.urls import reverse
from django.utils import timezone

from users.models import ContactMessage, MessageNote, MessageResponse

User = get_user_model()


class ContactMessageResponsesTestCase(TestCase):
    """Test the functionality of MessageResponse and MessageNote models."""

    def setUp(self):
        """Set up test data."""
        # Create a staff user for testing
        self.staff_user = User.objects.create_user(
            username='staffuser',
            email='staff@example.com',
            password='password123',
            is_staff=True,
        )

        # Create a regular user for testing
        self.regular_user = User.objects.create_user(
            username='regularuser',
            email='regular@example.com',
            password='password123',
        )

        # Create a test contact message
        self.contact_message = ContactMessage.objects.create(
            email='customer@example.com',
            subject='Test Inquiry',
            message='This is a test message from a customer.',
            priority='medium',
            category='general',
        )

        # Set up clients
        self.staff_client = Client()
        self.staff_client.login(username='staffuser', password='password123')

        self.user_client = Client()
        self.user_client.login(username='regularuser', password='password123')

    def test_message_response_creation(self):
        """Test creating different types of message responses."""
        # Create an email response
        email_response = MessageResponse.objects.create(
            contact_message=self.contact_message,
            content="Thank you for your inquiry. We'll get back to you soon.",
            created_by=self.staff_user,
            response_type='message',
            is_visible_to_user=True
        )

        self.assertEqual(email_response.contact_message, self.contact_message)
        self.assertEqual(email_response.created_by, self.staff_user)
        self.assertEqual(email_response.response_type, 'message')
        self.assertTrue(email_response.is_visible_to_user)
        self.assertFalse(email_response.email_sent)

        # Create a phone call record visible to the user
        phone_call = MessageResponse.objects.create(
            contact_message=self.contact_message,
            content=(
                "Called customer to discuss their inquiry. "
                "Will send follow-up email."
            ),
            created_by=self.staff_user,
            response_type='phone_call_user',
            is_visible_to_user=True
        )

        self.assertEqual(phone_call.response_type, 'phone_call_user')
        self.assertTrue(phone_call.is_visible_to_user)

        # Create an internal phone call record
        internal_phone_call = MessageResponse.objects.create(
            contact_message=self.contact_message,
            content="Called customer but no answer. Will try again tomorrow.",
            created_by=self.staff_user,
            response_type='phone_call_internal',
            is_visible_to_user=False
        )

        self.assertEqual(
            internal_phone_call.response_type,
            'phone_call_internal'
        )
        self.assertFalse(internal_phone_call.is_visible_to_user)

        # Check that all responses are linked to the contact message
        self.assertEqual(self.contact_message.responses.count(), 3)

    def test_message_note_creation(self):
        """Test creating message notes."""
        # Create a note
        note = MessageNote.objects.create(
            contact_message=self.contact_message,
            content="This customer has contacted us before about a similar issue.",
            created_by=self.staff_user
        )

        self.assertEqual(note.contact_message, self.contact_message)
        self.assertEqual(note.created_by, self.staff_user)

        # Create another note - use it in assertion to avoid F841
        MessageNote.objects.create(
            contact_message=self.contact_message,
            content="Customer seems upset. Handle with care.",
            created_by=self.staff_user
        )

        # Check that all notes are linked to the contact message
        self.assertEqual(self.contact_message.notes.count(), 2)

    def test_message_responses_and_notes_ordering(self):
        """Test that responses and notes are ordered by created_at."""
        note1 = MessageNote.objects.create(
            contact_message=self.contact_message,
            content="First note",
            created_by=self.staff_user
        )

        response1 = MessageResponse.objects.create(
            contact_message=self.contact_message,
            content="First response",
            created_by=self.staff_user,
            response_type='message',
            is_visible_to_user=True
        )

        # Wait a short time to ensure different timestamps
        import time
        time.sleep(0.1)

        note2 = MessageNote.objects.create(
            contact_message=self.contact_message,
            content="Second note",
            created_by=self.staff_user
        )

        response2 = MessageResponse.objects.create(
            contact_message=self.contact_message,
            content="Second response",
            created_by=self.staff_user,
            response_type='message',
            is_visible_to_user=True
        )

        # Check ordering of notes (latest first by default)
        notes = self.contact_message.notes.all()
        self.assertEqual(notes[0], note2)
        self.assertEqual(notes[1], note1)

        # Check ordering of responses (earliest first by default)
        responses = self.contact_message.responses.order_by('created_at').all()
        self.assertEqual(responses[0], response1)
        self.assertEqual(responses[1], response2)

    def test_contact_message_helper_methods(self):
        """Test the helper methods added to ContactMessage model."""
        # Test add_response method
        response = self.contact_message.add_response(
            response_text="This is a response via helper method.",
            user=self.staff_user,
            change_status=False
        )

        # Check that response was created
        self.assertIsInstance(response, MessageResponse)
        self.assertEqual(response.content, "This is a response via helper method.")
        self.assertEqual(response.created_by, self.staff_user)

        # Check that status was updated from 'new' to 'in_progress'
        self.assertEqual(self.contact_message.status, 'in_progress')

        # Test add_note method
        note = self.contact_message.add_note(
            note_content="This is a note via helper method.",
            user=self.staff_user
        )

        # Check that note was created
        self.assertIsInstance(note, MessageNote)
        self.assertEqual(note.content, "This is a note via helper method.")
        self.assertEqual(note.created_by, self.staff_user)

        # Test update_status method
        self.contact_message.update_status('resolved', self.staff_user)
        self.assertEqual(self.contact_message.status, 'resolved')
        self.assertIsNotNone(self.contact_message.resolved_date)

    @patch('users.utils.email.send_response_email')
    def test_email_sending_on_response(self, mock_send_email):
        """Test that emails are sent when a response is created with email."""
        # Create a response and trigger email sending
        self.contact_message.add_response(
            response_text="Thank you for your inquiry. We will ship your order.",
            user=self.staff_user
        )

        # Check that the email sending function was called
        mock_send_email.assert_called_once()

        # Check the email params
        args, kwargs = mock_send_email.call_args
        self.assertEqual(kwargs['contact_message'], self.contact_message)
        self.assertEqual(
            kwargs['response_text'],
            "Thank you for your inquiry. We will ship your order."
        )
        self.assertEqual(kwargs['sender'], self.staff_user)

    def test_status_workflow(self):
        """Test the complete workflow of a message through different statuses."""
        # Check initial status
        self.assertEqual(self.contact_message.status, 'new')
        self.assertIsNone(self.contact_message.resolved_date)

        # Add a response - should change status to in progress
        self.contact_message.add_response(
            response_text="We're looking into your inquiry.",
            user=self.staff_user,
            change_status=False
        )
        self.assertEqual(self.contact_message.status, 'in_progress')

        # Add another response without changing status
        self.contact_message.add_response(
            response_text="Here's an update on your inquiry.",
            user=self.staff_user,
            change_status=False
        )
        # Status should still be 'in_progress'
        self.assertEqual(self.contact_message.status, 'in_progress')

        # Mark as resolved
        pre_resolved_time = timezone.now()
        self.contact_message.update_status('resolved', self.staff_user)

        # Check resolved status and timestamp
        self.assertEqual(self.contact_message.status, 'resolved')
        self.assertIsNotNone(self.contact_message.resolved_date)
        self.assertGreaterEqual(
            self.contact_message.resolved_date,
            pre_resolved_time
        )

        # Reopen the message
        self.contact_message.update_status('in_progress', self.staff_user)
        self.assertEqual(self.contact_message.status, 'in_progress')
        # Resolved date should be cleared when reopening
        self.assertIsNone(self.contact_message.resolved_date)

    def test_staff_view_access(self):
        """Test access control for staff message views."""
        # Get URL for the staff message detail view
        staff_url = reverse(
            'users:staff_message_detail',
            args=[self.contact_message.id]
        )

        # Test staff access - should work
        staff_response = self.staff_client.get(staff_url)
        self.assertEqual(staff_response.status_code, 200)

        # Test regular user access - should fail
        user_response = self.user_client.get(staff_url)
        self.assertNotEqual(user_response.status_code, 200)

    @patch('users.views.staff_dashboard_views.send_response_email')
    def test_staff_response_endpoints(self, mock_send):
        """Test the staff response submission endpoints."""
        # URL for adding staff response
        response_url = reverse(
            'users:staff_message_response',
            args=[self.contact_message.id]
        )

        # Test adding a staff response
        response_data = {
            'content': 'This is a test staff response.',
            'response_type': 'message',
            'send_email': 'true'
        }

        # Make sure the mock is properly set up to track calls
        mock_send.reset_mock()

        # Use the response in an assertion to avoid F841
        resp = self.staff_client.post(response_url, response_data)

        # Should redirect after successful submission
        self.assertEqual(resp.status_code, 302)

        # Check that the response was created
        self.assertEqual(self.contact_message.responses.count(), 1)

        # Check that email was attempted
        mock_send.assert_called_once()

    def test_staff_note_endpoints(self):
        """Test the staff note submission endpoints."""
        # Add a note URL - this needs to match your actual URL name
        # Adjust if your URL name is different
        note_url = reverse(
            'users:staff_message_response',
            args=[self.contact_message.id]
        )

        # Test adding a staff note
        note_data = {
            'content': 'This is an internal note.',
            'response_type': 'note'
        }

        # Store and use the response in an assertion to avoid F841
        resp = self.staff_client.post(note_url, note_data)

        # Should redirect after successful note addition
        self.assertEqual(resp.status_code, 302)

        # Verify the note was added correctly
        self.assertGreater(self.contact_message.notes.count(), 0)
        note = MessageNote.objects.filter(
            contact_message=self.contact_message
        ).first()
        self.assertEqual(note.content, 'This is an internal note.')
        self.assertEqual(note.created_by, self.staff_user)
