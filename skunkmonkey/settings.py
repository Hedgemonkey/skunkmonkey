"""
Django settings for skunkmonkey project.

Generated by 'django-admin startproject' using Django 5.1.6.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

from pathlib import Path
import os
from dotenv import load_dotenv
import dj_database_url
from django.urls import reverse
import logging

# Load environment variables from .env file

load_dotenv()


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = 'DEVELOPMENT' in os.environ


ALLOWED_HOSTS = [
                    'skunk.devel.hedge-monkey.co.uk',
                    'localhost',
                    '127.0.0.1',
                    '*'
                    ]


# Application definition

INSTALLED_APPS = [
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'crispy_forms',
    'crispy_bootstrap5',
    'home',
    'users.apps.UsersConfig',
    'products',
    'shop',  # Add the new shop app
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'shop.middleware.CartMiddleware',  # Add the shop cart middleware
]

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
            ],
        },
    },
]

# Configure crispy_forms template pack
CRISPY_ALLOWED_TEMPLATE_PACKS = "bootstrap5"

CRISPY_TEMPLATE_PACK = "bootstrap5"

WSGI_APPLICATION = 'skunkmonkey.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

if 'DATABASE_URL' in os.environ:
    DATABASES = {
        'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
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
LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/'
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
ACCOUNT_ACTIVATION_URL = lambda: reverse('account_confirm_email') + '?code='
ACCOUNT_ADAPTER = 'users.adapters.CustomAccountAdapter' # Custom adapter to handle if email not verified
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
    EMAIL_HOST = os.environ.get('EMAIL_HOST')  # From environemnt variable
    EMAIL_PORT = os.environ.get('EMAIL_PORT', 587)  # Or the correct port for TLS/SSL
    EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', True)  # Or EMAIL_USE_SSL = True if your server uses SSL
    EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')  # From environemnt variable
    EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')  # From environemnt variable
    DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL')  # From environemnt variable


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# if os.environ.get("SKUNKMONKEY_VPS_HOST", False):
#   STATIC_URL = 'http://devel.skunkmonkey.co.uk/static/'
#   MEDIA_URL = 'http://devel.skunkmonkey.co.uk/media/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Logging configuration

if 'DEVELOPMENT' in os.environ:
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,  # Important: keep this False
        'formatters': {
            'verbose': {
                'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
                'style': '{',  # Use str.format() style formatting
            },
            'simple': {
                'format': '{levelname} {message}',
                'style': '{',
            },
        },
        'handlers': {
            'file': {
                'level': 'DEBUG',
                'class': 'logging.FileHandler',
                'filename': os.path.join(BASE_DIR, 'skunkmonkey.log'), # Log file path
                'formatter': 'verbose',  # Use the 'verbose' formatter
            },
            'console': {  # Add a console handler for development
                'level': 'DEBUG',  # Adjust as needed
                'class': 'logging.StreamHandler',
                'formatter': 'simple',
            },

        },
        'loggers': {
            '': {  # Root logger (catch-all if no other logger matches)
                'handlers': ['file', 'console'], #  Output to both file and console
                'level': 'DEBUG',  # Adjust log level as needed
            },
            'django.request': {  # Log HTTP requests (optional)
                'handlers': ['file', 'console'], 
                'level': 'INFO',
                'propagate': False,  # Prevents these messages from being logged twice
            }


        },
    }
else:
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,  # Important: keep this False
        'formatters': {
            'verbose': {
                'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
                'style': '{',  # Use str.format() style formatting
            },
            'simple': {
                'format': '{levelname} {message}',
                'style': '{',
            },
        },
        'handlers': {
            'file': {
                'level': 'DEBUG',
                'class': 'logging.FileHandler',
                'filename': os.path.join(BASE_DIR, 'skunkmonkey-apache.log'), # Log file path
                'formatter': 'verbose',  # Use the 'verbose' formatter
            },
            'console': {  # Add a console handler for development
                'level': 'DEBUG',  # Adjust as needed
                'class': 'logging.StreamHandler',
                'formatter': 'simple',
            },

        },
        'loggers': {
            '': {  # Root logger (catch-all if no other logger matches)
                'handlers': ['file', 'console'], #  Output to both file and console
                'level': 'DEBUG',  # Adjust log level as needed
            },
            'django.request': {  # Log HTTP requests (optional)
                'handlers': ['file', 'console'], 
                'level': 'INFO',
                'propagate': False,  # Prevents these messages from being logged twice
            }
        },
    }
