"""
Views package for users app.
This file imports and exposes view functions from separate modules.
"""

# Account related views
from .account_views import (
    account_inactive_message, deactivate_account, delete_account,
    deleted_account, email_verification_required, login, manage_account,
    manage_details, manage_details_update, manage_email, manage_password,
    manage_social,
)
# Address related views
from .address_views import (
    add_address, delete_address, edit_address, manage_addresses,
    set_default_address,
)
# Contact form related views
from .contact_views import contact, users_contact
# Order related views
from .order_views import order_detail, order_history
# Profile related views
from .profile_views import manage_profile, profile_dashboard

# Define __all__ to explicitly control what's imported when using
# from users.views import *
__all__ = [
    # Account views
    'login', 'manage_account', 'manage_details', 'manage_details_update',
    'manage_email', 'manage_password', 'manage_social',
    'email_verification_required', 'deactivate_account',
    'delete_account', 'deleted_account', 'account_inactive_message',

    # Profile views
    'profile_dashboard', 'manage_profile',

    # Address views
    'manage_addresses', 'add_address', 'edit_address',
    'delete_address', 'set_default_address',

    # Order views
    'order_history', 'order_detail',

    # Contact views
    'contact', 'users_contact'
]
