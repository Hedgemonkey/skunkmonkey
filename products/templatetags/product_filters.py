import logging

from django import template
from django.urls.resolvers import URLResolver

register = template.Library()
logger = logging.getLogger(__name__)

# Add our new filter functions to the existing custom_filters library


@register.filter
def split(value, arg):
    """
    Split a string by the provided delimiter.
    Usage: {{ value|split:"," }}
    """
    if value is None:
        return []
    return value.split(arg)


@register.filter
def get_item(dictionary, key):
    """
    Get an item from a dictionary safely.
    Usage: {{ dictionary|get_item:"key" }}
    """
    if dictionary is None:
        return None
    return dictionary.get(key)


@register.filter
def safe_attr(obj, attr):
    """
    Safely get an attribute or dictionary key, with fallbacks.
    First tries direct attribute access, then dictionary access,
    then tries common alternative names (e.g., 'text' for 'label').

    Usage: {{ object|safe_attr:"attribute_name" }}
    """
    if obj is None:
        return ""

    # Special handling for URLResolver objects
    if isinstance(obj, URLResolver):
        logger.warning(f"Attempted to access '{
                       attr}' on URLResolver object: {obj}")
        if attr == 'id':
            return ""
        if attr == 'name':
            return "Unknown"
        return ""

    # Try direct attribute access
    if hasattr(obj, attr):
        return getattr(obj, attr)

    # Try dictionary access
    if hasattr(obj, 'get'):
        # Check primary key
        if obj.get(attr):
            return obj.get(attr)

        # Common alternative attribute names
        alternatives = {
            'label': ['text', 'name', 'title'],
            'text': ['label', 'name', 'title'],
            'name': ['text', 'label', 'title'],
            'title': ['name', 'text', 'label'],
            'id': ['pk', 'key', 'value']
        }

        for alt in alternatives.get(attr, []):
            if obj.get(alt):
                return obj.get(alt)

    return ""
