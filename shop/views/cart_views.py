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
from django.core.exceptions import ValidationError
import logging

from products.models import Product
from ..forms import CartAddProductForm, CartUpdateQuantityForm
from .mixins import CartAccessMixin
from ..utils.error_handling import ErrorHandler

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
            # Validate the product exists and is active
            product = get_object_or_404(Product, id=product_id, is_active=True)
            
            # Validate form data
            form = CartAddProductForm(request.POST)
            if not form.is_valid():
                ErrorHandler.handle_form_errors(request, form, "cart_add_form")
                if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                    return JsonResponse({
                        'success': False, 
                        'errors': form.errors
                    }, status=400)
                return redirect('shop:cart')
            
            # Process valid form
            cd = form.cleaned_data
            quantity = cd['quantity']
            
            # Verify quantity is valid
            if quantity <= 0:
                raise ValidationError("Quantity must be greater than zero")
                
            # Add to cart
            cart.add(
                product=product,
                quantity=quantity,
                update_quantity=cd['update']
            )

            # Log the action
            ErrorHandler.log_action(
                action="add_to_cart",
                user=request.user,
                data={"product_id": product_id, "quantity": quantity}
            )

            # Return appropriate response
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True, 
                    'item_count': len(cart),
                    'message': f"{product.name} added to cart."
                })

            messages.success(request, f"{product.name} added to cart.")
                
        except ValidationError as e:
            # Handle validation errors
            ErrorHandler.handle_validation_error(request, e, "adding to cart")
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': False, 
                    'errors': str(e)
                }, status=400)
                
        except Exception as e:
            # Handle unexpected errors
            ErrorHandler.handle_exception(request, e, "adding product to cart")
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': False, 
                    'errors': "An error occurred. Please try again."
                }, status=500)

        return redirect('shop:cart')


class CartRemoveView(CartAccessMixin, View):
    """
    Remove a product from the shopping cart
    """
    def get(self, request, product_id):
        cart = request.cart
        
        try:
            # Validate the product exists
            product = get_object_or_404(Product, id=product_id)
            
            # Remove from cart
            cart.remove(product)
            
            # Log the action
            ErrorHandler.log_action(
                action="remove_from_cart",
                user=request.user,
                data={"product_id": product_id}
            )

            # Return appropriate response
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True, 
                    'item_count': len(cart),
                    'message': f"{product.name} removed from cart."
                })

            messages.success(request, f"{product.name} removed from cart.")
            
        except Exception as e:
            # Handle unexpected errors
            ErrorHandler.handle_exception(request, e, "removing product from cart")
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': False, 
                    'errors': "An error occurred. Please try again."
                }, status=500)
            
        return redirect('shop:cart')


@method_decorator(require_POST, name='post')
class CartUpdateQuantityView(CartAccessMixin, View):
    """
    Update the quantity of a product in the shopping cart (via AJAX)
    """
    def post(self, request, product_id):
        cart = request.cart
        success = False
        message = ""
        
        try:
            # Validate the product exists
            product = get_object_or_404(Product, id=product_id)
            
            # Validate form data
            form = CartUpdateQuantityForm(request.POST)
            if not form.is_valid():
                ErrorHandler.handle_form_errors(request, form, "cart_update_form")
                message = "Invalid quantity."
                raise ValidationError("Invalid quantity provided")
            
            # Process valid form
            cd = form.cleaned_data
            quantity = cd['quantity']
            
            # Update cart based on quantity
            if quantity > 0:
                cart.add(
                    product=product,
                    quantity=quantity,
                    update_quantity=True
                )
                success = True
                message = f"Quantity of {product.name} updated to {quantity}."
                
                # Log the action
                ErrorHandler.log_action(
                    action="update_cart_quantity",
                    user=request.user,
                    data={"product_id": product_id, "quantity": quantity}
                )
            else:
                cart.remove(product)
                success = True
                message = f"{product.name} removed from cart."
                
                # Log the action
                ErrorHandler.log_action(
                    action="remove_from_cart",
                    user=request.user,
                    data={"product_id": product_id, "reason": "quantity_zero"}
                )
                
        except ValidationError as e:
            # Handle validation errors
            ErrorHandler.handle_validation_error(request, e, "updating cart quantity")
            message = "Invalid quantity."
                
        except Exception as e:
            # Handle unexpected errors
            ErrorHandler.handle_exception(request, e, "updating cart quantity")
            message = "An error occurred. Please try again."

        # Return JSON response
        return JsonResponse({
            'success': success,
            'message': message,
            'item_count': len(cart),
            'cart_total': str(cart.total_price)
        }, status=200 if success else 400)


# For backwards compatibility with function-based views
cart = CartDetailView.as_view()
cart_add = CartAddView.as_view()
cart_remove = CartRemoveView.as_view()
cart_update_quantity = CartUpdateQuantityView.as_view()
