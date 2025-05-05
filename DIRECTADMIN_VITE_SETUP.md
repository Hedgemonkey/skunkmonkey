# Setting Up Vite with Django on DirectAdmin

This document outlines the steps to properly configure Vite with Django in a DirectAdmin hosting environment, specifically for deployment at `skunkmonkey.co.uk/dev/`.

## 1. Directory Structure

Ensure your project follows this structure:
```
/home/hedgemonkey/domains/skunkmonkey.co.uk/
├── dev/                # Django project root
│   ├── manage.py
│   ├── skunkmonkey/      # Django project files
│   ├── static/           # Static files directory
│   │   └── main.js       # Vite entry point
│   ├── staticfiles/      # Collected static files
│   ├── package.json      # Node.js package file
│   └── vite.config.js    # Vite configuration
└── public_html/
    └── dev/            # Web-accessible directory
        ├── passenger_wsgi.py
        ├── static/       # Symlink to dev/staticfiles
        └── media/        # Symlink to dev/media
```

## 2. Configure `vite.config.js`

Update your Vite configuration to work with the subdirectory setup:

```javascript
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/dev/static/',  // Important: Set base to match your subdirectory
  build: {
    outDir: resolve(__dirname, 'staticfiles'),
    manifest: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'static/main.js')
      }
    }
  },
  server: {
    origin: 'http://localhost:5173'
  }
})
```

## 3. Update `package.json` Scripts

Ensure your package.json has the appropriate scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    // Your dependencies
  },
  "devDependencies": {
    "vite": "^4.0.0"
    // Other dev dependencies
  }
}
```

## 4. Setting up Node.js in DirectAdmin

1. Log in to DirectAdmin
2. Navigate to "Extra Features" → "Node.js Selector"
3. Create a new Node.js application:
   - Application Path: `/dev`
   - Application Root: `/home/hedgemonkey/domains/skunkmonkey.co.uk/dev`
   - Node.js Version: (Choose a recent LTS version)
   - Application Mode: Production
   - Application Entry Point: `static/main.js`

## 5. Building Vite Assets

After setting up the Node.js app, SSH into your server and run:

```bash
# Navigate to your project directory
cd /home/hedgemonkey/domains/skunkmonkey.co.uk/dev

# Install dependencies
npm install

# Build for production
npm run build
```

## 6. Verify Django Vite Configuration

Ensure your Django settings include this configuration:

```python
# settings.py

# Subdirectory configuration
FORCE_SCRIPT_NAME = '/dev'

# Static URL with subdirectory prefix
STATIC_URL = '/dev/static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Django Vite configuration
DJANGO_VITE_ASSETS_PATH = BASE_DIR / 'staticfiles'
DJANGO_VITE_DEV_MODE = DEBUG
DJANGO_VITE_DEV_SERVER_URL = "http://localhost:5173/" if DEBUG else ""

DJANGO_VITE_CONFIGS = {
    'default': {
        'entry_points': ['main'],
    },
}

DJANGO_VITE = {
    "default": {
        "dev_mode": DEBUG,
        "dev_server_port": "5173",
        "dev_server_host": "localhost" if DEBUG else "",
        "static_url_prefix": STATIC_URL,
    }
}
```

## 7. Load Vite Assets in Templates

In your base template, load Vite assets:

```html
{% load django_vite %}

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{% block title %}SkunkMonkey{% endblock %}</title>

    {% vite_hmr_client %}
    {% vite_asset 'main' %}

    {% block extra_css %}{% endblock %}
</head>
<body>
    {% block content %}{% endblock %}

    {% block extra_js %}{% endblock %}
</body>
</html>
```

## 8. Final Steps

1. Collect static files to ensure all Django static files are properly gathered:
   ```bash
   python manage.py collectstatic --noinput
   ```

2. Restart your Python application in DirectAdmin

3. Test your site by visiting `https://skunkmonkey.co.uk/dev/`

## Troubleshooting

If you encounter issues with static files:

1. Check that symlinks are correctly set up:
   ```bash
   ln -sf ~/domains/skunkmonkey.co.uk/dev/staticfiles ~/domains/skunkmonkey.co.uk/public_html/dev/static
   ```

2. Verify file permissions:
   ```bash
   chmod -R 755 ~/domains/skunkmonkey.co.uk/dev/staticfiles
   ```

3. Check browser console for 404 errors on static files and adjust paths if needed

4. Inspect the generated Vite manifest in `staticfiles/manifest.json` to ensure paths are correct
