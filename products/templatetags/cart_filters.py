from django import template

register = template.Library()


@register.filter
def safe_item_count(cart):
    """
    Safely access the item_count attribute on a Cart object.
    Returns the actual count if available, otherwise returns 0.

    Usage: {{ cart|safe_item_count }}
    """
    try:
        # Try to use the cart's custom count method if available
        if hasattr(cart, 'get_item_count'):
            return cart.get_item_count()

        # Try to access item_count directly
        if hasattr(cart, 'item_count'):
            return cart.item_count

        # If cart has items attribute (many cart implementations do), count
        # them
        if hasattr(cart, 'items') and hasattr(cart.items, 'count'):
            return cart.items.count()

        # Fallback to zero
        return 0
    except Exception:
        # In case of any errors, return 0
        return 0
