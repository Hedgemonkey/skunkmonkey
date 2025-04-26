"""
Dashboard views for staff functionality
"""
import logging
from datetime import timedelta

from django.contrib.auth.models import User
from django.db.models import Count, Sum
from django.utils import timezone
from django.views.generic import TemplateView

from staff.mixins import StaffAccessMixin
from staff.models import StaffNotification

# Set up logger
logger = logging.getLogger(__name__)


class DashboardView(StaffAccessMixin, TemplateView):
    """
    Main dashboard view for staff members, showing key metrics
    and recent activity
    """
    template_name = 'staff/dashboard.html'

    def get_context_data(self, **kwargs):
        """Add dashboard metrics to context"""
        context = super().get_context_data(**kwargs)

        # Time periods for metrics
        now = timezone.now()
        today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        yesterday = today - timedelta(days=1)  # noqa:F841
        this_month_start = today.replace(day=1)
        last_month_end = this_month_start - timedelta(days=1)
        last_month_start = last_month_end.replace(day=1)

        # User metrics
        context['total_users'] = User.objects.count()
        context['active_users'] = User.objects.filter(is_active=True).count()

        # New user registrations
        context['new_users_today'] = User.objects.filter(
            date_joined__gte=today).count()
        context['new_users_month'] = User.objects.filter(
            date_joined__gte=this_month_start).count()
        context['new_users_last_month'] = User.objects.filter(
            date_joined__gte=last_month_start,
            date_joined__lt=this_month_start).count()

        # Staff notifications
        context['notifications'] = StaffNotification.objects.filter(
            recipient=self.request.user,
            is_read=False
        ).order_by('-created_at')[:5]

        # Revenue metrics - only if shop app is available
        try:
            from shop.models import Order

            # Get approved orders
            approved_orders = Order.objects.filter(status='approved')

            # Revenue metrics
            context['total_revenue'] = approved_orders.aggregate(
                total=Sum('total_price'))['total'] or 0

            context['revenue_today'] = approved_orders.filter(
                created_at__gte=today).aggregate(
                    total=Sum('total_price'))['total'] or 0

            context['revenue_month'] = approved_orders.filter(
                created_at__gte=this_month_start).aggregate(
                    total=Sum('total_price'))['total'] or 0

            context['revenue_last_month'] = approved_orders.filter(
                created_at__gte=last_month_start,
                created_at__lt=this_month_start).aggregate(
                    total=Sum('total_price'))['total'] or 0

            # Order metrics
            context['total_orders'] = Order.objects.count()
            context['orders_today'] = Order.objects.filter(
                created_at__gte=today).count()
            context['orders_month'] = Order.objects.filter(
                created_at__gte=this_month_start).count()

            # Status breakdown
            status_counts = dict(Order.objects.values_list(
                'status').annotate(count=Count('id')))
            # Count both 'pending' and 'created' statuses as pending orders
            context['pending_orders'] = (
                status_counts.get('pending', 0)
                + status_counts.get('created', 0)
            )
            context['processing_orders'] = status_counts.get('processing', 0)
            context['shipped_orders'] = status_counts.get('shipped', 0)
            context['completed_orders'] = status_counts.get('completed', 0)
            context['refunded_orders'] = status_counts.get('refunded', 0)

            # Add paid_orders for test compatibility
            context['paid_orders'] = status_counts.get('paid', 0)

            # Recent orders
            context['recent_orders'] = Order.objects.all().order_by(
                '-created_at')[:5]

        except (ImportError, ModuleNotFoundError):
            # Shop app not available, use placeholder values
            context['total_orders'] = 0
            context['orders_today'] = 0
            context['orders_month'] = 0
            context['total_revenue'] = 0
            context['revenue_today'] = 0
            context['revenue_month'] = 0
            context['revenue_last_month'] = 0
            context['recent_orders'] = []

        return context
