#!/usr/bin/env python
"""
Direct uploader script for S3 static files, with special handling for vite manifest
"""
import os
import json
import logging
from pathlib import Path

import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize environment
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(os.path.join(BASE_DIR, '.env'))

# Use AWS credentials from environment
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = os.environ.get('AWS_S3_REGION_NAME', 'us-east-1')
STATICFILES_LOCATION = 'static'


def verify_s3_connection():
    """Test S3 connection by listing buckets"""
    try:
        logger.info("Verifying S3 connection...")
        
        # Clean region name (remove any comments)
        region = AWS_S3_REGION_NAME
        if region and '#' in region:
            region = region.split('#')[0].strip()
        
        s3 = boto3.client(
            's3',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=region
        )
        
        # List buckets to test connection
        response = s3.list_buckets()
        buckets = [bucket['Name'] for bucket in response['Buckets']]
        logger.info(f"Found {len(buckets)} buckets")
        
        # Check if our target bucket exists
        if AWS_STORAGE_BUCKET_NAME in buckets:
            logger.info(f"Target bucket '{AWS_STORAGE_BUCKET_NAME}' exists")
            return True
        else:
            logger.warning(f"Target bucket '{AWS_STORAGE_BUCKET_NAME}' not found")
            return False
    except Exception as e:
        logger.error(f"S3 connection error: {str(e)}")
        return False


def handle_vite_manifest():
    """
    Specially handle the Vite manifest.json file
    This ensures the manifest is properly uploaded to S3
    """
    try:
        logger.info("Handling Vite manifest.json...")
        
        # Check if manifest.json exists in staticfiles directory
        manifest_path = os.path.join(BASE_DIR, 'staticfiles', 'manifest.json')
        if not os.path.exists(manifest_path):
            manifest_path = os.path.join(BASE_DIR, 'static', 'manifest.json')
            if not os.path.exists(manifest_path):
                logger.warning("manifest.json not found in staticfiles or static directory")
                return False
        
        # Clean region name (remove any comments)
        region = AWS_S3_REGION_NAME
        if region and '#' in region:
            region = region.split('#')[0].strip()
        
        # Read the manifest file
        with open(manifest_path, 'r') as f:
            manifest_content = f.read()
        
        # Parse to verify it's valid JSON
        try:
            manifest_data = json.loads(manifest_content)
            logger.info(f"Valid manifest.json found with {len(manifest_data)} entries")
        except json.JSONDecodeError:
            logger.error("Invalid manifest.json - not valid JSON")
            return False
        
        # Upload to S3
        s3 = boto3.client(
            's3',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=region
        )
        
        # Upload manifest.json to S3's static directory
        s3_key = f"{STATICFILES_LOCATION}/manifest.json"
        
        # Set content type to application/json
        s3.put_object(
            Bucket=AWS_STORAGE_BUCKET_NAME,
            Key=s3_key,
            Body=manifest_content,
            ContentType='application/json'
        )
        
        logger.info(f"Successfully uploaded manifest.json to s3://{AWS_STORAGE_BUCKET_NAME}/{s3_key}")
        
        # Verify the upload by checking if the file exists in S3
        try:
            s3.head_object(
                Bucket=AWS_STORAGE_BUCKET_NAME,
                Key=s3_key
            )
            logger.info("Verified manifest.json exists in S3")
            return True
        except ClientError:
            logger.error("Failed to verify manifest.json in S3")
            return False
        
    except Exception as e:
        logger.error(f"Error handling manifest.json: {str(e)}")
        return False


if __name__ == "__main__":
    if verify_s3_connection():
        handle_vite_manifest()
    else:
        logger.error("Cannot proceed - S3 connection failed")