from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model
from djstripe.models import Subscription, Customer
# Consider using django-countries for the country field if needed
# from django_countries.fields import CountryField

User = get_user_model()

class Address(models.Model):
    """
    Model to store user delivery addresses.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='addresses'
    )
    address_line_1 = models.CharField(max_length=80)
    address_line_2 = models.CharField(max_length=80, null=True, blank=True)
    town_or_city = models.CharField(max_length=40)
    county = models.CharField(max_length=80, null=True, blank=True)
    postcode = models.CharField(max_length=20, null=True, blank=True)
    # Replace CharField with CountryField if django-countries is installed
    country = models.CharField(max_length=40, default='United Kingdom')
    phone_number = models.CharField(max_length=20, null=True, blank=True)
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
            self.country
        ]
        return "\n".join(filter(None, parts))

    def get_short_address(self):
        """Returns a short, single-line representation."""
        return f"{self.address_line_1}, {self.town_or_city}"


class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='userprofile'
    )
    stripe_customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    stripe_subscription = models.ForeignKey(
        Subscription,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    # Link to the default delivery address
    default_delivery_address = models.ForeignKey(
        Address,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+' # No reverse relation needed from Address
    )

    def __str__(self):
        return self.user.username

# Ensure UserProfile is created when a User is created (using signals)
# Add this to users/signals.py or models.py if signals.py doesn't exist
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    """
    Create or update the user profile when a User object is saved.
    """
    if created:
        UserProfile.objects.create(user=instance)
    # Existing users: just save the profile
    instance.userprofile.save()
