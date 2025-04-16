#!/bin/bash

# fix_critical_files.sh - Special handling for files with complex line length issues
# Created on April 15, 2025

set -e  # Exit on error

echo "=== Starting critical file fixing process ==="

# Ensure files end with newlines
find shop/views/checkout_views.py shop/webhook_handler.py shop/forms.py -type f -exec sh -c \
  'tail -c1 "$0" | read -r _ || echo "" >> "$0"' {} \;

# Fix trailing whitespace
find shop/views/checkout_views.py shop/webhook_handler.py shop/forms.py -type f -exec sed -i 's/[ \t]*$//' {} \;

# Function to safely handle long lines in Python files
fix_long_lines() {
  local file=$1
  echo "Carefully fixing long lines in $file"

  # Create a backup
  cp "$file" "${file}.bak"

  # Use autopep8 with safe settings
  echo "Running autopep8 with safe settings..."
  autopep8 --in-place --max-line-length=79 "$file"

  # Check if the file still has valid syntax
  python -m py_compile "$file" 2>/dev/null
  if [ $? -ne 0 ]; then
    echo "Syntax error detected! Restoring from backup."
    cp "${file}.bak" "$file"
    echo "Will try a more conservative approach..."

    # Only fix the most obvious cases like long strings
    grep -n '.\{80,\}' "$file" | while read -r line; do
      line_num=$(echo "$line" | cut -d':' -f1)
      echo "Manual inspection needed for line $line_num in $file"
    done
  else
    echo "Syntax check passed for $file"
    rm "${file}.bak"
  fi
}

# Fix each file individually
fix_long_lines "shop/views/checkout_views.py"
fix_long_lines "shop/webhook_handler.py"
fix_long_lines "shop/forms.py"

echo "=== Critical file fixing completed ==="
echo "These files may still have line length issues that need manual attention."
echo "Please check each file manually and fix any remaining issues."
