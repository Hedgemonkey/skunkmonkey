"""
Django settings for skunkmonkey project.

Generated by 'django-admin startproject' using Django 5.1.6.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

import os
import shutil
from pathlib import Path

from django.urls import reverse

import dj_database_url
# Fix import to use environ instead of django_environ
from environ import Env  # noqa

# Initialize environment variables
env = Env()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Only load .env file if not on Heroku (determined by checking for DATABASE_URL)
if 'DATABASE_URL' not in os.environ:
    # Load environment variables from .env file
    env.read_env(os.path.join(BASE_DIR, '.env'))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env(
    'DJANGO_SECRET_KEY',
    default='f40naw8ut8j19m#ubbr3gzw^=uu0xlz%pl-+%ifjgq#is%96o87mb9!rsb^6+1^-z-v=6^-zr@l!du#f@zkhxk5ha1cb')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env.bool('DEBUG', default=False)  # Get DEBUG from environment variable, default to False in production

# Determine if we're running on Heroku
ON_HEROKU = 'DATABASE_URL' in os.environ

ALLOWED_HOSTS = [
    'skunk.devel.hedge-monkey.co.uk',
    'localhost',
    '127.0.0.1',
    'hedgemonkey.ddns.net:8000',
    'hedgemonkey.ddns.net',
    'skunkmonkey.herokuapp.com',
    '.herokuapp.com',
    'devel.skunkmonkey.co.uk',
    'skunkmonkey.co.uk',
    'www.skunkmonkey.co.uk',
]

# Subdirectory configuration - only use FORCE_SCRIPT_NAME if not on Heroku
if not ON_HEROKU:
    FORCE_SCRIPT_NAME = '/dev'  # Updated from /devel to /dev
else:
    FORCE_SCRIPT_NAME = None  # Don't force script name on Heroku

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Add sites framework required by allauth
    'django.contrib.sites',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'crispy_forms',
    'crispy_bootstrap5',
    'home',
    'users.apps.UsersConfig',
    'products',
    'shop',
    'staff.apps.StaffConfig',
    'djstripe',
    'django_countries',
    # Only include django_vite if not on Heroku
    'skunkmonkey',  # Add this to enable our custom templatetags
]

# Only include django_vite in INSTALLED_APPS if not on Heroku
if not ON_HEROKU:
    INSTALLED_APPS.append('django_vite')

    # Django-Vite configuration - SIMPLIFIED AND FIXED
    DJANGO_VITE_ASSETS_PATH = BASE_DIR / 'staticfiles'
    DJANGO_VITE_DEV_MODE = False
    DJANGO_VITE_DEV_SERVER_URL = ""

    # Create a symlink in the exact location django-vite expects
    manifest_source = os.path.join(BASE_DIR, 'staticfiles', 'manifest.json')
    dev_static_dir = os.path.join(BASE_DIR, 'dev', 'static')
    manifest_target = os.path.join(dev_static_dir, 'manifest.json')

    # Ensure the target directory exists
    os.makedirs(dev_static_dir, exist_ok=True)

    # Copy the manifest file to the exact path django-vite is looking for
    if os.path.exists(manifest_source):
        shutil.copy2(manifest_source, manifest_target)

    # Simplified configuration with clean entry points
    DJANGO_VITE_CONFIGS = {
        'default': {
            'entry_points': ['main'],
        },
    }

    # Use a single, simplified configuration
    DJANGO_VITE = {
        'default': {
            'dev_mode': False,
            'static_url_prefix': '/dev/static/',
        }
    }
else:
    # On Heroku, make sure django_vite is not installed or used
    # This prevents any potential django_vite template tag usage
    import sys
    if 'django_vite' in sys.modules:
        print("WARNING: django_vite module is loaded but shouldn't be used on Heroku")
        del sys.modules['django_vite']

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Add Whitenoise middleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'shop.middleware.ComparisonMiddleware',
    'shop.middleware.CartMiddleware',  # Add the shop cart middleware
    'staff.middleware.StaffProfileMiddleware',  # Add middleware to handle staffprofile
    'csp.middleware.CSPMiddleware',    # Add Content Security Policy middleware
    'skunkmonkey.security_middleware.SecurityHeadersMiddleware',  # Add custom security headers
    'skunkmonkey.middleware.SourceMapIgnoreMiddleware'  # Add custom middleware to handle source map requests
]

# Only include debug middleware in development mode


# Content Security Policy settings
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_BROWSER_XSS_FILTER = True

# Security settings for production
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Only enforce HTTPS redirection in production
if ON_HEROKU:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
else:
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False

# Cookie security settings - apply in all environments
SESSION_COOKIE_HTTPONLY = True  # Prevent XSS attacks on session cookies
CSRF_COOKIE_HTTPONLY = False  # CSRF token needs to be accessible to JavaScript
SESSION_COOKIE_SAMESITE = 'Strict'  # Strict same-site policy for session cookies
CSRF_COOKIE_SAMESITE = 'Lax'  # Lax policy for CSRF (allows some cross-site requests)

# Additional cookie security
SESSION_EXPIRE_AT_BROWSER_CLOSE = False  # Keep sessions across browser sessions
SESSION_COOKIE_AGE = 1209600  # 2 weeks in seconds

# Configure CSP settings with proper production/development separation
CSP_DEFAULT_SRC = ("'self'",)
CSP_STYLE_SRC = ("'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://*.cloudfront.net", "https://cdn.jsdelivr.net")
CSP_IMG_SRC = ("'self'", "data:", "https://*.stripe.com", "https://source.unsplash.com", "https://*.cloudfront.net", "https://*.amazonaws.com")
CSP_FONT_SRC = ("'self'", "data:", "https://fonts.gstatic.com", "https://use.fontawesome.com", "https://cdn.jsdelivr.net", "https://*.cloudfront.net")
CSP_SCRIPT_SRC = ("'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com", "https://cdn.jsdelivr.net", "https://*.cloudfront.net")
CSP_FRAME_SRC = ("'self'", "https://*.stripe.com")
CSP_FRAME_ANCESTORS = ("'self'",)

# Add development-specific CSP sources
if not ON_HEROKU:
    CSP_CONNECT_SRC = ("'self'", "https://*.stripe.com", "http://hedgemonkey.ddns.net:5173", "https://*.amazonaws.com", "https://*.cloudfront.net")
    CSP_SCRIPT_SRC += ("http://hedgemonkey.ddns.net:5173",)
else:
    CSP_CONNECT_SRC = ("'self'", "https://*.stripe.com", "https://*.amazonaws.com", "https://*.cloudfront.net")

# Ensure CSP is reported and enforced
CSP_REPORT_ONLY = False
CSP_INCLUDE_NONCE_IN = ['script-src', 'style-src']

# Crispy Forms settings

ROOT_URLCONF = 'skunkmonkey.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR, 'templates'),
            os.path.join(BASE_DIR, 'templates', 'allauth'),
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.media',
                'shop.context_processors.wishlist_processor',
                'shop.context_processors.comparison_processor',
                'staff.context_processors.unread_notifications',  # Add staff context processor
            ],
        },
    },
]

# Configure crispy_forms template pack
CRISPY_ALLOWED_TEMPLATE_PACKS = "bootstrap5"

# Crispy Forms
CRISPY_TEMPLATE_PACK = "bootstrap5"
CRISPY_FAIL_SILENTLY = not DEBUG

# Additional crispy form settings to fix template variable issues
CRISPY_CLASS_CONVERTERS = {
    'textinput': "form-control",
    'urlinput': "form-control",
    'numberinput': "form-control",
    'emailinput': "form-control",
    'dateinput': "form-control",
    'textarea': "form-control",
    'passwordinput': "form-control",
    'fileinput': "form-control",
}

# Define this variable globally to fix the wrapper_class issue
CRISPY_WRAPPER_CLASS = "mb-3"

# Override the default template pack settings for Bootstrap 5
CRISPY_BOOTSTRAP5_SETTINGS = {
    'wrapper_class': 'mb-3',  # This is the key setting for field wrapper
    'field_class': '',
    'label_class': '',
    'form_group_wrapper_class': '',
    'help_text_inline': True,
    'error_text_inline': True,
    'include_media': True,
}

WSGI_APPLICATION = 'skunkmonkey.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

if 'DATABASE_URL' in os.environ:
    DATABASES = {
        'default': dj_database_url.parse(os.environ['DATABASE_URL'])
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Add authentication backends.
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]


# Allauth Configuration
SITE_ID = 1
# Set login/logout redirect URLs based on environment
if ON_HEROKU:
    LOGIN_REDIRECT_URL = '/'
    LOGOUT_REDIRECT_URL = '/'
else:
    LOGIN_REDIRECT_URL = '/dev/'
    LOGOUT_REDIRECT_URL = '/dev/'

ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = True
ACCOUNT_LOGIN_METHODS = ['email', 'username']
ACCOUNT_LOGIN_ON_EMAIL_CONFIRMATION = True
ACCOUNT_EMAIL_VERIFICATION = 'mandatory'
ACCOUNT_EMAIL_NOTIFICATIONS = True
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_UNIQUE_USERNAME = True
ACCOUNT_LOGOUT_ON_GET = True
ACCOUNT_SESSION_REMEMBER = True
ACCOUNT_SIGNUP_PASSWORD_ENTER_TWICE = True
ACCOUNT_SIGNUP_EMAIL_ENTER_TWICE = True


def ACCOUNT_ACTIVATION_URL():
    return reverse('account_confirm_email') + '?code='


# Custom adapter to handle if email not verified
ACCOUNT_ADAPTER = 'users.adapters.CustomAccountAdapter'
ACCOUNT_LOGIN_ON_PASSWORD_RESET = True
ACCOUNT_REAUTHENTICATION_REQUIRED = True
ACCOUNT_FORMS = {
    'add_email': 'allauth.account.forms.AddEmailForm',
    'change_password': 'allauth.account.forms.ChangePasswordForm',
    'confirm_login_code': 'allauth.account.forms.ConfirmLoginCodeForm',
    'login': 'users.forms.CustomLoginForm',
    'request_login_code': 'allauth.account.forms.RequestLoginCodeForm',
    'reset_password': 'allauth.account.forms.ResetPasswordForm',
    'reset_password_from_key': 'allauth.account.forms.ResetPasswordKeyForm',
    'set_password': 'allauth.account.forms.SetPasswordForm',
    'signup': 'allauth.account.forms.SignupForm',
    'user_token': 'allauth.account.forms.UserTokenForm',
}

# Email settings
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
if 'EMAIL_HOST' in os.environ:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = os.environ['EMAIL_HOST']
    EMAIL_PORT = int(os.environ['EMAIL_PORT'])
    EMAIL_USE_TLS = os.environ['EMAIL_USE_TLS'].lower() == 'true'
    EMAIL_HOST_USER = os.environ['EMAIL_HOST_USER']
    EMAIL_HOST_PASSWORD = os.environ['EMAIL_HOST_PASSWORD']
    DEFAULT_FROM_EMAIL = os.environ['DEFAULT_FROM_EMAIL']
    # Add additional console backend settings if needed

# Configure Django to log all email-related actions
if DEBUG:
    EMAIL_DEBUG = True

# Add site URL and name settings for email templates
SITE_URL = env('SITE_URL', default='http://hedgemonkey.ddns.net:8000')
SITE_NAME = env('SITE_NAME', default='SkunkMonkey')
CONTACT_EMAIL = env('CONTACT_EMAIL', default=DEFAULT_FROM_EMAIL)

# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

# Set static and media URLs based on environment
if ON_HEROKU:
    STATIC_URL = '/static/'
    MEDIA_URL = '/media/'
else:
    STATIC_URL = '/dev/static/'  # Development URL with /dev prefix
    MEDIA_URL = '/dev/media/'    # Development URL with /dev prefix

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_LOCATION = 'static'  # Define static files location for S3

# Media files - local settings that will be overridden if AWS is configured
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIAFILES_LOCATION = 'media'

# Add storages to installed apps
INSTALLED_APPS += [
    'storages',
]

# Define default storage backends - these will be used if USE_S3 is True
DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'

# Use Whitenoise for static files on Heroku, otherwise use default storage
if ON_HEROKU:
    # Use StaticFilesStorage instead of CompressedStaticFilesStorage to avoid MIME type issues
    # This helps prevent issues with file naming conflicts and MIME types in Vite-generated assets
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'

    # Add MIME type hints for WhiteNoise to properly serve CSS and JS files
    WHITENOISE_MIMETYPES = {
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.html': 'text/html',
        '.txt': 'text/plain',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
    }
else:
    STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

    # Django 4.2+ STORAGES setting for local storage
    STORAGES = {
        'default': {
            'BACKEND': 'django.core.files.storage.FileSystemStorage',
        },
        'staticfiles': {
            'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage',
        },
    }

# Use AWS settings if configured - but keep static files local for direct asset system
# Check both USE_S3_FOR_MEDIA (new) and USE_S3 (legacy) for backward compatibility
use_s3_for_media = (
    env.bool('USE_S3_FOR_MEDIA', default=False)
    or os.environ.get('USE_S3_FOR_MEDIA') == 'True'
    or os.environ.get('USE_S3') == 'True'  # Backward compatibility
)

if use_s3_for_media:
    # Import AWS settings
    from .aws import *

    # Override storage backends for MEDIA files only (legacy settings)
    DEFAULT_FILE_STORAGE = 'skunkmonkey.custom_storages.MediaStorage'
    # Keep STATICFILES_STORAGE as Whitenoise for direct asset system to work

    # Django 4.2+ STORAGES setting - only use S3 for media files
    STORAGES = {
        'default': {
            'BACKEND': 'skunkmonkey.custom_storages.MediaStorage',
        },
        'staticfiles': {
            'BACKEND': 'whitenoise.storage.CompressedStaticFilesStorage' if ON_HEROKU else 'django.contrib.staticfiles.storage.StaticFilesStorage',
        },
    }

    # If CloudFront is configured, use it for media URLs
    if AWS_S3_CUSTOM_DOMAIN:
        MEDIA_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/{MEDIAFILES_LOCATION}/"

# if os.environ.get("SKUNKMONKEY_VPS_HOST", False):
#   STATIC_URL = 'http://devel.skunkmonkey.co.uk/static/'
#   MEDIA_URL = 'http://devel.skunkmonkey.co.uk/media/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# dj-stripe configuration - Modern approach using database-managed API keys
# API keys are managed through Django admin interface, not environment variables
STRIPE_LIVE_MODE = env.bool('STRIPE_LIVE_MODE', default=False)
DJSTRIPE_WEBHOOK_SECRET = env('DJSTRIPE_WEBHOOK_SECRET', default='')
DJSTRIPE_FOREIGN_KEY_TO_FIELD = "id"
DJSTRIPE_USE_NATIVE_JSONFIELD = True
DJSTRIPE_WEBHOOK_VALIDATION = "verify_signature"

# Application-specific Stripe settings
STRIPE_CURRENCY = 'gbp'  # British Pound as default currency
STRIPE_API_VERSION = "2023-10-16"

# Enhanced logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'detailed': {
            'format': '{levelname} {asctime} {name} {module} - {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'debug.log'),
            'maxBytes': 1024 * 1024 * 5,  # 5 MB
            'backupCount': 5,
            'formatter': 'detailed',
        },
        'auth_file': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'auth_debug.log'),
            'maxBytes': 1024 * 1024 * 5,  # 5 MB
            'backupCount': 5,
            'formatter': 'detailed',
        },
        'error_file': {
            'level': 'WARNING',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'error.log'),
            'maxBytes': 1024 * 1024 * 5,  # 5 MB
            'backupCount': 5,
            'formatter': 'detailed',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': True,
        },
        'django.request': {
            'handlers': ['error_file'],
            'level': 'WARNING',
            'propagate': True,
        },
        'staff': {
            'handlers': ['console', 'file', 'auth_file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'auth': {
            'handlers': ['console', 'auth_file'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

# Make sure log directories exist
os.makedirs(os.path.join(BASE_DIR, 'logs'), exist_ok=True)
