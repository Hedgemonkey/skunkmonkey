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
from django.contrib import admin
from django.urls import path
from django.urls.conf import include
from django.conf import settings
from django.conf.urls.static import static
from users import views as user_views
from shop.webhooks import stripe_webhook

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
    path('', include('home.urls')),
    path('stripe/webhook/', stripe_webhook, name='stripe_webhook'),
    path('stripe/', include('djstripe.urls', namespace='djstripe')),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )
