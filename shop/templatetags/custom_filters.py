from decimal import Decimal

from django import template

register = template.Library()


@register.filter
def multiply(value, arg):
    """
    Multiply the value by the argument
    """
    try:
        return Decimal(str(value)) * Decimal(str(arg))
    except (ValueError, TypeError):
        return value


@register.filter
def get_item(dictionary, key):
    """
    Get an item from a dictionary using the key.
    This is useful since Django templates don't allow direct dictionary access
    with variables.

    Usage: {{ my_dict|get_item:key_var }}
    """
    if not dictionary:
        return None

    try:
        return dictionary.get(key)
    except (TypeError, AttributeError):
        # If it's not a dictionary, try accessing it as a list or tuple index
        try:
            return dictionary[key]
        except (IndexError, TypeError, KeyError):
            return None
