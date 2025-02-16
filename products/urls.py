# products/urls.py
from django.urls import path
from . import views

app_name = 'products'

urlpatterns = [
    path('staff/product/create/', views.ProductCreateView.as_view(), name='product_create'),
    path('staff/product/<slug:slug>/update/', views.ProductUpdateView.as_view(), name='product_update'),
    path('staff/product/<slug:slug>/delete/', views.ProductDeleteView.as_view(), name='product_delete'),
    path('staff/management/', views.product_management, name='product_management'),
]

