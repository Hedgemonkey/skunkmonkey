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
from .product_api_views import (
    export_products, export_template, get_low_stock_products, import_products,
    product_ajax_list, product_batch_action, product_stats,
)
from .product_views import (
    CategoryCreateView, CategoryListView, CategoryUpdateView,
    ProductCreateView, ProductDashboardView, ProductDetailView,
    ProductListView, ProductUpdateView, category_ajax_list, product_quick_edit,
)
from .profile_views import (
    StaffListView, StaffProfileView, ToggleManagerStatusView,
)
from .user_views import (
    UserCreateView, UserDetailView, UserGroupManagementView, UserListView,
    UserProfileUpdateView, UserToggleStatusView, UserUpdateView,
)
