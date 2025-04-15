from django.contrib import admin

from .models import (
    Cart, CartItem, ComparisonList, Order, OrderItem, RecentlyViewedItem,
    WishlistItem,
)


class CartItemInline(admin.TabularInline):
    model = CartItem
    raw_id_fields = ['product']
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'session_id', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['user__username', 'session_id']
    inlines = [CartItemInline]
    raw_id_fields = ['user']


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    raw_id_fields = ['product']
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'order_number',
        'user',
        'full_name',
        'email',
        'status',
        'payment_status',
        'total_price',
        'created_at',
        'is_paid']
    list_filter = ['status', 'payment_status', 'is_paid', 'created_at']
    search_fields = ['order_number', 'full_name', 'email', 'user__username']
    inlines = [OrderItemInline]
    raw_id_fields = ['user']
    fieldsets = (
        ('Customer Information', {
            'fields': ('user', 'full_name', 'email', 'phone_number')
        }),
        ('Shipping Address', {
            'fields': ('shipping_address1', 'shipping_address2', 'shipping_city',
                       'shipping_state', 'shipping_zipcode', 'shipping_country')
        }),
        ('Billing Address', {
            'fields': ('billing_address1', 'billing_address2', 'billing_city',
                       'billing_state', 'billing_zipcode', 'billing_country')
        }),
        ('Order Details', {
            'fields': ('order_number', 'status', 'payment_status', 'shipping_cost',
                       'total_price', 'grand_total', 'notes')
        }),
        ('Payment Information', {
            'fields': ('stripe_pid', 'is_paid', 'paid_at')
        }),
        ('Shipping Information', {
            'fields': ('shipped_at', 'delivered_at', 'tracking_number')
        }),
    )
    readonly_fields = ['order_number']


@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'added_at']
    list_filter = ['added_at']
    search_fields = ['user__username', 'product__name']
    raw_id_fields = ['user', 'product']


@admin.register(RecentlyViewedItem)
class RecentlyViewedItemAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'viewed_at']
    list_filter = ['viewed_at']
    search_fields = ['user__username', 'product__name']
    raw_id_fields = ['user', 'product']


@admin.register(ComparisonList)
class ComparisonListAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['name', 'user__username']
    raw_id_fields = ['user', 'products']
    filter_horizontal = ['products']
