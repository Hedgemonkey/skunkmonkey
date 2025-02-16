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

load_dotenv()  # Load environment variables from .env file
logger = logging.getLogger(__name__)  # Get a logger

logger.info("WSGI script has been executed.")

application = get_wsgi_application()
