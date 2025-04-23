from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from djstripe.models import Customer, Subscription

User = get_user_model()


class Address(models.Model):
    """
    Model to store user delivery addresses.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='addresses',
    )
    address_line_1 = models.CharField(max_length=80)
    address_line_2 = models.CharField(max_length=80, blank=True, default='')
    town_or_city = models.CharField(max_length=40)
    county = models.CharField(max_length=80, blank=True, default='')
    postcode = models.CharField(max_length=20, blank=True, default='')
    country = models.CharField(
        max_length=40, default='United Kingdom'
    )
    phone_number = models.CharField(max_length=20, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Addresses'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.address_line_1}, {self.postcode}"

    def get_full_address(self):
        """Returns the address formatted on multiple lines."""
        parts = [
            self.address_line_1,
            self.address_line_2,
            self.town_or_city,
            self.county,
            self.postcode,
            self.country,
        ]
        return "\n".join(filter(None, parts))

    def get_short_address(self):
        """Returns a short, single-line representation."""
        return f"{self.address_line_1}, {self.town_or_city}"


class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='userprofile',
    )
    stripe_customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    stripe_subscription = models.ForeignKey(
        Subscription,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    default_delivery_address = models.ForeignKey(
        Address,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )
    # User profile fields
    display_name = models.CharField(
        max_length=50,
        blank=True,
        default='',
        help_text="The name you'd like to be called on the site"
    )
    phone_number = models.CharField(max_length=20, blank=True, default='')
    bio = models.TextField(blank=True, default='')
    birth_date = models.DateField(null=True, blank=True)
    profile_image = models.ImageField(
        upload_to='profile_images/',
        null=True,
        blank=True
    )

    # Communication preferences
    NOTIFICATION_CHOICES = (
        ('all', 'All notifications'),
        ('important', 'Important notifications only'),
        ('none', 'No notifications'),
    )
    notification_preference = models.CharField(
        max_length=10,
        choices=NOTIFICATION_CHOICES,
        default='all'
    )

    # Marketing preferences
    receive_marketing_emails = models.BooleanField(default=True)

    # Display preferences
    THEME_CHOICES = (
        ('light', 'Light'),
        ('dark', 'Dark'),
        ('system', 'System default'),
    )
    theme_preference = models.CharField(
        max_length=10,
        choices=THEME_CHOICES,
        default='system'
    )

    def __str__(self):
        return self.user.username

    def get_display_name(self):
        """
        Returns the user's display name with appropriate fallbacks.

        Priority order:
        1. Custom display_name if set
        2. User's get_full_name() if available
        3. User's username as last resort
        """
        if self.display_name:
            return self.display_name

        full_name = self.user.get_full_name()
        if full_name:
            return full_name

        return self.user.username


@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    """
    Create or update the user profile when a User object is saved.
    """
    if created:
        UserProfile.objects.create(user=instance)
    instance.userprofile.save()
