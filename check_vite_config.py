#!/usr/bin/env python
"""
Check Django-Vite configuration against actual manifest.json
"""
import json
import os
import sys
from pathlib import Path

# Add the project to the Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skunkmonkey.settings')

import django
django.setup()

from django.conf import settings

print("=" * 80)
print("DJANGO-VITE CONFIGURATION CHECK")
print("=" * 80)

# Display Django-Vite settings
print(f"\nDJANGO_VITE_ASSETS_PATH: {getattr(settings, 'DJANGO_VITE_ASSETS_PATH', 'Not set')}")
print(f"DJANGO_VITE_MANIFEST_PATH: {getattr(settings, 'DJANGO_VITE_MANIFEST_PATH', 'Not set')}")
print(f"DJANGO_VITE_DEV_SERVER_PORT: {getattr(settings, 'DJANGO_VITE_DEV_SERVER_PORT', 'Not set')}")
print(f"DJANGO_VITE_DEV_SERVER_HOST: {getattr(settings, 'DJANGO_VITE_DEV_SERVER_HOST', 'Not set')}")
print(f"DJANGO_VITE_DEV_MODE: {getattr(settings, 'DJANGO_VITE_DEV_MODE', 'Not set')}")

# Read the manifest.json file
manifest_path = os.path.join(settings.STATIC_ROOT, 'manifest.json')
if os.path.exists(manifest_path):
    print(f"\nFound manifest.json at: {manifest_path}")
    try:
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)
        
        print(f"Manifest contains {len(manifest)} entries")
        
        # Look for main entry points
        main_entries = [key for key in manifest.keys() if key.endswith('main.js') or '/main.' in key]
        print(f"\nPossible main entry points in manifest:")
        for entry in main_entries:
            print(f"- {entry}")
        
        # Find all entry points
        entry_points = [key for key, value in manifest.items() if isinstance(value, dict) and value.get('isEntry')]
        print(f"\nAll entry points in manifest ({len(entry_points)}):")
        for i, entry in enumerate(sorted(entry_points)):
            print(f"{i+1}. {entry}")
            
        # Check settings for vite_configs
        vite_configs = getattr(settings, 'DJANGO_VITE_CONFIGS', {})
        print(f"\nDJANGO_VITE_CONFIGS:")
        if vite_configs:
            for app_name, config in vite_configs.items():
                print(f"- App: {app_name}")
                for key, value in config.items():
                    print(f"  - {key}: {value}")
                
                # Check if entry points exist in manifest
                if 'entry_points' in config:
                    for entry in config['entry_points']:
                        if entry in manifest:
                            print(f"  ✅ Entry point '{entry}' exists in manifest")
                        else:
                            print(f"  ❌ Entry point '{entry}' NOT FOUND in manifest!")
        else:
            print("Not configured or empty")

        # Check default configuration
        print("\nChecking for default entry point 'main':")
        if 'main' in manifest:
            print("✅ 'main' entry point exists in manifest")
        else:
            print("❌ 'main' entry point NOT FOUND in manifest!")
        
    except Exception as e:
        print(f"Error reading manifest: {str(e)}")
else:
    print(f"Manifest file not found at: {manifest_path}")

print("\nCheck complete.")