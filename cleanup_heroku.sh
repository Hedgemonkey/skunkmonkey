#!/bin/bash
# Script to clean up Heroku-specific files before DirectAdmin deployment

echo "Cleaning up Heroku-specific files..."

# Heroku Configuration Files
rm -f Procfile
rm -f app.json
rm -f runtime.txt

# S3/CloudFront Special Fixes
rm -f direct_static_s3_upload.py
rm -f test_s3_upload.py
rm -f test_cloudfront.py
rm -f test_static_s3_upload.py
rm -f verify_vite_s3_integration.py
rm -f deploy_static.sh

# Vite/Manifest Fixes for Heroku
rm -f fix_heroku_manifest.py
rm -f patch_django_vite.py
rm -f check_vite_config.py
rm -f debug_vite.py
rm -f inspect_django_vite.py

# Other Heroku Scripts
rm -f deploy.sh
rm -f inspect_heroku_files.sh

echo "Heroku files have been removed!"

# Now let's handle the package.json file
echo "Updating package.json to remove Heroku-specific scripts..."

# Remove Heroku-specific script
node -e '
const fs = require("fs");
const path = require("path");
const pkgPath = path.join(process.cwd(), "package.json");
const pkg = require(pkgPath);

// Remove Heroku-specific scripts
if (pkg.scripts && pkg.scripts["heroku-postbuild"]) {
  delete pkg.scripts["heroku-postbuild"];
  console.log("Removed heroku-postbuild script");
}

// Remove Heroku-specific engines
if (pkg.engines) {
  delete pkg.engines;
  console.log("Removed engines specification");
}

// Write the updated package.json
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
'

echo "Cleanup complete! Your project is now ready for DirectAdmin deployment."
