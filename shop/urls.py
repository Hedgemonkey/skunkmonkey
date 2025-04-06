"""
URL configuration for the shop application
"""
from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from . import payment_methods, views
from .webhooks import webhook
from .views import (
    # Cart views
    CartDetailView, CartAddView, CartRemoveView, CartUpdateQuantityView,
    
    # Product views
    ProductListView, ProductDetailView, 
    
    # Checkout and payment views
    CheckoutView, CheckoutSuccessView, CreatePaymentIntentView,
    payment_cancel, recover_payment_intent, cache_checkout_data,
    reset_payment_intent,
    
    # Comparison views
    ComparisonView, AddToComparisonView, RemoveFromComparisonView,
    
    # Order views
    OrderHistoryView, OrderCompleteView, OrderDetailView
)

# Import wishlist views separately for better organization
from .views.wishlist_views import (
    WishlistView, 
    ToggleWishlistView
)


app_name = 'shop'

# Define wishlist URL patterns separately for better organization
wishlist_patterns = [
    path('wishlist/', WishlistView.as_view(), name='wishlist'),
    path('wishlist/toggle/<int:product_id>/', ToggleWishlistView.as_view(), name='toggle_wishlist'),
]

urlpatterns = [
    # Product list and detail views
    path('', ProductListView.as_view(), name='product_list'),
    path('products/ajax/', views.product_list_ajax, name='product_list_ajax'),
    path('products/<slug:slug>/', ProductDetailView.as_view(), name='product_detail'),
    path('category/<slug:category_slug>/', ProductListView.as_view(), name='product_list_by_category'),

    # Cart views
    path('cart/', CartDetailView.as_view(), name='cart'),
    path('cart/add/<int:product_id>/', CartAddView.as_view(), name='cart_add'),
    path('cart/remove/<int:product_id>/', CartRemoveView.as_view(), name='cart_remove'),
    path('cart/update/<int:product_id>/', CartUpdateQuantityView.as_view(), name='cart_update'),

    # Checkout views
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('checkout/success/<int:order_id>/', CheckoutSuccessView.as_view(), name='checkout_success'),
    path('checkout/cancel/', payment_cancel, name='payment_cancel'),
    path('recover_payment_intent/<int:order_id>/', recover_payment_intent, name='recover_payment_intent'),

    # Payment
    path('create-payment-intent/', CreatePaymentIntentView.as_view(), name='create_payment_intent'),
    path('cache_checkout_data/', cache_checkout_data, name='cache_checkout_data'),
    path('checkout/reset/', reset_payment_intent, name='reset_payment_intent'),

    # Order history
    path('orders/', OrderHistoryView.as_view(), name='order_history'),
    path('order/complete/<int:order_id>/', OrderCompleteView.as_view(), name='order_complete'),
    path('order/<int:order_id>/', OrderDetailView.as_view(), name='order_detail'),

    # Comparison
    path('comparison/', ComparisonView.as_view(), name='comparison'),
    path('comparison/add/<int:product_id>/', AddToComparisonView.as_view(), name='add_to_comparison'),
    path('comparison/remove/<int:product_id>/', RemoveFromComparisonView.as_view(), name='remove_from_comparison'),

    # Stripe webhooks
    path('webhook/', webhook, name='webhook'),

    # Payment methods
    path('payment-methods/', payment_methods.payment_methods_list, name='payment_methods_list'),
    path('payment-methods/attach/', payment_methods.attach_payment_method, name='attach_payment_method'),
    path('payment-methods/<str:payment_method_id>/delete/', payment_methods.delete_payment_method, name='delete_payment_method'),
    path('payment-methods/<str:payment_method_id>/set-default/', payment_methods.set_default_payment_method, name='set_default_payment_method'),
]

# Add wishlist patterns to the main URL patterns
urlpatterns += wishlist_patterns
