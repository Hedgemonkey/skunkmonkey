"""
Email utility functions for the users app.
Provides reusable email functionality throughout the application.
"""
import logging

from django.conf import settings
from django.core.mail import EmailMessage, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.html import strip_tags

# Configure logger for email operations
logger = logging.getLogger('skunkmonkey')


def send_email(subject, message, to_email, from_email=None, **kwargs):
    """
    Send a plain text email.

    Args:
        subject: Email subject line
        message: Plain text message body
        to_email: Recipient email address or list of addresses
        from_email: Sender email (defaults to settings.DEFAULT_FROM_EMAIL)
        **kwargs: Additional email parameters (cc, bcc, headers, etc.)

    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    if not from_email:
        from_email = settings.DEFAULT_FROM_EMAIL

    try:
        email = EmailMessage(
            subject=subject,
            body=message,
            from_email=from_email,
            to=[to_email] if isinstance(to_email, str) else to_email,
            **kwargs
        )
        email.send(fail_silently=False)
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Error sending email to {to_email}: {str(e)}")
        return False


def send_html_email(subject, html_message, to_email, from_email=None,
                    text_message=None, **kwargs):
    """
    Send an HTML email with an alternative plain-text version.

    Args:
        subject: Email subject line
        html_message: HTML message body
        to_email: Recipient email address or list of addresses
        from_email: Sender email (defaults to settings.DEFAULT_FROM_EMAIL)
        text_message: Plain text alternative
            (generated from HTML if not provided)
        **kwargs: Additional email parameters (cc, bcc, headers, etc.)

    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    if not from_email:
        from_email = settings.DEFAULT_FROM_EMAIL

    # Generate plain text version from HTML if not provided
    if text_message is None:
        text_message = strip_tags(html_message)

    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_message,
            from_email=from_email,
            to=[to_email] if isinstance(to_email, str) else to_email,
            **kwargs
        )
        email.attach_alternative(html_message, "text/html")
        email.send(fail_silently=False)
        logger.info(f"HTML email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Error sending HTML email to {to_email}: {str(e)}")
        return False


def send_templated_email(subject, template_name, context, to_email,
                         from_email=None, **kwargs):
    """
    Send an HTML email using a template with context data.

    Args:
        subject: Email subject line
        template_name: Path to the template file
        context: Dictionary of context data for the template
        to_email: Recipient email address or list of addresses
        from_email: Sender email (defaults to settings.DEFAULT_FROM_EMAIL)
        **kwargs: Additional email parameters (cc, bcc, headers, etc.)

    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    # Ensure context has common variables needed by templates
    if 'site_name' not in context:
        context['site_name'] = settings.SITE_NAME

    if 'site_url' not in context:
        context['site_url'] = settings.SITE_URL

    # Add user_name if user is in context but user_name is not
    if 'user_name' not in context and 'user' in context and context['user']:
        user = context['user']
        context['user_name'] = user.get_full_name() or user.username

    html_message = render_to_string(template_name, context)
    text_message = strip_tags(html_message)

    return send_html_email(
        subject=subject,
        html_message=html_message,
        text_message=text_message,
        to_email=to_email,
        from_email=from_email,
        **kwargs
    )


def send_contact_email(
    request_or_email, subject, message, to_email=None,
    phone_number=None, user=None
):
    """
    Send emails for contact form submissions.
    This sends a notification to the site admin and a confirmation to the user.

    Args:
        request_or_email: Either the HTTP request object
            or user's email address
        subject: Subject line for the email
        message: Message content
        to_email: Recipient email
            (if not provided, extracted from request_or_email)
        phone_number: Optional phone number for contact
        user: Optional User object if submission is from a logged-in user

    Returns:
        bool: True if both emails sent successfully, False otherwise
    """
    # Handle case where request_or_email is an email address string
    if isinstance(request_or_email, str) and '@' in request_or_email:
        email = request_or_email
        host = settings.SITE_URL
    else:
        # Assuming it's a request object
        request = request_or_email
        # Don't extract email from request.POST. Instead, use the provided
        # to_email or get it from the request if possible.
        email = to_email or getattr(request, 'email', None)
        # If still no email, try to get it from POST data
        if not email and hasattr(request, 'POST'):
            email = request.POST.get('email')
        host = (
            request.get_host()
            if hasattr(request, 'get_host')
            else settings.SITE_URL
        )

    # Ensure we have a valid email
    if not email or '@' not in email:
        logger.error("Invalid or missing email address for contact form")
        return False

    # Common context for both emails
    context = {
        'email': email,
        'message': message,
        'subject': subject,
        'phone_number': phone_number,
        'user': user,
        'site_url': settings.SITE_URL,
        'host': host,
        'request': request if not isinstance(request_or_email, str) else None,
        'user_name': user.get_full_name() if user else email.split('@')[0]
    }

    # Send admin notification
    admin_notification = send_templated_email(
        subject=f"Contact Form: {subject}",
        template_name='users/emails/admin_contact_notification.html',
        context=context,
        to_email=settings.CONTACT_EMAIL or settings.DEFAULT_FROM_EMAIL
    )

    # Send confirmation to user
    user_confirmation = send_templated_email(
        subject=f"We've received your message: {subject}",
        template_name='users/emails/contact_confirmation.html',
        context=context,
        to_email=email
    )

    # Log result
    logger.info(f"Contact form submission processed for {email}")

    # Return True only if both emails sent successfully
    return admin_notification and user_confirmation


def send_response_email(contact_message, response_text, sender=None):
    """
    Send an email to the user with the staff's response to their contact
    message.

    Args:
        contact_message: The ContactMessage object containing the inquiry
            details
        response_text: The staff response text
        sender: The staff user who wrote the response (optional)

    Returns:
        bool: True if the email was sent successfully, False otherwise
    """
    try:
        # Get recipient email from the contact message
        recipient_email = contact_message.email

        if not recipient_email or '@' not in recipient_email:
            logger.error(
                f"Invalid recipient email for contact message ID: "
                f"{contact_message.id}"
            )
            return False

        # Prepare context for the email template
        context = {
            'user_name': (
                contact_message.user.get_full_name()
                if contact_message.user
                else recipient_email.split('@')[0]
            ),
            'original_subject': contact_message.subject,
            'original_message': contact_message.message,
            'response': response_text,
            'staff_name': (
                sender.get_full_name() if sender else 'Customer Support'
            ),
            'message_date': contact_message.timestamp,
            'response_date': timezone.now(),
            'site_url': settings.SITE_URL,
        }

        # Send the email
        return send_templated_email(
            subject=f"Response to your inquiry: {contact_message.subject}",
            template_name='users/emails/contact_response.html',
            context=context,
            to_email=recipient_email
        )
    except Exception as e:
        logger.error(
            f"Failed to send response email for contact message ID "
            f"{contact_message.id}: {str(e)}"
        )
        return False
