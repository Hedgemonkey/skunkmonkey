#!/bin/bash

# fix_pre_commit_issues.sh - A script to fix the specific issues preventing pre-commit hooks from passing
# Created on April 15, 2025

set -e  # Exit on error

echo "=== Starting pre-commit issue fixing process ==="

# Fix end-of-file issues for all files
echo "Fixing end-of-file issues..."
find . -type f -not -path "*/\.*" -not -path "*/venv*" -not -path "*/node_modules/*" \
  -not -path "*/.git/*" -not -path "*/__pycache__/*" -exec sh -c \
  'tail -c1 "$0" | read -r _ || echo "" >> "$0"' {} \;

# Also fix files in .vscode directory
echo "Fixing .vscode directory files..."
find ./.vscode -type f -name "*.py" -exec sh -c \
  'tail -c1 "$0" | read -r _ || echo "" >> "$0"' {} \;

# List of files with line length issues that need special handling
LONG_LINE_FILES=(
  "find_default_error.py"
  "fix_template.py"
  "fix_all_templates.py"
  "check_logs_dir.py"
  "check_template_syntax.py"
  ".vscode/arctictern.py"
  "shop/webhook_handler.py"
  "shop/webhooks.py"
  "shop/checkout_views.py"
  "shop/views/checkout_views.py"
  "shop/views/payment_views.py"
  "shop/views/comparison_views.py"
  "shop/views/order_views.py"
  "shop/views/mixins.py"
  "shop/views/__init__.py"
  "shop/forms.py"
  "shop/admin.py"
  "shop/mixins.py"
  "shop/middleware.py"
  "shop/payment_methods.py"
  "shop/utils/stripe_utils.py"
  "shop/templatetags/custom_filters.py"
  "shop/management/commands/cleanup_comparison_lists.py"
  "home/views.py"
  "products/views.py"
  "products/forms.py"
)

# Apply more aggressive autopep8 to these files
echo "Fixing long lines in problematic files..."
for file in "${LONG_LINE_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing long lines in $file"
    # Run autopep8 with very aggressive settings multiple times
    for i in {1..3}; do
      autopep8 --in-place --aggressive --aggressive --aggressive --max-line-length=79 "$file"
    done

    # For complex files that might need manual breaking of long lines
    if [[ "$file" == "shop/webhook_handler.py" || "$file" == "shop/views/checkout_views.py" || "$file" == "shop/forms.py" ]]; then
      echo "Special handling for complex file: $file"
      # Try to break string literals and long parameter lists
      sed -i -E 's/(.{70,78})( +)/\1\\\n        /g' "$file"
    fi
  else
    echo "Warning: File $file not found"
  fi
done

# Fix trailing whitespace in all files
echo "Fixing trailing whitespace..."
find . -type f -not -path "*/\.*" -not -path "*/venv*" -not -path "*/node_modules/*" \
  -not -path "*/.git/*" -not -path "*/__pycache__/*" -exec sed -i 's/[ \t]*$//' {} \;

# Fix specific import issue in arctictern.py
if [ -f ".vscode/arctictern.py" ]; then
  echo "Fixing unused import in .vscode/arctictern.py"
  # Remove the unused subprocess import
  sed -i "/^import subprocess$/d" .vscode/arctictern.py
fi

echo "=== Pre-commit issue fixing completed ==="
echo "Try running 'pre-commit run --all-files' to check if all issues are resolved."
echo "Note: You may need to manually fix some long lines that couldn't be automatically broken."
