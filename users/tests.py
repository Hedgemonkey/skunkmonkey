from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from .models import Address, UserProfile
from allauth.account.models import EmailAddress
from .forms import ContactForm, CustomAddEmailForm
from .signals import update_user_email

User = get_user_model()


class UsersViewsTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='password123',
        )
        self.client.login(username='testuser', password='password123')

    def test_manage_email_view(self):
        response = self.client.get(reverse('users:manage_email'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'users/email.html')

    def test_manage_password_view(self):
        response = self.client.get(reverse('users:manage_password'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'users/password_change.html')

    def test_users_contact_view(self):
        response = self.client.get(reverse('users:users_contact'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'users/contact.html')

    def test_users_contact_post(self):
        response = self.client.post(
            reverse('users:users_contact'),
            {
                'email': 'testuser@example.com',
                'message': 'This is a test message.',
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Send Message')


class UsersModelsTestCase(TestCase):
    def setUp(self):
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
        self.assertEqual(
            str(self.address),
            'testuser - 123 Test Street, 12345',
        )

    def test_get_full_address(self):
        full_address = self.address.get_full_address()
        self.assertIn('123 Test Street', full_address)
        self.assertIn('Testville', full_address)
        self.assertIn('12345', full_address)
        self.assertIn('Testland', full_address)

    def test_get_short_address(self):
        short_address = self.address.get_short_address()
        self.assertEqual(short_address, '123 Test Street, Testville')

    def test_userprofile_creation(self):
        user_profile = UserProfile.objects.get(user=self.user)
        self.assertEqual(user_profile.user, self.user)


class UsersFormsTestCase(TestCase):
    def test_contact_form_valid(self):
        form = ContactForm(
            data={
                'email': 'testuser@example.com',
                'message': 'This is a test message.',
            }
        )
        self.assertTrue(form.is_valid())

    def test_contact_form_invalid(self):
        form = ContactForm(data={'email': '', 'message': ''})
        self.assertFalse(form.is_valid())
        self.assertIn('email', form.errors)
        self.assertIn('message', form.errors)

    def test_custom_add_email_form_valid(self):
        form = CustomAddEmailForm(
            data={
                'email': 'newemail@example.com',
                'email2': 'newemail@example.com',
            }
        )
        self.assertTrue(form.is_valid())

    def test_custom_add_email_form_invalid(self):
        form = CustomAddEmailForm(
            data={
                'email': 'newemail@example.com',
                'email2': 'differentemail@example.com',
            }
        )
        self.assertFalse(form.is_valid())
        self.assertIn('email2', form.errors)


class UsersSignalsTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='password123',
        )

    def test_create_user_profile_signal(self):
        user_profile = UserProfile.objects.get(user=self.user)
        self.assertIsNotNone(user_profile)

    def test_update_user_email_signal(self):
        email_address = EmailAddress.objects.create(
            user=self.user,
            email='newemail@example.com',
            verified=True,
            primary=False,
        )
        update_user_email(
            sender=None,
            request=None,
            email_address=email_address,
        )
        email_address.refresh_from_db()
        self.assertTrue(email_address.primary)
        self.assertEqual(self.user.email, 'newemail@example.com')
