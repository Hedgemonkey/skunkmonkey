"""
Views for product comparison functionality
"""
import logging

from django.contrib import messages
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect
from django.views.generic import ListView, View

from products.models import ProductAttributeType

from ..models import ComparisonList, Product

logger = logging.getLogger(__name__)


class ComparisonView(ListView):
    """
    Display comparison list of products
    """
    template_name = 'shop/comparison.html'
    context_object_name = 'products'

    def get_queryset(self):
        """
        Get list of products in comparison
        """
        if self.request.user.is_authenticated:
            # For authenticated users, get from database
            try:
                comparison_list = ComparisonList.objects.get(
                    user=self.request.user)
                products = comparison_list.products.all()
                logger.debug(f"Retrieved {products.count()} products for "
                             f"authenticated user comparison")
                return products
            except ComparisonList.DoesNotExist:
                logger.debug("No comparison list found for authenticated user")
                return Product.objects.none()
        else:
            # For anonymous users, get from session
            comparison_list = self.request.session.get('comparison', [])
            if not comparison_list:
                logger.debug("No comparison list found in session")
                return Product.objects.none()

            # Get products from ids in comparison list
            products = Product.objects.filter(id__in=comparison_list)
            logger.debug(f"Retrieved {products.count()} products for "
                         f"anonymous user comparison")
            return products

    def get_context_data(self, **kwargs):
        """
        Add additional context data
        """
        context = super().get_context_data(**kwargs)
        products = context['products']

        # Get all attribute types used by these products
        attribute_types = ProductAttributeType.objects.filter(
            values__productattribute__product__in=products
        ).distinct()

        # Build a dictionary of product attributes organized by product id and
        # attribute type id
        product_attributes = {}

        for product in products:
            product_attributes[product.id] = {}

            # Get all attributes for this product
            for attr in product.attributes.select_related(
                    'attribute_value__attribute_type'):
                attr_type_id = attr.attribute_value.attribute_type.id
                attr_value = attr.attribute_value.value

                # Initialize list for this attribute type if it doesn't exist
                if attr_type_id not in product_attributes[product.id]:
                    product_attributes[product.id][attr_type_id] = []

                # Add the attribute value to the list
                product_attributes[product.id][attr_type_id].append(attr_value)

        context['attribute_types'] = attribute_types
        context['product_attributes'] = product_attributes

        return context


class AddToComparisonView(View):
    """
    Add a product to comparison list
    """

    def post(self, request, product_id):
        """
        Handle POST request to add product to comparison
        """
        product = get_object_or_404(Product, id=product_id)

        # Initialize comparison list if not present
        if 'comparison' not in request.session:
            request.session['comparison'] = []

        # Get current comparison list
        comparison = request.session['comparison']

        # Add product to comparison if not already there
        if product_id not in comparison:
            # Limit to 4 products max
            if len(comparison) >= 4:
                messages.warning(
                    request,
                    "You can compare up to 4 products at a time. Remove a \
                        product to add another.")
                return redirect('shop:comparison')

            comparison.append(product_id)
            request.session['comparison'] = comparison
            request.session.modified = True
            messages.success(
                request,
                f"{product.name} has been added to your comparison list."
            )
            logger.info(
                f"Product {product.name} (ID: {product_id}) added to "
                f"comparison"
            )
        else:
            messages.info(
                request,
                f"{product.name} is already in your comparison list."
            )

        # Check if AJAX request
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({
                'status': 'success',
                'message': f"{product.name} has been added to your comparison \
                    list.",
                'count': len(comparison)
            })

        # Get the next parameter or default to product list
        next_url = request.GET.get('next', 'shop:comparison')
        return redirect(next_url)

    def get(self, request, product_id):
        """
        Handle GET request by forwarding to POST
        """
        return self.post(request, product_id)


class RemoveFromComparisonView(View):
    """
    Remove a product from comparison list
    """

    def post(self, request, product_id):
        """
        Handle POST request to remove product from comparison
        """
        product = get_object_or_404(Product, id=product_id)

        # Initialize comparison list if not present
        if 'comparison' not in request.session:
            request.session['comparison'] = []

        # Get current comparison list
        comparison = request.session['comparison']

        # Remove product if in comparison
        if product_id in comparison:
            comparison.remove(product_id)
            request.session['comparison'] = comparison
            request.session.modified = True
            messages.success(
                request,
                f"{product.name} has been removed from your comparison list."
            )
            logger.info(
                f"Product {product.name} (ID: {product_id}) removed from "
                f"comparison"
            )

        # Check if AJAX request
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({
                'status': 'success',
                'message': f"{product.name} has been removed from your \
                    comparison list.",
                'count': len(comparison)
            })

        # Redirect to comparison page
        return redirect('shop:comparison')

    def get(self, request, product_id):
        """
        Handle GET request by forwarding to POST
        """
        return self.post(request, product_id)
