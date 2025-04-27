"""
Views package for staff functionality
"""
from .dashboard_views import DashboardView
from .notification_views import (
    MarkAllNotificationsReadView, MarkNotificationReadView,
    NotificationListView,
)
from .order_views import (
    CustomerContactView, OrderDetailView, OrderListView, OrderNoteCreateView,
    OrderQuickViewAPI, OrderShippingUpdateView, OrderUpdateView,
)
from .profile_views import (
    StaffListView, StaffProfileView, ToggleManagerStatusView,
)
from .user_views import (
    UserCreateView, UserDetailView, UserGroupManagementView, UserListView,
    UserProfileUpdateView, UserToggleStatusView, UserUpdateView,
)
