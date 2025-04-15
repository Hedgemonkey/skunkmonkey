"""
Mixins for shop views

This module contains mixins used by shop views to handle common functionality:
- Cart access
- Order access permissions
- Staff-only access
- Ownership verification
- Secure checkout requirements
"""
import logging

from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.shortcuts import redirect

logger = logging.getLogger(__name__)


class CartAccessMixin:
    """
    Mixin for views that require access to the cart.

    Makes the cart available as self.cart in the view.
    This allows views to easily access and manipulate the user's shopping cart.
    """

    def dispatch(self, request, *args, **kwargs):
        self.cart = request.cart
        return super().dispatch(request, *args, **kwargs)


class OrderAccessMixin(UserPassesTestMixin):
    """
    Mixin to ensure users can only access their own orders.

    Implements permission logic where:
    - Admin users can access any order
    - Regular users can only access their own orders
    - Redirects with error message on unauthorized access
    """

    def test_func(self):
        order_id = self.kwargs.get('order_id') or self.kwargs.get('pk')
        if not order_id:
            return False

        # Get the order
        try:
            from ..models import Order
            order = Order.objects.get(id=order_id)

            # Admin can access any order
            if self.request.user.is_staff:
                return True

            # Regular users can only access their own orders
            return order.user == self.request.user
        except Order.DoesNotExist:
            logger.warning(
                f"Attempted access to non-existent order {order_id}")
            return False

    def handle_no_permission(self):
        messages.error(
            self.request,
            "You don't have permission to view this order.")
        return redirect('shop:product_list')


class StaffRequiredMixin(UserPassesTestMixin):
    """
    Mixin to ensure only staff members can access the view.

    Provides a simple way to restrict views to admin/staff users only.
    Redirects with appropriate message when non-staff users attempt access.
    """

    def test_func(self):
        return self.request.user.is_staff

    def handle_no_permission(self):
        messages.error(self.request, "Staff access required.")
        return redirect('shop:product_list')


class OwnershipRequiredMixin(UserPassesTestMixin):
    """
    Mixin that checks if the current user is the owner of the object.
    The view implementing this mixin must define get_object() method.
    """

    def test_func(self):
        obj = self.get_object()
        return obj.user == self.request.user

    def handle_no_permission(self):
        messages.error(
            self.request,
            "You don't have permission to access this resource.")
        return redirect('shop:product_list')


class SecureCheckoutMixin(LoginRequiredMixin):
    """
    Mixin to ensure user is authenticated before accessing checkout-related views
    and that they have an active cart with items.
    """

    def dispatch(self, request, *args, **kwargs):
        # First check if user is authenticated
        if not request.user.is_authenticated:
            messages.warning(
                request, "Please log in to proceed with checkout.")
            return self.handle_no_permission()

        # Check if cart exists and has items
        if not request.cart or not request.cart.items.exists():
            messages.warning(
                request, "Your cart is empty. Add items before checkout.")
            return redirect('shop:cart')

        return super().dispatch(request, *args, **kwargs)
