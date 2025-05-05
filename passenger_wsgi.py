#!/usr/bin/env python3
import os
import sys

# Add the project directory to the path
sys.path.insert(0, '/home/hedgemonkey/domains/skunkmonkey.co.uk/dev')

# Set Django settings module
os.environ['DJANGO_SETTINGS_MODULE'] = 'skunkmonkey.settings'
os.environ['SCRIPT_NAME'] = '/dev'  # Add this line to handle the subdirectory

# Ensure USE_S3 environment variable is available
os.environ.setdefault('USE_S3', 'True')

# Import Django WSGI application
error_message = None
try:
    from django.core.wsgi import get_wsgi_application
    application = get_wsgi_application()
except Exception as exception:
    error_message = str(exception)

    def application(environ, start_response):
        status = '500 Internal Server Error'
        response_headers = [('Content-type', 'text/plain')]
        start_response(status, response_headers)
        error_info = f"Error loading Django application: {error_message}"
        return [error_info.encode()]
