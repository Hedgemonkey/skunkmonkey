#!/usr/bin/env python
import os
import sys

# Current file is in the project root directory
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, PROJECT_ROOT)

# Set Django settings
os.environ['DJANGO_SETTINGS_MODULE'] = 'skunkmonkey.settings'

# Import Django WSGI application
try:
    from django.core.wsgi import get_wsgi_application
    application = get_wsgi_application()
except Exception as e:
    # Provide helpful debug information if something goes wrong
    import traceback
    error_info = "Error loading Django application:\n"
    error_info += str(e) + "\n\n"
    error_info += "Traceback:\n"
    error_info += traceback.format_exc() + "\n\n"
    error_info += "Environment:\n"
    error_info += "Python path: " + str(sys.path) + "\n"
    error_info += "PROJECT_ROOT: " + PROJECT_ROOT + "\n"

    def application(environ, start_response):
        status = '500 Internal Server Error'
        response_headers = [('Content-type', 'text/plain')]
        start_response(status, response_headers)
        return [error_info.encode()]
