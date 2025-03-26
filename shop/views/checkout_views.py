"""
Views for checkout process
"""
from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import View, TemplateView
from django.contrib import messages
from django.conf import settings
from django.http import JsonResponse
import json
import stripe
import time
import logging
from django.utils import timezone

from djstripe.models import PaymentIntent, APIKey

from ..models import Order, OrderItem
from ..forms import CheckoutForm
from .mixins import CartAccessMixin
from ..utils.stripe_utils import get_stripe_publishable_key, get_stripe_secret_key, create_payment_intent


logger = logging.getLogger(__name__)


class CheckoutView(CartAccessMixin, View):
    """
    View for processing checkout with Stripe integration
    Enhanced with detailed logging and consolidated Stripe API key handling
    """
    template_name = 'shop/checkout.html'
    
    def get_stripe_key(self, key_type='publishable'):
        """
        Consolidated method to get Stripe keys
        Args:
            key_type: Either 'publishable' or 'secret'
        Returns:
            The requested Stripe API key
        """
        logger.debug(f"Getting Stripe {key_type} key")
        
        # Set variables based on key type
        if key_type == 'publishable':
            settings_key = 'STRIPE_PUBLISHABLE_KEY'
            api_key_type = "pk_test"
            possible_names = ["test_publishable", "Test Publishable", "publishable", "Publishable"]
            fallback_key = 'pk_test_your_development_key'
        else:  # secret
            settings_key = 'STRIPE_SECRET_KEY'
            api_key_type = "sk_test"
            possible_names = ["test_secret", "Test Secret", "secret", "Secret"]
            fallback_key = 'sk_test_your_development_key'
        
        # First try from settings
        if hasattr(settings, settings_key) and getattr(settings, settings_key):
            logger.debug(f"Using {settings_key} from settings")
            return getattr(settings, settings_key)
        
        # Then try from database (if using dj-stripe)
        try:
            # Try by type first
            api_key = APIKey.objects.filter(type=key_type).first()
            
            # If that doesn't work, try by name
            if not api_key:
                for possible_name in possible_names:
                    api_key = APIKey.objects.filter(name__iexact=possible_name).first()
                    if api_key:
                        break
            
            # If that doesn't work, try any key with appropriate prefix
            if not api_key:
                for key in APIKey.objects.all():
                    if key.secret and key.secret.startswith(api_key_type):
                        api_key = key
                        break
            
            if api_key and api_key.secret:
                logger.debug(f"Using {key_type} API key from database: {getattr(api_key, 'name', 'unknown')}")
                return api_key.secret
                
        except Exception as e:
            logger.error(f"Error retrieving {key_type} API key from database: {e}")
        
        # Fallback for development
        if settings.DEBUG:
            logger.warning(f"Using development fallback for Stripe {key_type} key")
            return fallback_key
            
        logger.error(f"No Stripe {key_type} key found")
        return ''
    
    def get(self, request, *args, **kwargs):
        """
        Display checkout form or redirect to cart if empty
        """
        logger.info("CheckoutView GET request started")
        cart = request.cart
        
        # Check if cart is empty - redirect to cart instead of prefilling forms
        if cart.items.count() == 0:
            logger.debug("Cart is empty, redirecting to cart")
            messages.warning(request, "Your cart is empty!")
            return redirect('shop:cart')
        
        logger.debug(f"Cart contains {cart.items.count()} items with total price {cart.total_price}")
        
        # Get Stripe publishable key using consolidated method
        stripe_public_key = self.get_stripe_key('publishable')
        
        # Create a new payment intent for the checkout
        client_secret, error = create_payment_intent(request)
        
        if error:
            logger.error(f"Error creating payment intent: {error}")
            messages.error(request, f"Payment error: {error}. Please try again.")
        
        # Initialize empty form
        form = CheckoutForm()
        
        context = {
            'cart': cart,
            'form': form,
            'stripe_public_key': stripe_public_key,
            'client_secret': client_secret,
            'djstripe_webhook_url': '/stripe/webhook/'
        }
        
        return render(request, self.template_name, context)
    
    def post(self, request):
        """
        Process checkout form submission
        """
        cart = request.cart
        logger.info("Processing checkout form submission")

        # Return to cart if empty
        if cart.items.count() == 0:
            logger.warning("Attempted to submit checkout with empty cart")
            messages.error(request, "Your cart is empty!")
            return redirect('shop:cart')

        # Get Stripe API key with consolidated method
        stripe_public_key = self.get_stripe_key('publishable')
        logger.debug(f"Using stripe_public_key: {stripe_public_key}")
        
        if not stripe_public_key:
            logger.error("Stripe publishable key not found during form submission")
            messages.error(request, "Payment configuration error. Please contact support.")
            return redirect('shop:checkout')

        form = CheckoutForm(request.POST)

        # Get or create client_secret - do this once regardless of form validity
        # Get client_secret from POST or session
        client_secret = request.POST.get('client_secret')
        if client_secret:
            logger.debug(f"Received client_secret from POST: {client_secret[:10]}...")
        else:
            logger.debug("No client_secret in POST data, checking session")
            client_secret = request.session.get('client_secret')

        # Check if we need to create a new payment intent
        if not client_secret:
            logger.warning("No client_secret found in POST or session, creating new payment intent")
            # Create a new payment intent
            client_secret, error = create_payment_intent(request)
            
            if error:
                logger.error(f"Error creating new payment intent: {error}")
                messages.error(request, f"Payment error: {error}. Please try again.")
                return redirect('shop:checkout')
            
            logger.info(f"Created new payment intent, client_secret: {client_secret[:10]}...")

        # At this point, we should have a client_secret
        if not client_secret:
            logger.error("Failed to create a valid client_secret")
            messages.error(request, "Payment system error. Please try again.")
            return redirect('shop:checkout')

        logger.debug(f"Using client_secret: {client_secret[:10]}...")

        if form.is_valid():
            logger.info("Checkout form is valid - proceeding with payment processing")
            try:

                # Extract the payment intent ID from client secret
                pid = client_secret.split('_secret')[0]
                logger.info(f"Processing payment intent: {pid}")

                # Verify the payment intent is valid
                try:
                    # Get the API key using consolidated method
                    stripe_api_key = self.get_stripe_key('secret')
                    if stripe_api_key:
                        stripe.api_key = stripe_api_key
                        
                        # Retrieve the payment intent to verify it exists and is valid
                        payment_intent = stripe.PaymentIntent.retrieve(pid)
                        
                        # Check if the payment intent is in a valid state
                        valid_states = ['requires_payment_method', 'requires_confirmation', 
                                       'requires_action', 'processing', 'succeeded']
                        if payment_intent.status not in valid_states:
                            logger.warning(f"Payment intent {pid} is in an invalid state: {payment_intent.status}")
                            # Create a new payment intent
                            client_secret, error = create_payment_intent(request)
                            
                            if error:
                                logger.error(f"Error creating new payment intent: {error}")
                                messages.error(request, f"Payment error: {error}. Please try again.")
                                return redirect('shop:checkout')
                            
                            # Update the pid with the new payment intent ID
                            pid = client_secret.split('_secret')[0]
                            logger.info(f"Created new payment intent, new pid: {pid}")
                    else:
                        logger.warning("Could not verify payment intent - Stripe API key not available")
                except Exception as e:
                    logger.warning(f"Error verifying payment intent {pid}: {e}")
                    # Create a new payment intent since verification failed
                    client_secret, error = create_payment_intent(request)
                    
                    if error:
                        logger.error(f"Error creating new payment intent after verification failure: {error}")
                        messages.error(request, f"Payment error: {error}. Please try again.")
                        return redirect('shop:checkout')
                    
                    # Update the pid with the new payment intent ID
                    pid = client_secret.split('_secret')[0]
                    logger.info(f"Created new payment intent after verification failure, new pid: {pid}")

                # Create the order
                logger.info("Creating order record in database")
                order = form.save(commit=False)

                # Set payment information
                order.stripe_pid = pid
                order.stripe_client_secret = client_secret
                order.original_cart = json.dumps(
                    cart.to_dict() if hasattr(cart, 'to_dict') else {})
                order.total_price = cart.total_price
                order.grand_total = cart.total_price  # Add shipping cost if needed
                order.is_paid = True
                order.payment_status = 'completed'
                order.status = 'paid'
                order.paid_at = timezone.now()  # Set the paid_at timestamp

                # If user is authenticated, associate order with user
                if request.user.is_authenticated:
                    logger.debug(f"Associating order with user: {request.user.username}")
                    order.user = request.user

                # Save the order to generate order number
                order.save()
                logger.info(f"Order created with number: {order.order_number}")

                # Populate order with items from cart
                logger.debug("Adding cart items to order")
                for item in cart.items.all():
                    try:
                        OrderItem.objects.create(
                            order=order,
                            product=item.product,
                            quantity=item.quantity,
                            price=item.price,
                        )
                    except Exception as item_creation_exception:
                        logger.error(f"Error creating order item for product {item.product.name}: {item_creation_exception}")
                        order.delete()  # Remove incomplete order
                        messages.error(request, "There was an error processing your order. Please try again.")
                        return redirect('shop:checkout')

                # Clear the cart
                cart.clear()
                logger.info("Cart cleared after successful order")

                # Store order ID in session for payment success page
                request.session['order_id'] = order.id
                logger.info(f"Order processing completed successfully for order {order.order_number}")

                return redirect('shop:checkout_success', order_id=order.id)

            except Exception as e:
                logger.error(f"Payment processing error: {e}")
                messages.error(request, "There was an error processing your payment. Please try again.")
                return redirect('shop:checkout')
        else:
            logger.warning("Checkout form is invalid - re-rendering checkout page")
            messages.error(request, "Please correct the errors in the form below.")
            context = {
                'cart': cart,
                'form': form,
                'stripe_public_key': stripe_public_key,
                'client_secret': client_secret,  # Use the client_secret we just verified/created
                'djstripe_webhook_url': '/stripe/webhook/'
            }
            return render(request, self.template_name, context)


class PaymentSuccessView(TemplateView):
    """
    Display payment success page after order is completed
    """
    template_name = 'shop/payment_success.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        order_id = self.request.session.get('order_id')
        
        if order_id:
            try:
                order = Order.objects.get(id=order_id)
                context['order'] = order
                
                # Clear the order_id from session once viewed
                if 'order_id' in self.request.session:
                    del self.request.session['order_id']
                    
                logger.info(f"Displaying payment success page for order {order.order_number}")
            except Order.DoesNotExist:
                logger.warning(f"Order with ID {order_id} not found for success page")
                # If order not found, show generic success message
                pass
                
        return context


class CheckoutSuccessView(TemplateView):
    """
    Display checkout success page for a specific order
    Takes order_id as URL parameter
    """
    template_name = 'shop/payment_success.html'  # Reusing the same template as PaymentSuccessView
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        order_id = self.kwargs.get('order_id')
        
        if order_id:
            try:
                order = Order.objects.get(id=order_id)
                context['order'] = order
                logger.info(f"Displaying checkout success page for order {order.order_number}")
            except Order.DoesNotExist:
                logger.warning(f"Order with ID {order_id} not found for checkout success page")
                messages.error(self.request, "The requested order could not be found.")
        else:
            logger.warning("Checkout success page requested without order_id")
            messages.error(self.request, "No order information provided.")
            
        return context


def payment_success(request):
    """
    Function-based view for payment success
    Redirects to class-based view for consistency
    """
    return PaymentSuccessView.as_view()(request)


def payment_cancel(request):
    """
    Handle cancelled payment
    """
    logger.info("Payment cancelled by user")
    messages.warning(
        request, "Your payment was cancelled. Please try again when you're ready.")
    return redirect('shop:cart_detail')


def recover_payment_intent(request, order_id=None):
    """
    Handle payment intent errors by redirecting to checkout
    """
    logger.info("Recovering from payment intent error")
    
    # Clear any existing payment intent from the session
    if 'client_secret' in request.session:
        del request.session['client_secret']

    messages.info(
        request, "We've refreshed your checkout session. Please try again.")

    # If we have an order ID, we might want to delete the incomplete order
    if order_id:
        try:
            order = Order.objects.get(id=order_id)
            # Only delete if not paid
            if not order.is_paid:
                logger.info(f"Deleting incomplete order {order.order_number}")
                order.delete()
                messages.info(
                    request, "Your previous incomplete order has been removed.")
        except Order.DoesNotExist:
            logger.warning(f"Order with ID {order_id} not found for recovery")
            pass

    # Redirect to checkout with refresh parameter to ensure a new payment intent
    return redirect('shop:checkout')


def reset_payment_intent(request):
    """
    Reset the payment intent by removing it from session and creating a fresh one
    This is useful when the payment process needs to be restarted
    """
    logger.info("Reset payment intent requested")
    
    # Clear any existing payment intent from the session
    if 'client_secret' in request.session:
        logger.info("Removing existing client_secret from session")
        del request.session['client_secret']
    
    # Redirect to checkout to create a new payment intent
    messages.info(request, "Your payment session has been refreshed. You can now proceed with checkout.")
    return redirect('shop:checkout')


class OrderDetailView(View):
    """
    Display details of a specific order
    """
    template_name = 'shop/order_detail.html'
    
    def get(self, request, order_id):
        # Check if the user is authorized to view this order
        if request.user.is_authenticated:
            # Staff can view any order
            if request.user.is_staff:
                order = get_object_or_404(Order, id=order_id)
            else:
                # Regular users can only view their own orders
                order = get_object_or_404(Order, id=order_id, user=request.user)
        else:
            # For guests, check if the order is in their session
            session_order_id = request.session.get('order_id')
            if session_order_id and str(session_order_id) == str(order_id):
                order = get_object_or_404(Order, id=order_id)
            else:
                messages.error(request, "You do not have permission to view this order.")
                return redirect('shop:product_list')
        
        context = {
            'order': order,
        }
        
        return render(request, self.template_name, context)
