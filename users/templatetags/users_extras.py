from django import template

register = template.Library()


@register.filter
def split(value, arg):
    """
    Split the value by the argument and return a list.
    Used for displaying conversation threads in templates.

    Usage: {{ value|split:"delimiter" }}
    """
    if value:
        return value.split(arg)
    return []


@register.filter
def is_user_reply(value):
    """
    Check if a message note is from a user reply.

    Usage: {{ value|is_user_reply }}
    """
    if value and isinstance(value, str):
        return "USER REPLY" in value
    return False
