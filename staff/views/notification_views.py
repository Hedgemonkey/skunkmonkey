"""
Notification-related views for staff functionality
"""
import logging

from django.contrib import messages
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse
from django.utils import timezone
from django.views.generic import ListView, View

from staff.mixins import StaffAccessMixin
from staff.models import StaffNotification

# Set up logger
logger = logging.getLogger(__name__)


class NotificationListView(StaffAccessMixin, ListView):
    """
    List view of staff notifications with filtering
    """
    model = StaffNotification
    template_name = 'staff/notifications.html'
    context_object_name = 'notifications'
    paginate_by = 20

    def get_queryset(self):
        """
        Filter notifications for current user and by read status if requested
        """
        queryset = StaffNotification.objects.filter(
            recipient=self.request.user
        )

        # Filter by read status
        unread_only = self.request.GET.get('unread_only')
        if unread_only == 'true':
            queryset = queryset.filter(is_read=False)

        return queryset.order_by('-created_at')

    def get_context_data(self, **kwargs):
        """Add filter information to context"""
        context = super().get_context_data(**kwargs)
        context['unread_only'] = self.request.GET.get('unread_only') == 'true'
        context['unread_count'] = StaffNotification.objects.filter(
            recipient=self.request.user,
            is_read=False
        ).count()
        return context


class MarkNotificationReadView(StaffAccessMixin, View):
    """
    Mark a notification as read
    """
    def get(self, request, pk):
        """Handle GET request to mark notification as read"""
        notification = get_object_or_404(
            StaffNotification,
            pk=pk,
            recipient=request.user
        )
        notification.mark_as_read()

        # Redirect to the page specified in the 'next' parameter,
        # or default to notifications page
        next_url = request.GET.get('next', reverse('staff:notifications'))
        return HttpResponseRedirect(next_url)

    def post(self, request, pk):
        """Handle POST request to mark notification as read"""
        notification = get_object_or_404(
            StaffNotification,
            pk=pk,
            recipient=request.user
        )
        notification.mark_as_read()

        # Check if AJAX request - return JSON response
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'success': True})

        # Otherwise redirect to referrer or notifications page
        next_url = request.POST.get('next', reverse('staff:notifications'))
        return HttpResponseRedirect(next_url)


class MarkAllNotificationsReadView(StaffAccessMixin, View):
    """
    Mark all notifications as read
    """
    def get(self, request):
        """Handle GET request to mark all notifications as read"""
        notifications = StaffNotification.objects.filter(
            recipient=request.user,
            is_read=False
        )

        now = timezone.now()
        count = notifications.count()
        notifications.update(is_read=True, read_at=now)

        messages.success(
            request,
            f'Marked {count} notifications as read.'
        )
        return redirect('staff:notifications')
