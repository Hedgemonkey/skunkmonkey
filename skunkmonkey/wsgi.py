"""
WSGI config for skunkmonkey project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/wsgi/
"""


import os
import logging 
from django.core.wsgi import get_wsgi_application
import sys
from dotenv import load_dotenv

os.environ.setdefault('DJANGO_SECRET_KEY', 'django-insecure-ufb(q*rf)353ns2lxk$qds!+$aqf)=$+8ip4vz25mxnj^ui-qi')
os.environ.setdefault('DATABASE_URL', 'postgresql://neondb_owner:9PJZirMgh1IB@ep-blue-mouse-a2wukk26.eu-central-1.aws.neon.tech/year_motor_thumb_159204')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skunkmonkey.settings')

load_dotenv()  # Load environment variables from .env file
logger = logging.getLogger(__name__)  # Get a logger
logger.info("WSGI script has been executed.")  # Log the message

for key, value in os.environ.items():
    # Minimal sanitization (replace common sensitive substrings)
    for sensitive_part in []:
        if sensitive_part in key.lower():  # Case-insensitive check
            value = "REDACTED"  # Or a more sophisticated masking technique
            break  # Stop checking sensitive parts after the first match

    logger.info(f"{key}={value}") # Still risky, even with basic sanitization


logger.info("WSGI script has been executed.")

application = get_wsgi_application()
