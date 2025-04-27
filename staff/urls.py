"""
URL patterns for staff functionality
"""
from django.urls import path

from . import views
from .views import user_views

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

    # Notifications
    path('notifications/', views.NotificationListView.as_view(),
         name='notifications'),
    path('notifications/<int:pk>/mark-read/',
         views.MarkNotificationReadView.as_view(),
         name='mark_notification_read'),
    path('notifications/mark-all-read/',
         views.MarkAllNotificationsReadView.as_view(),
         name='mark_all_notifications_read'),

    # Staff
    path('profile/', views.StaffProfileView.as_view(), name='profile'),
    path('staff-list/', views.StaffListView.as_view(), name='staff_list'),
    path('staff-list/<int:pk>/toggle-manager/',
         views.ToggleManagerStatusView.as_view(),
         name='toggle_manager_status'),

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
