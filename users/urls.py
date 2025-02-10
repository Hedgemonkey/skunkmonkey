# users/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('manage/', views.manage_account, name='users_manage'),
    path('details/', views.user_details, name='users_details'),
]
