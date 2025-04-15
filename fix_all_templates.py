#!/usr/bin/env python3
import os
import re
import shutil
from datetime import datetime


def fix_default_filters(content):
    """Fix all incorrect uses of the default filter in a template string."""
    # Pattern 1: {{ var|default }} -> {{ var|default:"" }}
    pattern1 = re.compile(r'(\{\{\s*[^}|]+)\|default\s*\}\}')
    content = pattern1.sub(r'\1|default:""\}\}', content)

    # Pattern 2: {{ var|default value }} without quotes -> {{
    # var|default:"value" }}
    pattern2 = re.compile(r'(\{\{\s*[^}|]+)\|default\s+([^"}][^}]*)\}\}')
    content = pattern2.sub(r'\1|default:"\2"\}\}', content)

    # Pattern 3: {{ var|default: value }} space after colon ->
    # {{ var|default:"value" }}
    pattern3 = re.compile(r'(\{\{\s*[^}|]+)\|default:\s+([^"}][^}]*)\}\}')
    content = pattern3.sub(r'\1|default:"\2"\}\}', content)

    # Pattern 4: {{ var|default:value }} without quotes ->
    # {{ var|default:"value" }}
    # This is tricky because we need to avoid matching already correct usage
    # like {{ var|default:"value" }}
    pattern4 = re.compile(r'(\{\{\s*[^}|]+)\|default:([^"][^},"\']*[^"])\}\}')
    content = pattern4.sub(r'\1|default:"\2"\}\}', content)

    # Pattern 5: Fix include tags with default filter
    # {% include '...' with var=var|default %}
    pattern5 = re.compile(r'(=\s*[^=\s]+)\|default(\s+[^%}]*)%\}')
    content = pattern5.sub(r'\1|default:""\2%\}', content)

    # Pattern 6: Fix |default filter in if conditions
    # {% if var|default %}
    pattern6 = re.compile(r'(\{%\s*if\s+[^%}|]+)\|default(\s*%\})')
    content = pattern6.sub(r'\1|default:""\2', content)

    return content


def process_directory(directory):
    """Process all HTML files in a directory and its subdirectories."""
    fixed_files = 0
    checked_files = 0

    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html'):
                filepath = os.path.join(root, file)
                checked_files += 1

                # Skip files in the virtual environment directory
                if '.venv' in filepath:
                    continue

                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # Fix content
                    fixed_content = fix_default_filters(content)

                    # If changes were made
                    if fixed_content != content:
                        # Create backup
                        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
                        backup_path = f"{filepath}.bak.{timestamp}"
                        shutil.copy2(filepath, backup_path)

                        # Write fixed content
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(fixed_content)

                        fixed_files += 1
                        print(f"Fixed default filter issues in: {filepath}")
                except Exception as e:
                    print(f"Error processing {filepath}: {str(e)}")

    return checked_files, fixed_files


if __name__ == "__main__":
    base_dir = ("/home/hedgemonkey/Documents/Work/code_institute/"
                "API_boilerplate/skunkmonkey")
    print(f"Scanning templates in {base_dir} for default filter issues...")

    checked, fixed = process_directory(base_dir)

    print("\nProcess complete!")
    print(f"Checked {checked} template files")
    print(f"Fixed {fixed} files with default filter issues")

    if fixed > 0:
        print("\nRestart your Django server to apply the changes.")
    else:
        print("\nNo issues found or fixed. The error might be in a different "
              "aspect of your templates.")
        print("Consider checking for other template syntax errors or "
              "mismatched template tags.")
