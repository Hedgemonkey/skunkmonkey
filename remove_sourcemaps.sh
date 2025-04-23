#!/bin/bash

# Script to remove sourceMappingURL comments from CSS and JS files
# This ensures browsers don't request source maps

echo "Removing source map references from static files..."

# Find all CSS files and remove sourceMappingURL comments
find ./static -name "*.css" -exec sed -i -E 's/\/\*#\s*sourceMappingURL=.*\*\///g' {} \;

# Find all JS files and remove sourceMappingURL comments
find ./static -name "*.js" -exec sed -i -E 's/\/\/# sourceMappingURL=.*//g' {} \;

echo "Source map references removed successfully!"
