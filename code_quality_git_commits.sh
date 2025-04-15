#!/bin/bash

# code_quality_git_commits.sh - Script to help make organized code quality git commits
# Created on April 15, 2025

set -e  # Exit on error

echo "=== Making structured git commits for code quality improvements ==="

# Function to commit changes with descriptive messages
commit_changes() {
  local message=$1
  local scope=$2

  # Stage specific files based on scope
  if [ "$scope" = "all" ]; then
    git add .
  elif [ "$scope" = "models" ]; then
    git add "**/models.py"
  elif [ "$scope" = "views" ]; then
    git add "**/views.py" "**/views/*.py"
  elif [ "$scope" = "tests" ]; then
    git add "**/tests.py" "**/tests/*.py"
  else
    # For specific files, split by spaces and add each file
    for file in $scope; do
      if [ -f "$file" ]; then
        git add "$file"
      else
        echo "Warning: File $file not found"
      fi
    done
  fi

  # Check if there are staged changes before committing
  if git diff --staged --quiet; then
    echo "No changes to commit for: $message"
  else
    # Commit with the given message
    git commit -m "$message"
    echo "Committed: $message"
  fi
}

# Check if code quality issues still exist
echo "Checking for remaining Flake8 issues..."
flake8 > flake8_current.txt || true

# Make structured commits for each type of fix
echo "Making structured git commits..."

# 1. First commit: Setup files for code quality
commit_changes "chore: add configuration for Flake8 and code quality tools" "setup.cfg .pre-commit-config.yaml fix_code_quality.sh"

# 2. Second commit: Fix model field issues (null=True)
commit_changes "fix: replace null=True with blank=True and default on CharField/TextField" "models"

# 3. Third commit: Fix undefined names and imports
commit_changes "fix: add missing imports and fix undefined names" "shop/views.py shop/tests/test_error_handler.py"

# 4. Fourth commit: Documentation
commit_changes "docs: add comments explaining code quality practices" "all"

echo "=== Git commits completed! ==="
echo "The following improvements have been made:"
echo "1. Created a setup.cfg file with Flake8 configuration"
echo "2. Created a pre-commit hook configuration"
echo "3. Fixed Django model fields (replaced null=True with blank=True and default=\"\")"
echo "4. Fixed missing imports and undefined names"
echo "5. Created an automated script to detect Django applications"
echo "6. Made structured git commits for each improvement type"
echo ""
echo "You should periodically run the fix_code_quality.sh script to maintain code quality"
echo "New applications will be automatically detected and processed"

