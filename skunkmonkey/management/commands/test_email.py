"""
Django management command to test email configuration.
"""
import os
import traceback

from django.conf import settings
from django.core.mail import send_mail
from django.core.management.base import BaseCommand
from django.utils import timezone


class Command(BaseCommand):
    help = 'Test email configuration by sending a test email'

    def add_arguments(self, parser):
        parser.add_argument(
            '--to',
            type=str,
            default='hedgemonkey@gmail.com',
            help=(
                'Email address to send test email to '
                '(default: hedgemonkey@gmail.com)'
            )
        )
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Show detailed email configuration information'
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('=== Django Email Configuration Test ===')
        )

        # Show current email configuration
        if options['verbose']:
            self.stdout.write('\n--- Email Configuration ---')
            self.stdout.write(f'EMAIL_BACKEND: {settings.EMAIL_BACKEND}')

            if hasattr(settings, 'EMAIL_HOST'):
                self.stdout.write(f'EMAIL_HOST: {settings.EMAIL_HOST}')
                self.stdout.write(f'EMAIL_PORT: {settings.EMAIL_PORT}')
                self.stdout.write(
                    f'EMAIL_USE_TLS: '
                    f'{getattr(settings, "EMAIL_USE_TLS", "Not set")}'
                )
                self.stdout.write(
                    f'EMAIL_HOST_USER: '
                    f'{getattr(settings, "EMAIL_HOST_USER", "Not set")}'
                )
                email_host_password = getattr(
                    settings, "EMAIL_HOST_PASSWORD", ""
                )
                self.stdout.write(
                    f'EMAIL_HOST_PASSWORD: '
                    f'{"*" * len(email_host_password) if email_host_password else "Not set"}'  # noqa: E501
                )
                self.stdout.write(
                    f'DEFAULT_FROM_EMAIL: '
                    f'{getattr(settings, "DEFAULT_FROM_EMAIL", "Not set")}'
                )
            else:
                self.stdout.write(
                    'SMTP settings not configured - using console backend'
                )

        to_email = options['to']
        timestamp = timezone.now().strftime('%Y-%m-%d %H:%M:%S UTC')

        # Test email content
        subject = f'SkunkMonkey Email Test - {timestamp}'
        message = (
            "\nThis is a test email from SkunkMonkey Django application.\n\n"
            "Configuration Details:\n"
            f"- Sent at: {timestamp}\n"
            f"- Email Backend: {settings.EMAIL_BACKEND}\n"
            f"- From: "
            f"{getattr(settings, 'DEFAULT_FROM_EMAIL', 'Not configured')}\n"
            f"- To: {to_email}\n\n"
            "If you received this email, your Django email configuration is "
            "working.\n"
            "Environment: "
            f"{'Production (Heroku)' if 'DATABASE_URL' in os.environ else 'Development'}\n"  # noqa: E501
            f"Site: "
            f"{getattr(settings, 'SITE_URL', 'Not configured')}\n"
        )

        from_email = getattr(
            settings, 'DEFAULT_FROM_EMAIL', 'noreply@skunkmonkey.co.uk'
        )

        self.stdout.write('\n--- Sending Test Email ---')
        self.stdout.write(f'From: {from_email}')
        self.stdout.write(f'To: {to_email}')
        self.stdout.write(f'Subject: {subject}')

        try:
            # Send the test email
            result = send_mail(
                subject=subject,
                message=message,
                from_email=from_email,
                recipient_list=[to_email],
                fail_silently=False,
            )

            if result == 1:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'\n✅ SUCCESS: Test email sent successfully to '
                        f'{to_email}'
                    )
                )
                self.stdout.write(
                    'Check your inbox (and spam folder) for the test email.'
                )

                console_backend = (
                    'django.core.mail.backends.console.EmailBackend'
                )
                if settings.EMAIL_BACKEND == console_backend:
                    self.stdout.write(
                        self.style.WARNING(
                            '\nNOTE: Using console backend - email content '
                            'should appear above.'
                        )
                    )
            else:
                self.stdout.write(
                    self.style.ERROR(
                        f'\n❌ FAILED: send_mail returned {result} (expected 1)'
                    )
                )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR('\n❌ ERROR: Failed to send email')
            )
            self.stdout.write(f'Error: {str(e)}')

            if options['verbose']:
                self.stdout.write('\n--- Full Error Traceback ---')
                self.stdout.write(traceback.format_exc())

            # Provide troubleshooting suggestions
            self.stdout.write('\n--- Troubleshooting Suggestions ---')
            if 'Authentication' in str(e) or 'login' in str(e).lower():
                self.stdout.write(
                    '• Check EMAIL_HOST_USER and EMAIL_HOST_PASSWORD'
                )
                self.stdout.write('• Verify email account credentials')
            elif 'Connection' in str(e) or 'timeout' in str(e).lower():
                self.stdout.write('• Check EMAIL_HOST and EMAIL_PORT settings')
                self.stdout.write('• Verify network connectivity')
                self.stdout.write('• Check if TLS/SSL settings are correct')
            elif 'Permission' in str(e) or 'denied' in str(e).lower():
                self.stdout.write(
                    '• Check if the email account has SMTP permissions'
                )
                self.stdout.write(
                    '• Verify "Allow less secure apps" if using Gmail'
                )
            else:
                self.stdout.write('• Check all email configuration variables')
                self.stdout.write('• Verify SMTP server settings')

        self.stdout.write('\n=== Email Test Complete ===')
