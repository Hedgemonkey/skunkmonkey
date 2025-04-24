from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from djstripe.models import Customer, Subscription

User = get_user_model()


class Address(models.Model):
    """
    Model to store user delivery addresses.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='addresses',
    )
    address_line_1 = models.CharField(max_length=80)
    address_line_2 = models.CharField(max_length=80, blank=True, default='')
    town_or_city = models.CharField(max_length=40)
    county = models.CharField(max_length=80, blank=True, default='')
    postcode = models.CharField(max_length=20, blank=True, default='')
    country = models.CharField(
        max_length=40, default='United Kingdom'
    )
    phone_number = models.CharField(max_length=20, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Addresses'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.address_line_1}, {self.postcode}"

    def get_full_address(self):
        """Returns the address formatted on multiple lines."""
        parts = [
            self.address_line_1,
            self.address_line_2,
            self.town_or_city,
            self.county,
            self.postcode,
            self.country,
        ]
        return "\n".join(filter(None, parts))

    def get_short_address(self):
        """Returns a short, single-line representation."""
        return f"{self.address_line_1}, {self.town_or_city}"


class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='userprofile',
    )
    stripe_customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    stripe_subscription = models.ForeignKey(
        Subscription,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    default_delivery_address = models.ForeignKey(
        Address,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )
    # User profile fields
    display_name = models.CharField(
        max_length=50,
        blank=True,
        default='',
        help_text="The name you'd like to be called on the site"
    )
    phone_number = models.CharField(max_length=20, blank=True, default='')
    bio = models.TextField(blank=True, default='')
    birth_date = models.DateField(null=True, blank=True)
    profile_image = models.ImageField(
        upload_to='profile_images/',
        null=True,
        blank=True
    )

    # Communication preferences
    NOTIFICATION_CHOICES = (
        ('all', 'All notifications'),
        ('important', 'Important notifications only'),
        ('none', 'No notifications'),
    )
    notification_preference = models.CharField(
        max_length=10,
        choices=NOTIFICATION_CHOICES,
        default='all'
    )

    # Marketing preferences
    receive_marketing_emails = models.BooleanField(default=True)

    # Display preferences
    THEME_CHOICES = (
        ('light', 'Light'),
        ('dark', 'Dark'),
        ('system', 'System default'),
    )
    theme_preference = models.CharField(
        max_length=10,
        choices=THEME_CHOICES,
        default='system'
    )

    def __str__(self):
        return self.user.username

    def get_display_name(self):
        """
        Returns the user's display name with appropriate fallbacks.

        Priority order:
        1. Custom display_name if set
        2. User's get_full_name() if available
        3. User's username as last resort
        """
        if self.display_name:
            return self.display_name

        full_name = self.user.get_full_name()
        if full_name:
            return full_name

        return self.user.username


class ContactMessage(models.Model):
    """
    Stores all contact form submissions with associated metadata.
    Provides functionality for staff to manage, track, and respond to messages.
    """
    PRIORITY_CHOICES = [
        ('low', _('Low')),
        ('medium', _('Medium')),
        ('high', _('High')),
        ('urgent', _('Urgent')),
    ]

    STATUS_CHOICES = [
        ('new', _('New')),
        ('in_progress', _('In Progress')),
        ('resolved', _('Resolved')),
        ('closed', _('Closed')),
    ]

    CATEGORY_CHOICES = [
        ('general', _('General Inquiry')),
        ('support', _('Technical Support')),
        ('billing', _('Billing Question')),
        ('feedback', _('Feedback')),
        ('complaint', _('Complaint')),
        ('other', _('Other')),
    ]

    # Basic fields from the contact form
    email = models.EmailField(_('Email Address'))
    subject = models.CharField(_('Subject'), max_length=200)
    message = models.TextField(_('Message'))
    phone_number = models.CharField(_('Phone Number'), max_length=20, blank=True)

    # Metadata and tracking fields
    timestamp = models.DateTimeField(_('Received Date'), default=timezone.now)
    is_read = models.BooleanField(_('Read Status'), default=False)
    status = models.CharField(
        _('Status'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='new'
    )
    priority = models.CharField(
        _('Priority'),
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='medium'
    )
    category = models.CharField(
        _('Category'),
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='general'
    )

    # Associated user if the message was submitted by a logged-in user
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name=_('User'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='contact_messages'
    )

    # Staff response and handling
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name=_('Assigned To'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_messages'
    )

    # Legacy fields - will be deprecated after migration
    staff_notes = models.TextField(_('Staff Notes'), blank=True)
    response = models.TextField(_('Response Message'), blank=True)
    response_date = models.DateTimeField(_('Response Date'), null=True, blank=True)
    resolved_date = models.DateTimeField(_('Resolved Date'), null=True, blank=True)

    class Meta:
        verbose_name = _('Contact Message')
        verbose_name_plural = _('Contact Messages')
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['category']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['is_read']),
        ]

    def __str__(self):
        return f"{self.subject} - {self.email} ({self.timestamp.strftime('%Y-%m-%d')})"

    def mark_as_read(self):
        """Mark the message as read."""
        if not self.is_read:
            self.is_read = True
            self.save(update_fields=['is_read'])

    def mark_as_unread(self):
        """Mark the message as unread."""
        if self.is_read:
            self.is_read = False
            self.save(update_fields=['is_read'])

    def assign_to(self, user):
        """Assign the message to a staff member."""
        self.assigned_to = user
        self.save(update_fields=['assigned_to'])

    def add_response(self, response_text, user=None, change_status=False):
        """
        Add a response to the message and update its status if requested.

        Args:
            response_text: The response content to be added
            user: The staff member who wrote the response (optional)
            change_status: Whether to update status to resolved (default: False)
        """
        # Create a new MessageResponse instead of appending to text field
        response = MessageResponse.objects.create(
            contact_message=self,
            content=response_text,
            created_by=user,
            response_type='message',
            is_visible_to_user=True
        )

        # Legacy support - format and append to existing response field
        timestamp = timezone.now().strftime('%Y-%m-%d %H:%M')
        formatted_response = f"[{timestamp}] STAFF RESPONSE: {response_text}"

        # Append to existing response or create new one
        if self.response:
            self.response = f"{self.response}\n\n{formatted_response}"
        else:
            self.response = formatted_response

        self.response_date = timezone.now()

        # Update status to resolved only if explicitly requested
        if change_status and self.status in ['new', 'in_progress']:
            self.status = 'resolved'
            self.resolved_date = timezone.now()
        elif self.status == 'new':
            # Always change 'new' status to 'in_progress' when responding
            self.status = 'in_progress'

        # Update the assigned_to field if not already set
        if user and not self.assigned_to:
            self.assigned_to = user

        self.save(update_fields=[
            'response', 'response_date', 'status', 'resolved_date', 'assigned_to'
        ])

        # Send email notification with the response to the user
        from users.utils.email import send_response_email
        send_response_email(contact_message=self, response_text=response_text, sender=user)

        return response

    def update_status(self, status, user=None):
        """
        Update the status of the message.

        Args:
            status: The new status value
            user: The staff member making the change (optional)
        """
        old_status = self.status
        self.status = status

        # Set resolved date if transitioning to resolved status
        if status == 'resolved' and old_status != 'resolved':
            self.resolved_date = timezone.now()

        # Update assigned_to if not set
        if user and not self.assigned_to:
            self.assigned_to = user

        save_fields = ['status', 'assigned_to']
        if status == 'resolved':
            save_fields.append('resolved_date')

        self.save(update_fields=save_fields)


class MessageResponse(models.Model):
    """
    Stores individual responses to contact messages.
    Each response is stored as a separate record rather than appending to a text field.
    """
    RESPONSE_TYPE_CHOICES = [
        ('message', _('Staff Message')),
        ('user_reply', _('User Reply')),
        ('phone_call_user', _('Phone Call - User Message')),
        ('phone_call_internal', _('Phone Call - Internal Only')),
    ]

    contact_message = models.ForeignKey(
        ContactMessage,
        on_delete=models.CASCADE,
        related_name='responses',
        verbose_name=_('Contact Message')
    )
    content = models.TextField(_('Response Content'))
    response_type = models.CharField(
        _('Response Type'),
        max_length=20,
        choices=RESPONSE_TYPE_CHOICES,
        default='message'
    )
    created_at = models.DateTimeField(_('Created At'), auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='message_responses',
        verbose_name=_('Created By')
    )
    is_visible_to_user = models.BooleanField(
        _('Visible to User'),
        default=True,
        help_text=_('Whether this response is visible to the user')
    )
    email_sent = models.BooleanField(
        _('Email Sent'),
        default=False,
        help_text=_('Whether an email notification was sent to the user')
    )

    class Meta:
        verbose_name = _('Message Response')
        verbose_name_plural = _('Message Responses')
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['response_type']),
        ]

    def __str__(self):
        return f"Response to {self.contact_message} at {self.created_at}"

    def save(self, *args, **kwargs):
        is_new = not self.pk
        super().save(*args, **kwargs)

        # Update the contact message response_date field for backward compatibility
        if is_new and self.is_visible_to_user:
            self.contact_message.response_date = self.created_at
            self.contact_message.save(update_fields=['response_date'])


class MessageNote(models.Model):
    """
    Stores internal staff notes for contact messages.
    Each note is stored as a separate record rather than appending to a text field.
    """
    contact_message = models.ForeignKey(
        ContactMessage,
        on_delete=models.CASCADE,
        related_name='notes',
        verbose_name=_('Contact Message')
    )
    content = models.TextField(_('Note Content'))
    created_at = models.DateTimeField(_('Created At'), auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='message_notes',
        verbose_name=_('Created By')
    )

    class Meta:
        verbose_name = _('Message Note')
        verbose_name_plural = _('Message Notes')
        ordering = ['-created_at']  # Notes are displayed newest first
        indexes = [
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Note for {self.contact_message} at {self.created_at}"


@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    """
    Create or update the user profile when a User object is saved.
    """
    if created:
        UserProfile.objects.create(user=instance)
    else:
        # Get or create the user profile if it doesn't exist
        UserProfile.objects.get_or_create(user=instance)

    # Only save the profile if it exists
    try:
        if hasattr(instance, 'userprofile'):
            instance.userprofile.save()
    except UserProfile.DoesNotExist:
        # This shouldn't happen after the get_or_create above,
        # but just in case to prevent any errors
        pass
