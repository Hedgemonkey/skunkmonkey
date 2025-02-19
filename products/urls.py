# products/urls.py
from django.urls import path
from . import views

app_name = 'products'

urlpatterns = [
    path('staff/category/<slug:slug>/update/', views.category_update, name='category_update'),
    path('staff/category/<slug:slug>/delete/', views.category_delete, name='category_delete'),
    path('staff/get_category_cards/', views.get_category_cards, name='get_category_cards'),
    path('staff/category/add/', views.category_add, name='category_add'), 
    path('staff/product/add-form/', views.product_add_form, name='product_add_form'),
    path('staff/product/add/', views.product_add, name='product_add'),
    path('staff/product/<slug:slug>/update/', views.ProductUpdateView.as_view(), name='product_update'),
    path('staff/product/<slug:slug>/delete/', views.product_delete, name='product_delete'),
    path('staff/management/', views.product_management, name='product_management'),
]

