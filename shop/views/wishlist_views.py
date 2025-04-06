"""
Views for managing user wishlists in the shop application.
"""
import logging
from typing import Any, Dict, List, Optional, Set

# Django Core Imports
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db import transaction
from django.http import (
    HttpRequest,
    HttpResponse,
    HttpResponseNotAllowed,
    HttpResponseRedirect,
    JsonResponse,
)
from django.shortcuts import get_object_or_404, redirect
from django.urls import NoReverseMatch, reverse
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.generic import ListView, View

# Local Imports
from products.models import Product
from ..models import WishlistItem

# Configure logger for this module
logger = logging.getLogger(__name__)


# ==============================================================================
# Class-Based Views
# ==============================================================================

class WishlistView(LoginRequiredMixin, ListView):
    """
    Displays the list of products in the user's wishlist.

    Requires authentication. Retrieves `WishlistItem` objects for the user,
    providing them and related product data to the template context.
    """
    model = WishlistItem
    template_name = 'shop/wishlist.html'
    context_object_name = 'wishlist_items'
    # Optional: Enable pagination for large wishlists
    # paginate_by = 12

    def get_queryset(self) -> List[WishlistItem]:
        """
        Returns the queryset of wishlist items for the current user.

        Optimizes DB access by prefetching related product details and
        orders items by date added (descending).
        """
        user = self.request.user
        queryset = (
            WishlistItem.objects.filter(user=user)
            .select_related('product')
            .order_by('-added_at')
        )
        return queryset

    def get_context_data(self, **kwargs: Any) -> Dict[str, Any]:
        """
        Adds additional data to the context for rendering the wishlist
        template.
        """
        context = super().get_context_data(**kwargs)
        wishlist_items: List[WishlistItem] = context.get('wishlist_items', [])

        products: List[Product] = [
            item.product for item in wishlist_items if item.product
        ]
        context['products'] = products

        # Create the set with type hint first (respects line length)
        wishlist_product_ids: Set[int] = {
            p.id for p in products
        }
        # Assign the correctly typed variable to the context key
        # This line itself should be well within the length limit
        context['wishlist_product_ids'] = wishlist_product_ids

        context['page_title'] = 'My Wishlist'
        context['is_wishlist_empty'] = not products
        return context


class ToggleWishlistView(LoginRequiredMixin, View):
    """
    Handles adding/removing a product from the user's wishlist via POST.

    Requires authentication. Expects `product_id`. Uses transactions.
    Responds with JSON for AJAX or redirects for standard requests.
    GET requests are generally disallowed for state changes.
    """
    http_method_names = ['post', 'get']

    def post(
        self, request: HttpRequest, *args: Any, **kwargs: Any
    ) -> HttpResponse:
        """Handles the POST request to add/remove a wishlist item."""
        product_id_str = kwargs.get('product_id') or \
            request.POST.get('product_id')
        is_ajax = request.headers.get('x-requested-with') == 'XMLHttpRequest'
        product: Optional[Product] = None
        is_in_wishlist: bool = False
        was_added: bool = False
        was_removed: bool = False

        if not product_id_str:
            message = "Product ID not provided."
            logger.warning("ToggleWishlistView: Request missing Product ID.")
            if is_ajax:
                return JsonResponse(
                    {'success': False, 'message': message}, status=400
                )
            messages.error(request, message)
            return redirect(reverse('shop:product_list'))

        try:
            product_id = int(product_id_str)
        except (ValueError, TypeError):
            message = "Invalid Product ID format."
            logger.warning(
                "ToggleWishlistView: Invalid Product ID format "
                f"received: '{product_id_str}'"
            )
            if is_ajax:
                return JsonResponse(
                    {'success': False, 'message': message}, status=400
                )
            messages.error(request, message)
            return redirect(reverse('shop:product_list'))

        try:
            product = get_object_or_404(Product, id=product_id)

            with transaction.atomic():
                item, created = WishlistItem.objects.get_or_create(
                    user=request.user, product=product
                )

                if created:
                    is_in_wishlist = True
                    was_added = True
                    message = f"'{product.name}' added to wishlist."
                    logger.info(
                        f"User '{request.user.username}' added product "
                        f"{product.id} ('{product.name}') to wishlist."
                    )
                else:
                    item.delete()
                    is_in_wishlist = False
                    was_removed = True
                    message = f"'{product.name}' removed from wishlist."
                    logger.info(
                        f"User '{request.user.username}' removed product "
                        f"{product.id} ('{product.name}') from wishlist."
                    )

            count = WishlistItem.objects.filter(user=request.user).count()

            if is_ajax:
                return JsonResponse({
                    'success': True,
                    'message': message,
                    'wishlist_count': count,
                    'product_id': product_id,
                    'isInWishlist': is_in_wishlist,
                    'added': was_added,
                    'removed': was_removed,
                })
            else:
                messages.success(request, message)
                return self._redirect_non_ajax(request, product, was_removed)

        except Product.DoesNotExist:
            message = "Product not found."
            logger.warning(
                f"Wishlist toggle failed: Product ID {product_id} not found."
            )
            if is_ajax:
                return JsonResponse(
                    {'success': False, 'message': message}, status=404
                )
            messages.error(request, message)
            return self._redirect_non_ajax(request, None, False)

        except Exception as e:
            logger.exception(  # Log full traceback for unexpected errors
                f"Error toggling wishlist item for product ID {product_id} "
                f"and user '{request.user.username}': {e}"
            )
            message = (
                "An error occurred while updating your wishlist. "
                "Please try again."
            )
            if is_ajax:
                return JsonResponse(
                    {'success': False, 'message': message}, status=500
                )
            messages.error(request, message)
            return redirect(reverse('shop:product_list'))

    def get(
        self, request: HttpRequest, *args: Any, **kwargs: Any
    ) -> HttpResponse:
        """Handles GET requests. Disallows standard GET for state changes."""
        product_id = kwargs.get('product_id')
        is_ajax = request.headers.get('x-requested-with') == 'XMLHttpRequest'

        if is_ajax:
            # Allow AJAX GET but log warning
            log_msg = (
                f"AJAX GET for state-changing view ToggleWishlistView "
                f"(product_id={product_id}). POST recommended."
            )
            logger.warning(log_msg)
            return self.post(request, *args, **kwargs)
        else:
            # Disallow standard GET
            log_msg = (
                f"Standard GET disallowed for state-changing view "
                f"ToggleWishlistView (product_id={product_id})."
            )
            logger.warning(log_msg)
            allowed = [m.upper() for m in self.http_method_names if m != 'get']
            return HttpResponseNotAllowed(allowed)

    def _is_safe_url(self, url: Optional[str], request: HttpRequest) -> bool:
        """Checks if a URL is safe for redirection."""
        if not url:
            return False
        return url_has_allowed_host_and_scheme(
            url=url,
            allowed_hosts={request.get_host()},
            require_https=request.is_secure()
        )

    def _redirect_non_ajax(
        self,
        request: HttpRequest,
        product: Optional[Product],
        was_removed: bool
    ) -> HttpResponseRedirect:
        """
        Determines and returns the appropriate redirect for non-AJAX requests.
        """
        next_url = request.POST.get('next') or request.GET.get('next')
        referer = request.META.get('HTTP_REFERER')
        product_list_url = reverse('shop:product_list')  # Cache fallback URL

        # 1. Try 'next' parameter if safe
        if self._is_safe_url(next_url, request):
            safe_next = next_url or product_list_url
            logger.debug(f"Redirecting non-AJAX to safe 'next': {safe_next}")
            return HttpResponseRedirect(safe_next)
        elif next_url:
            logger.warning(f"Ignoring potentially unsafe 'next' URL: \
                           {next_url}")

        # 2. Try 'referer' if safe
        if self._is_safe_url(referer, request):
            safe_referer = referer or product_list_url
            # Stay on wishlist if removing item there
            if was_removed and '/wishlist' in safe_referer:
                logger.debug(f"Redirecting non-AJAX back to wishlist: \
                             {safe_referer}")
                return HttpResponseRedirect(safe_referer)
            logger.debug(f"Redirecting non-AJAX back to referrer: \
                         {safe_referer}")
            return HttpResponseRedirect(safe_referer)
        elif referer:
            logger.warning(f"Ignoring potentially unsafe 'referer': {referer}")

        # 3. Try Product Detail Page
        if product and hasattr(product, 'slug') and product.slug:
            try:
                detail_url = reverse(
                    'shop:product_detail', kwargs={'slug': product.slug}
                )
                logger.debug(f"Redirecting non-AJAX to product detail: \
                             {detail_url}")
                return redirect(detail_url)
            except NoReverseMatch as e:
                logger.error(
                    f"Failed to reverse 'shop:product_detail' for "
                    f"slug '{product.slug}': {e}"
                )
                # Fall through if URL fails

        # 4. Ultimate Fallback
        logger.debug(f"Redirecting non-AJAX to ultimate fallback: \
                     {product_list_url}")
        return redirect(product_list_url)


# ==============================================================================
# Function-Based View (Wrapper/Compatibility)
# ==============================================================================

@login_required
def toggle_wishlist(request: HttpRequest, product_id: int) -> HttpResponse:
    """
    Function-based wrapper view for toggling a wishlist item.

    Delegates handling to the ToggleWishlistView class-based view.
    """
    if request.method not in ['GET', 'POST']:
        return HttpResponseNotAllowed(['GET', 'POST'])

    # Dispatch to the CBV
    view_func = ToggleWishlistView.as_view()
    return view_func(request, product_id=product_id)
