#!/usr/bin/env python
"""
Direct S3 upload test script.
This script bypasses Django and directly tests AWS S3 connectivity and uploads.
"""
import os
import sys  # noqa: F401
from pathlib import Path

import django  # noqa: F401

import boto3  # noqa: F401
from botocore.exceptions import ClientError
from dotenv import load_dotenv

# Initialize environment
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(os.path.join(BASE_DIR, '.env'))

# Print diagnostic information
print("Testing S3 upload directly...")
print(f"Current working directory: {os.getcwd()}")

# Use AWS credentials from environment
aws_access_key = os.environ.get('AWS_ACCESS_KEY_ID')
aws_secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY')
bucket_name = os.environ.get('AWS_STORAGE_BUCKET_NAME')
region = os.environ.get('AWS_S3_REGION_NAME', 'us-east-1')

# Clean region name (remove any comments)
if region and '#' in region:
    region = region.split('#')[0].strip()

# Print configuration
print(
    f"AWS Access Key: {'*' * 16}"
    f"{aws_access_key[-4:] if aws_access_key else 'None'}"
)
print(
    f"AWS Secret Key: {'*' * 16}"
    f"{aws_secret_key[-4:] if aws_secret_key else 'None'}"
)
print(f"Bucket Name: {bucket_name}")
print(f"Region Name: {region}")


def test_s3_connection():
    """Test basic S3 connection by listing buckets"""
    try:
        print("\n1. Testing S3 connection...")
        s3 = boto3.client(
            's3',
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key,
            region_name=region
        )

        # List buckets to test connection
        response = s3.list_buckets()
        buckets = [bucket['Name'] for bucket in response['Buckets']]
        print(f"Connection successful - found {len(buckets)} buckets:")
        for b in buckets:
            print(f"  - {b}")

        # Check if our target bucket exists
        if bucket_name in buckets:
            print(f"Target bucket '{bucket_name}' exists!")
        else:
            print(f"WARNING: Target bucket '{bucket_name}' not found!")

        return True
    except Exception as e:
        print(f"ERROR connecting to S3: {str(e)}")
        return False


def test_list_objects():
    """Test listing objects in the bucket"""
    try:
        print("\n2. Testing listing objects in bucket...")
        s3 = boto3.client(
            's3',
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key,
            region_name=region
        )

        # Try to list objects in bucket
        response = s3.list_objects_v2(
            Bucket=bucket_name,
            MaxKeys=10
        )

        # Check for contents
        if 'Contents' in response:
            objects = response['Contents']
            print(f"Found {len(objects)} objects in bucket '{bucket_name}':")
            for obj in objects[:5]:  # Show first 5 objects
                print(f"  - {obj['Key']}")
            if len(objects) > 5:
                print(f"  ... and {len(objects) - 5} more")
        else:
            print(f"Bucket '{bucket_name}' appears to be empty")

        return True
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'AccessDenied':
            print(
                f"ERROR: Access denied - no permission to list objects "
                f"in bucket '{bucket_name}'"
            )
        elif error_code == 'NoSuchBucket':
            print(f"ERROR: Bucket '{bucket_name}' does not exist")
        else:
            print(f"ERROR listing bucket contents: {str(e)}")
        return False
    except Exception as e:
        print(f"ERROR listing bucket contents: {str(e)}")
        return False


def test_put_object():
    """Test uploading a file to the bucket"""
    try:
        print("\n3. Testing uploading a test file...")
        s3 = boto3.client(
            's3',
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key,
            region_name=region
        )

        # Create a test file
        test_file_path = os.path.join(BASE_DIR, 'test_s3_upload.txt')
        with open(test_file_path, 'w') as f:
            f.write('This is a test file for S3 upload')

        print(f"Created test file at {test_file_path}")

        # Upload the test file
        # Use media/ prefix to match Django
        test_key = 'media/test_s3_upload.txt'
        print(f"Uploading to S3 at key: {test_key}")

        with open(test_file_path, 'rb') as f:
            s3.upload_fileobj(
                f,
                bucket_name,
                test_key
            )

        print(
            f"Successfully uploaded test file to "
            f"s3://{bucket_name}/{test_key}"
        )

        # Clean up
        os.remove(test_file_path)
        print("Removed local test file")

        return True
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'AccessDenied':
            print(
                f"ERROR: Access denied - no permission to upload to "
                f"bucket '{bucket_name}'"
            )
        else:
            print(f"ERROR uploading test file: {str(e)}")
        return False
    except Exception as e:
        print(f"ERROR uploading test file: {str(e)}")
        return False


if __name__ == "__main__":
    # Run tests
    conn_success = test_s3_connection()

    if conn_success:
        # Only run these if connection was successful
        list_success = test_list_objects()
        upload_success = test_put_object()

        # Summary
        print("\n=== TEST SUMMARY ===")
        print(f"S3 Connection: {'✅' if conn_success else '❌'}")
        print(f"List Objects:  {'✅' if list_success else '❌'}")
        print(f"Upload Test:   {'✅' if upload_success else '❌'}")
    else:
        print("\n❌ S3 connection failed! Cannot proceed with further tests.")
