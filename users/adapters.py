# users/adapters.py
from allauth.account.adapter import DefaultAccountAdapter


class CustomAccountAdapter(DefaultAccountAdapter):
     def authenticate(self, request, **credentials):  # Make sure 'request' is an argument
        user = super().authenticate(request=request, **credentials)  # Explicitly pass 'request' in super call
        return user