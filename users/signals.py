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
    # Make new email_address primary, also sets user.email
    email_address.set_as_primary()
    # Delete old, non-primary addresses
    EmailAddress.objects.filter(user=email_address.user).exclude(primary=True).delete()
    # Send a message to the user
    messages.info(request, f"{email_address} has been verified and set as primary email address. Old E-Mail deleted.")


@receiver(email_added)
def email_added_signal(sender, request, email_address, **kwargs): # Sends an extra message in case a user trys to add an existing email address
        if email_address.verified == True: # Checks if the address is already verified on the account
            messages.success(request, f"{email_address} has already been verified on this account. Setting as primary email address.")
            email_address.set_as_primary(request)
        else:# send a message to verify
            messages.info(request, f"Confirmation email sent to {email_address}. Please verify this email address.")


# Create a UserProfile for each new user
User = get_user_model()

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Create a UserProfile for each new user.
    """
    if created:
        UserProfile.objects.create(user=instance)
