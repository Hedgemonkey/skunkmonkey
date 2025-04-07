from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import UserProfile, Address

User = get_user_model()

# Unregister the default User admin if it's registered
# admin.site.unregister(User) # Might not be needed depending on project setup

class UserProfileInline(admin.StackedInline):
    """ Inline representation of UserProfile for UserAdmin """
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'
    # Customize fields shown in the inline admin
    fields = ('default_delivery_address', 'stripe_customer', 'stripe_subscription')
    # Use raw_id_fields for ForeignKey fields for better performance/UI with many options
    raw_id_fields = ('default_delivery_address', 'stripe_customer', 'stripe_subscription')


# Ensure the default User admin is unregistered before registering the custom one
# This prevents potential conflicts if User is already registered elsewhere.
# Check if User is registered before attempting to unregister
if admin.site.is_registered(User):
    admin.site.unregister(User)

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """ Custom User Admin including the UserProfile inline """
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')
    search_fields = ('username', 'first_name', 'last_name', 'email')

    def get_inline_instances(self, request, obj=None):
        # Prevent showing the inline form on the 'add user' page
        if not obj:
            return list()
        return super().get_inline_instances(request, obj)

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    """ Admin configuration for the Address model """
    list_display = ('user', 'address_line_1', 'town_or_city', 'postcode', 'country', 'created_at')
    list_filter = ('user', 'town_or_city', 'country', 'created_at')
    search_fields = ('user__username', 'address_line_1', 'town_or_city', 'postcode', 'country')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {'fields': ('user',)}),
        ('Address Details', {'fields': ('address_line_1', 'address_line_2', 'town_or_city', 'county', 'postcode', 'country')}),
        ('Contact Information', {'fields': ('phone_number',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    # Use raw_id_fields for the user ForeignKey for better performance
    raw_id_fields = ('user',)

# If UserProfile needs separate admin management (not common when using inline):
# @admin.register(UserProfile)
# class UserProfileAdmin(admin.ModelAdmin):
#     list_display = ('user', 'default_delivery_address', 'stripe_customer')
#     search_fields = ('user__username',)
#     raw_id_fields = ('user', 'default_delivery_address', 'stripe_customer', 'stripe_subscription')
