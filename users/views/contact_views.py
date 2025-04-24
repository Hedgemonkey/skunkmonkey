"""
Contact-related views for the users app.
Handles contact form submissions and processing.
"""
import logging

from django.contrib import messages
from django.shortcuts import redirect, render
from django.urls import reverse

from ..forms import ContactForm
from ..models import ContactMessage
from ..utils.email import send_contact_email

logger = logging.getLogger('skunkmonkey')


def process_contact_form(request, is_user_view=False):
    """
    Helper function to process contact form data.
    Used by both contact and users_contact views to reduce duplication.
    """
    form = ContactForm(request.POST)
    if form.is_valid():
        # Get form data
        email = form.cleaned_data['email']
        subject = form.cleaned_data['subject']
        message = form.cleaned_data['message']
        phone_number = form.cleaned_data['phone_number']

        # Create ContactMessage record
        contact_msg = ContactMessage(
            email=email,
            subject=subject,
            message=message,
            phone_number=phone_number,
        )

        # Associate with user if logged in
        if request.user.is_authenticated:
            contact_msg.user = request.user

        # Apply automatic prioritization
        if any(word in subject.lower() for word in ['urgent',
                                                    'emergency',
                                                    'immediate']):
            contact_msg.priority = 'urgent'
        elif any(word in subject.lower() for word in ['problem',
                                                      'issue',
                                                      'error']):
            contact_msg.priority = 'high'

        # Apply automatic categorization
        if any(word in subject.lower() for word in ['payment',
                                                    'bill',
                                                    'charge',
                                                    'refund']):
            contact_msg.category = 'billing'
        elif any(word in subject.lower() for word in ['help',
                                                      'support',
                                                      'assist',
                                                      'error']):
            contact_msg.category = 'support'
        elif any(word in subject.lower() for word in ['suggest',
                                                      'feedback',
                                                      'improve']):
            contact_msg.category = 'feedback'
        elif any(word in subject.lower() for word in ['complaint',
                                                      'dissatisfied',
                                                      'unhappy']):
            contact_msg.category = 'complaint'

        # Save to database
        contact_msg.save()

        # Log the action
        if request.user.is_authenticated:
            logger.info(
                f"New contact message saved from user "
                f"{request.user.username}: {contact_msg.id}"
            )
        else:
            logger.info(f"New contact message saved: {contact_msg.id} "
                        f"from {email}")

        # Send email using our utility function
        email_sent = send_contact_email(
            request_or_email=email,
            message=message,
            subject=subject,
            phone_number=phone_number,
            user=request.user if request.user.is_authenticated else None
        )

        # Handle response messages
        if email_sent:
            messages.success(
                request,
                (
                    "Thank you for your message. "
                    "We'll respond as soon as possible."
                )
            )
        else:
            messages.error(
                request,
                (
                    "There was an issue sending your confirmation email, "
                    "but your message has been received. "
                    "We'll be in touch soon."
                )
            )

        # Redirect to appropriate page
        redirect_url = (
            'users:users_contact' if is_user_view else 'users:contact'
        )
        if is_user_view:
            return redirect(redirect_url)
        return redirect(f"{reverse(redirect_url)}?ok")

    return form


def contact(request):
    """Process contact form submissions."""
    if request.method == 'POST':
        result = process_contact_form(request)
        if isinstance(result, ContactForm):  # If form has errors
            form = result
        else:  # If form processing returned a redirect
            return result
    else:
        form = ContactForm()

    return render(request, 'users/contact.html', {'form': form})


def users_contact(request):
    """
    User-specific contact form with pre-filled user information.
    Used when a logged-in user wants to contact the site.
    """
    if request.method == 'POST':
        result = process_contact_form(request, is_user_view=True)
        if isinstance(result, ContactForm):  # If form has errors
            form = result
        else:  # If form processing returned a redirect
            return result
    else:
        # Pre-fill email if user is logged in
        initial_data = {}
        if request.user.is_authenticated:
            initial_data['email'] = request.user.email

        form = ContactForm(initial=initial_data)

    return render(request, 'users/contact.html', {'form': form})
