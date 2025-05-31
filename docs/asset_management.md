# SkunkMonkey Asset Management System

This document explains how SkunkMonkey manages frontend assets (JavaScript and CSS) for optimal organization and performance.

## Directory Structure

Frontend assets are organized in a hierarchical structure to ensure consistency and maintainability:

```
static/
├── js/
│   ├── core/        # Core application JS
│   ├── users/       # User-related features
│   ├── shop/        # Shopping and catalog features
│   ├── staff/       # Admin/staff functionality
│   ├── products/    # Product management
│   ├── common/      # Shared functionality
│   └── chunks/      # Code chunks and vendor libraries
└── css/
    ├── core/        # Core application styles
    ├── users/       # User-related styles
    ├── shop/        # Shopping and catalog styles
    ├── staff/       # Admin/staff styles
    ├── products/    # Product management styles
    ├── common/      # Shared styles
    └── chunks/      # Vendor CSS
```

## Asset Loading System

The project uses a Vite-based build system with a robust mechanism for loading assets:

### Direct Assets Template Tag

The primary way to load assets is using the `direct_asset` template tag:

```html
{% load direct_assets %}

{% block extra_css %}
    {% direct_asset 'profile' %}
{% endblock %}
```

This will automatically find and include both JS and CSS assets for the specified module using an enhanced asset finding algorithm that can:

1. Match exact name attributes
2. Handle normalized name variations (e.g., kebab-case vs camelCase)
3. Find assets by file path segments
4. Match by module path patterns

### Debug Manifest Tag

If assets aren't loading properly, use the debug template tag to see what's available:

```html
{% load direct_assets %}
{% debug_manifest %}
```

This will show all available assets and their configurations.

## Asset Naming Conventions

To ensure consistency and reliability:

1. Use kebab-case for filenames in the source code (e.g., `profile-image.js`)
2. Use camelCase for asset names in Vite configuration (e.g., `profileImage`)
3. Keep asset names consistent with their corresponding source files
4. Group related functionality in appropriate module directories

## Adding New Assets

When adding new assets to the application:

1. Place source files in the appropriate directory under `frontend/src/`
2. Add entry point configuration in `frontend/vite.config.js`
3. Build the assets with `npm run build`
4. Use the appropriate template tag to load the asset

## Optimizations

The asset system implements several optimizations:

1. **Code Splitting**: Common code is automatically extracted into shared chunks
2. **Module Organization**: Assets are grouped by module for better caching
3. **Flexible Matching**: The asset loader can find assets even with different naming conventions
4. **Dependency Management**: Related assets are loaded together automatically

## Best Practices

1. Always include assets in the appropriate template block (`extra_css`, `extra_js`, or `postloadjs`)
2. Keep module-specific code in the appropriate directory
3. Leverage code splitting for better performance
4. Test asset loading in both development and production environments
5. Use meaningful and consistent names for your assets
6. Follow the existing directory structure to maintain consistency
