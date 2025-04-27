"""
Views for staff functionality - import routing file

This file provides backward compatibility by importing all views
from the modular structure to maintain existing import paths.
"""

# Import all views from their respective modules
from staff.views.dashboard_views import DashboardView  # noqa:F401
from staff.views.notification_views import (  # noqa:F401
    MarkAllNotificationsReadView, MarkNotificationReadView,
    NotificationListView,
)
from staff.views.order_views import (  # noqa:F401
    CustomerContactView, OrderDetailView, OrderListView, OrderNoteCreateView,
    OrderQuickViewAPI, OrderShippingUpdateView, OrderUpdateView,
)
from staff.views.profile_views import (  # noqa:F401
    StaffListView, StaffProfileView, ToggleManagerStatusView,
)
from staff.views.user_views import (  # noqa:F401
    UserCreateView, UserDetailView, UserGroupManagementView, UserListView,
    UserProfileUpdateView, UserToggleStatusView, UserUpdateView,
)
# Import utility functions
from staff.views.utils import get_client_ip  # noqa:F401
