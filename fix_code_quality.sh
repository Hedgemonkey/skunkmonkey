#!/bin/bash

# fix_code_quality.sh - A script to systematically improve code quality
# Created on April 15, 2025

set -e  # Exit on error

echo "=== Starting code quality improvement process ==="

# Auto-detect Django app directories (folders containing both __init__.py and apps.py)
echo "Detecting Django applications..."
APP_DIRS=$(find . -type d -not -path "*/\.*" -not -path "*/venv*" -not -path "*/__pycache__*" -not -path "*/migrations*" | sort)
DJANGO_APPS=""

for dir in $APP_DIRS; do
  if [ -f "$dir/__init__.py" ] && [ -f "$dir/apps.py" ]; then
    relative_dir=${dir#./}
    if [ -n "$relative_dir" ]; then
      echo "Found Django app: $relative_dir"
      DJANGO_APPS="$DJANGO_APPS $relative_dir"
    fi
  fi
done

# Also include the project's main module
if [ -d "./skunkmonkey" ]; then
  DJANGO_APPS="$DJANGO_APPS skunkmonkey"
  echo "Including project module: skunkmonkey"
fi

# Add other important directories that may not be Django apps but contain Python code
for special_dir in "templates" "static"; do
  if [ -d "./$special_dir" ]; then
    DJANGO_APPS="$DJANGO_APPS $special_dir"
    echo "Including special directory: $special_dir"
  fi
done

echo "Directories to process: $DJANGO_APPS"

# Common exclude pattern for all tools
EXCLUDE_PATTERN="*/venv/*,*/.env/*,*/__pycache__/*,*/migrations/*,*/\.*/*,*/static/bundles/*,*/staticfiles/*"

# Step 1: Sort imports with isort
echo "Sorting imports with isort..."
isort $DJANGO_APPS --skip venv --skip .env --skip __pycache__ --skip migrations --skip .git

# Step 2: Remove unused imports with autoflake
echo "Removing unused imports with autoflake..."
for dir in $DJANGO_APPS; do
  if [ -d "$dir" ]; then
    echo "Processing $dir"
    autoflake --remove-all-unused-imports --remove-unused-variables --in-place --recursive "$dir" \
      --exclude "$EXCLUDE_PATTERN"
  fi
done

# Step 3: Fix PEP 8 style issues with autopep8
echo "Fixing PEP 8 style issues with autopep8..."
for dir in $DJANGO_APPS; do
  if [ -d "$dir" ]; then
    echo "Processing $dir"
    autopep8 --recursive --in-place --aggressive --aggressive --max-line-length=79 "$dir" \
      --exclude "$EXCLUDE_PATTERN"
  fi
done

# Step 4: Run Flake8 to check for remaining issues
echo "Checking for remaining issues with Flake8..."
flake8 $DJANGO_APPS --exclude "venv,.env,__pycache__,migrations,.git,static/bundles,staticfiles" > flake8_report.txt || true
echo "Flake8 issues saved to flake8_report.txt"

# Step 5: Fix Django-specific issues
echo "Note: You need to manually fix Django-specific issues like null=True on string fields"
echo "Affected files:"
grep -r "DJ01" flake8_report.txt | cut -d':' -f1 | sort | uniq

# Step 6: Fix undefined names
echo "Note: You need to manually fix undefined names (F821) issues"
echo "Affected files:"
grep -r "F821" flake8_report.txt | cut -d':' -f1 | sort | uniq

# Fix trailing whitespace in all Python files
echo "✅ Fixing trailing whitespace..."
find . -name "*.py" -not -path "*/\.*" -not -path "*/.venv*" -not -path "*/migrations/*" -not -path "*/__pycache__/*" -exec sed -i 's/[ \t]*$//' {} \;

# Fix blank lines containing whitespace
echo "✅ Fixing blank lines with whitespace..."
find . -name "*.py" -not -path "*/\.*" -not -path "*/.venv*" -not -path "*/migrations/*" -not -path "*/__pycache__/*" -exec sed -i 's/^[ \t]*$//' {} \;

echo "=== Code quality improvement process completed ==="
echo "Please check flake8_report.txt for any remaining issues that need manual attention."
