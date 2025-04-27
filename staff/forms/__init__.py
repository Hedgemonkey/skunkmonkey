"""
Forms package for staff functionality
"""
# Import forms from their respective modules
from .order_forms import (
    CustomerContactForm, OrderFilterForm, OrderNoteForm,
    OrderShippingUpdateForm, OrderStatusUpdateForm,
)
from .profile_forms import StaffProfileForm
from .user_forms import (
    StaffUserCreationForm as UserCreationForm,
    StaffUserUpdateForm as UserUpdateForm, UserProfileForm,
    UserSearchForm as UserFilterForm,
)

# Export all form classes
__all__ = [
    'CustomerContactForm',
    'OrderFilterForm',
    'OrderNoteForm',
    'OrderShippingUpdateForm',
    'OrderStatusUpdateForm',
    'StaffProfileForm',
    'UserCreationForm',
    'UserUpdateForm',
    'UserProfileForm',
    'UserFilterForm',
]
