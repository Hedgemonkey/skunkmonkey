from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _

from .models import (
    Address, ContactMessage, MessageNote, MessageResponse, UserProfile,
)

User = get_user_model()


class UserProfileInline(admin.StackedInline):
    """Inline representation of UserProfile for UserAdmin."""
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'
    fields = (
        'default_delivery_address',
        'stripe_customer',
        'stripe_subscription',
    )
    raw_id_fields = (
        'default_delivery_address',
        'stripe_customer',
        'stripe_subscription',
    )


if admin.site.is_registered(User):
    admin.site.unregister(User)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User Admin including the UserProfile inline."""
    inlines = (UserProfileInline,)
    list_display = (
        'username',
        'email',
        'first_name',
        'last_name',
        'is_staff',
        'is_active',
    )
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')
    search_fields = ('username', 'first_name', 'last_name', 'email')

    def get_inline_instances(self, request, obj=None):
        if not obj:
            return []
        return super().get_inline_instances(request, obj)


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    """Admin configuration for the Address model."""
    list_display = (
        'user',
        'address_line_1',
        'town_or_city',
        'postcode',
        'country',
        'created_at',
    )
    list_filter = ('user', 'town_or_city', 'country', 'created_at')
    search_fields = (
        'user__username',
        'address_line_1',
        'town_or_city',
        'postcode',
        'country',
    )
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {'fields': ('user',)}),
        (
            'Address Details',
            {
                'fields': (
                    'address_line_1',
                    'address_line_2',
                    'town_or_city',
                    'county',
                    'postcode',
                    'country',
                ),
            },
        ),
        ('Contact Information', {'fields': ('phone_number',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    raw_id_fields = ('user',)


class MessageResponseInline(admin.TabularInline):
    """Inline display of message responses for ContactMessage."""
    model = MessageResponse
    extra = 0
    readonly_fields = ['created_at']
    fields = ('content', 'response_type', 'created_by',
              'created_at', 'is_visible_to_user', 'email_sent')
    ordering = ['created_at']


class MessageNoteInline(admin.TabularInline):
    """Inline display of message notes for ContactMessage."""
    model = MessageNote
    extra = 0
    readonly_fields = ['created_at']
    fields = ('content', 'created_by', 'created_at')
    ordering = ['-created_at']


class ContactMessageAdmin(admin.ModelAdmin):
    """Admin interface for managing contact form submissions."""
    list_display = [
        'subject', 'email', 'category', 'priority',
        'status', 'is_read_display', 'timestamp', 'assigned_to_display'
    ]
    list_filter = [
        'is_read', 'status', 'priority', 'category',
        'timestamp', 'assigned_to'
    ]
    search_fields = [
        'email', 'subject', 'message', 'phone_number',
        'user__email', 'user__username', 'user__first_name', 'user__last_name'
    ]
    readonly_fields = ['timestamp']
    date_hierarchy = 'timestamp'
    list_per_page = 50
    inlines = [MessageResponseInline, MessageNoteInline]

    # Define custom fieldsets for better organization in the admin form
    fieldsets = (
        (_('Contact Information'), {
            'fields': ('email', 'phone_number', 'user')
        }),
        (_('Message Details'), {
            'fields': ('subject', 'message', 'timestamp')
        }),
        (_('Status & Classification'), {
            'fields': ('status', 'category', 'priority', 'is_read')
        }),
        (_('Staff Section'), {
            'fields': (
                'assigned_to', 'staff_notes', 'response',
                'response_date', 'resolved_date'
            ),
            'classes': ('collapse',),
            'description': _(
                'Legacy fields - messages and notes should be added \
                    using the dedicated sections below.')
        }),
    )

    actions = [
        'mark_as_read', 'mark_as_unread',
        'set_status_in_progress', 'set_status_resolved',
        'set_priority_high', 'set_priority_urgent'
    ]

    def is_read_display(self, obj):
        """Custom column display for is_read field."""
        if obj.is_read:
            return mark_safe('<span style="color:green;">✓</span>')
        return mark_safe('<span style="color:red;">✗</span>')
    is_read_display.short_description = _('Read')
    is_read_display.admin_order_field = 'is_read'

    def assigned_to_display(self, obj):
        """Custom display for assigned_to field."""
        if obj.assigned_to:
            return obj.assigned_to.get_full_name() or obj.assigned_to.username
        return '-'
    assigned_to_display.short_description = _('Assigned To')
    assigned_to_display.admin_order_field = 'assigned_to'

    def mark_as_read(self, request, queryset):
        """Mark selected messages as read."""
        updated = queryset.update(is_read=True)
        self.message_user(
            request,
            _(f"{updated} messages marked as read.")
        )
    mark_as_read.short_description = _("Mark selected messages as read")

    def mark_as_unread(self, request, queryset):
        """Mark selected messages as unread."""
        updated = queryset.update(is_read=False)
        self.message_user(
            request,
            _(f"{updated} messages marked as unread.")
        )
    mark_as_unread.short_description = _("Mark selected messages as unread")

    def set_status_in_progress(self, request, queryset):
        """Set status to in_progress for selected messages."""
        updated = queryset.update(
            status='in_progress',
            is_read=True,
        )
        self.message_user(
            request,
            _(f"{updated} messages set to 'In Progress'.")
        )
    set_status_in_progress.short_description = _("Set status to 'In Progress'")

    def set_status_resolved(self, request, queryset):
        """Set status to resolved for selected messages."""
        for message in queryset:
            message.update_status('resolved', user=request.user)
        self.message_user(
            request,
            _(f"{queryset.count()} messages marked as resolved.")
        )
    set_status_resolved.short_description = _("Set status to 'Resolved'")

    def set_priority_high(self, request, queryset):
        """Set priority to high for selected messages."""
        updated = queryset.update(priority='high')
        self.message_user(
            request,
            _(f"Priority set to 'High' for {updated} messages.")
        )
    set_priority_high.short_description = _("Set priority to 'High'")

    def set_priority_urgent(self, request, queryset):
        """Set priority to urgent for selected messages."""
        updated = queryset.update(priority='urgent')
        self.message_user(
            request,
            _(f"Priority set to 'Urgent' for {updated} messages.")
        )
    set_priority_urgent.short_description = _("Set priority to 'Urgent'")

    def save_model(self, request, obj, form, change):
        """
        Custom save method to track changes and assign staff member.
        """
        # Check if the response field has been changed or added
        if 'response' in form.changed_data:
            # Get the raw response text from the form
            response_text = form.cleaned_data['response']

            # Use the add_response method to properly format the response
            # and add it to the conversation history
            obj.add_response(response_text, request.user)

        # Assign to staff member if saving without explicitly assigning
        if not obj.assigned_to and request.user.is_staff:
            obj.assigned_to = request.user

        # If viewing the message, mark it as read
        if not obj.is_read:
            obj.is_read = True

        super().save_model(request, obj, form, change)


@admin.register(MessageResponse)
class MessageResponseAdmin(admin.ModelAdmin):
    """Admin interface for MessageResponse model."""
    list_display = [
        'contact_message_subject', 'response_type',
        'created_at', 'created_by_name', 'is_visible_to_user'
    ]
    list_filter = [
        'response_type', 'created_at', 'is_visible_to_user', 'email_sent'
    ]
    search_fields = [
        'content', 'contact_message__subject', 'contact_message__email'
    ]
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    raw_id_fields = ['contact_message', 'created_by']

    def contact_message_subject(self, obj):
        """Display the subject of the related contact message."""
        return obj.contact_message.subject
    contact_message_subject.short_description = _('Subject')
    contact_message_subject.admin_order_field = 'contact_message__subject'

    def created_by_name(self, obj):
        """Display the name of the user who created the response."""
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return '-'
    created_by_name.short_description = _('Created By')
    created_by_name.admin_order_field = 'created_by'


@admin.register(MessageNote)
class MessageNoteAdmin(admin.ModelAdmin):
    """Admin interface for MessageNote model."""
    list_display = [
        'contact_message_subject', 'created_at', 'created_by_name'
    ]
    list_filter = ['created_at']
    search_fields = [
        'content', 'contact_message__subject', 'contact_message__email'
    ]
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    raw_id_fields = ['contact_message', 'created_by']

    def contact_message_subject(self, obj):
        """Display the subject of the related contact message."""
        return obj.contact_message.subject
    contact_message_subject.short_description = _('Subject')
    contact_message_subject.admin_order_field = 'contact_message__subject'

    def created_by_name(self, obj):
        """Display the name of the user who created the note."""
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return '-'
    created_by_name.short_description = _('Created By')
    created_by_name.admin_order_field = 'created_by'


# Register your models here
admin.site.register(UserProfile)
admin.site.register(ContactMessage, ContactMessageAdmin)
