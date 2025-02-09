from django.contrib import admin
from django.urls import path
from . import views

# Register your models here.

urlpatterns = [
    path('', views.index, name='index'),
]