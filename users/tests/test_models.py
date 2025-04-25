"""
Tests for user models.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from users.models import (
    Address, ContactMessage, MessageNote, MessageResponse, UserProfile,
)

User = get_user_model()


class UsersModelsTestCase(TestCase):
    """Test cases for user models."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='password123',
        )
        self.address = Address.objects.create(
            user=self.user,
            address_line_1='123 Test Street',
            town_or_city='Testville',
            postcode='12345',
            country='Testland',
        )

    def test_address_str(self):
        """Test string representation of Address model."""
        self.assertEqual(
            str(self.address),
            'testuser - 123 Test Street, 12345',
        )

    def test_get_full_address(self):
        """Test get_full_address method."""
        full_address = self.address.get_full_address()
        self.assertIn('123 Test Street', full_address)
        self.assertIn('Testville', full_address)
        self.assertIn('12345', full_address)
        self.assertIn('Testland', full_address)

    def test_get_short_address(self):
        """Test get_short_address method."""
        short_address = self.address.get_short_address()
        self.assertEqual(short_address, '123 Test Street, Testville')

    def test_userprofile_creation(self):
        """Test UserProfile is created for user."""
        user_profile = UserProfile.objects.get(user=self.user)
        self.assertEqual(user_profile.user, self.user)

    def test_userprofile_str(self):
        """Test string representation of UserProfile."""
        user_profile = UserProfile.objects.get(user=self.user)
        self.assertEqual(str(user_profile), self.user.username)

    def test_userprofile_get_display_name(self):
        """Test get_display_name method with different scenarios."""
        profile = UserProfile.objects.get(user=self.user)

        # Test fallback to username when no display name or full name is set
        self.assertEqual(profile.get_display_name(), self.user.username)

        # Test using full name when available
        self.user.first_name = 'Test'
        self.user.last_name = 'User'
        self.user.save()

        # Get a fresh instance of the user and profile
        fresh_user = User.objects.get(pk=self.user.pk)
        fresh_profile = UserProfile.objects.get(user=fresh_user)

        # Verify the full name is set correctly
        self.assertEqual(fresh_user.get_full_name(), 'Test User')
        self.assertEqual(fresh_profile.get_display_name(), 'Test User')

        # Test using display_name when set (highest priority)
        fresh_profile.display_name = 'Custom Display Name'
        fresh_profile.save()
        self.assertEqual(fresh_profile.get_display_name(), 'Custom Display Name')


class ContactMessageModelTestCase(TestCase):
    """Test the ContactMessage model functionality."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='password123',
        )

        self.staff_user = User.objects.create_user(
            username='staffuser',
            email='staff@example.com',
            password='staffpass',
            is_staff=True
        )

        self.message = ContactMessage.objects.create(
            email='contact@example.com',
            subject='Test Subject',
            message='This is a test message.',
            user=self.user
        )

    def test_contact_message_defaults(self):
        """Test default values for ContactMessage fields."""
        self.assertEqual(self.message.status, 'new')
        self.assertEqual(self.message.priority, 'medium')
        self.assertEqual(self.message.category, 'general')
        self.assertFalse(self.message.is_read)
        self.assertIsNone(self.message.assigned_to)
        self.assertIsNone(self.message.resolved_date)

    def test_contact_message_str(self):
        """Test string representation of ContactMessage."""
        expected = f"{self.message.subject} - {self.message.email} " \
            f"({self.message.timestamp.strftime('%Y-%m-%d')})"
        self.assertEqual(str(self.message), expected)

    def test_mark_as_read_unread(self):
        """Test mark_as_read and mark_as_unread methods."""
        # Initially not read
        self.assertFalse(self.message.is_read)

        # Mark as read
        self.message.mark_as_read()
        self.assertTrue(self.message.is_read)

        # Mark as unread
        self.message.mark_as_unread()
        self.assertFalse(self.message.is_read)

    def test_assign_to(self):
        """Test assign_to method."""
        self.assertIsNone(self.message.assigned_to)

        # Assign to staff user
        self.message.assign_to(self.staff_user)
        self.assertEqual(self.message.assigned_to, self.staff_user)

    def test_add_response(self):
        """Test add_response method."""
        # Add response without changing status
        response = self.message.add_response(
            response_text="Test response",
            user=self.staff_user,
            change_status=False
        )

        # Verify response created correctly
        self.assertEqual(response.content, "Test response")
        self.assertEqual(response.created_by, self.staff_user)
        self.assertEqual(response.response_type, 'message')
        self.assertTrue(response.is_visible_to_user)

        # Verify status changed from new to in_progress
        self.assertEqual(self.message.status, 'in_progress')

        # Test changing to resolved
        self.message.add_response(
            response_text="Issue resolved",
            user=self.staff_user,
            change_status=True
        )

        self.assertEqual(self.message.status, 'resolved')
        self.assertIsNotNone(self.message.resolved_date)

    def test_update_status(self):
        """Test update_status method."""
        # Update status to in_progress
        self.message.update_status('in_progress', self.staff_user)
        self.assertEqual(self.message.status, 'in_progress')
        self.assertEqual(self.message.assigned_to, self.staff_user)
        self.assertIsNone(self.message.resolved_date)

        # Update to resolved
        self.message.update_status('resolved', self.staff_user)
        self.assertEqual(self.message.status, 'resolved')
        self.assertIsNotNone(self.message.resolved_date)

        # Update to closed
        self.message.update_status('closed', self.staff_user)
        self.assertEqual(self.message.status, 'closed')

    def test_add_note(self):
        """Test add_note method."""
        # Add a note
        note = self.message.add_note("Test note", self.staff_user)

        # Verify note created correctly
        self.assertEqual(note.content, "Test note")
        self.assertEqual(note.created_by, self.staff_user)
        self.assertEqual(note.contact_message, self.message)

        # Verify staff_notes field updated (legacy support)
        self.assertIn("Test note", self.message.staff_notes)


class MessageResponseModelTestCase(TestCase):
    """Test the MessageResponse model functionality."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='password123',
        )

        self.staff_user = User.objects.create_user(
            username='staffuser',
            email='staff@example.com',
            password='staffpass',
            is_staff=True
        )

        self.message = ContactMessage.objects.create(
            email='contact@example.com',
            subject='Test Subject',
            message='This is a test message.',
            user=self.user
        )

    def test_message_response_creation(self):
        """Test creating a MessageResponse."""
        response = MessageResponse.objects.create(
            contact_message=self.message,
            content="Test response content",
            created_by=self.staff_user,
            response_type='message',
            is_visible_to_user=True
        )

        self.assertEqual(response.content, "Test response content")
        self.assertEqual(response.created_by, self.staff_user)
        self.assertEqual(response.response_type, 'message')
        self.assertTrue(response.is_visible_to_user)
        self.assertFalse(response.email_sent)

    def test_message_response_str(self):
        """Test string representation of MessageResponse."""
        response = MessageResponse.objects.create(
            contact_message=self.message,
            content="Test response content",
            created_by=self.staff_user
        )

        expected = f"Response to {self.message} at {response.created_at}"
        self.assertEqual(str(response), expected)

    def test_message_response_save(self):
        """Test save method updates contact message."""
        # Initially response_date is None
        self.assertIsNone(self.message.response_date)

        # Create response
        response = MessageResponse.objects.create(
            contact_message=self.message,
            content="Test response content",
            created_by=self.staff_user
        )

        # Refresh message from database
        self.message.refresh_from_db()

        # response_date should be updated
        self.assertIsNotNone(self.message.response_date)
        self.assertEqual(self.message.response_date, response.created_at)


class MessageNoteModelTestCase(TestCase):
    """Test the MessageNote model functionality."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='password123',
        )

        self.staff_user = User.objects.create_user(
            username='staffuser',
            email='staff@example.com',
            password='staffpass',
            is_staff=True
        )

        self.message = ContactMessage.objects.create(
            email='contact@example.com',
            subject='Test Subject',
            message='This is a test message.',
            user=self.user
        )

    def test_message_note_creation(self):
        """Test creating a MessageNote."""
        note = MessageNote.objects.create(
            contact_message=self.message,
            content="Test note content",
            created_by=self.staff_user
        )

        self.assertEqual(note.content, "Test note content")
        self.assertEqual(note.created_by, self.staff_user)
        self.assertEqual(note.contact_message, self.message)

    def test_message_note_str(self):
        """Test string representation of MessageNote."""
        note = MessageNote.objects.create(
            contact_message=self.message,
            content="Test note content",
            created_by=self.staff_user
        )

        expected = f"Note for {self.message} at {note.created_at}"
        self.assertEqual(str(note), expected)

    def test_message_note_ordering(self):
        """Test MessageNote ordering (newest first)."""
        # Create notes
        note1 = MessageNote.objects.create(
            contact_message=self.message,
            content="First note",
            created_by=self.staff_user
        )

        # Add a small delay to ensure different timestamps
        import time
        time.sleep(0.1)

        note2 = MessageNote.objects.create(
            contact_message=self.message,
            content="Second note",
            created_by=self.staff_user
        )

        # Get all notes for the message
        notes = MessageNote.objects.filter(contact_message=self.message).all()

        # Newest first ordering
        self.assertEqual(notes[0], note2)
        self.assertEqual(notes[1], note1)
