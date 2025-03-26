"""
Views for AJAX requests
"""
from django.shortcuts import redirect
from django.http import JsonResponse
from django.views import View
from django.template.loader import render_to_string
from django.db.models import Q
import logging

from products.models import Product
from .utils import apply_product_filters, apply_product_sorting
from .mixins import CartAccessMixin

logger = logging.getLogger(__name__)


class AjaxCartCountView(CartAccessMixin, View):
    """
    Return the current cart count via AJAX
    """
    def get(self, request):
        try:
            cart = request.cart
            return JsonResponse({
                'success': True,
                'count': len(cart),
                'total': str(cart.total_price)
            })
        except Exception as e:
            logger.error(f"Error in AjaxCartCountView: {e}")
            return JsonResponse({
                'success': False,
                'error': 'Could not retrieve cart information'
            }, status=500)


class AjaxProductListView(View):
    """
    AJAX endpoint for dynamic product filtering
    """
    def get(self, request):
        try:
            # Get filter parameters
            category = request.GET.get('category')
            search = request.GET.get('search', '').lower()
            sort = request.GET.get('sort', 'name-asc')
            items_only = request.GET.get('items_only') == 'true'
            count_only = request.GET.get('count_only') == 'true'

            # Start with active products
            products = Product.objects.filter(is_active=True)
            
            # Apply filters and sorting using utility functions
            products = apply_product_filters(products, category, search)
            products = apply_product_sorting(products, sort)

            # Get the total count before any pagination
            product_count = products.count()

            # If we only want the count, return it immediately without rendering HTML
            if count_only:
                logger.debug(f"Count only request: {product_count} products found")
                return JsonResponse({
                    'success': True,
                    'count': product_count,
                    'total_count': product_count
                })

            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                context = {
                    'products': products,
                    'search': search,
                    'current_sort': sort,
                }

                html = render_to_string(
                    'shop/includes/product_grid.html',
                    context,
                    request=request
                )

                logger.debug(f"AJAX request: {product_count} products returned")
                # Return both the HTML and the product count in the JSON response
                return JsonResponse({
                    'success': True,
                    'html': html,
                    'count': product_count,
                    'total_count': product_count
                })

            # Fallback for non-AJAX requests
            logger.debug("Non-AJAX request redirected to product list")
            return redirect('shop:product_list')
            
        except Exception as e:
            logger.error(f"Error in AjaxProductListView: {e}")
            return JsonResponse({
                'success': False,
                'error': 'Could not filter products'
            }, status=500)


class AjaxQuickViewView(View):
    """
    Return quick view product details via AJAX
    """
    def get(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id, is_active=True)
            
            # Render the product details to HTML
            html = render_to_string(
                'shop/includes/product_quick_view.html',
                {'product': product},
                request=request
            )
            
            logger.debug(f"Quick view rendered for product ID: {product_id}")
            return JsonResponse({
                'success': True,
                'html': html
            })
            
        except Product.DoesNotExist:
            logger.warning(f"Quick view requested for non-existent product ID: {product_id}")
            return JsonResponse({
                'success': False,
                'error': 'Product not found'
            }, status=404)
            
        except Exception as e:
            logger.error(f"Error in AjaxQuickViewView: {e}")
            return JsonResponse({
                'success': False,
                'error': 'Could not retrieve product details'
            }, status=500)


# Function-based view for backwards compatibility
def product_list_ajax(request):
    """
    Function-based view that redirects to class-based view
    """
    return AjaxProductListView.as_view()(request)
