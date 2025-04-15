from django.contrib.sitemaps import Sitemap
from django.urls import reverse

from products.models import Category, Product


class StaticViewSitemap(Sitemap):
    priority = 0.5
    changefreq = 'daily'

    def items(self):
        # Add all your important static pages here
        return ['home', 'products:list', 'shop:cart']

    def location(self, item):
        return reverse(item)


class ProductSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.7

    def items(self):
        return Product.objects.filter(is_active=True)

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        return reverse('products:detail', args=[obj.slug])


class CategorySitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.6

    def items(self):
        return Category.objects.filter(is_active=True)

    def location(self, obj):
        return reverse('products:category', args=[obj.slug])
