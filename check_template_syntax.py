#!/usr/bin/env python
import os
import re
import argparse
from pathlib import Path

def check_template_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    errors = []
    
    # Check for common filter syntax errors
    filter_patterns = {
        'default': r'\{\{\s*([^}|]+)\|default(?!\s*:)([^}]*)\}\}',  # {{ value|default }} or missing colon
        'default_space': r'\{\{\s*([^}|]+)\|default:\s+([^}]+)\}\}',  # {{ value|default: "value" }} - space after colon
        'add': r'\{\{\s*([^}|]+)\|add(?!\s*:)([^}]*)\}\}',  # Missing colon for add filter
        'truncate': r'\{\{\s*([^}|]+)\|truncate(?!words|chars)([^}]*)\}\}',  # Wrong truncate filter name
    }
    
    for filter_name, pattern in filter_patterns.items():
        matches = re.finditer(pattern, content)
        for match in matches:
            errors.append({
                'filter': filter_name,
                'match': match.group(0),
                'line': content[:match.start()].count('\n') + 1,
                'suggestion': get_suggestion(filter_name, match)
            })
    
    # Check for missing endblock, endif, endfor, etc.
    start_tags = ['{% block', '{% if', '{% for', '{% with']
    end_tags = ['{% endblock', '{% endif', '{% endfor', '{% endwith']
    
    for i, (start, end) in enumerate(zip(start_tags, end_tags)):
        starts = len(re.findall(re.escape(start) + r'\s', content))
        ends = len(re.findall(re.escape(end) + r'\s*%}', content))
        
        if starts > ends:
            errors.append({
                'filter': f"Missing {end}",
                'match': f"Found {starts} {start} tags but only {ends} {end} tags",
                'line': None,
                'suggestion': f"Add missing {end} %}} tag(s)"
            })
    
    return errors

def get_suggestion(filter_name, match):
    if filter_name == 'default':
        variable = match.group(1).strip()
        return f"{{ {variable}|default:\"\" }}"
    elif filter_name == 'default_space':
        variable = match.group(1).strip()
        default_value = match.group(2).strip()
        return f"{{ {variable}|default:\"{default_value}\" }}"
    elif filter_name == 'add':
        variable = match.group(1).strip()
        return f"{{ {variable}|add:0 }}"
    elif filter_name == 'truncate':
        variable = match.group(1).strip()
        return f"{{ {variable}|truncatewords:30 }} or {{ {variable}|truncatechars:100 }}"
    return "Fix syntax according to Django template filter documentation"

def main():
    parser = argparse.ArgumentParser(description='Check Django templates for common syntax errors')
    parser.add_argument('path', help='Path to template file or directory of templates')
    args = parser.parse_args()
    
    path = Path(args.path)
    
    if path.is_file():
        errors = check_template_file(path)
        if errors:
            print(f"Found {len(errors)} error(s) in {path}:")
            for error in errors:
                line_info = f" (line {error['line']})" if error['line'] else ""
                print(f"  - {error['filter']} error{line_info}: {error['match']}")
                print(f"    Suggestion: {error['suggestion']}")
        else:
            print(f"No common template syntax errors found in {path}")
    elif path.is_dir():
        all_errors = []
        for root, dirs, files in os.walk(path):
            for file in files:
                if file.endswith('.html'):
                    file_path = os.path.join(root, file)
                    errors = check_template_file(file_path)
                    if errors:
                        all_errors.append((file_path, errors))
        
        if all_errors:
            print(f"Found errors in {len(all_errors)} template file(s):")
            for file_path, errors in all_errors:
                print(f"\n{file_path} - {len(errors)} error(s):")
                for error in errors:
                    line_info = f" (line {error['line']})" if error['line'] else ""
                    print(f"  - {error['filter']} error{line_info}: {error['match']}")
                    print(f"    Suggestion: {error['suggestion']}")
        else:
            print("No common template syntax errors found in any template files")
    else:
        print(f"Path not found: {path}")

if __name__ == "__main__":
    main()