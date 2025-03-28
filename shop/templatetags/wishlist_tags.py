from django import template
from ..models import WishlistItem

register = template.Library()

@register.filter
def is_in_wishlist(product, user):
    """
    Check if a product is in the user's wishlist
    
    Usage: {% if product|is_in_wishlist:user %}
    """
    if not user.is_authenticated:
        return False
    
    return WishlistItem.objects.filter(user=user, product=product).exists()

@register.simple_tag(takes_context=True)
def get_wishlist_items(context):
    """
    Return the user's wishlist items as a list of product IDs
    
    Usage: {% get_wishlist_items as wishlist_product_ids %}
    """
    user = context['request'].user
    if not user.is_authenticated:
        return []
    
    return list(WishlistItem.objects.filter(user=user).values_list('product_id', flat=True))
