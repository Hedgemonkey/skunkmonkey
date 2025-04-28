"""
Custom storage classes for Django using AWS S3 with CloudFront CDN
"""
import logging
import os  # noqa: F401
import time
import traceback

from django.conf import settings
from django.core.files.storage import FileSystemStorage

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from storages.backends.s3boto3 import S3Boto3Storage

logger = logging.getLogger('django')


class FallbackStorage(FileSystemStorage):
    """
    Fallback storage for when S3 upload fails.
    This ensures users can still upload files even if S3 is unavailable.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.location = settings.MEDIA_ROOT


class MediaStorage(S3Boto3Storage):
    """
    Custom storage for media files using S3 with CloudFront
    Includes enhanced error handling and logging
    """
    location = settings.MEDIAFILES_LOCATION
    file_overwrite = False  # Don't overwrite files with the same name
    max_retries = 3  # Number of retries for S3 operations

    def __init__(self, *args, **kwargs):
        print("DEBUG: MediaStorage class initialized")

        # Clean the AWS region name first to ensure it doesn't have comments
        region = settings.AWS_S3_REGION_NAME
        if region and '#' in region:
            region = region.split('#')[0].strip()
            print(f"DEBUG: Cleaned AWS region name to: {region}")

        # Configure the AWS client with appropriate settings
        config = Config(
            region_name=region,
            signature_version=settings.AWS_S3_SIGNATURE_VERSION,
            retries={
                'max_attempts': self.max_retries,
                'mode': 'standard'
            }
        )

        # Override kwargs with our clean config
        kwargs['config'] = config

        print(
            f"DEBUG: Initializing MediaStorage with region: {region}, "
            f"bucket: {settings.AWS_STORAGE_BUCKET_NAME}"
        )
        super().__init__(*args, **kwargs)
        self.fallback_storage = FallbackStorage()

    def _save(self, name, content):
        """
        Override _save to enhance error handling and logging when uploading to
        S3
        """
        logger.info(f"Attempting to save file to S3: {name}")

        try:
            # Try to connect to S3 directly to test connection
            s3 = boto3.client(
                's3',
                region_name=settings.AWS_S3_REGION_NAME.split('#')[0].strip(),
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
            )

            # Test S3 connection by listing objects
            try:
                s3.list_objects_v2(
                    Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                    MaxKeys=1
                )
                logger.info("S3 connection test successful")
            except Exception as e:
                logger.error(f"S3 connection test failed: {str(e)}")
                return self._save_to_fallback(name, content)

            # Try uploading to S3 with retries
            retry_count = 0
            while retry_count < self.max_retries:
                try:
                    logger.info(
                        f"S3 upload attempt {retry_count + 1} for {name}"
                    )

                    # Log S3 configuration for debugging
                    logger.info(
                        "S3 Configuration: Bucket=%s, Region=%s",
                        settings.AWS_STORAGE_BUCKET_NAME,
                        settings.AWS_S3_REGION_NAME
                    )

                    # Try to perform the actual save operation
                    result = super()._save(name, content)

                    # Log success
                    logger.info(f"Successfully saved file to S3: {name}")

                    # Return the result
                    return result

                except ClientError as e:
                    # Log detailed S3 errors
                    error_code = e.response['Error']['Code']
                    error_message = e.response['Error']['Message']
                    logger.error(
                        (
                            f"AWS S3 error saving {name}: "
                            f"{error_code} - {error_message}"
                        )
                    )

                    retry_count += 1
                    if retry_count < self.max_retries:
                        # Wait before retrying (exponential backoff)
                        time.sleep(2 ** retry_count)
                    else:
                        # All retries failed, try fallback storage
                        logger.warning(
                            f"S3 upload failed after "
                            f"{self.max_retries} attempts. "
                            f"Using local fallback for {name}"
                        )
                        return self._save_to_fallback(name, content)

                except Exception as e:
                    # Log other unexpected errors
                    logger.error(
                        f"Unexpected error saving file to S3: {name} - "
                        f"Error: {str(e)}"
                    )
                    logger.error(f"Traceback: {traceback.format_exc()}")
                    return self._save_to_fallback(name, content)

        except Exception as outer_e:
            logger.error(f"Error in S3 upload wrapper: {str(outer_e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return self._save_to_fallback(name, content)

    def _save_to_fallback(self, name, content):
        """
        Save file to local storage as fallback when S3 fails
        """
        try:
            logger.info(f"Saving file to local fallback storage: {name}")
            # Reset file pointer to beginning
            if hasattr(content, 'seek'):
                content.seek(0)

            # Save to local fallback storage
            local_path = self.fallback_storage.save(name, content)
            logger.info(f"File saved to local storage: {local_path}")
            return local_path

        except Exception as e:
            logger.error(f"Even fallback storage failed for {name}: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            # Raise the error since we have no more fallbacks
            raise
