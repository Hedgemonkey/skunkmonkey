import json
import os

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
    # Try to load from manifest if available
    manifest_path = os.path.join(
        settings.BASE_DIR, 'staticfiles', 'manifest.json'
    )

    if os.path.exists(manifest_path):
        try:
            with open(manifest_path, 'r') as f:
                manifest = json.load(f)

            if name in manifest:
                entry = manifest[name]
                static_url = getattr(settings, 'STATIC_URL', '/dev/static/')

                # Handle CSS files
                html = ''
                if 'css' in entry:
                    for css_file in entry['css']:
                        css_tag = (
                            f'<link rel="stylesheet" '
                            f'href="{static_url}{css_file}" />'
                        )
                        html += css_tag

                # Handle JS files
                js_file = entry.get('file', f'js/{name}/{name}.js')
                html += (
                    f'<script type="module" '
                    f'src="{static_url}{js_file}"></script>'
                )
                return mark_safe(html)
        except Exception:
            # Fall back to hardcoded paths if manifest loading fails
            pass

    # Fallback to hardcoded paths if manifest not available
    if name == 'main':
        css_path = "/dev/static/css/core/main.css"
        js_path = "/dev/static/js/core/main.js"
    elif name == 'home':
        css_path = "/dev/static/css/home/home.css"
        js_path = "/dev/static/js/home/home.js"
    else:
        css_path = f"/dev/static/css/{name}/{name}.css"
        js_path = f"/dev/static/js/{name}/{name}.js"

    # Include both CSS and JS tags
    html = f'<link rel="stylesheet" href="{css_path}" />'
    html += f'<script type="module" src="{js_path}"></script>'
    return mark_safe(html)
