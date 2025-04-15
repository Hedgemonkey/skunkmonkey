# users/urls.py
from django.urls import path

from . import views

app_name = 'users'

urlpatterns = [
    # Dashboard
    path(
        'dashboard/',
        views.profile_dashboard,
        name='profile_dashboard',
    ),

    # Account management
    path(
        'manage/',
        views.manage_account,
        name='manage_account',
    ),
    path(
        'profile/',
        views.manage_profile,
        name='manage_profile',
    ),
    path(
        'details/',
        views.manage_details,
        name='manage_details',
    ),
    path(
        'details/update/',
        views.manage_details_update,
        name='manage_details_update',
    ),
    path(
        'email/',
        views.manage_email,
        name='manage_email',
    ),
    path(
        'password/',
        views.manage_password,
        name='manage_password',
    ),
    path(
        'social/',
        views.manage_social,
        name='manage_social',
    ),
    path(
        'social/accounts/',
        views.manage_social,
        name='account_manage_connected_accounts',
    ),
    path(
        'contact/',
        views.users_contact,
        name='users_contact',
    ),

    # Account status
    path(
        'deactivate/',
        views.deactivate_account,
        name='deactivate_account',
    ),
    path(
        'delete/',
        views.delete_account,
        name='delete_account',
    ),
    path(
        'deleted/',
        views.deleted_account,
        name='deleted_account',
    ),
    path(
        'inactive/',
        views.account_inactive_message,
        name='account_inactive_message',
    ),

    # Address management
    path(
        'addresses/',
        views.manage_addresses,
        name='manage_addresses',
    ),
    path(
        'addresses/add/',
        views.add_address,
        name='add_address',
    ),
    path(
        'addresses/<int:address_id>/edit/',
        views.edit_address,
        name='edit_address',
    ),
    path(
        'addresses/<int:address_id>/delete/',
        views.delete_address,
        name='delete_address',
    ),
    path(
        'addresses/<int:address_id>/set-default/',
        views.set_default_address,
        name='set_default_address',
    ),

    # Order history
    path(
        'orders/',
        views.order_history,
        name='order_history',
    ),
    path(
        'orders/<str:order_number>/',
        views.order_detail,
        name='order_detail',
    ),
]

# Ensure you have included this urls.py in your main project urls.py
# e.g., path('profile/', include('users.urls', namespace='users')),
