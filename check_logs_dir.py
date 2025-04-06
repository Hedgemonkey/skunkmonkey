#!/usr/bin/env python
import os
import sys
from pathlib import Path

# Get the same BASE_DIR as in settings.py
BASE_DIR = Path(__file__).resolve().parent

# Define logs directory
LOGS_DIR = os.path.join(BASE_DIR, 'logs')

print(f"Checking if logs directory can be created at: {LOGS_DIR}")

# Try to create the directory without silent error suppression
try:
    os.makedirs(LOGS_DIR, exist_ok=False)
    print(f"Successfully created logs directory at {LOGS_DIR}")
except FileExistsError:
    print(f"Logs directory already exists at {LOGS_DIR}")
except PermissionError:
    print(f"Permission denied when creating logs directory at {LOGS_DIR}")
    print("This is likely the reason your log files aren't being created.")
    sys.exit(1)
except Exception as e:
    print(f"Unexpected error creating logs directory: {str(e)}")
    sys.exit(1)

# Try to write a test file
test_file_path = os.path.join(LOGS_DIR, 'test_log.txt')
try:
    with open(test_file_path, 'w') as f:
        f.write('Test log entry\n')
    print(f"Successfully wrote to test file at {test_file_path}")
    # Clean up
    os.remove(test_file_path)
    print(f"Removed test file {test_file_path}")
except PermissionError:
    print(f"Permission denied when writing to {test_file_path}")
    print("Your logs directory exists but Django can't write to it.")
    sys.exit(1)
except Exception as e:
    print(f"Unexpected error writing to test file: {str(e)}")
    sys.exit(1)

print("Log directory and write permissions verified. Django should be able to create log files.")