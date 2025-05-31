import json
import os

from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.http import require_GET


@require_GET
def debug_manifest_view(request):
    """Debug view to inspect manifest contents in production."""
    manifest_paths = [
        os.path.join(settings.BASE_DIR, 'static', '.vite', 'manifest.json'),
        os.path.join(
            settings.BASE_DIR, 'staticfiles', '.vite', 'manifest.json'
        ),
        os.path.join(settings.BASE_DIR, 'static', 'manifest.json'),
        os.path.join(settings.BASE_DIR, 'staticfiles', 'manifest.json')
    ]

    results = {
        "base_dir": str(settings.BASE_DIR),
        "static_url": getattr(settings, 'STATIC_URL', '/static/'),
        "manifest_checks": [],
        "chosen_manifest": None,
        "manifest_content": None,
        "entry_checks": {},
    }

    # Check all possible manifest files
    for path in manifest_paths:
        exists = os.path.exists(path)
        file_info = {"path": path, "exists": exists}

        if exists:
            try:
                with open(path, 'r') as f:
                    manifest = json.load(f)
                    file_info["valid"] = True
                    file_info["size"] = len(json.dumps(manifest))
                    file_info["entries"] = len(manifest)

                    # Store the first valid manifest we find
                    if results["manifest_content"] is None:
                        results["manifest_content"] = manifest
                        results["chosen_manifest"] = path
            except Exception as e:
                file_info["valid"] = False
                file_info["error"] = str(e)

        results["manifest_checks"].append(file_info)

    # Test entry lookups for key pages
    test_names = ["category_list", "main", "home", "staff", "products"]
    manifest = results["manifest_content"]

    if manifest:
        for name in test_names:
            name_check = {
                "direct_match": name in manifest,
                "src_pattern_match": f"src/{name}/js/{name}.js" in manifest,
                "core_match": f"src/core/js/{name}.js" in manifest,
                "special_case_match": False
            }

            # Staff pattern
            if "staff" in name:
                staff_path = f"src/staff/js/{name.replace('staff', '')}.js"
                name_check["staff_pattern_match"] = staff_path in manifest

            # Category list special case
            if name == "category_list":
                path = "src/staff/js/category_list.js"
                name_check["special_case_match"] = path in manifest

            # Partial matches
            name_check["partial_matches"] = []
            for key in manifest:
                if name in key:
                    value = manifest[key]
                    is_name_match = (
                        isinstance(value, dict) and value.get('name') == name
                    )
                    is_key_match = key.endswith(f"/{name}.js")
                    if is_name_match or is_key_match:
                        name_check["partial_matches"].append(key)

            results["entry_checks"][name] = name_check

    return JsonResponse(results)
