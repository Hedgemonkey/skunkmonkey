"""
URL patterns for staff functionality
"""
from django.urls import path

from . import views
from .views.notification_views import (
    DeleteNotificationView, MarkAllNotificationsReadView,
    MarkNotificationReadView, NotificationListView,
)
from .views.order_views import (
    CustomerContactView, OrderDetailView, OrderListView, OrderNoteCreateView,
    OrderQuickViewAPI, OrderShippingUpdateView, OrderUpdateView,
)
from .views.product_views import (
    CategoryCreateView, CategoryListView, CategoryUpdateView,
    ProductAdjustStockView, ProductCreateView, ProductDashboardView,
    ProductDetailView, ProductListView, ProductUpdateView, category_ajax_list,
    product_quick_edit,
)
from .views.profile_views import (
    StaffListView, StaffProfileView, ToggleManagerStatusView,
)
from .views.user_views import (
    UserCreateView, UserDetailView, UserGroupManagementView, UserListView,
    UserProfileUpdateView, UserToggleStatusView, UserUpdateView,
)

app_name = 'staff'
urlpatterns = [
    # Dashboard
    path('', views.DashboardView.as_view(), name='dashboard'),

    # Staff profiles
    path('profile/', StaffProfileView.as_view(), name='profile'),
    path('staff/', StaffListView.as_view(), name='staff_list'),
    path('staff/toggle-manager/<int:pk>/',
         ToggleManagerStatusView.as_view(), name='toggle_manager'),

    # Users
    path('users/', UserListView.as_view(), name='user_list'),
    path('users/create/', UserCreateView.as_view(), name='user_create'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user_detail'),
    path('users/<int:pk>/update/',
         UserUpdateView.as_view(), name='user_update'),
    path('users/<int:pk>/profile/',
         UserProfileUpdateView.as_view(), name='user_profile_update'),
    path('users/<int:pk>/toggle-status/',
         UserToggleStatusView.as_view(), name='user_toggle_status'),
    path('users/groups/',
         UserGroupManagementView.as_view(), name='user_groups'),

    # Products
    path('products/', ProductListView.as_view(), name='product_list'),
    path('products/create/',
         ProductCreateView.as_view(), name='product_create'),
    path('products/<int:pk>/',
         ProductDetailView.as_view(), name='product_detail'),
    path('products/<int:pk>/update/',
         ProductUpdateView.as_view(), name='product_update'),
    path('products/<int:pk>/adjust-stock/',
         ProductAdjustStockView.as_view(), name='product_adjust_stock'),
    path('products/dashboard/',
         ProductDashboardView.as_view(), name='product_dashboard'),
    path('products/quick-edit/<int:pk>/',
         product_quick_edit, name='product_quick_edit'),

    # Categories
    path('categories/', CategoryListView.as_view(), name='category_list'),
    path('categories/create/',
         CategoryCreateView.as_view(), name='category_create'),
    path('categories/<int:pk>/update/',
         CategoryUpdateView.as_view(), name='category_update'),
    path('categories/ajax-list/',
         category_ajax_list, name='category_ajax_list'),

    # Orders
    path('orders/', OrderListView.as_view(), name='order_list'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order_detail'),
    path('orders/<int:pk>/update/',
         OrderUpdateView.as_view(), name='order_update'),
    path('orders/<int:pk>/shipping/',
         OrderShippingUpdateView.as_view(), name='order_shipping'),
    path('orders/<int:pk>/contact/',
         CustomerContactView.as_view(), name='customer_contact'),
    path('orders/<int:order_id>/note/',
         OrderNoteCreateView.as_view(), name='order_note_create'),
    path('orders/quick-view/<int:pk>/',
         OrderQuickViewAPI.as_view(), name='order_quick_view'),

    # Notifications
    path('notifications/',
         NotificationListView.as_view(), name='notifications'),
    path('notifications/<int:pk>/read/',
         MarkNotificationReadView.as_view(), name='mark_notification_read'),
    path('notifications/read-all/',
         MarkAllNotificationsReadView.as_view(), name='mark_all_read'),
    path('notifications/<int:pk>/delete/',
         DeleteNotificationView.as_view(), name='delete_notification'),
]
