#!/usr/bin/env python
"""
Direct S3 static files uploader.
Bypasses Django's collectstatic to ensure files are properly uploaded to S3.
Specially handles Vite manifest.json to ensure it's properly available.
"""
import json
import os
import sys
import time
from pathlib import Path

import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

# Initialize environment
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(os.path.join(BASE_DIR, '.env'))

print("=" * 80)
print("DIRECT S3 STATIC FILES UPLOADER")
print("=" * 80)
print(f"Current working directory: {os.getcwd()}")
print(f"Script directory: {BASE_DIR}")

# Use AWS credentials from environment
aws_access_key = os.environ.get('AWS_ACCESS_KEY_ID')
aws_secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY')
bucket_name = os.environ.get('AWS_STORAGE_BUCKET_NAME')
region = os.environ.get('AWS_S3_REGION_NAME', 'us-east-1')

# Clean region name (remove any comments)
if region and '#' in region:
    region = region.split('#')[0].strip()

# Print configuration (masked for security)
print("\nS3 Configuration:")
print(f"- AWS Access Key: {'*' * 16}{aws_access_key[-4:] if aws_access_key else 'None'}")
print(f"- AWS Secret Key: {'*' * 16}{aws_secret_key[-4:] if aws_secret_key else 'None'}")
print(f"- Bucket Name: {bucket_name}")
print(f"- Region: {region}")

# Static file directories
STATIC_ROOT = os.environ.get('STATIC_ROOT', os.path.join(BASE_DIR, 'staticfiles'))
STATIC_URL_PREFIX = os.environ.get('STATIC_URL_PREFIX', 'static/')

print(f"- Static Root: {STATIC_ROOT}")
print(f"- Static URL Prefix: {STATIC_URL_PREFIX}")


def verify_s3_connection():
    """Test S3 connection and bucket access"""
    try:
        print("\nVerifying S3 connection...")
        s3 = boto3.client(
            's3',
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key,
            region_name=region
        )

        # List buckets to test connection
        response = s3.list_buckets()
        buckets = [bucket['Name'] for bucket in response['Buckets']]
        print(f"Connection successful - found {len(buckets)} buckets")

        # Check if our target bucket exists
        if bucket_name in buckets:
            print(f"Target bucket '{bucket_name}' exists!")
        else:
            print(f"WARNING: Target bucket '{bucket_name}' not found!")

        # Test bucket permissions by listing objects
        s3.list_objects_v2(
            Bucket=bucket_name,
            MaxKeys=1
        )
        print(f"Successfully accessed bucket '{bucket_name}'")
        return True

    except Exception as e:
        print(f"ERROR connecting to S3: {str(e)}")
        return False


def upload_file_to_s3(local_path, s3_key):
    """Upload a single file to S3 with retries"""
    max_retries = 3
    retry_count = 0

    while retry_count < max_retries:
        try:
            s3 = boto3.client(
                's3',
                aws_access_key_id=aws_access_key,
                aws_secret_access_key=aws_secret_key,
                region_name=region
            )
            
            print(f"Uploading: {local_path} -> s3://{bucket_name}/{s3_key}")
            
            with open(local_path, 'rb') as f:
                s3.upload_fileobj(
                    f,
                    bucket_name,
                    s3_key
                )
            
            # Upload successful
            return True
            
        except Exception as e:
            retry_count += 1
            if retry_count < max_retries:
                wait_time = 2 ** retry_count
                print(f"Upload failed: {str(e)}. Retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                print(f"ERROR uploading {local_path}: {str(e)}")
                return False


def handle_vite_manifest():
    """Special handling for Vite manifest.json file"""
    manifest_path = os.path.join(STATIC_ROOT, 'manifest.json')
    
    if os.path.exists(manifest_path):
        print("\nFound Vite manifest.json")
        
        # Read the manifest to verify it's valid
        try:
            with open(manifest_path, 'r') as f:
                manifest_data = json.load(f)
                
            print(f"Manifest contains {len(manifest_data)} entries")
            for key in list(manifest_data.keys())[:5]:  # Show first 5 entries
                print(f"- {key}")
            
            # Check if we need to fix the manifest for django-vite
            if 'main' not in manifest_data and 'frontend/src/core/js/main.js' in manifest_data:
                print("\nFixing manifest.json by adding 'main' entry...")
                # Add a 'main' entry pointing to the same content as 'frontend/src/core/js/main.js'
                manifest_data['main'] = manifest_data['frontend/src/core/js/main.js']
                # Write the updated manifest back to the file
                with open(manifest_path, 'w') as f:
                    json.dump(manifest_data, f, indent=2)
                print("Successfully added 'main' entry to manifest.json")
            
            # Upload manifest.json to S3 with high priority
            s3_key = f"{STATIC_URL_PREFIX}manifest.json"
            result = upload_file_to_s3(manifest_path, s3_key)
            
            if result:
                print("Successfully uploaded manifest.json to S3")
                return True
            else:
                print("Failed to upload manifest.json to S3")
                return False
                
        except json.JSONDecodeError:
            print("ERROR: manifest.json is not valid JSON!")
            with open(manifest_path, 'r') as f:
                content = f.read()
            print(f"Content (first 200 chars): {content[:200]}")
            return False
        except Exception as e:
            print(f"ERROR processing manifest.json: {str(e)}")
            return False
    else:
        print("WARNING: manifest.json not found!")
        print(f"Looked for manifest at: {manifest_path}")
        return False


def upload_all_static_files():
    """Upload all static files from STATIC_ROOT to S3"""
    if not os.path.exists(STATIC_ROOT):
        print(f"ERROR: Static root directory {STATIC_ROOT} does not exist!")
        return False
        
    print(f"\nUploading all static files from {STATIC_ROOT}...")
    
    total_files = 0
    uploaded_files = 0
    failed_files = 0
    
    for root, _, files in os.walk(STATIC_ROOT):
        for filename in files:
            local_path = os.path.join(root, filename)
            
            # Calculate S3 key (preserve directory structure)
            rel_path = os.path.relpath(local_path, STATIC_ROOT)
            s3_key = f"{STATIC_URL_PREFIX}{rel_path}"
            
            # Upload file
            total_files += 1
            if upload_file_to_s3(local_path, s3_key):
                uploaded_files += 1
            else:
                failed_files += 1
                
    print(f"\nStatic files upload complete: {uploaded_files}/{total_files} successful, {failed_files} failed")
    return failed_files == 0


if __name__ == "__main__":
    start_time = time.time()
    
    # Step 1: Verify S3 connection
    if not verify_s3_connection():
        print("S3 connection verification failed. Exiting.")
        sys.exit(1)
    
    # Step 2: Special handling for Vite manifest.json
    manifest_success = handle_vite_manifest()
    
    # Step 3: Upload all static files
    upload_success = upload_all_static_files()
    
    end_time = time.time()
    duration = end_time - start_time
    
    # Summary
    print("\n" + "=" * 40)
    print("UPLOAD SUMMARY")
    print("=" * 40)
    print(f"Vite Manifest: {'✅' if manifest_success else '❌'}")
    print(f"Static Files: {'✅' if upload_success else '❌'}")
    print(f"Total Duration: {duration:.2f} seconds")
    
    if not manifest_success or not upload_success:
        print("\nWARNING: Some uploads failed!")
        sys.exit(1)
    else:
        print("\nAll uploads successful!")
        sys.exit(0)