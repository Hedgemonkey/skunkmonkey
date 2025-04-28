"""
Monkey patch for django-vite to fix the issue with finding the 'main' entry point.
This file should be imported in wsgi.py to apply the fix at application startup.
"""
import django_vite.core.vite

# Store original function
original_find_entrypoint = django_vite.core.vite.find_entrypoint_file

# Define patched function
def patched_find_entrypoint_file(app_name, entry_name):
    """
    Patched version of find_entrypoint_file that handles various manifest formats.
    This looks for entry points in multiple ways:
    1. First tries the original approach
    2. Looks for direct key matching entry_name
    3. Looks for paths containing entry_name
    4. Looks for entries with isEntry=True and name=entry_name
    """
    manifest = django_vite.core.vite.get_manifest()
    try:
        # Try original approach first
        return original_find_entrypoint(app_name, entry_name)
    except Exception:
        # If original method fails, try alternative approaches

        # 1. Try direct key lookup
        if entry_name in manifest:
            return entry_name

        # 2. Try looking for entries with the entry_name in the path
        candidates = [k for k in manifest.keys() if f"/{entry_name}.js" in k or f"/{entry_name}." in k]
        if candidates:
            return candidates[0]

        # 3. Look for entries with 'isEntry' flag and matching entry_name or name property
        for key, value in manifest.items():
            if isinstance(value, dict) and value.get('isEntry') and (
                entry_name in key or
                value.get('name') == entry_name
            ):
                return key

        # If we get here, we couldn't find a suitable entry point
        raise Exception(f"Could not find entry for {entry_name} in app={app_name}")

# Apply the monkey patch
django_vite.core.vite.find_entrypoint_file = patched_find_entrypoint_file
