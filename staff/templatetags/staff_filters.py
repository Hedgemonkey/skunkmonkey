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


@register.filter
def safe_profile_access(user, attr):
    """
    Safely access user profile attributes with compatibility for both
    staffprofile and staff_profile attribute names.

    This helps prevent errors when templates try to access staffprofile
    instead of staff_profile

    Usage: {{ user|safe_profile_access:"is_manager" }}
    """
    if not user:
        return None

    try:
        # First try to access attribute via staff_profile (the correct way)
        if hasattr(user, 'staff_profile'):
            return getattr(user.staff_profile, attr)
        # If that fails, return None but don't raise an error
        return None
    except (AttributeError, TypeError):
        return None


@register.filter
def with_fallback(obj, attr):
    """
    Access an attribute with fallback to alternative casing.

    This helps with attributes that might be accessed with inconsistent casing,
    such as staffprofile vs staff_profile

    Usage: {{ user|with_fallback:"staff_profile" }}
    """
    if not obj:
        return None

    # First try the original attribute
    if hasattr(obj, attr):
        result = getattr(obj, attr)
        return result() if callable(result) else result

    # Try alternatives for staff_profile / staffprofile
    alternatives = {
        'staff_profile': 'staffprofile',
        'staffprofile': 'staff_profile'
    }

    alt_attr = alternatives.get(attr)
    if alt_attr and hasattr(obj, alt_attr):
        result = getattr(obj, alt_attr)
        return result() if callable(result) else result

    return None
