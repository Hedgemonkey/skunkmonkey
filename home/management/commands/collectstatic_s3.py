"""
Custom management command to force collectstatic with S3 storage
"""
import logging
import os

from django.contrib.staticfiles.management.commands.collectstatic import (
    Command as CollectstaticCommand
)
from django.core.management.base import CommandError
from django.conf import settings

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
                    self.command.stdout.write(
                        f"Preserved {filename} before collectstatic"
                    )
        except Exception as e:
            self.command.stdout.write(
                self.command.style.WARNING(
                    f"Error preserving Vite files: {str(e)}"
                )
            )
        
    def restore_vite_files(self):
        """Restore important Vite files after collectstatic runs"""
        try:
            static_root = settings.STATIC_ROOT
            for filename, content in self.preserved_paths.items():
                filepath = os.path.join(static_root, filename)
                with open(filepath, 'wb') as f:
                    f.write(content)
                self.command.stdout.write(
                    self.command.style.SUCCESS(
                        f"Restored {filename} after collectstatic"
                    )
                )
        except Exception as e:
            self.command.stdout.write(
                self.command.style.ERROR(
                    f"Error restoring Vite files: {str(e)}"
                )
            )


class Command(CollectstaticCommand):
    help = 'Collect static files directly to S3 with enhanced logging'
    
    # Initialize the attribute here to prevent 'no attribute' error
    preserve_vite = True

    def add_arguments(self, parser):
        super().add_arguments(parser)
        parser.add_argument(
            '--preserve-vite',
            action='store_true',
            default=True,
            help='Preserve Vite manifest files during collection',
        )
        
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting S3 static file collection...'))

        # Check if AWS S3 is properly configured
        if not getattr(settings, 'USE_S3', False):
            raise CommandError(
                'AWS S3 is not enabled. Cannot proceed with S3 upload.'
            )

        try:
            # Set preserve_vite at the beginning to avoid attribute error
            self.preserve_vite = options.get('preserve_vite', True)
            
            # Print AWS settings for debugging
            bucket = settings.AWS_STORAGE_BUCKET_NAME
            region = settings.AWS_S3_REGION_NAME
            storage = settings.STATICFILES_STORAGE

            self.stdout.write(f'AWS Bucket: {bucket}')
            self.stdout.write(f'AWS Region: {region}')
            self.stdout.write(f'Static Storage: {storage}')
            
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
            
            # Call the standard collectstatic command
            super().handle(*args, **options)
            
            # Restore Vite files if needed
            if vite_preserver:
                vite_preserver.restore_vite_files()
                
            self.stdout.write(
                self.style.SUCCESS(
                    'Successfully collected static files to S3'
                )
            )
            
        except Exception as e:
            logger.exception('Error in collectstatic_s3 command')
            error_msg = f'Error: {str(e)}'
            self.stdout.write(self.style.ERROR(error_msg))
            raise CommandError(f'Failed to collect static files: {str(e)}')