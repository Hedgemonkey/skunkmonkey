"""
Views for product comparison functionality
"""
import logging
from django.views.generic import ListView, View
from django.shortcuts import redirect, get_object_or_404
from django.contrib import messages
from django.http import JsonResponse
from django.contrib.auth.mixins import LoginRequiredMixin

from ..models import Product

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
        comparison_list = self.request.session.get('comparison', [])
        if not comparison_list:
            return Product.objects.none()
        
        # Get products from ids in comparison list
        products = Product.objects.filter(id__in=comparison_list)
        logger.debug(f"Retrieved {products.count()} products for comparison")
        return products
    
    def get_context_data(self, **kwargs):
        """
        Add additional context data
        """
        context = super().get_context_data(**kwargs)
        products = context['products']
        
        # Get all unique attributes across products
        all_attributes = set()
        for product in products:
            if hasattr(product, 'attributes'):
                all_attributes.update(product.attributes.keys())
        
        context['attributes'] = sorted(all_attributes)
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
                messages.warning(request, "You can compare up to 4 products at a time. Remove a product to add another.")
                return redirect('shop:comparison')
                
            comparison.append(product_id)
            request.session['comparison'] = comparison
            request.session.modified = True
            messages.success(request, f"{product.name} has been added to your comparison list.")
            logger.info(f"Product {product.name} (ID: {product_id}) added to comparison")
        else:
            messages.info(request, f"{product.name} is already in your comparison list.")
        
        # Check if AJAX request
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({
                'status': 'success',
                'message': f"{product.name} has been added to your comparison list.",
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
            messages.success(request, f"{product.name} has been removed from your comparison list.")
            logger.info(f"Product {product.name} (ID: {product_id}) removed from comparison")
        
        # Check if AJAX request
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({
                'status': 'success',
                'message': f"{product.name} has been removed from your comparison list.",
                'count': len(comparison)
            })
            
        # Redirect to comparison page
        return redirect('shop:comparison')
    
    def get(self, request, product_id):
        """
        Handle GET request by forwarding to POST
        """
        return self.post(request, product_id)