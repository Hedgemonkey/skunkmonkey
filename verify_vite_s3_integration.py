#!/usr/bin/env python
"""
Script to verify django-vite integration with S3/CloudFront
This tests if manifest.json can be loaded from S3/CloudFront and if
static assets can be properly referenced.
"""
import os
import json
import requests

import django
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.templatetags.static import static

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skunkmonkey.settings')
django.setup()


def verify_manifest_accessibility():
    """Verify that manifest.json is accessible from the S3/CloudFront URL"""
    print("="*80)
    print("VERIFYING VITE MANIFEST ACCESSIBILITY")
    print("="*80)
    
    # Get the manifest path from django-vite settings
    if hasattr(settings, 'DJANGO_VITE_MANIFEST_PATH'):
        manifest_path = settings.DJANGO_VITE_MANIFEST_PATH
        print(f"Manifest path from settings: {manifest_path}")
        
        # Check if it's a URL or local path
        if manifest_path.startswith(('http://', 'https://')):
            print(f"Manifest appears to be a URL. Attempting HTTP request...")
            try:
                response = requests.get(manifest_path)
                if response.status_code == 200:
                    print("✅ Successfully accessed manifest.json via HTTP!")
                    try:
                        manifest_data = response.json()
                        print(f"✅ manifest.json parsed successfully - found {len(manifest_data)} entries")
                        return manifest_data
                    except json.JSONDecodeError:
                        print("❌ Failed to parse manifest.json - invalid JSON format")
                        return None
                else:
                    print(f"❌ Failed to access manifest.json - HTTP status code: {response.status_code}")
                    return None
            except Exception as e:
                print(f"❌ Error accessing manifest.json: {str(e)}")
                return None
        else:
            # Local file path
            print(f"Manifest appears to be a local file. Checking if file exists...")
            if os.path.exists(manifest_path):
                print(f"✅ Local manifest.json exists at {manifest_path}")
                try:
                    with open(manifest_path, 'r') as f:
                        manifest_data = json.load(f)
                        print(f"✅ manifest.json parsed successfully - found {len(manifest_data)} entries")
                        return manifest_data
                except json.JSONDecodeError:
                    print("❌ Failed to parse local manifest.json - invalid JSON format")
                    return None
                except Exception as e:
                    print(f"❌ Error reading local manifest.json: {str(e)}")
                    return None
            else:
                print(f"❌ Local manifest.json not found at {manifest_path}")
                return None
    else:
        print("❌ DJANGO_VITE_MANIFEST_PATH not set in settings")
        return None


def check_asset_urls(manifest_data):
    """Check if asset URLs are properly formed with S3/CloudFront domain"""
    print("\n" + "="*80)
    print("CHECKING DJANGO-VITE ASSET URL GENERATION")
    print("="*80)
    
    if not manifest_data:
        print("❌ No manifest data available to check asset URLs")
        return
    
    # Check if we're configured to use S3
    if not getattr(settings, 'USE_S3', False):
        print("⚠️ USE_S3 is False - assets will use local URLs")
        return
        
    # Verify we have CloudFront domain
    if not getattr(settings, 'AWS_S3_CUSTOM_DOMAIN', None):
        print("⚠️ AWS_S3_CUSTOM_DOMAIN not set - CloudFront integration may not work")
        return
        
    # Extract the first asset from manifest.json to test
    try:
        entry_file = next(iter(manifest_data.keys()))
        asset_path = manifest_data[entry_file].get('file')
        
        if not asset_path:
            print(f"❌ Could not find asset path in manifest entry: {entry_file}")
            return
            
        # Get static URL prefix
        static_url = settings.STATIC_URL
        expected_prefix = f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{settings.STATICFILES_LOCATION}"
        if not static_url.startswith(('http://', 'https://')):
            expected_prefix = f"https://{settings.AWS_S3_CUSTOM_DOMAIN}{static_url}"
            
        print(f"Entry point: {entry_file}")
        print(f"Asset path: {asset_path}")
        print(f"Static URL: {static_url}")
        print(f"Expected prefix: {expected_prefix}")
        
        # Check CloudFront integration
        if expected_prefix in static_url or static_url.startswith(('http://', 'https://')):
            print("✅ Static URL uses CloudFront domain")
        else:
            print("❌ Static URL does not use CloudFront domain")
            
    except Exception as e:
        print(f"❌ Error checking asset URLs: {str(e)}")


def check_django_vite_settings():
    """Check if django-vite settings are properly configured for S3"""
    print("\n" + "="*80)
    print("CHECKING DJANGO-VITE CONFIGURATION")
    print("="*80)
    
    # Check if django-vite is in installed apps
    if 'django_vite' not in settings.INSTALLED_APPS:
        print("❌ django_vite not in INSTALLED_APPS")
        return False
        
    # Check required settings
    required_settings = [
        'DJANGO_VITE_ASSETS_PATH',
        'DJANGO_VITE_MANIFEST_PATH',
        'DJANGO_VITE_CONFIGS',
    ]
    
    missing = []
    for setting_name in required_settings:
        if not hasattr(settings, setting_name):
            missing.append(setting_name)
            
    if missing:
        print(f"❌ Missing required settings: {', '.join(missing)}")
        return False
    else:
        print("✅ All required django-vite settings are present")
        
    # Print current settings for review
    print("\nCurrent django-vite settings:")
    print(f"DJANGO_VITE_ASSETS_PATH: {settings.DJANGO_VITE_ASSETS_PATH}")
    print(f"DJANGO_VITE_MANIFEST_PATH: {settings.DJANGO_VITE_MANIFEST_PATH}")
    print(f"DJANGO_VITE_DEV_MODE: {getattr(settings, 'DJANGO_VITE_DEV_MODE', 'Not set')}")
    
    # Check if we're in production mode with S3
    if getattr(settings, 'USE_S3', False):
        if not getattr(settings, 'DJANGO_VITE_DEV_MODE', True) == False:
            print("⚠️ Warning: USE_S3 is True but DJANGO_VITE_DEV_MODE is not False")
            
    return True
    

if __name__ == "__main__":
    # Check django-vite settings
    check_django_vite_settings()
    
    # Verify manifest.json accessibility
    manifest_data = verify_manifest_accessibility()
    
    # Check asset URLs
    if manifest_data:
        check_asset_urls(manifest_data)
        
    print("\nVerification complete.")