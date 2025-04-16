#!/bin/bash

echo "=== Committing Flake8 fixes ==="

echo "1. Committing all __init__.py file changes..."
git add */__init__.py */*/__init__.py
git commit -m "docs: update __init__.py files with proper docstrings" || echo "No changes to commit"

echo "2. Committing utility script fixes..."
git add *.py
git commit -m "style: fix code style issues in utility scripts" || echo "No changes to commit"

echo "3. Committing settings.py changes..."
git add */settings.py
git commit -m "style: fix trailing whitespace in settings.py" || echo "No changes to commit"

echo "4. Committing shop app code quality fixes..."
git add shop/*.py shop/*/*.py
git commit -m "style: fix line length and formatting issues in shop application" || echo "No changes to commit"

echo "5. Committing home and products app fixes..."
git add home/*.py products/*.py
git commit -m "style: fix code style issues in home and products apps" || echo "No changes to commit"

echo "6. Committing users app fixes..."
git add users/*.py
git commit -m "style: fix code style issues in users app" || echo "No changes to commit"

echo "7. Committing remaining fixes..."
git add .
git commit -m "style: fix remaining code style issues" || echo "No changes to commit"

echo "=== All changes committed ==="
