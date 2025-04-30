#!/bin/bash
# Script to inspect static files and manifest.json on Heroku

echo "============================================"
echo "INSPECTING HEROKU FILESYSTEM"
echo "============================================"

# Check if staticfiles directory exists
echo "Checking if staticfiles directory exists:"
ls -la /app/staticfiles

# Count files in staticfiles directory
echo -e "\nCounting files in staticfiles directory:"
find /app/staticfiles -type f | wc -l

# List a few files in staticfiles
echo -e "\nListing a few files in staticfiles directory:"
find /app/staticfiles -type f | head -n 10

# Check for manifest.json
echo -e "\nChecking for manifest.json:"
ls -la /app/staticfiles/manifest.json 2>/dev/null || echo "manifest.json not found"

# If manifest.json exists, show its content
if [ -f /app/staticfiles/manifest.json ]; then
  echo -e "\nContent of manifest.json:"
  cat /app/staticfiles/manifest.json
else
  echo -e "\nmanifest.json file does not exist!"
fi

# Check static directory (source files)
echo -e "\nChecking static directory (source files):"
ls -la /app/static

# Check for manifest.json in static directory
echo -e "\nChecking for manifest.json in static directory:"
ls -la /app/static/manifest.json 2>/dev/null || echo "manifest.json not found in static directory"

# If manifest.json exists in static directory, show its content
if [ -f /app/static/manifest.json ]; then
  echo -e "\nContent of manifest.json from static directory:"
  cat /app/static/manifest.json
else
  echo -e "\nmanifest.json file does not exist in static directory!"
fi

# Check Django settings for STATIC configurations
echo -e "\nChecking Django settings:"
echo "STATIC_ROOT setting:"
python -c "import os; from django.conf import settings; print(settings.STATIC_ROOT)"
echo "STATIC_URL setting:"
python -c "import os; from django.conf import settings; print(settings.STATIC_URL)"
echo "STATICFILES_STORAGE setting:"
python -c "import os; from django.conf import settings; print(settings.STATICFILES_STORAGE)"

echo -e "\nInspection complete."