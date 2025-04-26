"""
Custom template filters for staff functionality
"""
from django import template

register = template.Library()


@register.filter
def get_item(dictionary, key):
    """
    Gets an item from a dictionary using the key.

    This is useful for dictionaries where the keys are variables or
    values that can't be directly accessed in templates.

    Usage: {{ my_dict|get_item:key_variable }}
    """
    if not dictionary:
        return None
    return dictionary.get(key)


@register.filter
def get_attr(obj, attr):
    """
    Gets an attribute or method from an object.

    This allows for accessing object attributes or methods that might be
    stored in variables or in formats that can't be directly accessed
    in templates.

    Usage: {{ my_object|get_attr:"attribute_name" }}
    """
    if not obj:
        return None

    try:
        # Try to get the attribute
        attribute = getattr(obj, attr)

        # If it's a method, call it
        if callable(attribute):
            return attribute()
        return attribute
    except (AttributeError, TypeError):
        return None
