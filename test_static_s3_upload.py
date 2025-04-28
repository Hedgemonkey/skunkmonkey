#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Filename: test_static_s3_upload.py
# flake8: noqa
"""
Test script to verify static file uploads to S3
"""
import logging
import os
import sys
import traceback

import boto3
from botocore.exceptions import ClientError

# Set up Django settings
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "skunkmonkey.settings")

# Import Django and set it up
import django

django.setup()

# Once Django is set up, we can import from settings
from django.conf import settings

# Configure logging
logging.basicConfig(level=logging.INFO,
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('static_s3_test')

def test_s3_connection():
    """Test if we can connect to S3 and list objects"""
    try:
        # Get S3 bucket and region from settings
        bucket_name = settings.AWS_STORAGE_BUCKET_NAME
        region_name = settings.AWS_S3_REGION_NAME
        static_location = settings.STATICFILES_LOCATION

        logger.info(f"Testing S3 connection to bucket: {bucket_name}")
        logger.info(f"Region: {region_name}")
        logger.info(f"Static location: {static_location}")

        # Create S3 client
        s3 = boto3.client(
            's3',
            region_name=region_name,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )

        # List objects in the static prefix
        response = s3.list_objects_v2(
            Bucket=bucket_name,
            Prefix=static_location + '/'
        )

        # Check if objects exist in the static folder
        if 'Contents' in response:
            logger.info(f"Found {len(response['Contents'])} static objects in S3 bucket")

            # Print first 10 objects for reference
            logger.info("First 10 static files in the bucket:")
            for i, obj in enumerate(response['Contents'][:10]):
                logger.info(f"  {i+1}. {obj['Key']} ({obj['Size']} bytes)")

            return True
        else:
            logger.warning(f"No static files found in bucket {bucket_name}/{static_location}/")
            return False

    except ClientError as e:
        logger.error(f"AWS S3 error: {e}")
        logger.error(traceback.format_exc())
        return False
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        logger.error(traceback.format_exc())
        return False

def try_upload_test_file():
    """Try to upload a test file to the static folder in S3"""
    try:
        bucket_name = settings.AWS_STORAGE_BUCKET_NAME
        region_name = settings.AWS_S3_REGION_NAME
        static_location = settings.STATICFILES_LOCATION

        logger.info(f"Attempting to upload a test file to {bucket_name}/{static_location}/")

        # Create test file content
        test_content = b"This is a test file to verify S3 upload permissions."
        file_key = f"{static_location}/test_upload.txt"

        # Create S3 resource
        s3 = boto3.resource(
            's3',
            region_name=region_name,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )

        # Upload the file
        s3.Bucket(bucket_name).put_object(
            Key=file_key,
            Body=test_content,
            ContentType='text/plain'
        )

        logger.info(f"Successfully uploaded test file to {bucket_name}/{file_key}")
        return True

    except ClientError as e:
        logger.error(f"Failed to upload test file: {e}")
        logger.error(traceback.format_exc())
        return False
    except Exception as e:
        logger.error(f"Unexpected error during test upload: {e}")
        logger.error(traceback.format_exc())
        return False

if __name__ == "__main__":
    print("\n=== Testing S3 Static Files Connection ===")
    connection_success = test_s3_connection()

    if not connection_success:
        print("\n=== Trying to upload a test file ===")
        upload_success = try_upload_test_file()

        if upload_success:
            print("\n✅ Test file upload successful. Your AWS credentials and bucket permissions seem correct.")
            print("   The issue might be with the collectstatic process or Django's staticfiles configuration.")
        else:
            print("\n❌ Test file upload failed. This suggests there might be an issue with:")
            print("   1. AWS credentials")
            print("   2. S3 bucket permissions")
            print("   3. The bucket name or region configuration")
            print("   Check the logs above for specific error details.")
    else:
        print("\n✅ Successfully connected to S3 and found existing static files.")
        print("   Your static files are already in the S3 bucket.")
