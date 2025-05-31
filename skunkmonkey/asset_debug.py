"""
Debug views for static asset system.
Provides diagnostic tools for asset loading and manifest contents.
"""
import json
import os

from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render


def check_asset_health(request):
    """
    Check health of core assets and return results.

    Args:
        request: The HTTP request

    Returns:
        Rendered asset_health.html template with context
    """
    static_url = settings.STATIC_URL
    on_heroku = 'DATABASE_URL' in os.environ

    # List of tests to show in UI
    test_paths = []

    # Add vendor bundles - look for both possible locations
    manifest_json = {}
    manifest_paths = [
        os.path.join(settings.BASE_DIR, 'static', 'manifest.json'),
        os.path.join(settings.BASE_DIR, 'staticfiles', 'manifest.json')
    ]

    # Try to load manifest to find actual asset paths
    for manifest_path in manifest_paths:
        if os.path.exists(manifest_path):
            try:
                with open(manifest_path, 'r') as f:
                    manifest_json = json.load(f)
                break
            except Exception:
                pass

    # Always include core assets (even without manifest)
    core_paths = [
        f"{static_url}js/core/main.js",
        f"{static_url}css/core/main.css",
        f"{static_url}js/home/home.js",
        f"{static_url}css/home/home.css",
    ]
    test_paths.extend(core_paths)

    # Always add the fallback file since it's important
    test_paths.append(f"{static_url}js/fontawesome-fallback.js")

    # Dynamically identify key files from each section and vendor chunks
    if manifest_json:
        # Find vendor chunks first (most important for testing)
        vendor_chunks = []
        for key, value in manifest_json.items():
            if isinstance(value, dict) and 'file' in value:
                file_path = value['file']
                if 'chunks/vendor/' in file_path:
                    vendor_chunks.append(f"{static_url}{file_path}")

        # Add up to 3 vendor chunks to the tests
        if vendor_chunks:
            test_paths.extend(vendor_chunks[:3])

        # Now look for section files
        sections = [
            'core', 'home', 'products', 'shop', 'users', 'staff', 'common'
        ]
        section_files = []

        # Find meaningful entry points for each section
        for section in sections:
            # Skip core and home since we already have them
            if section in ['core', 'home']:
                continue

            # Look for section-specific files in manifest
            section_entries = []
            for key, value in manifest_json.items():
                if isinstance(value, dict) and 'file' in value:
                    file_path = value['file']
                    if f"js/{section}/" in file_path:
                        # Skip chunked files for section tests
                        if "chunks" not in file_path:
                            file_name = (
                                file_path.split('/')[-1].split('.')[0]
                            )
                            # Prioritize files named like the section
                            if section in file_name:
                                section_entries.insert(
                                    0, f"{static_url}{file_path}"
                                )
                            else:
                                section_entries.append(
                                    f"{static_url}{file_path}"
                                )

            # Add up to 1 file per section
            if section_entries:
                section_files.append(section_entries[0])

        # Add section files to tests
        test_paths.extend(section_files)

    # Remove duplicates while preserving order
    unique_test_paths = []
    for path in test_paths:
        if path not in unique_test_paths:
            unique_test_paths.append(path)

    # Remove duplicates while preserving order
    unique_test_paths = []
    for path in test_paths:
        if path not in unique_test_paths:
            unique_test_paths.append(path)

    context = {
        'test_paths': unique_test_paths,
        'static_url': static_url,
        'debug': settings.DEBUG,
        'on_heroku': on_heroku,
        'static_root': settings.STATIC_ROOT,
        'manifest_json': manifest_json,
    }

    return render(request, 'asset_health.html', context)


def static_directory_info(request):
    """
    Return information about static directories and manifest.json.

    Args:
        request: The HTTP request

    Returns:
        JSON response with static file system information
    """
    # Basic environment info
    on_heroku = 'DATABASE_URL' in os.environ

    results = {
        'environment': {
            'debug': settings.DEBUG,
            'on_heroku': on_heroku,
            'static_url': settings.STATIC_URL,
            'static_root': getattr(settings, 'STATIC_ROOT', None)
        },
        'manifest': {
            'found': False,
            'path': None,
            'entries_count': 0
        },
        'directories': {}
    }

    # Check for manifest.json
    manifest_paths = [
        os.path.join(settings.BASE_DIR, 'staticfiles', 'manifest.json'),
        os.path.join(settings.BASE_DIR, 'static', 'manifest.json')
    ]

    for path in manifest_paths:
        if os.path.exists(path):
            try:
                with open(path, 'r') as f:
                    manifest = json.load(f)
                    results['manifest'] = {
                        'found': True,
                        'path': path,
                        'entries_count': len(manifest),
                        'sample_keys': list(manifest.keys())[:5]
                    }
                break
            except Exception as e:
                results['manifest']['error'] = str(e)

    # Check static directories
    static_dirs = [
        os.path.join(settings.BASE_DIR, 'static'),
        os.path.join(settings.BASE_DIR, 'staticfiles')
    ]

    # Core and section directories to check
    sections = [
        'core', 'home', 'products', 'shop',
        'users', 'staff', 'common', 'chunks', 'vendor'
    ]
    core_dirs = ['manifest.json', 'assets']

    # Add all section directories to check
    for section in sections:
        core_dirs.append(f'js/{section}')
        core_dirs.append(f'css/{section}')

    for static_dir in static_dirs:
        dir_info = {
            'exists': os.path.exists(static_dir),
            'paths': {}
        }

        if dir_info['exists']:
            for core_dir in core_dirs:
                path = os.path.join(static_dir, core_dir)
                path_info = {'exists': os.path.exists(path)}

                if os.path.isfile(path):
                    path_info['type'] = 'file'
                    path_info['size'] = os.path.getsize(path)
                elif os.path.isdir(path):
                    path_info['type'] = 'directory'
                    try:
                        files = os.listdir(path)
                        path_info['files_count'] = len(files)
                        path_info['sample_files'] = files[:5]
                    except Exception as e:
                        path_info['error'] = str(e)

                dir_info['paths'][core_dir] = path_info

        results['directories'][static_dir] = dir_info

    return JsonResponse(results)
