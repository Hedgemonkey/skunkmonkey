from django import template

register = template.Library()

@register.filter(name='get_item')
def get_item(dictionary, key):
    """
    Custom template filter to access dictionary items using a variable as the key.
    Usage: {{ dictionary|get_item:key }}
    """
    if dictionary is None:
        return None
    
    return dictionary.get(key)