"""
Test cases for staff user management views
"""
import logging
from datetime import timedelta

from django.contrib.auth.models import Group, User
from django.test import Client, TestCase
from django.urls import reverse
from django.utils import timezone

from staff.models import StaffProfile
from users.models import UserProfile

# Set up logger
logger = logging.getLogger(__name__)


class UserManagementTestCase(TestCase):
    """Base test case for user management tests"""

    def setUp(self):
        """Set up test data"""
        # Create regular user
        self.regular_user = User.objects.create_user(
            username='regularuser',
            email='regular@example.com',
            password='password123'
        )

        # Create staff user (not manager)
        self.staff_user = User.objects.create_user(
            username='staffuser',
            email='staff@example.com',
            password='password123',
            is_staff=True
        )
        self.staff_profile = StaffProfile.objects.create(
            user=self.staff_user,
            department='orders',
            is_manager=False
        )

        # Create manager user
        self.manager_user = User.objects.create_user(
            username='manageruser',
            email='manager@example.com',
            password='password123',
            is_staff=True
        )
        self.manager_profile = StaffProfile.objects.create(
            user=self.manager_user,
            department='admin',
            is_manager=True
        )

        # Create superuser
        self.superuser = User.objects.create_superuser(
            username='superuser',
            email='super@example.com',
            password='password123'
        )

        # Create some test users to manage
        for i in range(1, 6):
            User.objects.create_user(
                username=f'testuser{i}',
                email=f'test{i}@example.com',
                password='password123',
                is_active=i % 2 == 0,  # Every other user is inactive
                date_joined=timezone.now() - timedelta(days=i * 10)
            )

        # Create test group
        self.test_group = Group.objects.create(name='Test Group')

        # Set up client
        self.client = Client()


class UserListViewTestCase(UserManagementTestCase):
    """Test cases for the UserListView"""

    def test_access_denied_for_anonymous_users(self):
        """Test that anonymous users are redirected to login"""
        url = reverse('staff:user_list')
        response = self.client.get(url)

        # Should redirect to login
        self.assertEqual(response.status_code, 302)
        self.assertIn('login', response.url)

    def test_access_denied_for_regular_users(self):
        """Test that regular users get a 403 Forbidden response"""
        self.client.login(username='regularuser', password='password123')

        url = reverse('staff:user_list')
        response = self.client.get(url)

        # Should be forbidden
        self.assertEqual(response.status_code, 403)

    def test_access_denied_for_non_manager_staff(self):
        """Test that non-manager staff get a 403 Forbidden response"""
        self.client.login(username='staffuser', password='password123')

        url = reverse('staff:user_list')
        response = self.client.get(url)

        # Should be forbidden
        self.assertEqual(response.status_code, 403)

    def test_access_granted_for_managers(self):
        """Test that managers can access the user list"""
        self.client.login(username='manageruser', password='password123')

        url = reverse('staff:user_list')
        response = self.client.get(url)

        # Should be successful
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'staff/user_list.html')

    def test_access_granted_for_superusers(self):
        """Test that superusers can access the user list"""
        self.client.login(username='superuser', password='password123')

        url = reverse('staff:user_list')
        response = self.client.get(url)

        # Should be successful
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'staff/user_list.html')

    def test_user_list_shows_all_users(self):
        """Test that the user list page shows all users"""
        self.client.login(username='manageruser', password='password123')

        url = reverse('staff:user_list')
        response = self.client.get(url)

        # Count total users (4 from setup + 5 test users)
        expected_count = 9

        # Check if users are in context
        self.assertEqual(response.context['total_users'], expected_count)

    def test_user_list_filtering_by_active(self):
        """Test filtering by active status"""
        self.client.login(username='manageruser', password='password123')

        url = reverse('staff:user_list') + '?is_active=true'
        response = self.client.get(url)

        # Check if only active users are shown
        for user in response.context['users']:
            self.assertTrue(user.is_active)

    def test_user_list_filtering_by_staff(self):
        """Test filtering by staff status"""
        self.client.login(username='manageruser', password='password123')

        url = reverse('staff:user_list') + '?is_staff=true'
        response = self.client.get(url)

        # Check if only staff users are shown
        for user in response.context['users']:
            self.assertTrue(user.is_staff)

    def test_user_list_filtering_by_search(self):
        """Test filtering by search query"""
        self.client.login(username='manageruser', password='password123')

        url = reverse('staff:user_list') + '?query=testuser1'
        response = self.client.get(url)

        # Check if only matching users are shown
        self.assertEqual(len(response.context['users']), 1)
        self.assertEqual(response.context['users'][0].username, 'testuser1')


class UserDetailViewTestCase(UserManagementTestCase):
    """Test cases for the UserDetailView"""

    def test_access_denied_for_anonymous_users(self):
        """Test that anonymous users are redirected to login"""
        url = reverse('staff:user_detail', args=[self.regular_user.id])
        response = self.client.get(url)

        # Should redirect to login
        self.assertEqual(response.status_code, 302)
        self.assertIn('login', response.url)

    def test_access_denied_for_non_manager_staff(self):
        """Test that non-manager staff get a 403 Forbidden response"""
        self.client.login(username='staffuser', password='password123')

        url = reverse('staff:user_detail', args=[self.regular_user.id])
        response = self.client.get(url)

        # Should be forbidden
        self.assertEqual(response.status_code, 403)

    def test_access_granted_for_managers(self):
        """Test that managers can access user details"""
        self.client.login(username='manageruser', password='password123')

        url = reverse('staff:user_detail', args=[self.regular_user.id])
        response = self.client.get(url)

        # Should be successful
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'staff/user_detail.html')

    def test_user_detail_shows_correct_user(self):
        """Test that the user detail page shows the correct user"""
        self.client.login(username='manageruser', password='password123')

        url = reverse('staff:user_detail', args=[self.regular_user.id])
        response = self.client.get(url)

        # Check if correct user is in context
        self.assertEqual(response.context['user_obj'], self.regular_user)

    def test_user_detail_shows_profile(self):
        """Test that the user detail page shows the user profile"""
        self.client.login(username='manageruser', password='password123')

        # Ensure user has a profile
        profile, created = UserProfile.objects.get_or_create(
            user=self.regular_user
        )

        url = reverse('staff:user_detail', args=[self.regular_user.id])
        response = self.client.get(url)

        # Check if profile is in context
        self.assertEqual(response.context['profile'], profile)
        self.assertTrue('profile_form' in response.context)


class UserCreateViewTestCase(UserManagementTestCase):
    """Test cases for the UserCreateView"""

    def test_access_denied_for_anonymous_users(self):
        """Test that anonymous users are redirected to login"""
        url = reverse('staff:user_create')
        response = self.client.get(url)

        # Should redirect to login
        self.assertEqual(response.status_code, 302)
        self.assertIn('login', response.url)

    def test_access_denied_for_non_manager_staff(self):
        """Test that non-manager staff get a 403 Forbidden response"""
        self.client.login(username='staffuser', password='password123')

        url = reverse('staff:user_create')
        response = self.client.get(url)

        # Should be forbidden
        self.assertEqual(response.status_code, 403)

    def test_access_granted_for_managers(self):
        """Test that managers can access user create form"""
        self.client.login(username='manageruser', password='password123')

        url = reverse('staff:user_create')
        response = self.client.get(url)

        # Should be successful
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'staff/user_form.html')

    def test_user_creation(self):
        """Test creating a new user"""
        self.client.login(username='manageruser', password='password123')

        url = reverse('staff:user_create')
        user_count_before = User.objects.count()
        profile_count_before = UserProfile.objects.count()

        # Form data for a new user
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'first_name': 'New',
            'last_name': 'User',
            'password1': 'Complex123!',
            'password2': 'Complex123!',
            'is_active': True,
            'is_staff': False,
        }

        response = self.client.post(url, data)

        # Should redirect to user list on success
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, reverse('staff:user_list'))

        # Check that user and profile were created
        user_count_after = User.objects.count()
        profile_count_after = UserProfile.objects.count()

        self.assertEqual(user_count_after, user_count_before + 1)
        self.assertEqual(profile_count_after, profile_count_before + 1)

        # Check the new user
        new_user = User.objects.get(username='newuser')
        self.assertEqual(new_user.email, 'new@example.com')
        self.assertEqual(new_user.first_name, 'New')
        self.assertEqual(new_user.last_name, 'User')
        self.assertTrue(new_user.is_active)
        self.assertFalse(new_user.is_staff)

        # Verify profile was created
        self.assertTrue(
            UserProfile.objects.filter(user=new_user).exists()
        )


class UserUpdateViewTestCase(UserManagementTestCase):
    """Test cases for the UserUpdateView"""

    def test_access_denied_for_anonymous_users(self):
        """Test that anonymous users are redirected to login"""
        url = reverse('staff:user_update', args=[self.regular_user.id])
        response = self.client.get(url)

        # Should redirect to login
        self.assertEqual(response.status_code, 302)
        self.assertIn('login', response.url)

    def test_access_denied_for_non_manager_staff(self):
        """Test that non-manager staff get a 403 Forbidden response"""
        self.client.login(username='staffuser', password='password123')

        url = reverse('staff:user_update', args=[self.regular_user.id])
        response = self.client.get(url)

        # Should be forbidden
        self.assertEqual(response.status_code, 403)

    def test_access_granted_for_managers(self):
        """Test that managers can access user update form"""
        self.client.login(username='manageruser', password='password123')

        url = reverse('staff:user_update', args=[self.regular_user.id])
        response = self.client.get(url)

        # Should be successful
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'staff/user_form.html')

    def test_user_update(self):
        """Test updating an existing user"""
        self.client.login(username='manageruser', password='password123')

        url = reverse('staff:user_update', args=[self.regular_user.id])

        # Updated data
        data = {
            'username': self.regular_user.username,  # Unchanged
            'email': 'updated@example.com',
            'first_name': 'Updated',
            'last_name': 'User',
            'is_active': True,
            'is_staff': True,
            'groups': [self.test_group.id],
        }

        response = self.client.post(url, data)

        # Should redirect to user detail page on success
        self.assertEqual(response.status_code, 302)
        expected_redirect = reverse(
            'staff:user_detail',
            args=[self.regular_user.id]
        )
        self.assertEqual(response.url, expected_redirect)

        # Refresh user from database
        self.regular_user.refresh_from_db()

        # Check updated attributes
        self.assertEqual(self.regular_user.email, 'updated@example.com')
        self.assertEqual(self.regular_user.first_name, 'Updated')
        self.assertEqual(self.regular_user.last_name, 'User')
        self.assertTrue(self.regular_user.is_active)
        self.assertTrue(self.regular_user.is_staff)

        # Check group membership
        self.assertEqual(list(self.regular_user.groups.all()), [self.test_group])


class UserToggleStatusTestCase(UserManagementTestCase):
    """Test cases for the UserToggleStatusView"""

    def test_toggle_user_status(self):
        """Test toggling a user's active status"""
        self.client.login(username='manageruser', password='password123')

        # Get initial status
        initial_status = self.regular_user.is_active

        url = reverse('staff:user_toggle_status', args=[self.regular_user.id])
        response = self.client.post(url)

        # Should redirect to user detail
        self.assertEqual(response.status_code, 302)
        expected_redirect = reverse(
            'staff:user_detail',
            args=[self.regular_user.id]
        )
        self.assertEqual(response.url, expected_redirect)

        # Refresh user from database
        self.regular_user.refresh_from_db()

        # Status should be toggled
        self.assertEqual(self.regular_user.is_active, not initial_status)

    def test_cannot_deactivate_self(self):
        """Test that a user cannot deactivate their own account"""
        self.client.login(username='manageruser', password='password123')

        url = reverse('staff:user_toggle_status', args=[self.manager_user.id])
        response = self.client.post(url)

        # Should redirect to user detail
        self.assertEqual(response.status_code, 302)
        expected_redirect = reverse(
            'staff:user_detail',
            args=[self.manager_user.id]
        )
        self.assertEqual(response.url, expected_redirect)

        # Refresh user from database
        self.manager_user.refresh_from_db()

        # Status should remain active
        self.assertTrue(self.manager_user.is_active)


class UserProfileUpdateTestCase(UserManagementTestCase):
    """Test cases for the UserProfileUpdateView"""

    def test_profile_update(self):
        """Test updating a user's profile"""
        self.client.login(username='manageruser', password='password123')

        # Ensure user has a profile
        profile, created = UserProfile.objects.get_or_create(
            user=self.regular_user
        )

        url = reverse('staff:user_profile_update', args=[self.regular_user.id])

        data = {
            'phone_number': '123456789',
            'display_name': 'RegularTester',
            'bio': 'This is a test profile',
            'birth_date': '1990-01-01',
            'notification_preference': 'email',
            'receive_marketing_emails': True,
            'theme_preference': 'light',
        }

        response = self.client.post(url, data)

        # Should redirect to user detail
        self.assertEqual(response.status_code, 302)
        expected_redirect = reverse(
            'staff:user_detail',
            args=[self.regular_user.id]
        )
        self.assertEqual(response.url, expected_redirect)

        # Refresh profile from database
        profile.refresh_from_db()

        # Check updated profile
        self.assertEqual(profile.phone_number, '123456789')
        self.assertEqual(profile.display_name, 'RegularTester')
        self.assertEqual(profile.bio, 'This is a test profile')
