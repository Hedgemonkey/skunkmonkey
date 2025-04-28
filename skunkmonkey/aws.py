"""
AWS Storage configuration for skunkmonkey project.
"""
import os

from django.conf import settings  # noqa: F401

# AWS S3 and CloudFront configuration
USE_S3 = os.environ.get('USE_S3', 'False') == 'True'
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')
AWS_DEFAULT_ACL = 'public-read'

# Clean the region name in case it has comments
raw_region = os.environ.get('AWS_S3_REGION_NAME', 'eu-west-2')
if raw_region and '#' in raw_region:
    AWS_S3_REGION_NAME = raw_region.split('#')[0].strip()
else:
    AWS_S3_REGION_NAME = raw_region

AWS_S3_SIGNATURE_VERSION = 's3v4'

# CloudFront settings
AWS_S3_CUSTOM_DOMAIN = os.environ.get('AWS_CLOUDFRONT_DOMAIN')
AWS_CLOUDFRONT_KEY_ID = os.environ.get('AWS_CLOUDFRONT_KEY_ID')
AWS_CLOUDFRONT_KEY = os.environ.get('AWS_CLOUDFRONT_KEY')

# Cache settings
AWS_S3_OBJECT_PARAMETERS = {
    'CacheControl': 'max-age=86400',  # 1 day cache
}

# File size limit for S3 uploads
AWS_MAX_SIZE_MB = int(os.environ.get('AWS_MAX_SIZE_MB', 10))  # Default to 10MB

# Media location
MEDIAFILES_LOCATION = 'media'
