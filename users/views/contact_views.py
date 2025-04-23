"""
Contact-related views for the users app.
Handles contact form submissions and processing.
"""
from django.contrib import messages
from django.shortcuts import redirect, render
from django.urls import reverse

from ..forms import ContactForm
from ..utils.email import send_contact_email


def contact(request):
    """Process contact form submissions."""
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            # Get form data
            email = form.cleaned_data['email']
            message = form.cleaned_data['message']

            # Send email using our utility function
            email_sent = send_contact_email(
                request_email=email,
                message=message,
                user=request.user if request.user.is_authenticated else None
            )

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
                        "There was an issue sending your message. "
                        "Please try again later."
                    )
                )

            return redirect(
                reverse('users:contact') + '?ok'
            )
    else:
        form = ContactForm()

    return render(request, 'users/contact.html', {'form': form})


def users_contact(request):
    """
    User-specific contact form with pre-filled user information.
    Used when a logged-in user wants to contact the site.
    """
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            # Get form data
            email = form.cleaned_data['email']
            message = form.cleaned_data['message']

            # Send email using our utility function
            email_sent = send_contact_email(
                request_email=email,
                message=message,
                user=request.user
            )

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
                        "There was an issue sending your message. "
                        "Please try again later."
                    )
                )

            return redirect('users:users_contact')
    else:
        # Pre-fill email if user is logged in
        initial_data = {}
        if request.user.is_authenticated:
            initial_data['email'] = request.user.email

        form = ContactForm(initial=initial_data)

    return render(request, 'users/contact.html', {'form': form})
