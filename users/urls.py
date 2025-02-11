# users/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('manage/', views.manage_account, name='users_manage'),
    path('details/', views.manage_details, name='manage_details'),
    path('contact/', views.contact, name='users_contact'),
    path("email/", views.manage_email, name="manage_email"), # Add url for manage email
    path("password/", views.manage_password, name="manage_password"), # Add url for manage password
    path("social/", views.manage_social, name="manage_social"), # Add url for manage social
]
