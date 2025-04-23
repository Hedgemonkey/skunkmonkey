"""
Main views module for the users app.
This file imports and exposes all view functions from the views package.
"""

# Import all views from the views package to maintain backward compatibility
from users.views import (  # noqa
    account_inactive_message, add_address, contact, deactivate_account,
    delete_account, delete_address, deleted_account, edit_address,
    email_verification_required, login, manage_account, manage_addresses,
    manage_details, manage_details_update, manage_email, manage_password,
    manage_profile, manage_social, order_detail, order_history,
    profile_dashboard, set_default_address, users_contact,
)
