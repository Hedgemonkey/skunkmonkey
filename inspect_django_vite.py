#!/usr/bin/env python
"""
Inspector script to determine the exact structure of django-vite in Heroku.
Run this on Heroku with: heroku run python inspect_django_vite.py
"""
import inspect
import os
import pkgutil
import sys

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skunkmonkey.settings')
import django

django.setup()

# After Django is set up, import settings and django_vite
from django.conf import settings

import django_vite

print("\n==================================================")
print("DJANGO-VITE STRUCTURE INSPECTION")
print("==================================================")

# Check version
print(f"\nDjango-Vite Version: {getattr(django_vite, '__version__', 'Unknown')}")
print(f"Django-Vite Path: {django_vite.__file__}")

# List all top-level attributes of django_vite
print("\nTop-level attributes and modules:")
for name in dir(django_vite):
    if name.startswith('__'):
        continue

    attr = getattr(django_vite, name)
    attr_type = type(attr).__name__

    if hasattr(attr, '__file__'):
        print(f"- {name} ({attr_type}) → {attr.__file__}")
    else:
        print(f"- {name} ({attr_type})")

# Special focus on the core module
if hasattr(django_vite, 'core'):
    print("\nContents of django_vite.core:")
    core = django_vite.core
    for name in dir(core):
        if name.startswith('__'):
            continue

        attr = getattr(core, name)
        attr_type = type(attr).__name__

        if hasattr(attr, '__file__'):
            print(f"- {name} ({attr_type}) → {attr.__file__}")
        else:
            print(f"- {name} ({attr_type})")

    # Check for any submodules of core
    print("\nSubmodules of django_vite.core:")
    for _, name, ispkg in pkgutil.iter_modules([os.path.dirname(core.__file__)]):
        print(f"- {name} ({'package' if ispkg else 'module'})")

# Look for templatetags
if os.path.exists(os.path.join(os.path.dirname(django_vite.__file__), 'templatetags')):
    print("\nTemplate tags:")
    templatetags_dir = os.path.join(os.path.dirname(django_vite.__file__), 'templatetags')
    for file in os.listdir(templatetags_dir):
        if file.endswith('.py') and not file.startswith('__'):
            print(f"- {file}")
            try:
                # Try to import the template tag module
                module_name = f"django_vite.templatetags.{file[:-3]}"
                module = __import__(module_name, fromlist=['*'])

                # Look for functions in the module
                for name in dir(module):
                    if name.startswith('__'):
                        continue
                    attr = getattr(module, name)
                    if callable(attr) and not inspect.isclass(attr):
                        print(f"  - function: {name}")
            except Exception as e:
                print(f"  Error inspecting {file}: {e}")

# Special focus on any possible find_entrypoint or vite_asset function
print("\nSearching for vite_asset and find_entrypoint functions:")
for module_name in sys.modules:
    if 'django_vite' in module_name:
        module = sys.modules[module_name]
        for name in dir(module):
            if 'find_entrypoint' in name or 'vite_asset' in name:
                attr = getattr(module, name)
                if callable(attr):
                    print(f"- {module_name}.{name}")
                    # Try to inspect the function source
                    try:
                        source = inspect.getsource(attr)
                        print(f"  Source code preview: {source.splitlines()[0]}...")
                    except Exception:
                        print("  Could not retrieve source code")

# Special focus on the template tag function
print("\nDetailed inspection of template tag functions:")
try:
    from django_vite.templatetags.django_vite import vite_asset
    print("Found vite_asset template tag!")

    # Look at the source code of the template tag
    source = inspect.getsource(vite_asset)
    print("\nSource code of vite_asset:")
    for i, line in enumerate(source.splitlines()[:20]):  # Print first 20 lines
        print(f"{i+1}: {line}")

    # Look for internal function calls
    print("\nFunctions called by vite_asset:")
    for name in dir(vite_asset):
        if not name.startswith('__'):
            print(f"- {name}")
except Exception as e:
    print(f"Error inspecting vite_asset: {e}")

print("\nInspection complete.")
