# noqa
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.safestring import mark_safe

from django_vite.core.exceptions import DjangoViteAssetNotFoundError
from django_vite.templatetags.django_vite import vite_asset


def safe_vite_asset(path, app=None, **kwargs):
    """
    Wrapper around django_vite.vite_asset that handles missing assets gracefully.
    Uses the configured STATIC_URL from settings to ensure compatibility with AWS.
    """
    try:
        return vite_asset(path, app=app, **kwargs)
    except DjangoViteAssetNotFoundError:
        # Use proper URL based on settings.STATIC_URL
        base_url = settings.STATIC_URL.rstrip('/')
        
        if path == 'main':
            # Return direct link to compiled CSS and JS files
            css_link = f'<link rel="stylesheet" href="{base_url}/css/core/main.css" />'
            js_link = f'<script type="module" src="{base_url}/js/core/main.js"></script>'
            return mark_safe(f"{css_link}{js_link}")
        return ''
