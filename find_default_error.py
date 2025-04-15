#!/usr/bin/env python3
import os
import re

# Path to the template file
template_path = (
    "/home/hedgemonkey/Documents/Work/code_institute/API_boilerplate/"
    "skunkmonkey/shop/templates/shop/product_list.html")

if not os.path.exists(template_path):
    print("Error: Template file not found at {}".format(template_path))
    exit(1)

# Read the template file
with open(template_path, 'r') as f:
    lines = f.readlines()

# Look for incorrect default filter usage
incorrect_patterns = [
    r'\{\{\s*[^}|]+\|default\s*\}\}',  # {{ var|default }}
    r'\{\{\s*[^}|]+\|default\s+[^"}]*\}\}',  # {{ var|default something }}
    r'\{\{\s*[^}|]+\|default\s*:\s+[^"}]*\}\}'  # {{ var|default: something }}
]

found = False
for i, line in enumerate(lines, 1):
    for pattern in incorrect_patterns:
        if re.search(pattern, line):
            print("Line {}: {}".format(i, line.strip()))
            print("  Error: Incorrect default filter usage")
            print("  Should be: {{ variable|default:\"default_value\" }}")
            print()
            found = True

if not found:
    # Try a more general pattern to catch any default filter usage
    for i, line in enumerate(lines, 1):
        if "|default" in line and ":" not in line:
            print("Line {}: {}".format(i, line.strip()))
            print("  Warning: Possible incorrect default filter usage")
            print("  Should be: {{ variable|default:\"default_value\" }}")
            print()
            found = True
        elif "|default:" in line and ("|default: "
                                      in line or "|default:  " in line):
            print("Line {}: {}".format(i, line.strip()))
            print("  Warning: Possible space after colon in default filter")
            print("  Should be: {{ variable|default:\"default_value\" }}")
            print()
            found = True

if not found:
    print("No obvious incorrect default filter usage found.")
    print("Let's look at all default filter usages:")

    for i, line in enumerate(lines, 1):
        if "|default" in line:
            print("Line {}: {}".format(i, line.strip()))

print(
    "\nRemember: The correct syntax is "
    "{{ variable|default:\"default_value\" }}"
    " with no space after the colon.")
