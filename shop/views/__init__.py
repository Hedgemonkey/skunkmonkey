"""
Shop application views
Organized by functionality into separate modules
"""

# Import all views to make them available from the views module
from .cart_views import CartDetailView, CartAddView, CartRemoveView, CartUpdateQuantityView
from .product_views import ProductListView, ProductDetailView, ProductSearchView, product_list_ajax
from .payment_views import CreatePaymentIntentView, cache_checkout_data, reset_payment_intent
from .checkout_views import (
    CheckoutView, CheckoutSuccessView, OrderDetailView,
    payment_cancel, recover_payment_intent
)
from .wishlist_views import WishlistView, AddToWishlistView, RemoveFromWishlistView
from .ajax_views import AjaxCartCountView, AjaxProductListView, AjaxQuickViewView

# Import comparison views
from .comparison_views import ComparisonView, AddToComparisonView, RemoveFromComparisonView

# Import order history views
from .order_views import OrderHistoryView, OrderCompleteView, OrderDetailView

# For backwards compatibility
from .cart_views import (
    CartDetailView as cart_detail,
    CartAddView as cart_add,
    CartRemoveView as cart_remove,
    CartUpdateQuantityView as cart_update_quantity
)

# Expose all views at package level
__all__ = [
    # Cart views
    'CartDetailView', 'CartAddView', 'CartRemoveView', 'CartUpdateQuantityView',
    'cart_detail', 'cart_add', 'cart_remove', 'cart_update_quantity',
    
    # Product views
    'ProductListView', 'ProductDetailView', 'ProductSearchView', 'product_list_ajax',
    
    # Payment views
    'CreatePaymentIntentView', 'cache_checkout_data', 'reset_payment_intent',
    
    # Checkout views
    'CheckoutView', 'CheckoutSuccessView', 'OrderDetailView',
    'payment_cancel', 'recover_payment_intent',
    
    # Wishlist views
    'WishlistView', 'AddToWishlistView', 'RemoveFromWishlistView',
    
    # Comparison views
    'ComparisonView', 'AddToComparisonView', 'RemoveFromComparisonView',
    
    # Order views
    'OrderHistoryView', 'OrderCompleteView', 'OrderDetailView'
    
    # AJAX views
    'AjaxCartCountView', 'AjaxProductListView', 'AjaxQuickViewView',
]
