"""
Main views module for the users app.
This file imports and exposes all view functions from the views package.
"""

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.urls import reverse
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

# Import all views from the views package to maintain backward compatibility
from users.views import (  # noqa
    account_inactive_message, add_address, contact, deactivate_account,
    delete_account, delete_address, deleted_account, edit_address,
    email_verification_required, login, manage_account, manage_addresses,
    manage_details, manage_details_update, manage_email, manage_password,
    manage_profile, manage_social, order_detail, order_history,
    profile_dashboard, set_default_address, users_contact,
)

from .models import ContactMessage

User = get_user_model()


def send_contact_email(request, subject, email, message, phone_number=""):
    """
    Send confirmation email to the user and notification to staff after
    contact form submission.
    Also categorize and prioritize messages based on content.

    Args:
        request: The HTTP request object
        subject: Email subject line
        email: User's email address
        message: Message content
        phone_number: Optional phone number
    """
    # Determine category and priority based on subject keywords
    category = 'general'  # Default category
    priority = 'medium'   # Default priority

    # Simple keyword-based categorization
    subject_lower = subject.lower()
    message_lower = message.lower()

    # Check for support-related keywords
    if any(keyword in subject_lower or keyword in message_lower
           for keyword in [
               'help', 'support', 'problem', 'issue', 'error', 'bug', 'fix']):
        category = 'support'
        priority = 'high'

    # Check for billing-related keywords
    elif any(keyword in subject_lower or keyword in message_lower
             for keyword in ['bill', 'payment', 'invoice', 'charge',
                             'refund', 'subscription']):
        category = 'billing'
        priority = 'high'

    # Check for complaint-related keywords
    elif any(keyword in subject_lower or keyword in message_lower
             for keyword in [
                 'complaint', 'dissatisfied', 'unhappy',
                 'disappointed', 'angry'
             ]):
        category = 'complaint'
        priority = 'high'

    # Check for feedback-related keywords
    elif any(keyword in subject_lower or keyword in message_lower
             for keyword in [
                 'feedback', 'suggestion', 'recommend', 'improve'
             ]):
        category = 'feedback'

    # Check for urgent keywords
    if any(keyword in subject_lower or keyword in message_lower
           for keyword in [
               'urgent', 'emergency', 'immediate', 'asap', 'critical'
           ]):
        priority = 'urgent'

    # Get user if logged in
    user = None
    if request.user.is_authenticated:
        user = request.user
        user_name = user.get_full_name() or user.username
    else:
        # Try to find if there's a user with this email
        try:
            user = User.objects.filter(email=email).first()
            user_name = email.split('@')[0]  # Use part before @ as name
        except Exception:
            user_name = email.split('@')[0]

    # Save to database
    contact_message = ContactMessage.objects.create(
        email=email,
        subject=subject,
        message=message,
        phone_number=phone_number,
        user=user,
        category=category,
        priority=priority
    )

    # 1. Send confirmation email to user
    current_site = get_current_site(request)
    context = {
        'user_name': user_name,
        'subject': subject,
        'message': message,
        'phone_number': phone_number,
        'site_name': current_site.name,
        'domain': current_site.domain,
    }

    email_subject = _("We've received your message - SkunkMonkey")
    email_body = render_to_string('users/emails/contact_confirmation.html',
                                  context)

    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]

    email_message = EmailMessage(
        email_subject,
        email_body,
        from_email,
        recipient_list
    )
    email_message.content_subtype = "html"
    email_message.send(fail_silently=True)

    # 2. Send notification to admin/staff
    admin_emails = User.objects.filter(
        is_staff=True,
        is_active=True
    ).values_list('email', flat=True)

    if admin_emails:
        # Generate admin URL for this message
        admin_url = request.build_absolute_uri(
            reverse(
                'admin:users_contactmessage_change',
                args=[contact_message.id]
            )
        )

        admin_context = {
            'subject': subject,
            'message': message,
            'email': email,
            'phone_number': phone_number,
            'timestamp': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
            'user': user,
            'priority': priority,
            'category': category,
            'admin_url': admin_url,
            'message_id': contact_message.id,
        }

        admin_subject = f"New Contact Form: {subject}"
        admin_body = render_to_string(
            'users/emails/contact_admin_notification.html',
            admin_context
        )

        admin_email = EmailMessage(
            admin_subject,
            admin_body,
            from_email,
            list(admin_emails)
        )
        admin_email.content_subtype = "html"
        admin_email.send(fail_silently=True)

    return contact_message
