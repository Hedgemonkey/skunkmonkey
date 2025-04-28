from django import template
from django.conf import settings
from django.utils.safestring import mark_safe
from django_vite.templatetags.django_vite import vite_asset as original_vite_asset
from django_vite.core.exceptions import DjangoViteAssetNotFoundError

register = template.Library()

@register.simple_tag
def aws_vite_asset(path, app=None, **kwargs):
    """
    Custom template tag that wraps django_vite.vite_asset and provides a fallback 
    for when assets are served from AWS CloudFront.
    
    This is needed because django-vite might not find the manifest.json in non-local
    storage scenarios like when using S3.
    """
    try:
        # First try the regular django-vite asset loading
        return original_vite_asset(path, app, **kwargs)
    except DjangoViteAssetNotFoundError:
        # If that fails, generate URLs based on STATIC_URL
        base_url = settings.STATIC_URL.rstrip('/')
        
        # Check which asset is being requested and provide appropriate fallbacks
        if path == 'main':
            css_link = f'<link rel="stylesheet" href="{base_url}/css/core/main.css" />'
            js_link = f'<script type="module" src="{base_url}/js/core/main.js"></script>'
            return mark_safe(f"{css_link}{js_link}")
            
        # Handle other common asset types
        if path.endswith('.css') or 'Style' in path:
            # Determine the CSS path based on naming convention
            css_path = f"css/core/{path}.css"
            if 'products' in path:
                css_path = f"css/products/{path}.css"
            elif 'shop' in path:
                css_path = f"css/shop/{path}.css"
            elif 'users' in path:
                css_path = f"css/users/{path}.css"
            elif 'staff' in path:
                css_path = f"css/staff/{path}.css"
            
            return mark_safe(f'<link rel="stylesheet" href="{base_url}/{css_path}" />')
            
        # Handle JS files
        js_path = f"js/core/{path}.js"
        if 'products' in path:
            js_path = f"js/products/{path}.js"
        elif 'shop' in path:
            js_path = f"js/shop/{path}.js"
        elif 'users' in path:
            js_path = f"js/users/{path}.js"
        elif 'staff' in path:
            js_path = f"js/staff/{path}.js"
            
        return mark_safe(f'<script type="module" src="{base_url}/{js_path}"></script>')