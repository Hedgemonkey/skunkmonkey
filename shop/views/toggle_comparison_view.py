"""
Toggle comparison view for unified comparison functionality
"""
import logging
from typing import Any, Optional

# Django Core Imports
from django.contrib import messages
from django.db import transaction
from django.http import (
    HttpRequest, HttpResponse, HttpResponseNotAllowed, HttpResponseRedirect,
    JsonResponse,
)
from django.shortcuts import get_object_or_404, redirect
from django.urls import NoReverseMatch, reverse
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.generic import View

# Local Imports
from products.models import Product

from ..models import ComparisonList

# Configure logger for this module
logger = logging.getLogger(__name__)


class ToggleComparisonView(View):
    """
    Handles adding/removing a product from the user's comparison list via POST.

    Supports both authenticated users (stored in database) and anonymous users
    (stored in session). Uses transactions for database operations.
    Responds with JSON for AJAX or redirects for standard requests.
    """
    http_method_names = ['post', 'get']

    def post(
        self, request: HttpRequest, *args: Any, **kwargs: Any
    ) -> HttpResponse:
        """Handles the POST request to add/remove a comparison item."""
        product_id_str = kwargs.get('product_id') or \
            request.POST.get('product_id')
        is_ajax = request.headers.get('x-requested-with') == 'XMLHttpRequest'
        product: Optional[Product] = None
        is_in_comparison: bool = False
        was_added: bool = False
        was_removed: bool = False

        if not product_id_str:
            message = "Product ID not provided."
            logger.warning("ToggleComparisonView: Request missing Product ID.")
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
                "ToggleComparisonView: Invalid Product ID format "
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

            if request.user.is_authenticated:
                # Handle authenticated users with database storage
                with transaction.atomic():
                    comparison_list, created = (
                        ComparisonList.objects.get_or_create(
                            user=request.user,
                            defaults={'session_id': ''}
                        )
                    )

                    if comparison_list.products.filter(id=product_id).exists():
                        # Product is already in comparison, remove it
                        comparison_list.products.remove(product)
                        is_in_comparison = False
                        was_removed = True
                        message = f"'{product.name}' removed from comparison."
                        logger.info(
                            f"User '{request.user.username}' removed product "
                            f"{product.id} ('{product.name}') from comparison."
                        )
                    else:
                        # Check if we're at the limit (4 products max)
                        if comparison_list.products.count() >= 4:
                            message = (
                                "You can compare up to 4 products at a time. "
                                "Remove a product to add another."
                            )
                            logger.info(
                                f"User '{request.user.username}' tried to add "
                                f"product {product.id} but comparison list is "
                                f"full."
                            )
                            if is_ajax:
                                return JsonResponse({
                                    'success': False,
                                    'message': message,
                                    'comparison_count': (
                                        comparison_list.products.count()
                                    ),
                                })
                            messages.warning(request, message)
                            return redirect('shop:comparison')

                        # Add product to comparison
                        comparison_list.products.add(product)
                        is_in_comparison = True
                        was_added = True
                        message = f"'{product.name}' added to comparison."
                        logger.info(
                            f"User '{request.user.username}' added product "
                            f"{product.id} ('{product.name}') to comparison."
                        )

                count = comparison_list.products.count()

            else:
                # Handle anonymous users with session storage
                comparison_list = request.session.get('comparison', [])

                if product_id in comparison_list:
                    # Product is already in comparison, remove it
                    comparison_list.remove(product_id)
                    is_in_comparison = False
                    was_removed = True
                    message = f"'{product.name}' removed from comparison."
                    logger.info(
                        f"Anonymous user removed product "
                        f"{product.id} ('{product.name}') from comparison."
                    )
                else:
                    # Check if we're at the limit (4 products max)
                    if len(comparison_list) >= 4:
                        message = (
                            "You can compare up to 4 products at a time. "
                            "Remove a product to add another."
                        )
                        logger.info(
                            f"Anonymous user tried to add product "
                            f"{product.id} but comparison list is full."
                        )
                        if is_ajax:
                            return JsonResponse({
                                'success': False,
                                'message': message,
                                'comparison_count': len(comparison_list),
                            })
                        messages.warning(request, message)
                        return redirect('shop:comparison')

                    # Add product to comparison
                    comparison_list.append(product_id)
                    is_in_comparison = True
                    was_added = True
                    message = f"'{product.name}' added to comparison."
                    logger.info(
                        f"Anonymous user added product "
                        f"{product.id} ('{product.name}') to comparison."
                    )

                # Update session
                request.session['comparison'] = comparison_list
                request.session.modified = True
                count = len(comparison_list)

            if is_ajax:
                return JsonResponse({
                    'success': True,
                    'message': message,
                    'comparison_count': count,
                    'product_id': product_id,
                    'isInComparison': is_in_comparison,
                    'added': was_added,
                    'removed': was_removed,
                })
            else:
                messages.success(request, message)
                return self._redirect_non_ajax(request, product, was_removed)

        except Product.DoesNotExist:
            message = "Product not found."
            logger.warning(
                f"Comparison toggle failed: Product ID {product_id} not found."
            )
            if is_ajax:
                return JsonResponse(
                    {'success': False, 'message': message}, status=404
                )
            messages.error(request, message)
            return self._redirect_non_ajax(request, None, False)

        except Exception as e:
            logger.exception(  # Log full traceback for unexpected errors
                f"Error toggling comparison item for product ID {product_id} "
                f"and user "
                f"'{request.user.username if request.user.is_authenticated else 'Anonymous'}': "  # noqa: E501
                f"{e}"
            )
            message = (
                "An error occurred while updating your comparison list. "
                "Please try again."
            )
            if is_ajax:
                return JsonResponse(
                    {'success': False, 'message': message},
                    status=500
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
                f"AJAX GET for state-changing view ToggleComparisonView "
                f"(product_id={product_id}). POST recommended."
            )
            logger.warning(log_msg)
            return self.post(request, *args, **kwargs)
        else:
            # Disallow standard GET
            log_msg = (
                f"Standard GET disallowed for state-changing view "
                f"ToggleComparisonView (product_id={product_id})."
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
            logger.warning(
                f"Ignoring potentially unsafe 'next' URL: {next_url}"
            )

        # 2. Try 'referer' if safe
        if self._is_safe_url(referer, request):
            safe_referer = referer or product_list_url
            # Stay on comparison if removing item there
            if was_removed and '/comparison' in safe_referer:
                logger.debug(
                    f"Redirecting non-AJAX back to comparison: {safe_referer}"
                )
                return HttpResponseRedirect(safe_referer)
            logger.debug(
                f"Redirecting non-AJAX back to referrer: {safe_referer}"
            )
            return HttpResponseRedirect(safe_referer)
        elif referer:
            logger.warning(f"Ignoring potentially unsafe 'referer': {referer}")

        # 3. Try Product Detail Page
        if product and hasattr(product, 'slug') and product.slug:
            try:
                detail_url = reverse(
                    'shop:product_detail', kwargs={'slug': product.slug}
                )
                logger.debug(
                    f"Redirecting non-AJAX to product detail: {detail_url}"
                )
                return redirect(detail_url)
            except NoReverseMatch as e:
                logger.error(
                    f"Failed to reverse 'shop:product_detail' for "
                    f"slug '{product.slug}': {e}"
                )
                # Fall through if URL fails

        # 4. Ultimate Fallback
        logger.debug(
            f"Redirecting non-AJAX to ultimate fallback: {product_list_url}"
        )
        return redirect(product_list_url)
