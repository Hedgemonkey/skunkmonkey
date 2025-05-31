"""
Template tag for linking assets to their most commonly used counterparts
based on a predefined mapping. This helps streamline asset management
by providing shortcuts for frequently used asset combinations.
"""
import logging

from django import template
from django.utils.safestring import mark_safe

from skunkmonkey.templatetags.direct_assets import direct_asset

logger = logging.getLogger(__name__)
register = template.Library()

# Define common asset linkages - these map a simple name to
# one or more actual assets that should be loaded together
ASSET_MAPPINGS = {
    # Core assets
    'core': ['core/main'],
    'bootstrap': ['chunks/vendor/bootstrap'],
    'fontawesome': ['chunks/vendor/fontawesome'],

    # User assets
    'profile': [
        'users/profile', 'users/profileCropper', 'users/profileImageManager'
    ],
    'account': ['users/accountActions', 'users/profile'],
    'address': ['users/addressManagement'],

    # Shop assets
    'cart': ['shop/cartManager'],
    'catalog': ['shop/catalogManager', 'shop/productGrid'],
    'checkout': ['shop/checkout', 'shop/checkoutManager'],
    'products-list': ['shop/productList', 'shop/productFilters'],
    'products-detail': ['shop/productDetail'],
    'wishlist': ['shop/wishlistManager', 'shop/wishlistInitializer'],

    # Staff assets
    'staff-dashboard': ['staff/staff', 'staff/productDashboard'],
    'staff-products': ['staff/productManager', 'staff/productDashboardCharts'],
    'staff-orders': ['staff/orderManager'],
    'staff-categories': ['staff/categoryManagement'],

    # Common utility assets
    'image-cropper': ['common/imageCropper'],
    'api-client': ['common/apiClient'],
    'forms': ['products/formUtils', 'products/baseManager'],
}


@register.simple_tag
def asset_group(group_name):
    """
    Load a predefined group of assets based on the group name.

    Args:
        group_name: The name of the asset group to load

    Returns:
        HTML for all assets in the group
    """
    if group_name not in ASSET_MAPPINGS:
        logger.warning(f"Asset group '{group_name}' not defined in mappings")
        return mark_safe(f"<!-- Asset group '{group_name}' not found -->")

    html_parts = []
    for asset_name in ASSET_MAPPINGS[group_name]:
        asset_html = direct_asset(asset_name)
        html_parts.append(asset_html)

    return mark_safe('\n'.join(html_parts))
