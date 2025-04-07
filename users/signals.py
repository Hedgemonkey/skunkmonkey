# users/signals.py
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.contrib.auth import get_user_model
from allauth.account.signals import email_confirmed, email_added
from allauth.account.models import EmailAddress
from django.contrib import messages
from .models import UserProfile


@receiver(email_confirmed)
def update_user_email(sender, request, email_address, **kwargs):
    """Update the user's email when confirmed."""
    email_address.set_as_primary()
    EmailAddress.objects.filter(
        user=email_address.user
    ).exclude(primary=True).delete()
    if request:
        messages.info(
            request,
            f"{email_address} has been verified and set as primary email "
            "address. Old E-Mail deleted."
        )


@receiver(email_added)
def email_added_signal(sender, request, email_address, **kwargs):
    """Handle the addition of a new email address."""
    if email_address.verified:
        messages.success(
            request,
            f"{email_address} has already been verified on this account. "
            "Setting as primary email address."
        )
        email_address.set_as_primary(request)
    else:
        messages.info(
            request,
            f"Confirmation email sent to {email_address}. "
            "Please verify this email address."
        )


User = get_user_model()


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create a UserProfile for each new user if it doesn't already exist."""
    if created:
        UserProfile.objects.get_or_create(user=instance)
