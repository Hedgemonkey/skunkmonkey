"""
URL patterns for staff functionality
"""
from django.urls import path

from . import views
from .views import product_api_views, product_views, user_views
from .views.notification_views import (
    DeleteNotificationView, MarkAllNotificationsReadView,
    MarkNotificationReadView, NotificationListView,
)

app_name = 'staff'

urlpatterns = [
    # Dashboard
    path('', views.DashboardView.as_view(), name='dashboard'),

    # Orders
    path('orders/', views.OrderListView.as_view(), name='order_list'),
    path('orders/<int:pk>/', views.OrderDetailView.as_view(),
         name='order_detail'),
    path('orders/<int:pk>/update/', views.OrderUpdateView.as_view(),
         name='order_update'),
    # Adding 'order_edit' name as an alias to order_update for template compatibility
    path('orders/<int:pk>/edit/', views.OrderUpdateView.as_view(),
         name='order_edit'),
    path('orders/<int:pk>/shipping-update/',
         views.OrderShippingUpdateView.as_view(),
         name='shipping_update'),
    path('orders/<int:pk>/add-note/', views.OrderNoteCreateView.as_view(),
         name='add_note'),
    path('orders/<int:pk>/contact-customer/',
         views.CustomerContactView.as_view(),
         name='contact_customer'),
    path('api/orders/<int:pk>/quick-view/', views.OrderQuickViewAPI.as_view(),
         name='order_quickview'),

    # Products
    path('products/', views.ProductDashboardView.as_view(),
         name='product_dashboard'),
    path('products/management/', views.ProductDashboardView.as_view(),
         name='product_management'),
    path('products/list/', views.ProductListView.as_view(),
         name='product_list'),
    path('products/create/', views.ProductCreateView.as_view(),
         name='product_create'),
    path('products/<int:pk>/', views.ProductDetailView.as_view(),
         name='product_detail'),
    path('products/<int:pk>/update/', views.ProductUpdateView.as_view(),
         name='product_update'),
    path('products/<int:pk>/quick-edit/', views.product_quick_edit,
         name='product_quick_edit'),
    path('products/<int:pk>/adjust-stock/', product_views.ProductAdjustStockView.as_view(),
         name='product_adjust_stock'),

    # Product API endpoints
    path('api/products/list/', product_api_views.product_ajax_list,
         name='product_ajax_list'),
    path('api/products/stats/', product_api_views.product_stats,
         name='product_stats'),
    path('api/products/low-stock/', product_api_views.get_low_stock_products,
         name='low_stock_products'),
    path('api/products/batch-action/', product_api_views.product_batch_action,
         name='product_batch_action'),
    path('api/products/export/', product_api_views.export_products,
         name='export_products'),
    path('api/products/export-template/', product_api_views.export_template,
         name='export_template'),
    path('api/products/import/', product_api_views.import_products,
         name='import_products'),

    # Categories
    path('categories/', views.CategoryListView.as_view(),
         name='category_list'),
    path('categories/create/', views.CategoryCreateView.as_view(),
         name='category_create'),
    path('categories/<int:pk>/update/', views.CategoryUpdateView.as_view(),
         name='category_update'),
    path('api/categories/list/', views.category_ajax_list,
         name='category_ajax_list'),

    # Notifications
    path('notifications/', NotificationListView.as_view(),
         name='notifications'),
    path('notifications/<int:pk>/mark-read/',
         MarkNotificationReadView.as_view(),
         name='mark_notification_read'),
    path('notifications/mark-all-read/',
         MarkAllNotificationsReadView.as_view(),
         name='mark_all_notifications_read'),
    # Adding this alias for template compatibility
    path('notifications/mark-all-read/',
         MarkAllNotificationsReadView.as_view(),
         name='mark_all_read'),
    # Adding missing delete notification URL
    path('notifications/<int:pk>/delete/',
         DeleteNotificationView.as_view(),
         name='delete_notification'),

    # Staff
    path('profile/', views.StaffProfileView.as_view(), name='profile'),
    path('staff-list/', views.StaffListView.as_view(), name='staff_list'),
    path('staff-list/<int:pk>/toggle-manager/',
         views.ToggleManagerStatusView.as_view(),
         name='toggle_manager'),

    # User Management
    path('users/', user_views.UserListView.as_view(), name='user_list'),
    path('users/create/', user_views.UserCreateView.as_view(), name='user_create'),
    path('users/<int:pk>/', user_views.UserDetailView.as_view(),
         name='user_detail'),
    path('users/<int:pk>/update/', user_views.UserUpdateView.as_view(),
         name='user_update'),
    path('users/<int:pk>/profile/', user_views.UserProfileUpdateView.as_view(),
         name='user_profile_update'),
    path('users/<int:pk>/toggle-status/',
         user_views.UserToggleStatusView.as_view(),
         name='user_toggle_status'),
    path('users/<int:pk>/groups/', user_views.UserGroupManagementView.as_view(),
         name='user_groups'),
]
