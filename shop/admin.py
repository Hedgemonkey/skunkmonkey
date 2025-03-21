from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'session_id', 'created_at', 'updated_at', 'item_count', 'total_price')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('user__username', 'user__email', 'session_id')
    inlines = [CartItemInline]
    
    def item_count(self, obj):
        return obj.items.count()

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('subtotal',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'full_name', 'email', 'status', 'total_price', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('full_name', 'email', 'user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [OrderItemInline]
    list_editable = ('status',)
    
    fieldsets = (
        ('Order Information', {
            'fields': ('user', 'full_name', 'email', 'status', 'total_price')
        }),
        ('Shipping Information', {
            'fields': ('shipping_address',)
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at')
        }),
    )
