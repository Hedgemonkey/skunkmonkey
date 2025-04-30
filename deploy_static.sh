#!/bin/bash
# Script to deploy static files to S3 and ensure manifest.json is properly uploaded

echo "==== Running collectstatic_s3 to upload static files to S3 ===="
python manage.py collectstatic_s3 --noinput

# Check if collectstatic was successful
if [ $? -ne 0 ]; then
    echo "Error: collectstatic_s3 failed. Aborting."
    exit 1
fi

echo "==== Fixing manifest.json to ensure it has the 'main' entry point ===="
python fix_heroku_manifest.py

echo "==== Uploading manifest.json to S3 ===="
python direct_static_s3_upload.py

echo "==== Static deployment complete! ===="
