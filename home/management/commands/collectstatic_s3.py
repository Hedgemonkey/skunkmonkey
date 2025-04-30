"""
Custom management command to force collectstatic with S3 storage
"""
import logging
import os
import sys
import traceback
import boto3
from botocore.exceptions import BotoCoreError, ClientError

from django.contrib.staticfiles.management.commands.collectstatic import (
    Command as CollectstaticCommand
)
from django.core.management.base import CommandError
from django.conf import settings
from skunkmonkey.custom_storages import StaticStorage

logger = logging.getLogger('django')


class VitePreservingCollector:
    """
    Custom collector that preserves important Vite files
    """
    def __init__(self, command_instance):
        self.command = command_instance
        self.preserved_files = ['manifest.json']
        self.preserved_paths = {}
        
    def preserve_vite_files(self):
        """Save copies of important Vite files before collectstatic runs"""
        try:
            static_root = settings.STATIC_ROOT
            if not os.path.exists(static_root):
                os.makedirs(static_root)
                
            for filename in self.preserved_files:
                filepath = os.path.join(static_root, filename)
                if os.path.exists(filepath):
                    with open(filepath, 'rb') as f:
                        self.preserved_paths[filename] = f.read()
                    logger.info(f"Preserved {filename} before collectstatic")
                    self.command.stdout.write(
                        f"Preserved {filename} before collectstatic"
                    )
        except Exception as e:
            error_msg = f"Error preserving Vite files: {str(e)}"
            logger.error(error_msg)
            self.command.stdout.write(
                self.command.style.WARNING(error_msg)
            )
        
    def restore_vite_files(self):
        """Restore important Vite files after collectstatic runs"""
        try:
            static_root = settings.STATIC_ROOT
            for filename, content in self.preserved_paths.items():
                filepath = os.path.join(static_root, filename)
                with open(filepath, 'wb') as f:
                    f.write(content)
                success_msg = f"Restored {filename} after collectstatic"
                logger.info(success_msg)
                self.command.stdout.write(
                    self.command.style.SUCCESS(success_msg)
                )
        except Exception as e:
            error_msg = f"Error restoring Vite files: {str(e)}"
            logger.error(error_msg)
            self.command.stdout.write(
                self.command.style.ERROR(error_msg)
            )


class Command(CollectstaticCommand):
    help = 'Collect static files directly to S3 with enhanced logging'
    
    # Initialize the attribute here to prevent 'no attribute' error
    preserve_vite = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.successful_uploads = 0
        self.failed_uploads = 0
        self.error_details = {}  # Store error details by file path
        # Initialize storage, forcing it to be StaticStorage
        self._storage = None

    def add_arguments(self, parser):
        # ...existing code...
        super().add_arguments(parser)
        parser.add_argument(
            '--preserve-vite',
            action='store_true',
            default=True,
            help='Preserve Vite manifest files during collection',
        )
        parser.add_argument(
            '--show-error-details',
            action='store_true',
            default=True,
            help='Show detailed error messages for failed uploads',
        )
        parser.add_argument(
            '--force-s3',
            action='store_true',
            default=True,
            help='Force using S3 storage even if not configured in settings',
        )
    
    def set_options(self, **options):
        """Override to force using StaticStorage backend"""
        super().set_options(**options)
        
        # Force the storage to be StaticStorage
        if options.get('force_s3', True):
            from skunkmonkey.custom_storages import StaticStorage
            self.storage = StaticStorage()
            self.stdout.write(self.style.SUCCESS(f"Forced storage backend to {self.storage.__class__.__name__}"))
    
    def copy_file(self, source_path, prefixed_path, source_storage=None):
        """
        Override copy_file to properly show S3 destinations in logs
        This implementation maintains compatibility with Django's signature
        """
        # Log that we're about to copy a file (before calling super)
        source_display_name = source_path if isinstance(source_path, str) else source_path.name
        logger.info(f"S3 COPY: Starting copy of '{source_display_name}'")
        
        try:
            # Get the result of the original copy_file method
            result = super().copy_file(source_path, prefixed_path, source_storage)
            
            # Check if the file was skipped (result will be None if it was skipped)
            if result is None:
                # File was skipped, so we'll count it as a success
                logger.info(f"Skipped file: '{source_display_name}' (not modified)")
                self.stdout.write(f"Skipping '{source_display_name}' (not modified)")
                self.successful_uploads += 1
                return None  # Return None to indicate the file was skipped
            
            # If we got here, the file was copied (result should be True)
            if result:
                # Calculate the S3 destination path
                bucket = settings.AWS_STORAGE_BUCKET_NAME
                
                # The prefixed_path is the destination path relative to the storage root
                s3_path = f"s3://{bucket}/static/{prefixed_path}"
                
                # Add CloudFront URL if available
                cloudfront_url = None
                if hasattr(settings, 'CLOUDFRONT_DOMAIN'):
                    cloudfront_domain = settings.CLOUDFRONT_DOMAIN
                    cloudfront_url = f"https://{cloudfront_domain}/static/{prefixed_path}"
                
                # Print enhanced message (in addition to the default "Copying" message)
                destination_msg = f"S3 file upload: '{source_display_name}' → '{s3_path}'"
                if cloudfront_url:
                    destination_msg += f" (accessible at {cloudfront_url})"
                
                # Log to both Django logger and stdout
                logger.info(destination_msg)
                sys.stdout.flush()  # Ensure output is flushed immediately
                
                # Add colored success indicator (green checkmark)
                self.stdout.write(self.style.SUCCESS(f"✓ {destination_msg}"))
                self.stdout.flush()  # Also flush the stdout buffer
                
                # Increment success counter
                self.successful_uploads += 1
            else:
                # Print warning and debug info if copy_file returns False
                import traceback
                fail_msg = f"Failed to copy '{source_display_name}' to S3 (copy_file returned False)"
                logger.warning(fail_msg)
                self.stdout.write(self.style.ERROR(f"✗ {fail_msg}"))
                # Print traceback for more context
                tb = traceback.format_stack()
                self.stdout.write(self.style.WARNING('Traceback (most recent call last):'))
                for line in tb:
                    self.stdout.write(line.strip())
                self.error_details[str(source_display_name)] = "copy_file returned False (see traceback above)"
                self.failed_uploads += 1
                
            return result
            
        except Exception as e:
            # Capture detailed exception information
            error_type = type(e).__name__
            error_msg = str(e)
            error_trace = traceback.format_exc()
            
            # Format specific errors more clearly
            detailed_msg = f"Error type: {error_type}, Message: {error_msg}"
            if isinstance(e, (BotoCoreError, ClientError)):
                if hasattr(e, 'response') and 'Error' in getattr(e, 'response', {}):
                    aws_error = e.response['Error']
                    detailed_msg = f"AWS Error: {aws_error.get('Code', 'Unknown')}: {aws_error.get('Message', 'No message')}"
            
            # Log the full error with traceback
            logger.error(f"Error uploading '{source_display_name}' to S3: {detailed_msg}")
            logger.debug(f"Full traceback:\n{error_trace}")
            
            # Print a user-friendly error message
            fail_msg = f"Failed to copy '{source_display_name}' to S3: {error_msg}"
            self.stdout.write(self.style.ERROR(f"✗ {fail_msg}"))
            
            # Store the error info for summary
            self.error_details[str(source_display_name)] = detailed_msg
            
            # Increment failure counter
            self.failed_uploads += 1
            
            return False
        
    def handle(self, *args, **options):
        # Add a clear marker at the start of logs to help debugging
        logger.info("="*50)
        logger.info("STARTING COLLECTSTATIC_S3 COMMAND")
        logger.info("="*50)
        
        self.stdout.write(self.style.SUCCESS('Starting S3 static file collection...'))
        
        # Reset counters at start
        self.successful_uploads = 0
        self.failed_uploads = 0
        self.error_details = {}
        self.show_error_details = options.get('show_error_details', True)

        # Verify AWS credentials before proceeding
        if not self._check_aws_credentials():
            raise CommandError("AWS credentials check failed - cannot proceed.")

        # Check if AWS S3 is properly configured
        if not getattr(settings, 'USE_S3', False):
            if not options.get('force_s3', True):
                error_msg = 'AWS S3 is not enabled. Cannot proceed with S3 upload.'
                logger.error(error_msg)
                raise CommandError(error_msg)
            else:
                self.stdout.write(self.style.WARNING('USE_S3 setting is False but proceeding anyway with --force-s3'))

        try:
            # Set preserve_vite at the beginning to avoid attribute error
            self.preserve_vite = options.get('preserve_vite', True)
            
            # Print AWS settings for debugging
            bucket = settings.AWS_STORAGE_BUCKET_NAME
            region = settings.AWS_S3_REGION_NAME
            region = region.split('#')[0].strip() if '#' in region else region
            
            # Important: Ensure ACLs are disabled for Object Ownership "Bucket owner enforced" buckets
            if getattr(settings, 'AWS_DEFAULT_ACL', None) is not None:
                self.stdout.write(self.style.WARNING('Setting AWS_DEFAULT_ACL to empty string - your bucket has ACLs disabled'))
                settings.AWS_DEFAULT_ACL = ''
                
            # For object parameters, don't include ACL at all instead of setting to None
            settings.AWS_OBJECT_PARAMETERS = getattr(settings, 'AWS_OBJECT_PARAMETERS', {})
            if 'ACL' in settings.AWS_OBJECT_PARAMETERS:
                settings.AWS_OBJECT_PARAMETERS.pop('ACL')
            self.stdout.write(self.style.WARNING('Disabled ACL usage for S3 uploads'))
            
            # Test direct S3 connection to bucket
            self.stdout.write('Testing S3 connection...')
            try:
                s3_client = boto3.client(
                    's3',
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                    region_name=region
                )
                
                # Actually test connection with a real API call
                s3_client.list_objects_v2(
                    Bucket=bucket,
                    MaxKeys=1
                )
                
                self.stdout.write(self.style.SUCCESS('✓ S3 connection successful!'))
                logger.info('S3 connection test successful')
                
            except Exception as e:
                error_msg = f"S3 connection test failed: {str(e)}"
                self.stdout.write(self.style.ERROR(f"✗ {error_msg}"))
                logger.error(error_msg)
                if not options.get('force_s3', True):
                    raise CommandError(error_msg)
                else:
                    self.stdout.write(self.style.WARNING('Continuing despite S3 connection failure due to --force-s3'))
            
            # Print current storage class for debugging
            storage_class = settings.STATICFILES_STORAGE
            self.stdout.write(f'Static Storage Class (from settings): {storage_class}')
            
            # Force S3 backend for this run
            if options.get('force_s3', True):
                # Override storage settings temporarily for this command run
                original_storage_setting = settings.STATICFILES_STORAGE
                settings.STATICFILES_STORAGE = 'skunkmonkey.custom_storages.StaticStorage'
                self.stdout.write(self.style.WARNING(f'Forcing storage backend to: {settings.STATICFILES_STORAGE}'))
                
                # Apply our custom storage backend
                self.set_options(**options)
                
                # Verify we're using the right backend
                if not isinstance(self.storage, StaticStorage):
                    self.stdout.write(self.style.ERROR('Failed to apply StaticStorage backend!'))
                else:
                    self.stdout.write(self.style.SUCCESS(f'Using {self.storage.__class__.__name__} for file uploads'))
            
            # Create a Vite file preserver if enabled
            vite_preserver = None
            if self.preserve_vite:
                vite_preserver = VitePreservingCollector(self)
                vite_preserver.preserve_vite_files()
            
            # Set verbosity and other options
            options['verbosity'] = 2
            options['clear'] = True  # Always clear to force full upload
            options['no_input'] = True  # Don't prompt for confirmation
            options['interactive'] = False  # Ensure no interactive prompts
            
            # CRITICAL: Force yes to avoid interactive prompt that hangs in Heroku
            self.interactive = False
            
            # Log that we're about to call the parent implementation
            logger.info("Calling Django's collectstatic command with S3 storage backend")
            
            # Call the standard collectstatic command
            super().handle(*args, **options)
            
            # Restore Vite files if needed
            if vite_preserver:
                vite_preserver.restore_vite_files()
            
            # Display summary statistics with colored output
            total_files = self.successful_uploads + self.failed_uploads
            summary = (
                f"\nStatic file collection summary:\n"
                f"  {self.style.SUCCESS('✓ Successful uploads:')} {self.successful_uploads}\n"
                f"  {self.style.ERROR('✗ Failed uploads:')} {self.failed_uploads}\n"
                f"  Total files processed: {total_files}"
            )
            
            self.stdout.write(summary)
            logger.info(f"S3 upload summary: {self.successful_uploads} successful, {self.failed_uploads} failed")
            
            # Display detailed error information if requested and if there are errors
            if self.show_error_details and self.error_details:
                self._show_error_summary()
                
            success_msg = 'Static file collection completed'
            if self.failed_uploads == 0:
                success_msg = 'Successfully collected all static files to S3'
                self.stdout.write(self.style.SUCCESS(success_msg))
            else:
                warning_msg = f'Completed with {self.failed_uploads} failed uploads'
                self.stdout.write(self.style.WARNING(warning_msg))
            
            logger.info(success_msg)
            
            # Add a clear marker at the end of logs
            logger.info("="*50)
            logger.info("COMPLETED COLLECTSTATIC_S3 COMMAND")
            logger.info("="*50)
            
            # Restore original storage setting if we modified it
            if options.get('force_s3', True) and 'original_storage_setting' in locals():
                settings.STATICFILES_STORAGE = original_storage_setting
            
        except Exception as e:
            logger.exception('Error in collectstatic_s3 command')
            error_msg = f'Error: {str(e)}'
            self.stdout.write(self.style.ERROR(error_msg))
            
            # Still show summary even if exception occurred
            if hasattr(self, 'successful_uploads') and hasattr(self, 'failed_uploads'):
                total_files = self.successful_uploads + self.failed_uploads
                summary = (
                    f"\nStatic file collection summary (incomplete due to error):\n"
                    f"  {self.style.SUCCESS('✓ Successful uploads:')} {self.successful_uploads}\n"
                    f"  {self.style.ERROR('✗ Failed uploads:')} {self.failed_uploads}\n"
                    f"  Total files processed: {total_files}"
                )
                self.stdout.write(summary)
                
                # Display detailed error information if requested and if there are errors
                if self.show_error_details and self.error_details:
                    self._show_error_summary()
            
            # Add a clear marker for errors
            logger.error("="*50)
            logger.error("COLLECTSTATIC_S3 COMMAND FAILED")
            logger.error("="*50)
            
            raise CommandError(f'Failed to collect static files: {str(e)}')
    
    def _show_error_summary(self):
        """Display a summary of errors encountered during upload"""
        if not self.error_details:
            return
            
        self.stdout.write(self.style.WARNING("\nError details:"))
        
        # Group errors by type to avoid repetition
        error_types = {}
        for file_path, error_msg in self.error_details.items():
            if error_msg not in error_types:
                error_types[error_msg] = []
            error_types[error_msg].append(file_path)
        
        # Print the first few errors of each type
        for error_msg, file_paths in error_types.items():
            count = len(file_paths)
            self.stdout.write(self.style.ERROR(f"  • {error_msg}"))
            self.stdout.write(f"    Affected {count} file(s), including:")
            for i, path in enumerate(file_paths[:5]):
                self.stdout.write(f"    - {path}")
            if count > 5:
                self.stdout.write(f"    - ... and {count - 5} more files")
    
    def _check_aws_credentials(self):
        """Verify AWS credentials are valid before starting uploads"""
        try:
            # Check if required AWS settings are configured
            required_settings = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 
                                'AWS_STORAGE_BUCKET_NAME', 'AWS_S3_REGION_NAME']
            
            missing = [s for s in required_settings if not hasattr(settings, s) or not getattr(settings, s)]
            
            if missing:
                missing_str = ', '.join(missing)
                error_msg = f"Missing required AWS settings: {missing_str}"
                self.stdout.write(self.style.ERROR(error_msg))
                return False
            
            self.stdout.write(self.style.WARNING(f"AWS_ACCESS_KEY_ID: {settings.AWS_ACCESS_KEY_ID[:4]}...{settings.AWS_ACCESS_KEY_ID[-4:]}"))
            self.stdout.write(self.style.WARNING(f"AWS_SECRET_ACCESS_KEY: {settings.AWS_SECRET_ACCESS_KEY[:4]}...{settings.AWS_SECRET_ACCESS_KEY[-4:]}"))
            self.stdout.write(self.style.WARNING(f"AWS_STORAGE_BUCKET_NAME: {settings.AWS_STORAGE_BUCKET_NAME}"))
            
            region = settings.AWS_S3_REGION_NAME
            if '#' in region:
                cleaned_region = region.split('#')[0].strip()
                self.stdout.write(self.style.WARNING(f"AWS_S3_REGION_NAME: {region} -> {cleaned_region}"))
            else:
                self.stdout.write(self.style.WARNING(f"AWS_S3_REGION_NAME: {region}"))
            
            return True
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"AWS credentials check failed: {str(e)}"))
            return False