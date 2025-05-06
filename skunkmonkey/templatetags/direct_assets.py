import json
import os
from collections import OrderedDict

from django import template
from django.conf import settings
from django.utils.safestring import mark_safe

register = template.Library()


@register.simple_tag
def direct_asset(name):
    """
    Directly load asset files, with support for production and development.
    Dev: uses Vite dev server. Prod: uses compiled static files.
    """
    # Check if Django is in DEBUG mode
    debug_mode = getattr(settings, 'DEBUG', False)

    # Get Vite dev server settings
    vite_dev_server = getattr(
        settings, 'DJANGO_VITE_DEV_SERVER', 'http://localhost:5173'
    )

    if debug_mode:
        # Development mode - use Vite dev server
        return _render_dev_asset(name, vite_dev_server)
    else:
        # Production mode - use compiled static files
        return _render_prod_asset(name)


def _render_dev_asset(name, dev_server):
    """Render asset tags using Vite dev server in development mode."""
    # In dev mode, we reference the source files on the dev server
    if name == 'main':
        src_path = "src/core/js/main.js"
    elif name == 'home':
        src_path = "src/home/js/home.js"
    else:
        src_path = f"src/{name}/js/{name}.js"

    # Dev server doesn't need CSS tags as they're injected by the JS modules
    html = f'<script type="module" src="{dev_server}/{src_path}"></script>'
    return mark_safe(html)


def _render_prod_asset(name):
    """Render asset tags using compiled files in production mode."""
    # Look for manifest in static directory first, then staticfiles
    manifest_paths = [
        os.path.join(settings.BASE_DIR, 'static', 'manifest.json'),
        os.path.join(settings.BASE_DIR, 'staticfiles', 'manifest.json')
    ]
    
    manifest = None
    for path in manifest_paths:
        if os.path.exists(path):
            try:
                with open(path, 'r') as f:
                    manifest = json.load(f)
                break
            except Exception:
                continue
    
    if not manifest:
        # Fallback to hardcoded paths if manifest not available
        static_url = getattr(settings, 'STATIC_URL', '/static/')
        
        # Generate generic paths based on name
        js_path = f"{static_url}js/core/{name}.js"
        css_path = f"{static_url}css/core/{name}.css"
        
        html = f'<link rel="stylesheet" href="{css_path}" />'
        html += f'<script type="module" src="{js_path}"></script>'
        
        return mark_safe(html)
        
    # Try simple direct name match first
    entry = manifest.get(name)
    
    # If no direct match, try to find by simple file name (without path)
    if not entry:
        js_file = f"src/core/js/{name}.js"
        if js_file in manifest:
            entry = manifest[js_file]
            
    # If still no match, look for any entry with matching name
    if not entry:
        for key, value in manifest.items():
            if isinstance(value, dict) and value.get('name') == name:
                entry = value
                break
    
    # If we have an entry, render it
    if entry:
        static_url = getattr(settings, 'STATIC_URL', '/static/')
        html = []
        
        # Add CSS files
        if 'css' in entry:
            for css_file in entry['css']:
                html.append(f'<link rel="stylesheet" href="{static_url}{css_file}" />')
        
        # Add JS file 
        if 'file' in entry:
            html.append(f'<script type="module" src="{static_url}{entry["file"]}"></script>')
        
        return mark_safe('\n'.join(html))
    
    # If no entry found, fall back to default pattern
    static_url = getattr(settings, 'STATIC_URL', '/static/')
    
    # Generate generic paths based on name
    js_path = f"{static_url}js/core/{name}.js"
    css_path = f"{static_url}css/core/{name}.css"
    
    html = [
        f'<link rel="stylesheet" href="{css_path}" />',
        f'<script type="module" src="{js_path}"></script>'
    ]
    
    return mark_safe('\n'.join(html))


@register.simple_tag
def debug_manifest():
    """Helper tag to debug manifest contents."""
    manifest_paths = [
        os.path.join(settings.BASE_DIR, 'static', 'manifest.json'),
        os.path.join(settings.BASE_DIR, 'staticfiles', 'manifest.json')
    ]
    
    for path in manifest_paths:
        if os.path.exists(path):
            try:
                with open(path, 'r') as f:
                    manifest = json.load(f)
                return mark_safe(f"<pre>{json.dumps(manifest, indent=2)}</pre>")
            except Exception as e:
                return f"Error loading manifest: {str(e)}"
    
    return "Manifest not found"
