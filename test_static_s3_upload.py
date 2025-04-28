#!/usr/bin/env python
"""
Test script for direct static file uploads to S3.
Run this locally to verify S3 uploads before deploying to Heroku.
"""
import os
from pathlib import Path

# Import the direct uploader module
from direct_static_s3_upload import verify_s3_connection, handle_vite_manifest

# Initialize environment
BASE_DIR = Path(__file__).resolve().parent

print("=" * 80)
print("TESTING DIRECT S3 STATIC FILE UPLOAD")
print("=" * 80)

# First verify S3 connection
if verify_s3_connection():
    print("\nS3 connection successful!")
else:
    print("\nS3 connection failed! Verify your AWS credentials.")
    exit(1)

# Test handling of Vite manifest
print("\nTesting Vite manifest handling...")
manifest_success = handle_vite_manifest()

if manifest_success:
    print("\nVite manifest test successful! Your manifest.json is valid and was uploaded to S3.")
else:
    print("\nVite manifest test failed. Please check your manifest.json file.")

# If we have a manifest.json, print its content for debugging
manifest_path = os.path.join(BASE_DIR, 'staticfiles', 'manifest.json')
if os.path.exists(manifest_path):
    print("\nManifest content preview:")
    with open(manifest_path, 'r') as f:
        content = f.read()
        print(content[:500] + "..." if len(content) > 500 else content)
else:
    print("\nCould not find manifest.json at:", manifest_path)

print("\nTest complete. You can now commit and deploy these changes to Heroku.")
