from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.shortcuts import redirect


class OwnershipRequiredMixin(UserPassesTestMixin):
    """
    Mixin that checks if the current user is the owner of the object.
    The view implementing this mixin must define get_object() method.
    """

    def test_func(self):
        obj = self.get_object()
        user_field = getattr(obj, 'user', None)
        if user_field:
            return obj.user == self.request.user
        return False

    def handle_no_permission(self):
        messages.error(
            self.request,
            "You don't have permission to access this resource.")
        return redirect('home')


class StaffRequiredMixin(UserPassesTestMixin):
    """
    Mixin that checks if the current user has staff permissions.
    """

    def test_func(self):
        return self.request.user.is_staff

    def handle_no_permission(self):
        messages.error(
            self.request,
            "Staff permissions required to access this resource.")
        return redirect('home')


class SecureCheckoutMixin(LoginRequiredMixin):
    """
    Mixin to ensure user is authenticated before accessing checkout-related views
    and that they have an active cart.
    """

    def dispatch(self, request, *args, **kwargs):
        # First check if user is authenticated
        if not request.user.is_authenticated:
            messages.warning(
                request, "Please log in to proceed with checkout.")
            return self.handle_no_permission()

        # Check if cart exists and has items
        if not hasattr(
                request,
                'cart') or not request.cart or not request.cart.items.exists():
            messages.warning(
                request, "Your cart is empty. Add items before checkout.")
            return redirect('shop:cart')

        return super().dispatch(request, *args, **kwargs)


class WishlistOwnershipMixin(UserPassesTestMixin):
    """
    Mixin to ensure user is the owner of the wishlist.
    """

    def test_func(self):
        # Get wishlist_id from URL parameters
        wishlist_id = self.kwargs.get('wishlist_id')
        if not wishlist_id:
            return False

        from shop.models import Wishlist
        try:
            wishlist = Wishlist.objects.get(pk=wishlist_id)
            return wishlist.user == self.request.user
        except Wishlist.DoesNotExist:
            return False

    def handle_no_permission(self):
        messages.error(
            self.request,
            "You don't have permission to access this wishlist.")
        return redirect('shop:wishlist')
