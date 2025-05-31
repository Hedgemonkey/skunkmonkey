"""
Common S3 utilities for the skunkmonkey project.

This module provides common functions used by both s3_utils.py and
s3_verification.py to avoid circular imports.
"""
from django.conf import settings

import boto3
from botocore.config import Config


def get_s3_client() -> boto3.client:
    """
    Create and return a properly configured S3 client.

    Returns:
        boto3.client: Configured S3 client
    """
    # Clean region name (remove any comments)
    region = settings.AWS_S3_REGION_NAME
    if region and '#' in region:
        region = region.split('#')[0].strip()

    # Configure S3 client
    config = Config(
        region_name=region,
        signature_version=settings.AWS_S3_SIGNATURE_VERSION,
        retries={
            'max_attempts': 3,
            'mode': 'standard'
        }
    )

    return boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        config=config
    )
