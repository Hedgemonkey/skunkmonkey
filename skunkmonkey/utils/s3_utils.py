"""
S3 upload utilities for the skunkmonkey project.

This module provides standardized functions for uploading files to AWS S3,
including specialized handling for base64-encoded images from cropper.js.
"""
import base64
import io
import logging
import os
import time
import traceback
import uuid

from django.conf import settings
from django.core.files.base import ContentFile

from botocore.exceptions import ClientError

from skunkmonkey.utils.s3_common import get_s3_client
from skunkmonkey.utils.s3_verification import verify_s3_file_exists

logger = logging.getLogger('django')


def upload_file_to_s3(
    file_data: bytes,
    key_path: str,
    content_type: str | None = None,
    # Changed default to False since ACLs are not supported
    public: bool = False
) -> tuple[bool, str, str | None]:
    """
    Upload a file to S3 bucket directly.

    Args:
        file_data (bytes): The file data to upload
        key_path (str): The S3 key path where the file will be stored
        content_type (str, optional): The content type of the file
        public (bool, optional): Whether the file should be publicly
                                 accessible. Note: This is ignored if bucket
                                 doesn't support ACLs

    Returns:
        tuple[bool, str, str | None]:
            - Success status (True/False)
            - Message (success message or error)
            - URL of the uploaded file (if successful, otherwise None)
    """
    if not settings.USE_S3:
        logger.warning("S3 storage is disabled. File will not be uploaded.")
        return False, "S3 storage is disabled.", None

    try:
        # Get S3 client
        try:
            s3 = get_s3_client()
        except Exception as client_error:
            logger.error(f"Failed to create S3 client: {str(client_error)}")
            return (
                False,
                f"Failed to create S3 client: {str(client_error)}",
                None
            )

        # Create file-like object from bytes
        file_obj = io.BytesIO(file_data)

        # Set up extra arguments (different from the file object itself)
        extra_args = {}

        # Add content type if provided
        if content_type:
            # For upload purposes, we need to sanitize content type
            # Some browsers might add parameters to content types
            upload_content_type = content_type
            if ';' in upload_content_type:
                # Take only the main content type without parameters
                upload_content_type = upload_content_type.split(';')[0]
                print(
                    "DEBUG S3: Sanitized content type for upload: {} "
                    "(from {})".format(
                        upload_content_type, content_type
                    )
                )

            extra_args['ContentType'] = upload_content_type

        # Only add ACL if public AND bucket owner explicitly allows it
        # Skipping this since most modern S3 buckets don't use ACLs
        # if public:
        #    extra_args['ACL'] = 'public-read'

        # Perform the upload with retry logic
        max_retries = 3
        retry_count = 0
        last_exception = None

        while retry_count < max_retries:
            try:
                # Reset file pointer to beginning before each attempt
                file_obj.seek(0)
                print(
                    f"DEBUG S3: Upload attempt {retry_count + 1} for "
                    f"{key_path}"
                )

                # Log the ExtraArgs for debugging
                print(f"DEBUG S3: Using ExtraArgs: {extra_args}")

                # Correctly use upload_fileobj with positional arguments
                s3.upload_fileobj(
                    file_obj,
                    settings.AWS_STORAGE_BUCKET_NAME,
                    key_path,
                    ExtraArgs=extra_args if extra_args else None
                )

                # Generate the public URL
                if settings.AWS_S3_CUSTOM_DOMAIN:
                    # Check if we need to sanitize parameters in URL generation
                    if content_type and ';' in content_type:
                        print(
                            "DEBUG S3: Sanitizing URL for content_type with "
                            f"parameters: {content_type}"
                        )

                    public_url = (
                        f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{key_path}"
                    )
                else:
                    public_url = (
                        f"https://{settings.AWS_STORAGE_BUCKET_NAME}"
                        f".s3.amazonaws.com/{key_path}"
                    )

                print(
                    f"DEBUG S3: Successfully uploaded file to S3: "
                    f"{key_path}"
                )
                print(f"DEBUG S3: Generated URL: {public_url}")
                logger.info(f"Successfully uploaded file to S3: {key_path}")
                return True, "File uploaded successfully.", public_url

            except ClientError as e:
                retry_count += 1
                last_exception = e

                # Log the error
                error_code = e.response.get('Error', {}).get('Code', 'Unknown')
                error_message = e.response.get('Error', {}).get(
                    'Message', 'Unknown error'
                )
                error_log = (
                    f"S3 upload attempt {retry_count} failed: "
                    f"{error_code} - {error_message}"
                )
                print(f"DEBUG S3 ERROR: {error_log}")
                logger.warning(error_log)

                # Wait before retrying (exponential backoff)
                if retry_count < max_retries:
                    time.sleep(2 ** retry_count)

        # If we get here, all retries failed
        if last_exception:
            error_code = last_exception.response.get('Error', {}).get(
                'Code', 'Unknown'
            )
            error_message = last_exception.response.get('Error', {}).get(
                'Message', 'Unknown error'
            )
            error_msg = f"S3 upload failed: {error_code} - {error_message}"
        else:
            error_msg = "S3 upload failed for unknown reason."

        logger.error(error_msg)
        return False, error_msg, None

    except Exception as e:
        error_msg = f"Unexpected error during S3 upload: {str(e)}"
        logger.error(error_msg)
        logger.error(f"Traceback: {traceback.format_exc()}")
        return False, error_msg, None


def process_base64_image(
    base64_data: str,
    folder_path: str,
    file_name_prefix: str = "",
    public: bool = True
) -> dict[str, bool | str | None]:
    """
    Process a base64 encoded image and upload it to S3.
    This is particularly useful for handling cropped images from cropper.js.

    Args:
        base64_data (str): Base64 encoded image data
        folder_path (str): The folder path within S3 bucket
        file_name_prefix (str, optional): Prefix for the filename
        public (bool, optional): Whether the file should be publicly
                                 accessible

    Returns:
        dict: Result containing status, message, url, and field_value
            - success (bool): Whether the upload was successful
            - message (str): Success or error message
            - url (str): URL of the uploaded file (if successful)
            - field_value (str): Value to use in the model field
                                (relative path)
    """
    result = {
        'success': False,
        'message': '',
        'url': None,
        'field_value': None
    }

    try:
        # Validate base64 data
        if not base64_data or ';base64,' not in base64_data:
            error_msg = "Invalid base64 image data."
            print(f"⭐⭐⭐ S3 UPLOAD: ERROR - {error_msg}")
            result['message'] = error_msg
            logger.error(f"process_base64_image: {error_msg}")
            if not base64_data:
                logger.error("Base64 data is empty")
            elif len(base64_data) < 50:
                logger.error(f"Base64 data is malformed: {base64_data}")
            else:
                logger.error(
                    "Base64 data is malformed (too long to print fully)"
                )
            return result

        # Parse the base64 data
        print(
            "⭐⭐⭐ S3 UPLOAD: Base64 data validation passed, "
            "parsing data"
        )
        try:
            format_data, imgstr = base64_data.split(';base64,')
        except ValueError as e:
            error_msg = f"Failed to split base64 data: {str(e)}"
            print("⭐⭐⭐ S3 UPLOAD: ERROR - " + error_msg)
            result['message'] = error_msg
            logger.error(f"process_base64_image: {error_msg}")

            # Attempt recovery if there's a standard prefix we can identify
            recovery_prefixes = [
                'data:image/png', 'data:image/jpeg', 'data:image/jpg',
                'data:image/gif', 'data:image/webp'
            ]

            for prefix in recovery_prefixes:
                if prefix in base64_data:
                    try:
                        print(
                            f"⭐⭐⭐ S3 UPLOAD: Attempting recovery with "
                            f"prefix {prefix}"
                        )
                        parts = base64_data.split(prefix)
                        if len(parts) >= 2:
                            reconstructed = (
                                f"{prefix};base64,"
                                + parts[1].split(';base64,')[-1]
                            )
                            format_data, imgstr = reconstructed.split(
                                ';base64,'
                            )
                            print(
                                "⭐⭐⭐ S3 UPLOAD: Base64 data recovered"
                            )
                            break
                    except Exception:
                        continue
            else:
                # If we get here, recovery failed
                return result

        # Extract file extension (handle formats with any parameters)
        # Split the format data to get just the MIME type
        mime_parts = format_data.split(':')
        if len(mime_parts) != 2:
            result['message'] = "Invalid base64 image format."
            return result

        mime_type = mime_parts[1]
        ext = mime_type.split('/')[-1]

        # Remove any parameters from extension
        if ';' in ext:
            original_ext = ext
            ext = ext.split(';')[0]  # Extract just the file extension
            print(
                f"DEBUG S3: Removed parameters from extension: "
                f"{original_ext} -> {ext}"
            )

        # Get the content type (might include parameters)
        content_type = mime_parts[1]
        print(
            f"DEBUG S3: Using content_type: {content_type}, "
            f"file extension: {ext}"
        )

        # Generate a unique filename
        if file_name_prefix:
            # Clean the prefix to avoid path traversal or invalid chars
            file_name_prefix = os.path.basename(file_name_prefix)

            # Replace spaces with underscores
            file_name_prefix = file_name_prefix.replace(' ', '_')

            # Remove problematic keywords from filename
            for keyword in [
                'charset', 'encoding', 'utf', 'base64', 'content-type'
            ]:
                if keyword in file_name_prefix.lower():
                    sanitized_prefix = (
                        file_name_prefix.lower().replace(keyword, 'param')
                    )
                    print(
                        "DEBUG S3: Sanitized filename parameter: "
                        f"{file_name_prefix} -> {sanitized_prefix}"
                    )
                    file_name_prefix = sanitized_prefix
                    file_name_prefix = sanitized_prefix

            # Ensure prefix is properly formatted
            if not file_name_prefix.endswith('_'):
                file_name_prefix += '_'

        # Create a unique filename with a timestamp and UUID
        unique_id = uuid.uuid4().hex[:8]
        timestamp = int(time.time())
        file_name = f"{file_name_prefix}{timestamp}_{unique_id}.{ext}"

        # Ensure folder path is properly formatted
        if not folder_path.endswith('/'):
            folder_path += '/'

        if folder_path.startswith('/'):
            folder_path = folder_path[1:]

        # Prepare the S3 key path
        s3_key = f"{settings.MEDIAFILES_LOCATION}/{folder_path}{file_name}"

        # Decode the base64 data
        try:
            image_data = base64.b64decode(imgstr)
            print(
                f"DEBUG S3: Successfully decoded base64 image data, "
                f"size: {len(image_data)} bytes"
            )
        except Exception as decode_error:
            print(
                f"DEBUG S3 ERROR: Failed to decode base64 image data: "
                f"{str(decode_error)}"
            )
            logger.error(
                "Failed to decode base64 image data: %s", str(decode_error)
            )
            result['message'] = (
                f"Failed to decode base64 image data: {str(decode_error)}"
            )
            return result

        # Upload to S3
        print(f"DEBUG S3: Attempting to upload to S3 with key: {s3_key}")
        success, message, url = upload_file_to_s3(
            file_data=image_data,
            key_path=s3_key,
            content_type=content_type,
            public=public
        )

        result['success'] = success
        result['message'] = message
        result['url'] = url

        if success:
            # The field_value is the relative path without the media prefix
            result['field_value'] = f"{folder_path}{file_name}"

        return result

    except Exception as e:
        error_msg = f"Error processing base64 image: {str(e)}"
        logger.error(error_msg)
        logger.error(f"Traceback: {traceback.format_exc()}")
        result['message'] = error_msg
        return result


def upload_base64_to_model_field(
    model_instance,
    field_name: str,
    base64_data: str,
    folder_path: str,
    file_name_prefix: str = ""
) -> dict[str, bool | str | None]:
    """
    Process a base64 image and set it to a model's field.
    If S3 is enabled, uploads directly to S3, otherwise uses ContentFile.

    Args:
        model_instance: The model instance to update
        field_name (str): The name of the field to set
        base64_data (str): Base64 encoded image data
        folder_path (str): The folder path within media
        file_name_prefix (str, optional): Prefix for the filename

    Returns:
        dict: Result containing status and message
            - success (bool): Whether the operation was successful
            - message (str): Success or error message
            - url (str): URL of the uploaded file (if successful)
            - transaction_id (str): Unique ID for tracking this upload
                                   transaction
    """
    # Generate a transaction ID for tracking this specific upload
    transaction_id = f"s3_{int(time.time())}_{uuid.uuid4().hex[:6]}"

    try:
        # Log entry point with critical details
        print(
            f"⭐⭐⭐ S3 UPLOAD [{transaction_id}]: Starting base64 upload "
            f"for {field_name} in {folder_path}"
        )
        logger.info(
            f"S3 UPLOAD [{transaction_id}]: Starting base64 upload for "
            f"{field_name} in {folder_path}"
        )

        # Get model info safely
        model_name = model_instance.__class__.__name__
        try:
            model_id = getattr(model_instance, 'id', 'unknown')
        except Exception:
            model_id = 'unknown'

        print(
            f"⭐⭐⭐ S3 UPLOAD [{transaction_id}]: Model {model_name} "
            f"with ID {model_id}"
        )

        # Log critical S3 settings
        aws_access_available = bool(
            getattr(settings, 'AWS_ACCESS_KEY_ID', None)
        )
        aws_secret_available = bool(
            getattr(settings, 'AWS_SECRET_ACCESS_KEY', None)
        )
        aws_bucket = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', 'Not set')

        print(
            f"⭐⭐⭐ S3 UPLOAD [{transaction_id}]: USE_S3={settings.USE_S3}, "
            f"bucket={aws_bucket}"
        )
        print(
            f"⭐⭐⭐ S3 UPLOAD [{transaction_id}]: AWS credentials "
            f"available: Access key: {aws_access_available}, "
            f"Secret key: {aws_secret_available}"
        )
        logger.info(
            f"S3 UPLOAD [{transaction_id}]: USE_S3={settings.USE_S3}, "
            f"bucket={aws_bucket}"
        )
        logger.info(
            f"S3 UPLOAD [{transaction_id}]: AWS credentials available: "
            f"Access key: {aws_access_available}, "
            f"Secret key: {aws_secret_available}"
        )

        # Test S3 connectivity before proceeding
        if (settings.USE_S3 and aws_access_available
                and aws_secret_available and aws_bucket != 'Not set'):
            try:
                print(
                    f"⭐⭐⭐ S3 UPLOAD [{transaction_id}]: Testing S3 "
                    "connectivity before processing..."
                )
                s3 = get_s3_client()
                s3.list_objects_v2(
                    Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                    MaxKeys=1
                )
                print(
                    f"⭐⭐⭐ S3 UPLOAD [{transaction_id}]: S3 connectivity "
                    "test PASSED"
                )
                logger.info(
                    f"S3 UPLOAD [{transaction_id}]: S3 connectivity "
                    "test PASSED"
                )
            except Exception as e:
                print(
                    f"⭐⭐⭐ S3 UPLOAD [{transaction_id}]: S3 connectivity "
                    f"test FAILED: {str(e)}"
                )
                logger.error(
                    f"S3 UPLOAD [{transaction_id}]: S3 connectivity "
                    f"test FAILED: {str(e)}"
                )
                # Continue anyway - we'll handle failures later

        # Check base64 data format and try to fix common issues
        if not base64_data:
            print(
                f"⭐⭐⭐ S3 UPLOAD [{transaction_id}]: ERROR - "
                "base64_data is empty"
            )
            logger.error(
                f"S3 UPLOAD [{transaction_id}]: base64_data is empty"
            )
            result = {
                'success': False,
                'message': 'Base64 data is empty',
                'url': None,
                'transaction_id': transaction_id
            }
            return result
        elif len(base64_data) < 20:
            print(
                f"⭐⭐⭐ S3 UPLOAD [{transaction_id}]: ERROR - "
                f"base64_data is too short: {base64_data}"
            )
            logger.error(
                f"S3 UPLOAD [{transaction_id}]: base64_data is too short: "
                f"{base64_data}"
            )
            result = {
                'success': False,
                'message': 'Base64 data is too short',
                'url': None,
                'transaction_id': transaction_id
            }
            return result
        elif ';base64,' not in base64_data:
            print(
                f"⭐⭐⭐ S3 UPLOAD [{transaction_id}]: WARNING - "
                "missing base64 marker in data"
            )
            logger.warning(
                f"S3 UPLOAD [{transaction_id}]: Missing ;base64, marker "
                "in data"
            )

            # Try to autofix common base64 format issues
            fixed = False

            # Check for standard image data patterns at the beginning
            if base64_data.startswith('/9j/'):  # JPEG signature
                print(
                    f"⭐⭐⭐ S3 UPLOAD [{transaction_id}]: Detected JPEG "
                    "data without proper prefix"
                )
                base64_data = f"data:image/jpeg;base64,{base64_data}"
                fixed = True
            elif base64_data.startswith('iVBOR'):  # PNG signature
                print(
                    f"⭐⭐⭐ S3 UPLOAD [{transaction_id}]: Detected PNG "
                    "data without proper prefix"
                )
                base64_data = f"data:image/png;base64,{base64_data}"
                fixed = True
            elif base64_data.startswith('R0lGOD'):  # GIF signature
                print(
                    f"⭐⭐⭐ S3 UPLOAD [{transaction_id}]: Detected GIF "
                    "data without proper prefix"
                )
                base64_data = f"data:image/gif;base64,{base64_data}"
                fixed = True
            elif base64_data.startswith('UklGR'):  # WEBP signature
                print(
                    f"⭐⭐⭐ S3 UPLOAD [{transaction_id}]: Detected WEBP "
                    "data without proper prefix"
                )
                base64_data = f"data:image/webp;base64,{base64_data}"
                fixed = True

            if fixed:
                print(
                    f"⭐⭐⭐ S3 UPLOAD [{transaction_id}]: Successfully "
                    "fixed base64 data format"
                )
                logger.info(
                    f"S3 UPLOAD [{transaction_id}]: Successfully fixed "
                    "base64 data format"
                )
            else:
                print(
                    f"⭐⭐⭐ S3 UPLOAD [{transaction_id}]: Could not fix "
                    "base64 format"
                )
                logger.error(
                    f"S3 UPLOAD [{transaction_id}]: Could not fix "
                    "base64 format"
                )
                result = {
                    'success': False,
                    'message': (
                        'Invalid base64 format - missing ;base64, marker'
                    ),
                    'url': None,
                    'transaction_id': transaction_id
                }
                return result
        else:
            try:
                prefix = base64_data[:30].strip()
                print(
                    f"⭐⭐⭐ S3 UPLOAD [{transaction_id}]: base64 data "
                    f"prefix: {prefix}..."
                )
                logger.info(
                    f"S3 UPLOAD [{transaction_id}]: base64 data prefix: "
                    f"{prefix}..."
                )
            except Exception as e:
                print(
                    f"⭐⭐⭐ S3 UPLOAD [{transaction_id}]: Could not read "
                    f"base64 data prefix: {str(e)}"
                )
                logger.error(
                    f"S3 UPLOAD [{transaction_id}]: Could not read "
                    f"base64 data prefix: {str(e)}"
                )

        result = {
            'success': False,
            'message': '',
            'url': None,
            'transaction_id': transaction_id
        }
    except Exception as e:
        logger.error(
            f"Critical error in upload_base64_to_model_field initial "
            f"check: {str(e)}"
        )
        print(
            f"⭐⭐⭐ S3 UPLOAD: CRITICAL ERROR in initial setup: {str(e)}"
        )
        return {
            'success': False,
            'message': f"Critical error in upload setup: {str(e)}",
            'url': None,
            'transaction_id': f"error_{int(time.time())}"
        }

    try:
        if settings.USE_S3:
            # Print debug info for S3 configuration
            print(f"⭐⭐⭐ S3 UPLOAD: USE_S3 set to {settings.USE_S3}")
            print(
                f"⭐⭐⭐ S3 UPLOAD: AWS_STORAGE_BUCKET_NAME is "
                f"{settings.AWS_STORAGE_BUCKET_NAME}"
            )
            print(
                f"⭐⭐⭐ S3 UPLOAD: AWS_S3_REGION_NAME is "
                f"{settings.AWS_S3_REGION_NAME}"
            )
            creds_available = bool(
                settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY
            )
            print(
                "⭐⭐⭐ S3 UPLOAD: AWS credentials available: "
                f"{creds_available}"
            )

            if not creds_available:
                error_msg = "AWS credentials are not available"
                print(f"⭐⭐⭐ S3 UPLOAD: ERROR - {error_msg}")
                logger.error(f"S3 UPLOAD: {error_msg}")
                result['message'] = error_msg
                return result

            if not settings.AWS_STORAGE_BUCKET_NAME:
                error_msg = "AWS bucket name is not set"
                print(f"⭐⭐⭐ S3 UPLOAD: ERROR - {error_msg}")
                logger.error(f"S3 UPLOAD: {error_msg}")
                result['message'] = error_msg
                return result

            # Use S3 upload
            s3_result = process_base64_image(
                base64_data=base64_data,
                folder_path=folder_path,
                file_name_prefix=file_name_prefix
            )

            if s3_result['success']:
                # Set the model field to the relative path
                setattr(model_instance, field_name, s3_result['field_value'])
                result['success'] = True
                result['message'] = s3_result['message']
                result['url'] = s3_result['url']

                # Verify the file exists in S3 after upload
                print(
                    f"DEBUG: Verifying S3 upload for "
                    f"{s3_result['field_value']}"
                )
                verify_result = verify_s3_file_exists(
                    s3_result['field_value']
                )
                if verify_result['exists']:
                    print(
                        f"DEBUG: File verification successful: "
                        f"{s3_result['field_value']}"
                    )
                    logger.info(
                        "File verification successful: %s",
                        s3_result['field_value']
                    )
                else:
                    print(
                        f"DEBUG: File verification failed: "
                        f"{s3_result['field_value']} - "
                        f"{verify_result['message']}"
                    )
                    logger.warning(
                        "File verification failed: %s - %s",
                        s3_result['field_value'],
                        verify_result['message']
                    )

            else:
                # Fall back to content file method on failure
                logger.warning(
                    "S3 upload failed, falling back to ContentFile method"
                )
                return fallback_to_content_file(
                    model_instance, field_name, base64_data, file_name_prefix
                )
        else:
            # Use ContentFile approach for non-S3 storage
            return fallback_to_content_file(
                model_instance, field_name, base64_data, file_name_prefix
            )

    except Exception as e:
        error_msg = f"Error in upload_base64_to_model_field: {str(e)}"
        logger.error(error_msg)
        logger.error(f"Traceback: {traceback.format_exc()}")
        result['message'] = error_msg

    return result


def fallback_to_content_file(
    model_instance,
    field_name: str,
    base64_data: str,
    file_name_prefix: str = ""
) -> dict[str, bool | str | None]:
    """
    Fall back to using ContentFile for storing the image.
    This is used when S3 upload fails or is disabled.

    WARNING: On Heroku, files saved this way will not persist after dyno
    restart!

    Args:
        model_instance: The model instance to update
        field_name (str): The name of the field to set
        base64_data (str): Base64 encoded image data
        file_name_prefix (str, optional): Prefix for the filename

    Returns:
        dict: Result containing status and message
            - success (bool): Whether the operation was successful
            - message (str): Success or error message
            - url (str): URL of the uploaded file (if successful)
            - is_fallback (bool): Indicates this is a fallback storage
                                 which won't persist
    """
    transaction_id = f"fallback_{int(time.time())}_{uuid.uuid4().hex[:6]}"

    # Log critical warning about fallback storage not persisting on Heroku
    logger.warning(
        f"⚠️ FALLBACK STORAGE [{transaction_id}]: Using local file "
        "storage which WON'T PERSIST on Heroku!"
    )
    print(
        f"⭐⭐⭐ FALLBACK [{transaction_id}]: Using local file storage "
        "which WON'T PERSIST on Heroku!"
    )

    result = {
        'success': False,
        'message': '',
        'url': None,
        'is_fallback': True,
        'transaction_id': transaction_id
    }

    try:
        # Check if we can fix the base64 data format
        if ';base64,' not in base64_data:
            print(
                f"⭐⭐⭐ FALLBACK [{transaction_id}]: Attempting to fix "
                "base64 format"
            )

            # Auto-detect and fix common base64 image formats
            if base64_data.startswith('/9j/'):  # JPEG signature
                base64_data = f"data:image/jpeg;base64,{base64_data}"
            elif base64_data.startswith('iVBOR'):  # PNG signature
                base64_data = f"data:image/png;base64,{base64_data}"
            elif base64_data.startswith('R0lGOD'):  # GIF signature
                base64_data = f"data:image/gif;base64,{base64_data}"
            elif base64_data.startswith('UklGR'):  # WEBP signature
                base64_data = f"data:image/webp;base64,{base64_data}"

            if ';base64,' not in base64_data:
                error_msg = (
                    "Could not fix base64 data format for fallback storage"
                )
                logger.error(f"FALLBACK [{transaction_id}]: {error_msg}")
                result['message'] = error_msg
                return result

            print(
                f"⭐⭐⭐ FALLBACK [{transaction_id}]: Successfully fixed "
                "base64 format"
            )

        # Parse the base64 data
        try:
            format_data, imgstr = base64_data.split(';base64,')
            print(
                f"⭐⭐⭐ FALLBACK [{transaction_id}]: Successfully split "
                "base64 data"
            )
        except Exception as e:
            error_msg = (
                f"Failed to parse base64 data for fallback "
                f"storage: {str(e)}"
            )
            logger.error(f"FALLBACK [{transaction_id}]: {error_msg}")
            result['message'] = error_msg
            return result

        ext = format_data.split('/')[-1]

        # Handle parameters in extension
        if ';' in ext:
            ext = ext.split(';')[0]  # Extract just the file extension
            print(
                f"⭐⭐⭐ FALLBACK [{transaction_id}]: Cleaned extension "
                f"to: {ext}"
            )

        # Generate filename with transaction ID for easier tracking
        timestamp = int(time.time())
        file_name = (
            f"{file_name_prefix}{timestamp}_{transaction_id[-6:]}.{ext}"
        )
        print(
            f"⭐⭐⭐ FALLBACK [{transaction_id}]: Generated filename: "
            f"{file_name}"
        )

        # Attempt to decode the base64 data
        try:
            image_data = base64.b64decode(imgstr)
            print(
                f"⭐⭐⭐ FALLBACK [{transaction_id}]: Successfully decoded "
                f"base64 data, size: {len(image_data)} bytes"
            )
        except Exception as e:
            error_msg = f"Failed to decode base64 data: {str(e)}"
            logger.error(f"FALLBACK [{transaction_id}]: {error_msg}")
            result['message'] = error_msg
            return result

        # Create ContentFile
        image_content = ContentFile(
            image_data,
            name=file_name
        )
        print(f"⭐⭐⭐ FALLBACK [{transaction_id}]: Created ContentFile")

        # Get field information
        try:
            field = getattr(model_instance.__class__, field_name).field
            field_instance = getattr(model_instance, field_name)
            print(
                f"⭐⭐⭐ FALLBACK [{transaction_id}]: Accessed field: "
                f"{field_name}"
            )
        except Exception as e:
            error_msg = f"Failed to access field {field_name}: {str(e)}"
            logger.error(f"FALLBACK [{transaction_id}]: {error_msg}")
            result['message'] = error_msg
            return result

        # Delete old file if it exists
        if field_instance:
            try:
                storage = field.storage
                path = field_instance.name
                if storage.exists(path):
                    storage.delete(path)
                    print(
                        f"⭐⭐⭐ FALLBACK [{transaction_id}]: Deleted old "
                        f"file: {path}"
                    )
            except Exception as e:
                logger.warning(
                    f"FALLBACK [{transaction_id}]: Could not delete old "
                    f"file: {str(e)}"
                )

        # Set new file
        setattr(model_instance, field_name, image_content)
        print(
            f"⭐⭐⭐ FALLBACK [{transaction_id}]: Set image field on model"
        )

        # Get URL (this may save the file depending on the storage backend)
        try:
            field_instance = getattr(model_instance, field_name)
            if hasattr(field_instance, 'url'):
                result['url'] = field_instance.url
                print(
                    f"⭐⭐⭐ FALLBACK [{transaction_id}]: Got image URL: "
                    f"{result['url']}"
                )
        except Exception as e:
            logger.warning(
                f"FALLBACK [{transaction_id}]: Could not get URL: {str(e)}"
            )

        result['success'] = True
        result['message'] = (
            "Image processed with fallback storage. "
            "WARNING: Will not persist on Heroku."
        )
        print(
            f"⭐⭐⭐ FALLBACK [{transaction_id}]: Fallback storage "
            "processing complete"
        )

    except Exception as e:
        error_msg = f"Error in fallback_to_content_file: {str(e)}"
        logger.error(f"FALLBACK [{transaction_id}]: {error_msg}")
        logger.error(
            f"FALLBACK [{transaction_id}]: Traceback: "
            f"{traceback.format_exc()}"
        )
        print(
            f"⭐⭐⭐ FALLBACK [{transaction_id}]: ERROR: {error_msg}"
        )
        result['message'] = error_msg

    return result
