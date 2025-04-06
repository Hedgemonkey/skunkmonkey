#!/usr/bin/env python
import os
import re

# Path to the template with the error
template_path = "/home/hedgemonkey/Documents/Work/code_institute/API_boilerplate/skunkmonkey/shop/templates/shop/product_list.html"

if not os.path.exists(template_path):
    print(f"Template file not found: {template_path}")
    exit(1)

# Read the template content
with open(template_path, 'r') as f:
    content = f.read()

# Search for incorrect default filter usages
incorrect_patterns = [
    r'\{\{\s*([^}|]+)\|default\s*\}\}',  # {{ value|default }}
    r'\{\{\s*([^}|]+)\|default:\s+"?([^"}]+)"?\s*\}\}',  # {{ value|default: "value" }}
]

print("Analyzing template for default filter errors...")
found_errors = False

for pattern in incorrect_patterns:
    matches = re.finditer(pattern, content)
    for match in matches:
        found_errors = True
        print(f"Found incorrect default filter: {match.group(0)}")
        
        # For the first pattern (missing default value)
        if "|default }}" in match.group(0):
            variable = match.group(1).strip()
            suggested_fix = f"{{ {variable}|default:\"\" }}"
            print(f"  Suggested fix: {suggested_fix}")
            
        # For the second pattern (space after colon)
        elif "|default: " in match.group(0):
            variable = match.group(1).strip()
            default_value = match.group(2).strip()
            suggested_fix = f"{{ {variable}|default:\"{default_value}\" }}"
            print(f"  Suggested fix: {suggested_fix}")

# If no specific patterns matched, look for any default filter
if not found_errors:
    default_usages = re.finditer(r'\{\{[^}]*\|default[^}]*\}\}', content)
    for usage in default_usages:
        print(f"Found default filter usage: {usage.group(0)}")
        print("  Check that the default filter has exactly one value after the colon")
        print("  Correct format: {{ value|default:\"default_value\" }}")

print("\nTo fix the template, replace the incorrect usages with the suggested fixes.")
print("Remember: The default filter requires exactly 2 arguments - the variable and a default value.")