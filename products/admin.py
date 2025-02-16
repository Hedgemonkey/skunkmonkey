from django.contrib import admin
from .models import Category, Product, Review, InventoryLog

@admin.register(Category)  # Use decorator for simpler registration
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug') # Fields to show in the list view
    prepopulated_fields = {'slug': ('name',)} # Auto-populate slug from name


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'stock_quantity', 'is_active', 'created_at', 'updated_at')
    list_filter = ('category', 'is_active')  # Add filtering options
    prepopulated_fields = {'slug': ('name',)} # Slug auto-population
    search_fields = ('name', 'description') # Add search fields


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'comment', 'created_at')
    list_filter = ('product', 'user', 'rating') # Filter by product, user, rating
    search_fields = ('comment',) # Allow searching review comments
    readonly_fields = ('created_at', ) # Prevent editing of auto generated fields


@admin.register(InventoryLog)
class InventoryLogAdmin(admin.ModelAdmin):
    list_display = ('product', 'change', 'reason', 'created_at')
    list_filter = ('product',) # Filter by Product
    readonly_fields = ('created_at',) # Prevent admins from changing this.

