"""
Custom management command to force collectstatic with S3 storage
"""
import logging

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from home.force_s3_upload import run_collectstatic_with_s3

logger = logging.getLogger('django')


class Command(BaseCommand):
    help = 'Collect static files directly to S3 with enhanced logging'

    def add_arguments(self, parser):
        parser.add_argument(
            '--no-clear',
            action='store_true',
            help='Do not clear the existing files first',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting S3 static file collection...'))

        # Check if AWS S3 is properly configured
        if not getattr(settings, 'USE_S3', False):
            raise CommandError(
                'AWS S3 is not enabled. Cannot proceed with S3 upload.'
            )

        try:
            clear_files = not options['no_clear']
            self.stdout.write(f'Clear existing files: {clear_files}')

            # Print AWS settings for debugging
            bucket = settings.AWS_STORAGE_BUCKET_NAME
            region = settings.AWS_S3_REGION_NAME
            storage = settings.STATICFILES_STORAGE

            self.stdout.write(f'AWS Bucket: {bucket}')
            self.stdout.write(f'AWS Region: {region}')
            self.stdout.write(f'Static Storage: {storage}')

            # Extra debugging for storage class
            from importlib import import_module
            module_path, class_name = storage.rsplit('.', 1)
            try:
                module = import_module(module_path)
                storage_class = getattr(module, class_name)
                self.stdout.write(f'Storage class: {storage_class}')
                # Create an instance to verify it works
                storage_instance = storage_class()
                location = storage_instance.location
                self.stdout.write(f'Storage location: {location}')
            except Exception as e:
                error_msg = f'Error importing storage class: {str(e)}'
                self.stdout.write(self.style.ERROR(error_msg))

            # Run the collectstatic process with enhanced logging
            success = run_collectstatic_with_s3(clear=clear_files)

            if success:
                success_msg = 'Successfully collected static files to S3'
                self.stdout.write(self.style.SUCCESS(success_msg))
            else:
                failure_msg = 'Failed to collect static files to S3'
                self.stdout.write(self.style.ERROR(failure_msg))

        except Exception as e:
            logger.exception('Error in collectstatic_s3 command')
            error_msg = f'Error: {str(e)}'
            self.stdout.write(self.style.ERROR(error_msg))
            raise CommandError(f'Failed to collect static files: {str(e)}')
