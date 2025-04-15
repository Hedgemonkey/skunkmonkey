"""
Shop application views
This main views.py file acts as an entry point that imports views
from the views directory for backwards compatibility
"""
# Import all views from the views directory
from shop.views.product_views import (
    ProductDetailView, ProductListView, ProductSearchView, product_list_ajax,
)

# For backwards compatibility, expose the main views at the module level
__all__ = [
    # Product views
    'ProductListView', 'ProductDetailView', 'ProductSearchView',
    'product_list_ajax',
]
