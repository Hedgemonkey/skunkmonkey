from django.contrib import messages
from django.shortcuts import redirect, render
from django.utils.translation import gettext_lazy as _

from users.forms import ContactForm
from users.utils.email import send_contact_email


def contact(request):
    """Contact form view."""
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            # Get form data
            email = form.cleaned_data['email']
            subject = form.cleaned_data['subject']
            message = form.cleaned_data['message']
            phone_number = form.cleaned_data['phone_number']

            # Send email notifications and save to database
            send_contact_email(
                request_or_email=request,
                subject=subject,
                to_email=email,
                message=message,
                phone_number=phone_number
            )

            messages.success(
                request, _("Your message has been sent. \
                           We'll get back to you soon!")
            )
            return redirect('users:contact')
    else:
        # Pre-populate email field if user is logged in
        initial_data = {}
        if request.user.is_authenticated:
            initial_data['email'] = request.user.email
        form = ContactForm(initial=initial_data)

    return render(request, 'users/contact.html', {'form': form})
