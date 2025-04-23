"""
Contact-related views for the users app.
Handles contact form submissions and processing.
"""
from django.contrib import messages
from django.shortcuts import redirect, render
from django.urls import reverse

from ..forms import ContactForm


def contact(request):
    """Process contact form submissions."""
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            # Process the form data, e.g., send an email to support
            # Variables commented out until actual email sending is implemented
            # email = form.cleaned_data['email']
            # message = form.cleaned_data['message']
            # Implementation for sending the email would go here

            return redirect(
                reverse('users:contact') + '?ok'
            )
    else:
        form = ContactForm()

    return render(request, 'users/contact.html', {'form': form})


def users_contact(request):
    """
    Alternative view for contact form processing.
    This is a user-specific contact form that may include
    pre-filled data from the user's profile.
    """
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            # Process the form data (e.g., send an email to support)
            messages.success(request, "Message sent successfully.")
            return redirect('users:users_contact')
    else:
        form = ContactForm()

    return render(request, 'users/contact.html', {'form': form})
