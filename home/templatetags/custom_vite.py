"""
Custom template tags to override django-vite's default behaviors.
This file provides a direct fix for the "Cannot find main for app=default" error.
"""
import json
import os
from django import template
from django.conf import settings
from django.templatetags.static import static
from django.utils.safestring import mark_safe

# Register this template tag library
register = template.Library()

# Store the manifest data in a module-level variable to avoid reading it multiple times
_manifest_data = None


def get_manifest():
    """Read the Vite manifest.json file"""
    global _manifest_data
    
    if _manifest_data is not None:
        return _manifest_data
        
    manifest_path = getattr(settings, 'DJANGO_VITE_MANIFEST_PATH', None)
    if not manifest_path:
        # Use default path if not explicitly set
        manifest_path = os.path.join(settings.STATIC_ROOT, 'manifest.json')
    
    if not os.path.exists(manifest_path):
        # Check the alternative path in staticfiles
        alt_path = os.path.join(settings.STATICFILES_DIRS[0], 'manifest.json')
        if os.path.exists(alt_path):
            manifest_path = alt_path
            
    try:
        with open(manifest_path, 'r') as f:
            _manifest_data = json.load(f)
        return _manifest_data
    except (FileNotFoundError, json.JSONDecodeError) as e:
        # In case of error, return an empty dict to avoid crashing
        print(f"Error reading manifest: {e}")
        return {}


def find_entry_in_manifest(entry_name):
    """Find an entry point in the manifest using multiple strategies"""
    manifest = get_manifest()
    
    # Strategy 1: Direct key lookup
    if entry_name in manifest:
        return entry_name
    
    # Strategy 2: Look for file paths containing entry_name
    for key in manifest.keys():
        if f"/{entry_name}." in key or f"/{entry_name}/" in key:
            return key
    
    # Strategy 3: Look for entries with isEntry flag
    for key, value in manifest.items():
        if isinstance(value, dict):
            # Check if this entry has isEntry=true and name matches
            if value.get("isEntry") and (entry_name in key or value.get("name") == entry_name):
                return key
                
    # Strategy 4: Look for entries with src or file property containing entry_name
    for key, value in manifest.items():
        if isinstance(value, dict):
            src = value.get("src", "")
            file = value.get("file", "")
            if entry_name in src or entry_name in file:
                return key
    
    # If all strategies fail, return None
    return None


@register.simple_tag
def vite_asset(entry_name, app=None):
    """
    Custom implementation of vite_asset template tag to fix the manifest lookup issues.
    This version uses multiple strategies to find the entry point in the manifest.
    """
    # We're not in development mode on Heroku, so always use production
    dev_mode = False
    
    if dev_mode:
        # Just return dev server URLs (not relevant for Heroku)
        dev_server = getattr(settings, "DJANGO_VITE_DEV_SERVER_URL", "http://localhost:5173")
        return mark_safe(
            f'<script type="module" src="{dev_server}/{entry_name}"></script>'
        )
    else:
        # Production mode - use the manifest
        entry_path = find_entry_in_manifest(entry_name)
        
        if not entry_path:
            # Fall back to just using the entry name directly if we can't find it
            print(f"Warning: Could not find {entry_name} in manifest, using direct name")
            return mark_safe(
                f'<script type="module" src="{static(entry_name)}"></script>'
            )
            
        manifest = get_manifest()
        entry_data = manifest.get(entry_path, {})
        
        if not entry_data:
            print(f"Warning: Entry {entry_path} found but has no data in manifest")
            return ""
            
        # Get the file path for the entry
        file = entry_data.get("file")
        if not file:
            print(f"Warning: Entry {entry_path} has no file property")
            return ""
            
        # Get CSS imports if any
        css = entry_data.get("css", [])
        imports = entry_data.get("imports", [])
        
        # Build the HTML
        html = [f'<script type="module" src="{static(file)}"></script>']
        
        # Add CSS files
        for css_file in css:
            html.append(f'<link rel="stylesheet" href="{static(css_file)}">')
            
        return mark_safe("\n".join(html))