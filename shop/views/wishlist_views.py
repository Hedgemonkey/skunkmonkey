"""
Views for wishlist functionality
"""
from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import ListView, View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
import logging

from products.models import Product
from ..models import WishlistItem
from .mixins import CartAccessMixin

logger = logging.getLogger(__name__)


class WishlistView(LoginRequiredMixin, ListView):
    """
    Display the user's wishlist
    """
    template_name = 'shop/wishlist.html'
    context_object_name = 'wishlist_items'
    
    def get_queryset(self):
        """Return the user's wishlist items"""
        return WishlistItem.objects.filter(user=self.request.user).select_related('product')


class AddToWishlistView(LoginRequiredMixin, View):
    """
    Add a product to the user's wishlist
    """
    def post(self, request, product_id):
        is_ajax = request.headers.get('x-requested-with') == 'XMLHttpRequest'
        
        try:
            product = get_object_or_404(Product, id=product_id, is_active=True)
            
            # Check if item already in wishlist
            wishlist_item, created = WishlistItem.objects.get_or_create(
                user=request.user,
                product=product
            )
            
            if created:
                logger.info(f"User {request.user.username} added product {product.id} to wishlist")
                message = f"{product.name} added to your wishlist."
            else:
                logger.info(f"Product {product.id} already in wishlist for user {request.user.username}")
                message = f"{product.name} is already in your wishlist."
                
            if is_ajax:
                return JsonResponse({
                    'success': True,
                    'created': created,
                    'message': message,
                    'count': WishlistItem.objects.filter(user=request.user).count()
                })
            
            if added:
                messages.success(request, message)
            else:
                messages.info(request, message)
            
        except Exception as e:
            logger.error(f"Error adding to wishlist: {e}")
            if is_ajax:
                return JsonResponse({
                    'success': False,
                    'message': "An error occurred. Please try again."
                }, status=500)
            messages.error(request, "An error occurred. Please try again.")
            
        return redirect('shop:product_detail', slug=product.slug)


class RemoveFromWishlistView(LoginRequiredMixin, View):
    """
    Remove a product from the user's wishlist
    """
    def post(self, request, product_id):
        is_ajax = request.headers.get('x-requested-with') == 'XMLHttpRequest'
        
        try:
            product = get_object_or_404(Product, id=product_id)
            
            # Try to find and delete the wishlist item
            try:
                wishlist_item = WishlistItem.objects.get(user=request.user, product=product)
                wishlist_item.delete()
                logger.info(f"User {request.user.username} removed product {product.id} from wishlist")
                message = f"{product.name} removed from your wishlist."
                success = True
            except WishlistItem.DoesNotExist:
                logger.warning(f"Attempted to remove non-existent wishlist item for user {request.user.username}")
                message = f"{product.name} was not in your wishlist."
                success = False
                
            if is_ajax:
                return JsonResponse({
                    'success': success,
                    'message': message,
                    'count': WishlistItem.objects.filter(user=request.user).count()
                })
            
            if success:
                messages.success(request, message)
            else:
                messages.info(request, message)
                
        except Exception as e:
            logger.error(f"Error removing from wishlist: {e}")
            if is_ajax:
                return JsonResponse({
                    'success': False,
                    'message': "An error occurred. Please try again."
                }, status=500)
            messages.error(request, "An error occurred. Please try again.")
        
        # Determine where to redirect based on referer
        referer = request.META.get('HTTP_REFERER', '')
        if 'wishlist' in referer:
            return redirect('shop:wishlist')
        return redirect('shop:product_detail', slug=product.slug)


# Function-based views for backwards compatibility
def add_to_wishlist(request, product_id):
    """Function-based view that redirects to class-based view"""
    return AddToWishlistView.as_view()(request, product_id=product_id)


def remove_from_wishlist(request, product_id):
    """Function-based view that redirects to class-based view"""
    return RemoveFromWishlistView.as_view()(request, product_id=product_id)
