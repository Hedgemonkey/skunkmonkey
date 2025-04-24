# users/adapters.py
from django.conf import settings

from allauth.account.adapter import DefaultAccountAdapter


class CustomAccountAdapter(DefaultAccountAdapter):
    def authenticate(self, request, **credentials):
        # Make sure 'request' is an argument
        # Explicitly pass 'request' in the super call
        user = super().authenticate(request=request, **credentials)
        return user

    def send_mail(self, template_prefix, email, context):
        # Ensure the from_email is set correctly
        context['from_email'] = settings.DEFAULT_FROM_EMAIL
        context['site_name'] = settings.SITE_NAME
        # Call the parent method to send the email
        return super().send_mail(template_prefix, email, context)
