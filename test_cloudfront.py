#!/usr/bin/env python
"""
Test script for AWS S3/CloudFront configuration and logging.
"""
import logging
import os

import django
from django.conf import settings

import boto3
from botocore.exceptions import ClientError

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skunkmonkey.settings')
django.setup()


# Configure logging
logger = logging.getLogger('django')
logger.setLevel(logging.INFO)

# Create a handler specifically for this script
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(levelname)s %(asctime)s %(message)s')
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)


def test_aws_connection():
    """Test AWS S3 connection and CloudFront configuration."""
    logger.info("Testing AWS S3/CloudFront configuration...")

    # Check if AWS credentials are provided
    if not settings.AWS_ACCESS_KEY_ID or not settings.AWS_SECRET_ACCESS_KEY:
        logger.error("AWS credentials not found in environment variables")
        return False

    # Check S3 bucket configuration
    if not settings.AWS_STORAGE_BUCKET_NAME:
        logger.error("S3 bucket name not configured")
        return False

    # Check CloudFront domain
    if not settings.AWS_S3_CUSTOM_DOMAIN:
        logger.error("CloudFront domain not configured")
        return False

    # Print configuration for debugging
    logger.info(f"S3 Bucket: {settings.AWS_STORAGE_BUCKET_NAME}")
    logger.info(f"CloudFront Domain: {settings.AWS_S3_CUSTOM_DOMAIN}")

    # Test S3 connection
    try:
        s3 = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )

        response = s3.list_objects_v2(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            MaxKeys=5,
            Prefix=settings.MEDIAFILES_LOCATION + '/'
        )

        logger.info("Successfully connected to S3 bucket")

        # Display objects in the media folder
        if 'Contents' in response:
            logger.info(
                f"Found {len(response['Contents'])} objects in media folder:"
            )
            for obj in response['Contents']:
                logger.info(f"- {obj['Key']} ({obj['Size']} bytes)")

                # Construct CloudFront URL
                if settings.AWS_S3_CUSTOM_DOMAIN.startswith('https://'):
                    cf_url = f"{settings.AWS_S3_CUSTOM_DOMAIN}/{obj['Key']}"
                else:
                    cf_url = (
                        f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{obj['Key']}"
                    )

                logger.info(f"  CloudFront URL: {cf_url}")
        else:
            logger.warning("No objects found in the media folder")

        return True

    except ClientError as e:
        logger.error(f"AWS S3 error: {str(e)}")
        return False

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return False


def test_logging():
    """Test if logging is working properly."""
    logger.info("Testing logging functionality...")
    logger.debug("This is a DEBUG message")
    logger.info("This is an INFO message")
    logger.warning("This is a WARNING message")
    logger.error("This is an ERROR message")

    # Check if log files exist and are writable
    log_files = [
        'django.log',
        'error.log',
        'stripe.log',
        'webhooks.log',
        'mail.log'
    ]
    for file_name in log_files:
        file_path = os.path.join(settings.LOGS_DIR, file_name)
        if os.path.exists(file_path):
            if os.access(file_path, os.W_OK):
                logger.info(f"Log file '{file_name}' exists and is writable")
            else:
                logger.error(
                    f"Log file '{file_name}' exists but is not writable"
                )
        else:
            logger.warning(f"Log file '{file_name}' does not exist")


if __name__ == "__main__":
    print("===== Testing Logging =====")
    test_logging()

    print("\n===== Testing AWS Connection =====")
    if settings.USE_S3:
        test_aws_connection()
    else:
        print("AWS S3 is not enabled (USE_S3 is False)")
