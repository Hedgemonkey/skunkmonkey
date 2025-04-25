"""
Tests for user signals.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase

from allauth.account.models import EmailAddress

from users.models import UserProfile
from users.signals import update_user_email

User = get_user_model()


class UsersSignalsTestCase(TestCase):
    """Test cases for user signals."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='password123',
        )

    def test_create_user_profile_signal(self):
        """Test signal that creates a UserProfile when a User is created."""
        # Check that profile was automatically created for existing user
        user_profile = UserProfile.objects.get(user=self.user)
        self.assertIsNotNone(user_profile)

        # Create a new user and check that profile is created
        new_user = User.objects.create_user(
            username='newuser',
            email='newuser@example.com',
            password='password123',
        )

        # Verify profile created
        self.assertTrue(hasattr(new_user, 'userprofile'))
        self.assertIsNotNone(new_user.userprofile)

    def test_update_user_email_signal(self):
        """Test signal that updates User email when EmailAddress is updated."""
        # Create a verified email address
        email_address = EmailAddress.objects.create(
            user=self.user,
            email='newemail@example.com',
            verified=True,
            primary=False,
        )

        # Call the signal directly to simulate allauth behavior
        update_user_email(
            sender=None,
            request=None,
            email_address=email_address,
        )

        # Refresh objects from database
        email_address.refresh_from_db()
        self.user.refresh_from_db()

        # Check that email is now primary and user email updated
        self.assertTrue(email_address.primary)
        self.assertEqual(self.user.email, 'newemail@example.com')

    def test_update_user_profile_on_user_save(self):
        """Test that userprofile is saved when user is saved."""
        # Get current profile
        profile = self.user.userprofile

        # Make change to user
        self.user.first_name = 'Updated'
        self.user.save()

        # Verify profile still exists and is properly linked
        profile.refresh_from_db()
        self.assertEqual(profile.user.first_name, 'Updated')

    def test_do_not_update_user_email_for_unverified_email(self):
        """Test that unverified emails don't trigger email update."""
        # Create an unverified email address
        email_address = EmailAddress.objects.create(
            user=self.user,
            email='unverified@example.com',
            verified=False,
            primary=False,
        )

        # Call the signal
        update_user_email(
            sender=None,
            request=None,
            email_address=email_address,
        )

        # Refresh user from database
        self.user.refresh_from_db()

        # Email should not have been updated
        self.assertEqual(self.user.email, 'testuser@example.com')
