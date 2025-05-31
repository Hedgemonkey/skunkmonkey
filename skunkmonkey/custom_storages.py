"""
Custom storage classes for Django using AWS S3 with CloudFront CDN
"""
import logging
import os  # noqa: F401
import random
import string
import time
import traceback
import uuid  # noqa: F401

from django.conf import settings
from django.core.files.storage import FileSystemStorage

import boto3
from botocore.exceptions import ClientError
from storages.backends.s3boto3 import S3Boto3Storage

logger = logging.getLogger('django')


def log_s3_operation(message, level='info', error=None):
    """Log S3 operations with a consistent format for easier filtering in
        Heroku logs"""
    log_message = f"⭐ S3_OPERATION: {message}"

    if level == 'info':
        logger.info(log_message)
        print(f"DEBUG S3_OP: {message}")
    elif level == 'error':
        error_details = f" - ERROR: {error}" if error else ""
        logger.error(f"{log_message}{error_details}")
        print(f"DEBUG S3_OP ERROR: {message}{error_details}")
        if error and hasattr(error, '__traceback__'):
            logger.error(
                f"⭐ S3_OPERATION TRACEBACK: {traceback.format_exc()}"
            )
    elif level == 'warning':
        warning_details = f" - WARNING: {error}" if error else ""
        logger.warning(f"{log_message}{warning_details}")
        print(f"DEBUG S3_OP WARNING: {message}{warning_details}")


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
    # Disable ACL usage for buckets with Object Ownership set to
    # "Bucket owner enforced"
    default_acl = ''  # Empty string instead of None
    # Omit ACL parameter entirely instead of setting to None
    object_parameters = {}  # Empty dict without ACL key

    def __init__(self, *args, **kwargs):
        # Clean the AWS region name first to ensure it doesn't have comments
        region = settings.AWS_S3_REGION_NAME
        if region and '#' in region:
            region = region.split('#')[0].strip()

        # Set S3 options directly as class attributes instead of using config
        # These will be picked up by S3Boto3Storage
        self.region_name = region
        self.signature_version = settings.AWS_S3_SIGNATURE_VERSION

        # Configure retry settings for boto3
        self.custom_domain = (
            settings.AWS_S3_CUSTOM_DOMAIN
            if hasattr(settings, 'AWS_S3_CUSTOM_DOMAIN')
            else None
        )

        print(
            f"DEBUG: Initializing MediaStorage with region: {region}, "
            f"bucket: {settings.AWS_STORAGE_BUCKET_NAME}"
        )
        super().__init__(*args, **kwargs)
        self.fallback_storage = FallbackStorage()

        # Debug CloudFront domain setting
        if (
            hasattr(settings, 'AWS_S3_CUSTOM_DOMAIN')
            and settings.AWS_S3_CUSTOM_DOMAIN
        ):
            print(
                "DEBUG: Using CloudFront domain: "
                f"{settings.AWS_S3_CUSTOM_DOMAIN}"
            )

    def url(self, name, parameters=None, expire=None):
        """
        Override the URL method to ensure CloudFront domain is used if
        available
        Adds cache busting for profile images to prevent CloudFront
        caching issues
        """
        # Use CloudFront URL if available
        if (
            hasattr(settings, 'AWS_S3_CUSTOM_DOMAIN')
            and settings.AWS_S3_CUSTOM_DOMAIN
        ):
            url = (
                f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/"
                f"{self.location}/{name}"
            )

            # Add cache-busting parameter for profile images to prevent
            # CloudFront caching issues
            if 'profile_images/' in name:
                # Generate a more robust cache buster with timestamp and
                # random string
                timestamp = int(time.time())
                random_str = ''.join(
                    random.choices(
                        string.ascii_letters + string.digits, k=8
                    )
                )
                cache_buster = f"{timestamp}_{random_str}"

                url = f"{url}?v={cache_buster}"
                print(
                    "DEBUG: Generated CloudFront URL with cache busting for "
                    f"profile image: {url}"
                )
                logger.info(
                    "Generated CloudFront URL with cache busting for "
                    f"profile image: {url}"
                )
            else:
                logger.info(f"Generated CloudFront URL: {url}")

            return url
        # Fall back to S3 URL
        return super().url(name, parameters=parameters, expire=expire)

    def _save(self, name, content):
        """
        Override _save to enhance error handling and logging when uploading
        to S3
        """
        log_s3_operation(f"Starting upload process for file: {name}")

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
                log_s3_operation(
                    f"Testing S3 connection to bucket: "
                    f"{settings.AWS_STORAGE_BUCKET_NAME}"
                )
                s3.list_objects_v2(
                    Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                    MaxKeys=1
                )
                log_s3_operation("S3 connection test successful")
            except Exception as e:
                log_s3_operation(
                    "S3 connection test failed",
                    level='error',
                    error=str(e)
                )
                return self._save_to_fallback(name, content)

            # Try uploading to S3 with retries
            retry_count = 0
            while retry_count < self.max_retries:
                try:
                    log_s3_operation(
                        f"Upload attempt {retry_count + 1} for {name}"
                    )

                    # Log S3 configuration for debugging
                    log_s3_operation(
                        "S3 Configuration: Bucket={}, Region={}".format(
                            settings.AWS_STORAGE_BUCKET_NAME,
                            settings.AWS_S3_REGION_NAME
                        )
                    )

                    # First check content for debugging
                    if hasattr(content, 'name'):
                        content_size = getattr(
                            content, 'size', 'unknown'
                        )
                        log_s3_operation(
                            f"File info: name={content.name}, "
                            f"size={content_size}"
                        )

                    # Log the S3 key that will be used
                    s3_key = f"{self.location}/{name}"
                    log_s3_operation(f"Full S3 key for upload: {s3_key}")

                    # Perform the actual save operation
                    result = super()._save(name, content)

                    # Log success
                    log_s3_operation(
                        f"Successfully saved file to S3: {name}"
                    )
                    log_s3_operation(f"Upload result: {result}")

                    # Return the result
                    return result

                except ClientError as e:
                    # Log detailed S3 errors
                    error_code = e.response['Error']['Code']
                    error_message = e.response['Error']['Message']
                    error_msg = (
                        f"AWS S3 error: {error_code} - {error_message}"
                    )
                    log_s3_operation(
                        f"Upload attempt {retry_count + 1} failed for "
                        f"{name}",
                        level='error',
                        error=error_msg
                    )

                    retry_count += 1
                    if retry_count < self.max_retries:
                        # Wait before retrying (exponential backoff)
                        time.sleep(2 ** retry_count)
                    else:
                        # All retries failed, try fallback storage
                        log_s3_operation(
                            f"S3 upload failed after "
                            f"{self.max_retries} attempts for {name}",
                            level='warning'
                        )
                        return self._save_to_fallback(name, content)

                except Exception as e:
                    # Log other unexpected errors
                    log_s3_operation(
                        f"Unexpected error saving file {name} to S3",
                        level='error',
                        error=str(e)
                    )
                    return self._save_to_fallback(name, content)

        except Exception as outer_e:
            log_s3_operation(
                f"Error in S3 upload wrapper for {name}",
                level='error',
                error=str(outer_e)
            )
            return self._save_to_fallback(name, content)

    def _save_to_fallback(self, name, content):
        """
        Save file to local storage as fallback when S3 fails
        """
        try:
            log_s3_operation(
                f"Saving file to local fallback storage: {name}",
                level='warning'
            )

            # Log critical details for troubleshooting
            log_s3_operation(
                "⚠️⚠️⚠️ FALLBACK STORAGE: This is why images aren't "
                "appearing in S3! Files saved to fallback storage don't "
                "persist on Heroku!",
                level='error'
            )

            # Try to extract helpful info about AWS config
            aws_info = {
                'USE_S3': str(getattr(settings, 'USE_S3', 'Not set')),
                'AWS_ACCESS_KEY_ID': bool(getattr(
                    settings, 'AWS_ACCESS_KEY_ID', None
                )),
                'AWS_SECRET_KEY': bool(getattr(
                    settings, 'AWS_SECRET_ACCESS_KEY', None
                )),
                'BUCKET': str(getattr(
                    settings, 'AWS_STORAGE_BUCKET_NAME', 'Not set'
                )),
                'REGION': str(getattr(
                    settings, 'AWS_S3_REGION_NAME', 'Not set'
                ))
            }
            log_s3_operation(
                f"AWS Config Check: {aws_info}",
                level='error'
            )

            # Ensure fallback storage directory exists
            os.makedirs(self.fallback_storage.location, exist_ok=True)

            # Reset file pointer to beginning
            if hasattr(content, 'seek'):
                content.seek(0)

            # Save to local fallback storage
            local_path = self.fallback_storage.save(name, content)
            log_s3_operation(f"File saved to local storage: {local_path}")

            # Add diagnostic info about what caused the fallback
            import traceback
            stack_trace = traceback.format_stack()
            diagnostic_info = (
                stack_trace[-4] if len(stack_trace) >= 4
                else "Stack trace unavailable"
            )
            log_s3_operation(
                f"Fallback storage diagnostic info: {diagnostic_info}",
                level='warning'
            )

            return local_path

        except Exception as e:
            log_s3_operation(
                f"Even fallback storage failed for {name}",
                level='error',
                error=str(e)
            )
            # Raise the error since we have no more fallbacks
            raise


class StaticStorage(S3Boto3Storage):
    """
    Custom storage for static files using S3 with CloudFront
    """
    location = settings.STATICFILES_LOCATION
    file_overwrite = True  # Allow overwriting static files during deployment
    max_retries = 3  # Number of retries for S3 operations
    # Disable ACL usage for buckets with Object Ownership set to
    # "Bucket owner enforced"
    default_acl = ''  # Empty string instead of None
    # Omit ACL parameter entirely instead of setting to None
    object_parameters = {}  # Empty dict without ACL key

    def __init__(self, *args, **kwargs):
        # Clean the AWS region name first to ensure it doesn't have comments
        region = settings.AWS_S3_REGION_NAME
        if region and '#' in region:
            region = region.split('#')[0].strip()

        # Set S3 options directly as class attributes instead of trying
        # to use config
        # These will be picked up by S3Boto3Storage
        self.region_name = region
        self.signature_version = settings.AWS_S3_SIGNATURE_VERSION

        super().__init__(*args, **kwargs)
        self.fallback_storage = FileSystemStorage(
            location=settings.STATIC_ROOT
        )

    def url(self, name, parameters=None, expire=None):
        """
        Override the URL method to ensure CloudFront domain is used if
        available
        """
        # Use CloudFront URL if available
        if (
            hasattr(settings, 'AWS_S3_CUSTOM_DOMAIN')
            and settings.AWS_S3_CUSTOM_DOMAIN
        ):
            url = (
                f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/"
                f"{self.location}/{name}"
            )
            logger.info(f"Generated CloudFront static URL: {url}")
            return url
        # Fall back to S3 URL
        return super().url(name, parameters=parameters, expire=expire)

    def _save(self, name, content):
        """
        Override _save to ensure S3 upload failures raise errors and do not
        fallback to local storage.
        """
        logger.info(f"Attempting to save static file to S3: {name}")

        try:
            s3 = boto3.client(
                's3',
                region_name=settings.AWS_S3_REGION_NAME.split('#')[0].strip(),
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
            )
            try:
                print(
                    f"DEBUG: Testing S3 connection to bucket: "
                    f"{settings.AWS_STORAGE_BUCKET_NAME}"
                )
                s3.list_objects_v2(
                    Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                    MaxKeys=1
                )
                logger.info("S3 connection test successful for static files")
            except Exception as e:
                logger.error(
                    "S3 connection test failed for static files: %s", str(e)
                )
                raise  # Raise the error instead of falling back

            retry_count = 0
            while retry_count < self.max_retries:
                try:
                    print(
                        f"DEBUG: S3 upload attempt {retry_count + 1} for "
                        f"{name}"
                    )
                    logger.info(
                        f"S3 upload attempt {retry_count + 1} for {name}"
                    )
                    print(
                        "DEBUG: S3 configuration - Bucket: {}, Region: {}, "
                        "Location: {}".format(
                            settings.AWS_STORAGE_BUCKET_NAME,
                            settings.AWS_S3_REGION_NAME,
                            self.location
                        )
                    )
                    logger.info(
                        "S3 Static Configuration: Bucket=%s, Region=%s, "
                        "Location=%s",
                        settings.AWS_STORAGE_BUCKET_NAME,
                        settings.AWS_S3_REGION_NAME,
                        self.location
                    )
                    print(f"DEBUG: Calling super()._save for {name}")
                    # Call the actual S3Boto3Storage._save method
                    super()._save(name, content)
                    print(f"DEBUG: Successfully uploaded {name} to S3")
                    logger.info(
                        f"Successfully saved static file to S3: {name}")
                    # Critical fix: Return the name, which is what Django
                    # expects
                    # The parent method returns name, so we must do the same
                    return name
                except ClientError as e:
                    # Log detailed S3 errors
                    error_code = e.response['Error']['Code']
                    error_message = e.response['Error']['Message']
                    logger.error(
                        (
                            f"AWS S3 error saving static file {name}: "
                            f"{error_code} - {error_message}"
                        )
                    )
                    retry_count += 1
                    if retry_count < self.max_retries:
                        # Wait before retrying (exponential backoff)
                        time.sleep(2 ** retry_count)
                    else:
                        print(
                            f"DEBUG: S3 upload failed after "
                            f"{self.max_retries} attempts, raising error"
                        )
                        logger.error(
                            f"S3 static upload failed after "
                            f"{self.max_retries} attempts for {name}"
                        )
                        raise  # Raise the last S3 error
                except Exception as e:
                    # Log other unexpected errors
                    logger.error(
                        f"Unexpected error saving static file to S3: {name} - "
                        f"Error: {str(e)}"
                    )
                    logger.error(f"Traceback: {traceback.format_exc()}")
                    raise  # Raise the error instead of falling back

        except Exception as outer_e:
            print(f"DEBUG: Error in S3 upload wrapper: {str(outer_e)}")
            logger.error(f"Error in S3 static upload wrapper: {str(outer_e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise  # Raise the error instead of falling back
