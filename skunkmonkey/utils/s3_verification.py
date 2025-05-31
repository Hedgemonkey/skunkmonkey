"""
S3 verification utilities for the skunkmonkey project.
"""
import logging
import time
import traceback
import uuid

from django.conf import settings

from botocore.exceptions import ClientError

from skunkmonkey.utils.s3_common import get_s3_client

logger = logging.getLogger('django')


def verify_s3_file_exists(file_path: str) -> dict[str, bool | str]:
    """
    Verify if a file exists in S3 bucket.
    This performs a direct check with boto3 instead of relying on Django
    storage.

    Args:
        file_path (str): The relative path to the file in the bucket

    Returns:
        Dict: Result containing status and message
            - exists (bool): Whether the file exists in S3
            - message (str): Status or error message
            - key (str): The full S3 key that was checked
            - url (str): The URL to the file if it exists
    """
    transaction_id = f"verify_{int(time.time())}_{uuid.uuid4().hex[:6]}"

    result = {
        'exists': False,
        'message': '',
        'key': '',
        'url': None
    }

    try:
        if not settings.USE_S3:
            result['message'] = "S3 storage is not enabled"
            print(f"⭐ S3 VERIFY [{transaction_id}]: {result['message']}")
            return result

        # Check if AWS credentials are available
        if not (settings.AWS_ACCESS_KEY_ID
                and settings.AWS_SECRET_ACCESS_KEY):
            result['message'] = "AWS credentials are not available"
            print(f"⭐ S3 VERIFY [{transaction_id}]: {result['message']}")
            return result

        # Check if bucket name is set
        if not settings.AWS_STORAGE_BUCKET_NAME:
            result['message'] = "AWS bucket name is not set"
            print(f"⭐ S3 VERIFY [{transaction_id}]: {result['message']}")
            return result

        # Initialize S3 client
        try:
            s3 = get_s3_client()
            print(f"⭐ S3 VERIFY [{transaction_id}]: S3 client created "
                  "successfully")
        except Exception as e:
            result['message'] = f"Failed to create S3 client: {str(e)}"
            print(f"⭐ S3 VERIFY [{transaction_id}]: {result['message']}")
            return result

        # Construct the full S3 key with media location prefix
        s3_key = f"{settings.MEDIAFILES_LOCATION}/{file_path}"
        result['key'] = s3_key

        print(f"⭐ S3 VERIFY [{transaction_id}]: Checking if file exists "
              f"at key: {s3_key}")
        print(f"⭐ S3 VERIFY [{transaction_id}]: Using bucket: "
              f"{settings.AWS_STORAGE_BUCKET_NAME}")

        try:
            # Try to head the object to check if it exists
            response = s3.head_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                Key=s3_key
            )

            # If we get here, the object exists
            result['exists'] = True

            # Get content type and size if available
            content_type = response.get('ContentType', 'Unknown')
            content_length = response.get('ContentLength', 0)

            result['message'] = (
                f"File exists at {s3_key} "
                f"(Type: {content_type}, "
                f"Size: {content_length} bytes)"
            )
            print(f"⭐ S3 VERIFY [{transaction_id}]: {result['message']}")

            # Generate URL
            if (hasattr(settings, 'AWS_S3_CUSTOM_DOMAIN')
                    and settings.AWS_S3_CUSTOM_DOMAIN):
                result['url'] = (
                    f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/"
                    f"{s3_key}"
                )
                print(f"⭐ S3 VERIFY [{transaction_id}]: CloudFront URL: "
                      f"{result['url']}")
            else:
                result['url'] = (
                    f"https://"
                    f"{settings.AWS_STORAGE_BUCKET_NAME}"
                    f".s3.amazonaws.com/{s3_key}"
                )
                print(f"⭐ S3 VERIFY [{transaction_id}]: S3 URL: "
                      f"{result['url']}")

            # Check CloudFront settings
            if (hasattr(settings, 'AWS_S3_CUSTOM_DOMAIN')
                    and settings.AWS_S3_CUSTOM_DOMAIN):
                print(
                    f"⭐ S3 VERIFY [{transaction_id}]: CloudFront domain "
                    f"is configured as: {settings.AWS_S3_CUSTOM_DOMAIN}"
                )
            else:
                print(f"⭐ S3 VERIFY [{transaction_id}]: No CloudFront "
                      "domain configured")

            return result

        except ClientError as e:
            # Check if the error is because the object doesn't exist
            error_code = e.response['Error']['Code']
            if error_code == '404':
                result['message'] = f"File does not exist at {s3_key}"
                print(f"⭐ S3 VERIFY [{transaction_id}]: "
                      f"{result['message']}")
            else:
                # For other errors, provide detailed AWS error information
                error_msg = e.response['Error'].get(
                    'Message', 'Unknown error'
                )
                result['message'] = f"AWS Error ({error_code}): {error_msg}"
                print(f"⭐ S3 VERIFY [{transaction_id}]: ERROR - "
                      f"{result['message']}")

                # Log extra AWS information
                aws_request_id = (
                    e.response.get('ResponseMetadata', {})
                    .get('RequestId', 'Unknown')
                )
                print(f"⭐ S3 VERIFY [{transaction_id}]: AWS RequestId: "
                      f"{aws_request_id}")

            # Check S3 bucket permissions
            try:
                print(f"⭐ S3 VERIFY [{transaction_id}]: Testing bucket "
                      "permissions...")
                s3.list_objects_v2(
                    Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                    MaxKeys=1
                )
                print(f"⭐ S3 VERIFY [{transaction_id}]: S3 bucket "
                      "permissions OK - can list objects")
            except Exception as bucket_e:
                print(f"⭐ S3 VERIFY [{transaction_id}]: ERROR - Cannot "
                      f"list objects in bucket: {str(bucket_e)}")

            return result

    except Exception as e:
        error_msg = f"Error verifying S3 file: {str(e)}"
        logger.error(error_msg)
        logger.error(f"Traceback: {traceback.format_exc()}")
        result['message'] = error_msg
        print(f"⭐ S3 VERIFY [{transaction_id}]: EXCEPTION - {error_msg}")
        print(f"⭐ S3 VERIFY [{transaction_id}]: Traceback: "
              f"{traceback.format_exc()}")

    return result
