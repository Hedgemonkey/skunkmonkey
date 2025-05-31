#!/usr/bin/env python
"""
WSGI config for DirectAdmin/Passenger deployment
"""
import os
import sys
import traceback
from pathlib import Path

# Log file setup for capturing early errors
ROOT_DIR = Path(__file__).resolve().parent
LOG_DIR = ROOT_DIR / 'logs'
LOG_DIR.mkdir(exist_ok=True)
STARTUP_LOG = LOG_DIR / 'passenger_startup.log'


def log_startup(message):
    """Log startup messages to a dedicated file"""
    try:
        with open(STARTUP_LOG, 'a', encoding='utf-8') as f:
            f.write(f"{message}\n")
    except Exception as e:
        print(f"ERROR LOGGING: {e}", file=sys.stderr)
        print(message, file=sys.stderr)


# Global error variable to be accessible in fallback application
startup_error = None

try:
    log_startup("=" * 80)
    log_startup(f"Starting passenger_wsgi.py at {ROOT_DIR}")

    # Standard WSGI initialization
    log_startup("Standard WSGI initialization")
    # Set DJANGO_SETTINGS_MODULE
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "skunkmonkey.settings")

    # Standard Django WSGI application
    from django.core.wsgi import get_wsgi_application
    application = get_wsgi_application()

    log_startup("WSGI application initialized successfully")
except Exception as error:
    startup_error = error
    log_startup(f"ERROR in passenger_wsgi.py: {error}")
    log_startup(traceback.format_exc())

    # Define a fallback application that will show the error
    def application(environ, start_response):
        """Emergency application when everything else fails"""
        status = '500 Internal Server Error'
        output = f'Critical error in WSGI setup: {str(startup_error)}'
        response_headers = [('Content-type', 'text/plain'),
                            ('Content-Length', str(len(output)))]
        start_response(status, response_headers)
        return [output.encode('utf-8')]
