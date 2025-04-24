# users/urls.py
from django.urls import path

from . import views
from .views import contact_views, message_views, staff_dashboard_views

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
    path(
        "contact/",
        views.contact,
        name="contact",
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

    # Contact URLs
    path("contact/", contact_views.contact, name="contact"),
    path("contact/user/", contact_views.users_contact, name="users_contact"),

    # User message management
    path(
        'messages/',
        message_views.UserMessageListView.as_view(),
        name='message_list'
    ),
    path(
        'messages/<int:pk>/',
        message_views.UserMessageDetailView.as_view(),
        name='message_detail'
    ),
    path(
        'messages/<int:pk>/reply/',
        message_views.message_reply,
        name='message_reply'
    ),

    # Staff dashboard URLs
    path(
        "staff/dashboard/",
        staff_dashboard_views.StaffDashboardView.as_view(),
        name="staff_dashboard"
    ),
    path(
        "staff/messages/",
        staff_dashboard_views.ContactMessageListView.as_view(),
        name="staff_message_list"
    ),
    path(
        "staff/messages/<int:pk>/",
        staff_dashboard_views.ContactMessageDetailView.as_view(),
        name="staff_message_detail"
    ),
    path(
        "staff/messages/bulk-action/",
        staff_dashboard_views.message_bulk_action,
        name="staff_message_bulk_action"
    ),

    # New URL patterns for staff message actions
    path(
        "staff/messages/<int:pk>/reply/",
        staff_dashboard_views.staff_message_reply,
        name="staff_message_reply"
    ),
    path(
        "staff/messages/<int:pk>/mark-read/",
        staff_dashboard_views.staff_message_mark_read,
        name="staff_message_mark_read"
    ),
    path(
        "staff/messages/<int:pk>/mark-unread/",
        staff_dashboard_views.staff_message_mark_unread,
        name="staff_message_mark_unread"
    ),
    path(
        "staff/messages/<int:pk>/delete/",
        staff_dashboard_views.staff_message_delete,
        name="staff_message_delete"
    ),
    path(
        "staff/messages/<int:pk>/response/",
        staff_dashboard_views.staff_message_response,
        name="staff_message_response"
    ),
    path(
        "staff/messages/<int:pk>/update-status/",
        staff_dashboard_views.staff_message_update_status,
        name="staff_message_update_status"
    ),
    path(
        "staff/messages/<int:pk>/update-notes/",
        staff_dashboard_views.staff_message_update_notes,
        name="staff_message_update_notes"
    ),
    path(
        "staff/messages/<int:pk>/forward/",
        staff_dashboard_views.staff_message_forward,
        name="staff_message_forward"
    ),
    path(
        "staff/messages/<int:pk>/assign/",
        staff_dashboard_views.staff_message_assign,
        name="staff_message_assign"
    ),
]

# Ensure you have included this urls.py in your main project urls.py
# e.g., path('profile/', include('users.urls', namespace='users')),
