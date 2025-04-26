"""
Models for staff functionality
"""
from django.conf import settings
from django.db import models
from django.utils import timezone

from shop.models import Order


class StaffProfile(models.Model):
    """Staff member profile with role information"""

    DEPARTMENT_CHOICES = (
        ('orders', 'Order Processing'),
        ('customer_service', 'Customer Service'),
        ('warehouse', 'Warehouse'),
        ('admin', 'Administration'),
    )

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='staff_profile'
    )
    department = models.CharField(
        max_length=50,
        choices=DEPARTMENT_CHOICES,
        default='orders'
    )
    is_manager = models.BooleanField(default=False)
    phone_extension = models.CharField(max_length=10, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """String representation of a staff profile"""
        return f"{self.user.username} ({self.get_department_display()})"


class OrderNote(models.Model):
    """Internal notes for orders"""
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='staff_notes'  # Changed from 'notes' to 'staff_notes'
    )
    staff_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='order_notes'
    )
    content = models.TextField()
    is_important = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        """String representation of an order note"""
        return f"Note on {self.order.order_number} by {self.staff_user}"


class OrderAction(models.Model):
    """Record of actions performed on orders by staff"""
    ACTION_TYPES = (
        ('status_change', 'Status Change'),
        ('shipping_update', 'Shipping Update'),
        ('note_added', 'Note Added'),
        ('customer_contact', 'Customer Contact'),
        ('other', 'Other Action'),
    )

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='actions'
    )
    staff_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='order_actions'
    )
    action_type = models.CharField(
        max_length=20,
        choices=ACTION_TYPES
    )
    description = models.TextField()
    old_status = models.CharField(max_length=20, blank=True)
    new_status = models.CharField(max_length=20, blank=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        """String representation of an order action"""
        return (
            f"{self.get_action_type_display()} on {self.order.order_number}"
            f" by {self.staff_user}"
        )


class StaffNotification(models.Model):
    """Notification for staff members"""
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    )

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='staff_notifications'
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    url = models.URLField(blank=True)
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='medium'
    )
    related_order = models.ForeignKey(
        Order,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications'
    )
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_notifications'
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        """String representation of a notification"""
        return f"{self.title} for {self.recipient}"

    def mark_as_read(self):
        """Mark the notification as read"""
        self.is_read = True
        self.read_at = timezone.now()
        self.save()
