# users/adapters.py
from allauth.account.adapter import DefaultAccountAdapter


class CustomAccountAdapter(DefaultAccountAdapter):
    def authenticate(self, request, **credentials):
        # Make sure 'request' is an argument
        # Explicitly pass 'request' in the super call
        user = super().authenticate(request=request, **credentials)
        return user
