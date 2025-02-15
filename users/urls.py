# users/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('inactive-message/', views.account_inactive_message, name='account_inactive_message'),
    path('deleted/', views.deleted_account, name='account_deleted'),
    path('deactivate/', views.deactivate_account, name='deactivate_account'),
    path('delete/', views.delete_account, name='delete_account'),
    path('manage/', views.manage_account, name='users_manage'),
    path('details/', views.manage_details, name='manage_details'),
    path('contact/', views.contact, name='users_contact'),
    path("email/", views.manage_email, name="manage_email"), # Add url for manage email
    path("password/", views.manage_password, name="manage_password"), # Add url for manage password
    path("social/", views.manage_social, name="manage_social"), # Add url for manage social
    path('details/update/', views.manage_details_update, name='manage_details_update'), # Add url for updating user details
]
