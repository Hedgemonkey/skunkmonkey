from django.urls import path
from . import views

app_name = 'shop'

urlpatterns = [
    # Product browsing
    path('', views.ProductListView.as_view(), name='product_list'),
    path('category/<slug:category_slug>/', views.ProductListView.as_view(), name='product_list_by_category'),
    path('product/<slug:slug>/', views.ProductDetailView.as_view(), name='product_detail'),
    
    # Product list with dynamic filtering
    path('products/', views.ProductListView.as_view(), name='product_list'),
    path('products/category/<slug:category_slug>/', views.ProductListView.as_view(), name='product_list_by_category'),
    
    # Add the missing URL pattern for category_products
    path('category_products/<slug:category_slug>/', views.ProductListView.as_view(), name='category_products'),
    
    # AJAX endpoints for dynamic filtering
    path('ajax/products/', views.product_list_ajax, name='product_list_ajax'),
    path('products/ajax/', views.product_list_ajax, name='product_list_ajax_alt'),
    
    # Cart management
    path('cart/', views.CartView.as_view(), name='cart'),
    path('cart/add/<int:product_id>/', views.cart_add, name='cart_add'),
    path('cart/remove/<int:product_id>/', views.cart_remove, name='cart_remove'),
    path('cart/update/<int:product_id>/', views.cart_update, name='cart_update'),
    
    # Checkout process
    path('checkout/', views.CheckoutView.as_view(), name='checkout'),
    path('order/<int:order_id>/complete/', views.OrderCompleteView.as_view(), name='order_complete'),
    path('orders/', views.OrderHistoryView.as_view(), name='order_history'),
    
    # Wishlist functionality
    path('wishlist/', views.WishlistView.as_view(), name='wishlist'),
    path('wishlist/add/<int:product_id>/', views.add_to_wishlist, name='add_to_wishlist'),
    path('wishlist/remove/<int:product_id>/', views.remove_from_wishlist, name='remove_from_wishlist'),
    
    # Comparison functionality
    path('comparison/', views.ComparisonView.as_view(), name='comparison'),
    path('comparison/add/<int:product_id>/', views.add_to_comparison, name='add_to_comparison'),
    path('comparison/remove/<int:product_id>/', views.remove_from_comparison, name='remove_from_comparison'),
]
