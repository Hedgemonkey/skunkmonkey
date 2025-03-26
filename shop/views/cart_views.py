"""
Views for shopping cart functionality
"""
from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.views.generic import TemplateView
from django.views.decorators.http import require_POST
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from django.contrib import messages
import logging

from products.models import Product
from ..forms import CartAddProductForm, CartUpdateQuantityForm
from .mixins import CartAccessMixin

logger = logging.getLogger(__name__)


class CartDetailView(CartAccessMixin, TemplateView):
    """
    Display the shopping cart contents
    """
    template_name = 'shop/cart.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['cart'] = self.request.cart
        return context


@method_decorator(require_POST, name='post')
class CartAddView(CartAccessMixin, View):
    """
    Add a product to the shopping cart
    """
    def post(self, request, product_id):
        cart = request.cart
        
        try:
            product = get_object_or_404(Product, id=product_id, is_active=True)
            form = CartAddProductForm(request.POST)

            if form.is_valid():
                cd = form.cleaned_data
                cart.add(product=product,
                        quantity=cd['quantity'],
                        update_quantity=cd['update'])

                logger.info(f"Added product {product.id} to cart for user {request.user.username if request.user.is_authenticated else 'AnonymousUser'}")

                if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                    return JsonResponse({'success': True, 'item_count': len(cart)})

                messages.success(request, f"{product.name} added to cart.")
            else:
                logger.warning(f"Invalid cart add form: {form.errors}")
                if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                    return JsonResponse({'success': False, 'errors': form.errors}, status=400)
                messages.error(request, "Invalid quantity.")
                
        except Exception as e:
            logger.error(f"Error adding product to cart: {e}")
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'errors': str(e)}, status=500)
            messages.error(request, "An error occurred. Please try again.")

        return redirect('shop:cart')


class CartRemoveView(CartAccessMixin, View):
    """
    Remove a product from the shopping cart
    """
    def get(self, request, product_id):
        cart = request.cart
        
        try:
            product = get_object_or_404(Product, id=product_id)
            cart.remove(product)
            logger.info(f"Removed product {product.id} from cart for user {request.user.username if request.user.is_authenticated else 'AnonymousUser'}")

            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({'success': True, 'item_count': len(cart)})

            messages.success(request, f"{product.name} removed from cart.")
        except Exception as e:
            logger.error(f"Error removing product from cart: {e}")
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'errors': str(e)}, status=500)
            messages.error(request, "An error occurred. Please try again.")
            
        return redirect('shop:cart')


@method_decorator(require_POST, name='post')
class CartUpdateQuantityView(CartAccessMixin, View):
    """
    Update the quantity of a product in the shopping cart (via AJAX)
    """
    def post(self, request, product_id):
        cart = request.cart
        
        try:
            product = get_object_or_404(Product, id=product_id)
            form = CartUpdateQuantityForm(request.POST)

            if form.is_valid():
                cd = form.cleaned_data
                quantity = cd['quantity']
                
                if quantity > 0:
                    cart.add(product=product,
                            quantity=quantity,
                            update_quantity=True)
                    success = True
                    message = f"Quantity of {product.name} updated to {quantity}."
                    logger.info(f"Updated product {product.id} quantity to {quantity} in cart")
                else:
                    cart.remove(product)
                    success = True
                    message = f"{product.name} removed from cart."
                    logger.info(f"Removed product {product.id} from cart due to quantity=0")
            else:
                success = False
                message = "Invalid quantity."
                logger.warning(f"Invalid cart update form: {form.errors}")
                
        except Exception as e:
            success = False
            message = "An error occurred. Please try again."
            logger.error(f"Error updating cart quantity: {e}")

        return JsonResponse({
            'success': success,
            'message': message,
            'item_count': len(cart),
            'cart_total': str(cart.total_price)
        })


# For backwards compatibility with function-based views
cart = CartDetailView.as_view()
cart_add = CartAddView.as_view()
cart_remove = CartRemoveView.as_view()
cart_update_quantity = CartUpdateQuantityView.as_view()
