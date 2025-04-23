"""
Vite template tags bridge for the users app.
This module serves as a bridge between templates trying to use 'vite' tags
and the actual django_vite library.
"""
from django import template

from django_vite.templatetags.django_vite import vite_asset, vite_hmr_client

register = template.Library()

# Register the same tags from django_vite under our library name
register.simple_tag(vite_asset)
register.simple_tag(vite_hmr_client)
