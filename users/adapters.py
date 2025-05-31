# users/adapters.py
import logging
import threading

from django.conf import settings

from allauth.account.adapter import DefaultAccountAdapter

logger = logging.getLogger(__name__)


class EmailThread(threading.Thread):
    """Thread for sending emails asynchronously to prevent request timeouts."""
    def __init__(self, adapter, template_prefix, email, context):
        self.adapter = adapter
        self.template_prefix = template_prefix
        self.email = email
        self.context = context
        threading.Thread.__init__(self)

    def run(self):
        try:
            # Call the parent adapter's send_mail method
            self.adapter.parent_send_mail(
                self.template_prefix, self.email, self.context
            )
        except Exception as e:
            # Log the error but don't stop execution
            logger.error(f"Failed to send email to {self.email}: {str(e)}")


class CustomAccountAdapter(DefaultAccountAdapter):
    def authenticate(self, request, **credentials):
        # Make sure 'request' is an argument
        # Explicitly pass 'request' in the super call
        user = super().authenticate(request=request, **credentials)
        return user

    def parent_send_mail(self, template_prefix, email, context):
        # This method calls the original send_mail in the parent class
        context['from_email'] = settings.DEFAULT_FROM_EMAIL
        context['site_name'] = settings.SITE_NAME
        return super().send_mail(template_prefix, email, context)

    def send_mail(self, template_prefix, email, context):
        # Store the context values
        context['from_email'] = settings.DEFAULT_FROM_EMAIL
        context['site_name'] = settings.SITE_NAME

        # Start a background thread to send the email
        thread = EmailThread(self, template_prefix, email, context)
        thread.start()

        # Return immediately without waiting for the email to send
        return True
