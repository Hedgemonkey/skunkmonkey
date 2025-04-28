#!/usr/bin/env python
"""
Debug django-vite manifest processing to troubleshoot 'main' entry issue.
Run this on Heroku with: heroku run python debug_vite.py
"""
import json
import os
import sys
import traceback
from pathlib import Path

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skunkmonkey.settings')
import django
django.setup()

# After Django is set up, import settings and other Django modules
from django.conf import settings
import django_vite

print("\n" + "=" * 50)
print("DJANGO-VITE DIAGNOSTICS")
print("=" * 50)

# Print django-vite version
print(f"\nDjango-Vite Version: {getattr(django_vite, '__version__', 'Unknown')}")

# Determine correct module paths for your django-vite version
try:
    # Try to import directly (newer versions)
    try:
        from django_vite.core.vite import get_manifest, find_entrypoint_file
        vite_module = django_vite.core.vite
        print("Using django_vite.core.vite module path")
    except (ImportError, AttributeError):
        # Try older/alternative import path
        from django_vite.core import get_manifest, find_entrypoint_file
        vite_module = django_vite.core
        print("Using django_vite.core module path")
except Exception as e:
    print(f"Error importing django-vite modules: {e}")
    # Try to find the actual module paths by introspection
    print("\nAttempting to discover django-vite module structure:")
    for attr_name in dir(django_vite):
        if attr_name.startswith('__'):
            continue
        print(f"- django_vite.{attr_name}")
        attr = getattr(django_vite, attr_name)
        if hasattr(attr, '__file__'):
            print(f"  - File: {attr.__file__}")
        elif isinstance(attr, type(os)):  # Check if it's a module
            for subattr_name in dir(attr):
                if subattr_name.startswith('__'):
                    continue
                print(f"  - {attr_name}.{subattr_name}")
    sys.exit(1)

# Print relevant settings
print("\nSettings:")
print(f"DJANGO_VITE_ASSETS_PATH: {getattr(settings, 'DJANGO_VITE_ASSETS_PATH', None)}")
print(f"DJANGO_VITE_MANIFEST_PATH: {getattr(settings, 'DJANGO_VITE_MANIFEST_PATH', None)}")
print(f"DJANGO_VITE_DEV_MODE: {getattr(settings, 'DJANGO_VITE_DEV_MODE', None)}")
print(f"DJANGO_VITE_CONFIGS: {getattr(settings, 'DJANGO_VITE_CONFIGS', None)}")

# Check if manifest file exists
manifest_path = getattr(settings, 'DJANGO_VITE_MANIFEST_PATH', None) or os.path.join(settings.STATIC_ROOT, 'manifest.json')
print(f"\nManifest path: {manifest_path}")
print(f"Manifest exists: {os.path.exists(manifest_path)}")

# Try to read manifest
if os.path.exists(manifest_path):
    try:
        with open(manifest_path, 'r') as f:
            manifest_content = json.load(f)
        print(f"Manifest is valid JSON with {len(manifest_content)} entries")
        
        # Print some keys from manifest
        print("\nManifest entries:")
        for i, key in enumerate(list(manifest_content.keys())[:10]):
            print(f"  {i+1}. {key}")
            
        # Check if 'main' exists
        if 'main' in manifest_content:
            print("\n✅ 'main' entry exists in manifest")
            print(f"Content: {json.dumps(manifest_content['main'], indent=2)}")
        else:
            print("\n❌ 'main' entry does NOT exist in manifest")
            
            # Check for main-like entries
            main_candidates = [k for k in manifest_content.keys() if 'main' in k]
            if main_candidates:
                print(f"Found these main-like entries: {main_candidates}")
    except Exception as e:
        print(f"Error reading manifest: {e}")
else:
    print("❌ Manifest file not found!")

# Try to get manifest using django-vite's method
print("\nTesting django-vite's get_manifest function:")
try:
    manifest = get_manifest()
    print(f"✅ get_manifest() returned a manifest with {len(manifest)} entries")
except Exception as e:
    print(f"❌ get_manifest() failed: {e}")
    traceback.print_exc()

# Test entry point lookup for 'main'
print("\nTesting find_entrypoint_file for 'main':")
try:
    app_name = 'default'
    entry_name = 'main'
    result = find_entrypoint_file(app_name, entry_name)
    print(f"✅ find_entrypoint_file returned: {result}")
except Exception as e:
    print(f"❌ find_entrypoint_file failed: {e}")
    # Print traceback for detailed error info
    traceback.print_exc()

# Inspect source of the error
print("\nInspecting django_vite configuration:")
try:
    # Try to determine apps configuration
    apps_var_name = 'APPS'
    dev_mode_var_name = 'DEV_MODE'
    
    apps = None
    dev_mode = None
    
    # Check for various possible variable names
    for var_name in [apps_var_name, 'apps']:
        if hasattr(vite_module, var_name):
            apps = getattr(vite_module, var_name)
            apps_var_name = var_name
            break
    
    for var_name in [dev_mode_var_name, 'dev_mode']:
        if hasattr(vite_module, var_name):
            dev_mode = getattr(vite_module, var_name)
            dev_mode_var_name = var_name
            break
            
    print(f"Django-Vite configuration structure:")
    print(f"  apps ({apps_var_name}): {apps}")
    print(f"  dev mode ({dev_mode_var_name}): {dev_mode}")
except Exception as e:
    print(f"Error inspecting configuration: {e}")

# Monkey patch fix attempt
print("\nAttempting to monkey patch django-vite to fix the issue...")
try:
    # Get the original function
    original_find_entrypoint = find_entrypoint_file
    
    # Define a patched version
    def patched_find_entrypoint_file(app_name, entry_name):
        """Patched version that looks for main in different ways."""
        manifest = get_manifest()
        try:
            # Try original approach
            return original_find_entrypoint(app_name, entry_name)
        except Exception:
            # If that fails, try alternate approaches
            print(f"Original lookup failed, trying alternatives...")
            
            # Try direct key lookup
            if entry_name in manifest:
                print(f"Found entry by direct key: {entry_name}")
                return entry_name
            
            # Try looking for entries with the entry_name
            candidates = [k for k in manifest.keys() if f"/{entry_name}.js" in k or f"/{entry_name}." in k]
            if candidates:
                print(f"Found entry by name in path: {candidates[0]}")
                return candidates[0]
                
            # Look for entries with 'isEntry' flag and entry_name
            for key, value in manifest.items():
                if isinstance(value, dict) and value.get('isEntry') and (
                    entry_name in key or 
                    value.get('name') == entry_name
                ):
                    print(f"Found entry by isEntry and name: {key}")
                    return key
            
            # Failed to find anything
            raise Exception(f"Could not find entry for {entry_name} in app={app_name}")
    
    # Apply the monkey patch
    try:
        # Try to determine the correct module to patch
        sys.modules['django_vite'].core.vite.find_entrypoint_file = patched_find_entrypoint_file
    except Exception:
        try:
            sys.modules['django_vite'].core.find_entrypoint_file = patched_find_entrypoint_file
        except Exception:
            # Direct assignment as fallback
            globals()['find_entrypoint_file'] = patched_find_entrypoint_file
    
    # Test the patched function
    print("\nTesting patched find_entrypoint_file:")
    result = patched_find_entrypoint_file('default', 'main')
    print(f"✅ Patched function returned: {result}")
    
    print("\n🔧 MONKEY PATCH SUCCEEDED")
    print("To make this fix permanent, add a file called 'patch_django_vite.py' with the")
    print("patched function to your application, and import it from your wsgi.py.")
    
except Exception as e:
    print(f"❌ Monkey patch failed: {e}")
    traceback.print_exc()

print("\nDiagnostics complete.")
