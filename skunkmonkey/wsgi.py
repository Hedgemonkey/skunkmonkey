# noqa
"""
WSGI config for skunkmonkey project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/wsgi/
"""


import logging
import os
import sys

from django.core.wsgi import get_wsgi_application

from dotenv import load_dotenv

# Set up path to allow importing from project root
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

load_dotenv()  # Load environment variables from .env file
logger = logging.getLogger(__name__)  # Get a logger

logger.info("WSGI script has been executed.")

application = get_wsgi_application()
