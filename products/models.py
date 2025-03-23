from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from django.urls import reverse
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True) # Allow blank for auto-generation

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)  # Generate slug automatically
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        return reverse("products:category_detail", kwargs={"slug": self.slug})



class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    compare_at_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock_quantity = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='product_images/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse("products:product_detail", kwargs={"slug": self.slug})
    
    @property
    def is_new(self):
        """Return True if product was created in the last 30 days"""
        from datetime import timedelta
        from django.utils import timezone
        return self.created_at >= (timezone.now() - timedelta(days=30))
    
    @property
    def is_sale(self):
        """Return True if product has a sale price"""
        return self.compare_at_price and self.compare_at_price > self.price
    
    @property
    def discount_percentage(self):
        """Return the discount percentage if the product is on sale"""
        if self.is_sale:
            return int(((self.compare_at_price - self.price) / self.compare_at_price) * 100)
        return 0


class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField() 
    comment = models.TextField(blank=True) 
    created_at = models.DateTimeField(auto_now_add=True)
    

    def __str__(self):
        return f"Review by {self.user.username} on {self.product.name}"


class InventoryLog(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='inventory_logs')
    change = models.IntegerField() 
    reason = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Inventory change for {self.product.name}: {self.change}"
