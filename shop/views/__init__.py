"""
Shop application views
Organized by functionality into separate modules
"""

from .ajax_views import (
    AjaxCartCountView, AjaxProductListView, AjaxQuickViewView,
)
# For backwards compatibility
# Import all views to make them available from the views module
from .cart_views import (
    CartAddView, CartAddView as cart_add, CartDetailView,
    CartDetailView as cart_detail, CartRemoveView,
    CartRemoveView as cart_remove, CartUpdateQuantityView,
    CartUpdateQuantityView as cart_update_quantity,
)
from .checkout_views import (
    CheckoutSuccessView, CheckoutView, payment_cancel,
    recover_payment_intent,
)
# Import comparison views
from .comparison_views import (
    AddToComparisonView, ComparisonView, RemoveFromComparisonView,
)
# Import order history views
from .order_views import (
    OrderCompleteView, OrderDetailView as OrderDetailViewFromOrders,
    OrderHistoryView
)
from .payment_views import (
    CreatePaymentIntentView, cache_checkout_data, reset_payment_intent,
)
from .product_views import (
    ProductDetailView, ProductListView, ProductSearchView, product_list_ajax,
)
from .wishlist_views import ToggleWishlistView, WishlistView, toggle_wishlist

# Use OrderDetailView from order_views to avoid redefinition
OrderDetailView = OrderDetailViewFromOrders

# Expose all views at package level
__all__ = [
    # Cart views
    'CartDetailView', 'CartAddView', 'CartRemoveView',
    'CartUpdateQuantityView', 'cart_detail', 'cart_add',
    'cart_remove', 'cart_update_quantity',

    # Product views
    'ProductListView', 'ProductDetailView',
    'ProductSearchView', 'product_list_ajax',

    # Payment views
    'CreatePaymentIntentView', 'cache_checkout_data', 'reset_payment_intent',

    # Checkout views
    'CheckoutView', 'CheckoutSuccessView', 'OrderDetailView',
    'payment_cancel', 'recover_payment_intent',

    # Wishlist views
    'WishlistView', 'ToggleWishlistView', 'toggle_wishlist',

    # Comparison views
    'ComparisonView', 'AddToComparisonView', 'RemoveFromComparisonView',

    # Order views
    'OrderHistoryView', 'OrderCompleteView', 'OrderDetailView',

    # AJAX views
    'AjaxCartCountView', 'AjaxProductListView', 'AjaxQuickViewView',
]
