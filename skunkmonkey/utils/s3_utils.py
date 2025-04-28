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
from typing import Dict, Optional, Tuple, Union

from django.conf import settings
from django.core.files.base import ContentFile

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

logger = logging.getLogger('django')


def get_s3_client() -> boto3.client:
    """
    Create and return a properly configured S3 client.

    Returns:
        boto3.client: Configured S3 client
    """
    # Clean region name (remove any comments)
    region = settings.AWS_S3_REGION_NAME
    if region and '#' in region:
        region = region.split('#')[0].strip()

    # Configure S3 client
    s3_config = Config(
        region_name=region,
        signature_version=settings.AWS_S3_SIGNATURE_VERSION,
        retries={
            'max_attempts': 3,
            'mode': 'standard'
        }
    )

    # Create and return S3 client
    return boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        config=s3_config
    )


def upload_file_to_s3(
    file_data: bytes,
    key_path: str,
    content_type: Optional[str] = None,
    # Changed default to False since ACLs are not supported
    public: bool = False
) -> Tuple[bool, str, Optional[str]]:
    """
    Upload a file to S3 bucket directly.

    Args:
        file_data (bytes): The file data to upload
        key_path (str): The S3 key path where the file will be stored
        content_type (str, optional): The content type of the file
        public (bool, optional): Whether the file should be publicly accessible
                                 Note: This is ignored if bucket doesn't
                                 support ACLs

    Returns:
        Tuple[bool, str, Optional[str]]:
            - Success status (True/False)
            - Message (success message or error)
            - URL of the uploaded file (if successful, otherwise None)
    """
    if not settings.USE_S3:
        logger.warning("S3 storage is disabled. File will not be uploaded.")
        return False, "S3 storage is disabled.", None

    try:
        # Get S3 client
        s3 = get_s3_client()

        # Create file-like object from bytes
        file_obj = io.BytesIO(file_data)

        # Set up extra arguments (different from the file object itself)
        extra_args = {}

        # Add content type if provided
        if content_type:
            extra_args['ContentType'] = content_type

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

                # Correctly use upload_fileobj with positional arguments
                s3.upload_fileobj(
                    file_obj,
                    settings.AWS_STORAGE_BUCKET_NAME,
                    key_path,
                    ExtraArgs=extra_args if extra_args else None
                )

                # Generate the public URL
                if settings.AWS_S3_CUSTOM_DOMAIN:
                    public_url = (
                        f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{key_path}"
                    )
                else:
                    public_url = (
                        f"https://{settings.AWS_STORAGE_BUCKET_NAME}"
                        f".s3.amazonaws.com/{key_path}"
                    )

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
                logger.warning(
                    f"S3 upload attempt {retry_count} failed: "
                    f"{error_code} - {error_message}"
                )

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
) -> Dict[str, Union[bool, str]]:
    """
    Process a base64 encoded image and upload it to S3.
    This is particularly useful for handling cropped images from cropper.js.

    Args:
        base64_data (str): Base64 encoded image data
        folder_path (str): The folder path within S3 bucket
        file_name_prefix (str, optional): Prefix for the filename
        public (bool, optional): Whether the file should be publicly accessible

    Returns:
        Dict: Result containing status, message, url, and field_value
            - success (bool): Whether the upload was successful
            - message (str): Success or error message
            - url (str): URL of the uploaded file (if successful)
            - field_value (str): Value to use in the model
            field (relative path)
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
            result['message'] = "Invalid base64 image data."
            logger.error(result['message'])
            return result

        # Parse the base64 data
        format_data, imgstr = base64_data.split(';base64,')
        ext = format_data.split('/')[-1]

        # Get the content type
        content_type = format_data.split(':')[1]

        # Generate a unique filename
        if file_name_prefix:
            # Clean the prefix to avoid path traversal or invalid chars
            file_name_prefix = os.path.basename(file_name_prefix)
            file_name_prefix = file_name_prefix.replace(' ', '_')

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
        image_data = base64.b64decode(imgstr)

        # Upload to S3
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
) -> Dict[str, Union[bool, str]]:
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
        Dict: Result containing status and message
            - success (bool): Whether the operation was successful
            - message (str): Success or error message
            - url (str): URL of the uploaded file (if successful)
    """
    result = {
        'success': False,
        'message': '',
        'url': None
    }

    try:
        if settings.USE_S3:
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
) -> Dict[str, Union[bool, str]]:
    """
    Fall back to using ContentFile for storing the image.
    This is used when S3 upload fails or is disabled.

    Args:
        model_instance: The model instance to update
        field_name (str): The name of the field to set
        base64_data (str): Base64 encoded image data
        file_name_prefix (str, optional): Prefix for the filename

    Returns:
        Dict: Result containing status and message
            - success (bool): Whether the operation was successful
            - message (str): Success or error message
            - url (str): URL of the uploaded file (if successful)
    """
    result = {
        'success': False,
        'message': '',
        'url': None
    }

    try:
        # Parse the base64 data
        format_data, imgstr = base64_data.split(';base64,')
        ext = format_data.split('/')[-1]

        # Generate filename
        timestamp = int(time.time())
        file_name = f"{file_name_prefix}{timestamp}.{ext}"

        # Create ContentFile
        image_content = ContentFile(
            base64.b64decode(imgstr),
            name=file_name
        )

        # Set the model field
        field = getattr(model_instance.__class__, field_name).field
        field_instance = getattr(model_instance, field_name)

        # Delete old file if it exists
        if field_instance:
            try:
                storage = field.storage
                path = field_instance.name
                if storage.exists(path):
                    storage.delete(path)
            except Exception as e:
                logger.warning(f"Could not delete old file: {str(e)}")

        # Set new file
        setattr(model_instance, field_name, image_content)

        # Get URL (this may save the file depending on the storage backend)
        if hasattr(field_instance, 'url'):
            result['url'] = field_instance.url

        result['success'] = True
        result['message'] = "Image processed successfully with ContentFile."

    except Exception as e:
        error_msg = f"Error in fallback_to_content_file: {str(e)}"
        logger.error(error_msg)
        logger.error(f"Traceback: {traceback.format_exc()}")
        result['message'] = error_msg

    return result
