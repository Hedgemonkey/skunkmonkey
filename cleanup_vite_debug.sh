#!/bin/bash
# Cleanup script to remove temporary debugging files and scripts
# after fixing the django-vite integration issue

echo "Cleaning up temporary debugging files..."

# List of files to remove
FILES_TO_REMOVE=(
    "patch_django_vite.py"
    "debug_vite.py"
    "debug_vite_detailed.py"
    "fix_all_templates.py"
    "direct_asset_fix.py"
    "django_vite_debug.log"
    "django_vite_manifest_parse.log"
    "django_vite_fallback.log"
    "django_vite_init.log"
)

# Remove the files if they exist
for file in "${FILES_TO_REMOVE[@]}"; do
    if [ -f "$file" ]; then
        echo "Removing $file"
        rm "$file"
    else
        echo "File $file not found, skipping"
    fi
done

# Check if we should clean up on the server as well
read -p "Do you want to clean up temporary files on the server too? (y/n): " cleanup_server
if [ "$cleanup_server" = "y" ] || [ "$cleanup_server" = "Y" ]; then
    echo "Cleaning up temporary files on the server..."
    ssh -p 53667 hedgemonkey@spiralcorp.co.uk "cd ~/domains/skunkmonkey.co.uk/dev/ && rm -f patch_django_vite.py debug_vite.py debug_vite_detailed.py fix_all_templates.py direct_asset_fix.py django_vite_*.log"
fi

echo "Cleanup completed!"
echo "The permanent solution (direct_assets.py template tag) is still in place."
