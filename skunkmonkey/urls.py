"""
URL configuration for skunkmonkey project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.urls import path
from django.urls.conf import include
from django.views.generic import TemplateView
from django.views.static import serve

from shop.webhooks import webhook  # Import the webhook function
from users import views as user_views

from .asset_debug import check_asset_health, static_directory_info
from .sitemaps import CategorySitemap, ProductSitemap, StaticViewSitemap

# Define the sitemaps dictionary
sitemaps = {
    'static': StaticViewSitemap,
    'products': ProductSitemap,
    'categories': CategorySitemap,
}

urlpatterns = [
    path('admin/', admin.site.urls),
    path(
        'accounts/verify-email/',
        user_views.email_verification_required,
        name='account_email_verification_required'
    ),
    path(
        'accounts/login/',
        user_views.login,
        name='account_login'
    ),
    path('accounts/', include('allauth.urls')),
    path('users/', include('users.urls')),
    path('products/', include('products.urls')),
    path('shop/', include('shop.urls')),
    path('staff/', include('staff.urls')),  # Add staff URLs
    path('', include('home.urls')),
    path('stripe/webhook/', webhook, name='stripe_webhook'),  # Add webhook URL
    path('stripe/', include('djstripe.urls', namespace='djstripe')),

    # Sitemap
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps},
         name='django.contrib.sitemaps.views.sitemap'),

    # Asset testing route
    path('test-assets/', TemplateView.as_view(template_name='test_assets.html'),
         name='test_assets'),

    # Asset debugging views
    path('asset-health/', check_asset_health, name='asset_health'),
    path('static-info/', static_directory_info, name='static_info'),

    # Robots.txt - serve as a static file
    path(
        'robots.txt',
        TemplateView.as_view(
            template_name="robots.txt",
            content_type="text/plain")),
    path(
        'favicon.ico',
        serve,
        {'document_root': settings.STATIC_ROOT, 'path': 'favicon.ico'}
    ),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )
