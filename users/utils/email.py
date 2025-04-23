"""
Email utility functions for the users app.
Provides reusable email functionality throughout the application.
"""
import logging

from django.conf import settings
from django.core.mail import EmailMessage, EmailMultiAlternatives
from django.template.loader import render_to_string
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
        template_name: Django template path for HTML content
        context: Dictionary of context variables for the template
        to_email: Recipient email address or list of addresses
        from_email: Sender email (defaults to settings.DEFAULT_FROM_EMAIL)
        **kwargs: Additional email parameters (cc, bcc, headers, etc.)

    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    try:
        # Render HTML content from template
        html_message = render_to_string(template_name, context)

        # Generate plain text version from HTML
        text_message = strip_tags(html_message)

        # Send the email with both HTML and text alternatives
        return send_html_email(
            subject=subject,
            html_message=html_message,
            text_message=text_message,
            to_email=to_email,
            from_email=from_email,
            **kwargs
        )
    except Exception as e:
        logger.error(f"Error sending templated email to {to_email}: {str(e)}")
        return False


def send_contact_email(request_email, message, user=None):
    """
    Send a contact form submission to site administrators.

    Args:
        request_email: Email address of the person submitting the contact form
        message: Message content from the contact form
        user: User object if the sender is logged in (optional)

    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    subject = f"Contact Form Submission from {request_email}"

    # Create context for the email template
    context = {
        'email': request_email,
        'message': message,
        'user': user
    }

    # Email to site admins
    admin_emails = [admin[1] for admin in settings.ADMINS]

    if not admin_emails:
        # Fallback if ADMINS setting is not configured
        admin_emails = [settings.DEFAULT_FROM_EMAIL]

    try:
        # Send email to administrators
        admin_subject = f"[SkunkMonkey] {subject}"
        admin_message = (
            f"Contact form submission from: {request_email}\n\n"
            f"Message:\n{message}\n\n"
        )
        if user:
            admin_message += (
                f"User Information:\n"
                f"Username: {user.username}\n"
                f"Full Name: {user.get_full_name()}\n"
                f"Email: {user.email}\n"
            )

        send_email(
            subject=admin_subject,
            message=admin_message,
            to_email=admin_emails,
        )

        # Send confirmation email to the user using the HTML template
        confirmation_subject = "Thank you for contacting SkunkMonkey"

        # Use the templated email function with our HTML template
        send_templated_email(
            subject=confirmation_subject,
            template_name='users/emails/contact_confirmation.html',
            context=context,
            to_email=request_email,
        )

        logger.info(f"Contact form submission processed for {request_email}")
        return True

    except Exception as e:
        logger.error(
            f"Error processing contact form for {request_email}: {str(e)}"
        )
        return False
