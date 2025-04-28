"""
Helper module to ensure S3 storage is forced during collectstatic
"""

import logging

from django.conf import settings
from django.core.management import call_command

logger = logging.getLogger('django')

def run_collectstatic_with_s3(clear=True):
    """
    Force collectstatic to use S3 and provide detailed logging
    """
    logger.info("Starting forced S3 collectstatic...")

    # Verify S3 settings are properly configured
    logger.info(f"AWS_STORAGE_BUCKET_NAME: {settings.AWS_STORAGE_BUCKET_NAME}")
    logger.info(f"AWS_S3_REGION_NAME: {settings.AWS_S3_REGION_NAME}")
    logger.info(f"STATICFILES_STORAGE: {settings.STATICFILES_STORAGE}")

    # Force all files to be collected
    args = ['--noinput']
    if clear:
        logger.info("Clearing existing files before collection")
        args.append('--clear')

    # Run collectstatic with verbose output
    logger.info("Running collectstatic with S3 storage...")
    call_command('collectstatic', *args, verbosity=3)
    logger.info("Collectstatic complete!")

    return True
