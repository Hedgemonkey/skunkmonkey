# DirectAdmin Deployment Guide for SkunkMonkey

This guide covers the steps needed to deploy your Django project to a DirectAdmin hosting environment.

## 1. Preparation - Local Environment

Before uploading to DirectAdmin, clean up your local project:

```bash
# Make scripts executable
chmod +x cleanup_heroku.sh cleanup_packages.sh

# Remove Heroku-specific files
./cleanup_heroku.sh

# Consolidate package files
./cleanup_packages.sh

# Remove package.prod.json after confirming package.json is correct
rm package.prod.json package.prod.json.bak

# Collect static files
python manage.py collectstatic --noinput
```

## 2. Prepare Django Settings for Production

Ensure your `settings.py` is configured properly for production:

- Set `DEBUG = False`
- Add your domain to `ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']`
- Configure a production database (MySQL or PostgreSQL)
- Set up proper email configuration
- Configure static and media file paths

## 3. Upload Files to DirectAdmin

You'll need to upload your project files to your DirectAdmin hosting:

1. Connect to your hosting via FTP/SFTP
2. Upload all files to a directory within `public_html/` (e.g., `public_html/skunkmonkey/`)
3. Make sure all directories have appropriate permissions:
   ```bash
   find /home/username/domains/yourdomain.com/public_html/skunkmonkey -type d -exec chmod 755 {} \;
   find /home/username/domains/yourdomain.com/public_html/skunkmonkey -type f -exec chmod 644 {} \;
   ```

## 4. Set Up Python Environment

Create a Python virtual environment on your DirectAdmin server:

```bash
# SSH into your server
ssh username@yourdomain.com

# Navigate to your domain directory
cd ~/domains/yourdomain.com/

# Create a virtual environment
python3 -m venv venv

# Activate the environment
source venv/bin/activate

# Install dependencies
cd public_html/skunkmonkey
pip install -r requirements.txt
```

## 5. Configure Apache

1. Go to DirectAdmin control panel
2. Navigate to the "Custom HTTPD Configurations" section
3. Copy the content from `apache_directadmin.conf` in your project
4. Paste it into the configuration field, replacing:
   - `username` with your DirectAdmin username
   - `yourdomain.com` with your actual domain
   - Adjust paths as needed for your specific setup

## 6. Set Up Database

1. Create a MySQL or PostgreSQL database in DirectAdmin
2. Update your Django settings to use this database:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',  # or postgresql_psycopg2
        'NAME': 'your_database_name',
        'USER': 'your_database_user',
        'PASSWORD': 'your_database_password',
        'HOST': 'localhost',
        'PORT': '',
    }
}
```

3. Run Django migrations:
```bash
python manage.py migrate
```

## 7. Configure Static and Media Files

1. Ensure your static files are collected:
```bash
python manage.py collectstatic --noinput
```

2. Make sure the Apache configuration correctly points to your static and media directories
3. Update your settings.py to use the correct URLs:
```python
STATIC_URL = '/static/'
STATIC_ROOT = '/home/username/domains/yourdomain.com/public_html/skunkmonkey/staticfiles/'
MEDIA_URL = '/media/'
MEDIA_ROOT = '/home/username/domains/yourdomain.com/public_html/skunkmonkey/media/'
```

## 8. Build Frontend Assets

If using Vite, build your frontend assets:

```bash
# Install npm dependencies
npm install

# Build frontend assets
npm run build
```

## 9. Set Up HTTPS (recommended)

1. In DirectAdmin, navigate to SSL Certificates
2. Set up a Let's Encrypt certificate for your domain
3. Ensure your Django settings are configured for HTTPS:
```python
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```

## 10. Restart Services

After making configuration changes, restart the web server:
```bash
# Through DirectAdmin control panel or via SSH if you have permission
sudo service httpd restart  # or apache2
```

## Troubleshooting

If you encounter issues:

1. Check Apache error logs in DirectAdmin control panel
2. Verify permissions on files and directories
3. Ensure your virtual environment is activated when running Django commands
4. Check database connectivity
5. Review your application logs for Python/Django errors

---

Remember to replace all placeholders (username, yourdomain.com, etc.) with your actual values before implementing these configurations.
