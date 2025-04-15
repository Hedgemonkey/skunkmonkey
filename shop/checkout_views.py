import json
import logging
import time

from django.conf import settings
from django.contrib import messages
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.utils import timezone
from django.views.generic import View

import stripe
from djstripe.models import APIKey

from .forms import CheckoutForm
from .mixins import CartAccessMixin
from .models import Order, OrderItem


class CheckoutView(CartAccessMixin, View):
    """
    View for processing checkout with Stripe integration
    Enhanced with detailed logging
    """
    template_name = 'shop/checkout.html'
    logger = logging.getLogger(__name__)

    def get(self, request):
        self.logger.info("CheckoutView GET request started")
        cart = request.cart
        self.logger.debug(
            f"Cart contains {
                cart.items.count()} items with total price {
                cart.total_price}")

        # Always clear client_secret to ensure a fresh payment intent
        if 'client_secret' in request.session:
            self.logger.info('Clearing client_secret from session')
            del request.session['client_secret']

        # Redirect to shop if cart is empty
        if cart.items.count() == 0:
            self.logger.warning(
                "Attempted checkout with empty cart - redirecting to product list")
            messages.warning(
                request, "Your cart is empty. Please add some products first.")
            return redirect('shop:product_list')

        # Pre-fill form with user info if available
        initial_data = {}
        if request.user.is_authenticated:
            self.logger.debug(
                f"Pre-filling form for authenticated user: {request.user.username}")
            initial_data = {
                'full_name': request.user.get_full_name(),
                'email': request.user.email
            }

            # Get the most recent order for this user to pre-fill address
            # fields
            try:
                last_order = Order.objects.filter(
                    user=request.user).latest('created_at')
                if last_order:
                    self.logger.debug(
                        f"Found previous order {
                            last_order.order_number} - using for address pre-fill")
                    # Pre-fill shipping address
                    initial_data.update({
                        'shipping_address1': last_order.shipping_address1,
                        'shipping_address2': last_order.shipping_address2,
                        'shipping_city': last_order.shipping_city,
                        'shipping_state': last_order.shipping_state,
                        'shipping_zipcode': last_order.shipping_zipcode,
                        'shipping_country': last_order.shipping_country,
                        # Pre-fill billing address
                        'billing_address1': last_order.billing_address1,
                        'billing_address2': last_order.billing_address2,
                        'billing_city': last_order.billing_city,
                        'billing_state': last_order.billing_state,
                        'billing_zipcode': last_order.billing_zipcode,
                        'billing_country': last_order.billing_country,
                        'phone_number': last_order.phone_number,
                    })
            except Order.DoesNotExist:
                self.logger.debug("No previous orders found for user")
                # No previous order, just use the basic user info
        else:
            self.logger.debug("User is not authenticated - no form pre-fill")

        form = CheckoutForm(initial=initial_data)

        # Get Stripe API key
        stripe_public_key = settings.STRIPE_PUBLISHABLE_KEY

        context = {
            'cart': cart,
            'form': form,
            'stripe_public_key': stripe_public_key,
            'client_secret': request.session.get('client_secret', ''),
            'order_id': '',  # Add empty order_id to avoid template error
            'djstripe_webhook_url': '/stripe/webhook/'  # Use dj-stripe's webhook URL
        }

        self.logger.info("Checkout page prepared successfully")
        return render(request, self.template_name, context)

    def post(self, request):
        cart = request.cart

        # Return to cart if empty
        if cart.items.count() == 0:
            self.logger.warning("Attempted to submit checkout with empty cart")
            messages.error(request, "Your cart is empty!")
            return redirect('shop:cart')

        stripe_public_key = settings.STRIPE_PUBLISHABLE_KEY

        form = CheckoutForm(request.POST)
        self.logger.debug("Processing checkout form submission")

        if form.is_valid():
            self.logger.info(
                "Checkout form is valid - proceeding with payment processing")
            try:
                # Get client_secret from POST or session
                client_secret = request.POST.get('client_secret')
                if not client_secret:
                    self.logger.debug(
                        "No client_secret in POST data, checking session")
                    client_secret = request.session.get('client_secret')

                if not client_secret:
                    self.logger.error(
                        "No client_secret found in POST or session")
                    messages.error(
                        request, "No payment information was received. Please try again.")
                    return redirect('shop:checkout')

                self.logger.debug(f"Found client_secret: {
                                  client_secret[:10]}...")

                # Extract the payment intent ID from client secret
                pid = client_secret.split('_secret')[0]
                self.logger.info(f"Processing payment intent: {pid}")

                # Create the order
                self.logger.info("Creating order record in database")
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

                # If user is authenticated, associate order with user
                if request.user.is_authenticated:
                    self.logger.debug(
                        f"Associating order with user: {
                            request.user.username}")
                    order.user = request.user

                # Save the order to generate order number
                order.save()
                self.logger.info(
                    f"Order created with number: {
                        order.order_number}")

                # Populate order with items from cart
                self.logger.debug("Adding cart items to order")
                for item in cart.items.all():
                    try:
                        OrderItem.objects.create(
                            order=order,
                            product=item.product,
                            quantity=item.quantity,
                            price=item.price,
                        )
                    except Exception as item_creation_exception:
                        self.logger.error(
                            f"Error creating order item for product {
                                item.product.name}: {item_creation_exception}")
                        order.delete()  # Remove incomplete order
                        messages.error(
                            request, "There was an error processing your order. Please try again.")
                        return redirect('shop:checkout')

                # Clear the cart
                cart.clear()
                self.logger.info("Cart cleared after successful order")

                # Store order ID in session for payment success page
                request.session['order_id'] = order.id
                self.logger.info(
                    f"Order processing completed successfully for order {
                        order.order_number}")

                return redirect('shop:payment_success')

            except Exception as e:
                self.logger.error(f"Payment processing error: {e}")
                messages.error(
                    request, "There was an error processing your payment. Please try again.")
                return redirect('shop:checkout')
        else:
            self.logger.warning(
                "Checkout form is invalid - re-rendering checkout page")
            messages.error(
                request, "Please correct the errors in the form below.")
            context = {
                'cart': cart,
                'form': form,
                'stripe_public_key': stripe_public_key,
                'client_secret': request.session.get('client_secret', ''),
                'djstripe_webhook_url': '/stripe/webhook/'
            }
            return render(request, self.template_name, context)


class CreatePaymentIntentView(View):
    """
    Create a Stripe payment intent and return the client secret
    """

    def post(self, request, *args, **kwargs):
        cart = request.cart

        # Calculate total for Stripe payment intent
        total = cart.total_price
        stripe_total = round(
            total * 100)  # Stripe requires amount in cents/pence

        # Try different ways to get the API key - be flexible about naming
        api_key = None

        # First try by type
        api_key = APIKey.objects.filter(type="sk_test").first()

        # If not found, try by name
        if not api_key:
            # Try different possible names
            for possible_name in [
                "test_secret",
                "Test Secret",
                "secret",
                    "Secret"]:
                api_key = APIKey.objects.filter(
                    name__iexact=possible_name).first()
                if api_key:
                    break

        # If still not found, look for any key that starts with sk_test
        if not api_key:
            for key in APIKey.objects.all():
                if key.secret and key.secret.startswith('sk_test'):
                    api_key = key
                    break

        # If we still don't have a key, fall back to settings
        if not api_key:
            if hasattr(
                    settings,
                    'STRIPE_SECRET_KEY') and settings.STRIPE_SECRET_KEY:
                # Create a mock api_key object
                class MockAPIKey:
                    def __init__(self, secret):
                        self.secret = secret

                api_key = MockAPIKey(settings.STRIPE_SECRET_KEY)
            else:
                return JsonResponse(
                    {'error': 'Stripe API key is not configured correctly'}, status=500)

        # Print debug info about the API key
        print(f"Using API key in CreatePaymentIntentView: {api_key.secret[:8]}... (Type: {
            getattr(api_key, 'type', 'N/A')}, Name: {getattr(api_key, 'name', 'N/A')})")

        # Set the API key for this request
        stripe.api_key = api_key.secret

        # Create a payment intent with the order amount and currency
        # Add a timestamp to ensure uniqueness
        timestamp = int(time.time())

        # Clear any existing payment intent from the session first
        if 'client_secret' in request.session:
            del request.session['client_secret']

        intent = stripe.PaymentIntent.create(
            amount=stripe_total,
            currency=settings.STRIPE_CURRENCY,
            metadata={
                'username': request.user.username if request.user.is_authenticated else 'AnonymousUser',
                'cart_items': json.dumps(cart.to_dict()),
                # Add timestamp to ensure freshness
                'timestamp': str(timestamp),
                # Add ISO timestamp for better tracking
                'created_at': timezone.now().isoformat(),
            },
            automatic_payment_methods={
                'enabled': True,
            },
        )

        # Store the client secret in the session as a backup
        request.session['client_secret'] = intent.client_secret

        return JsonResponse({
            'clientSecret': intent.client_secret,
            'total': total,
            'webhook_url': '/stripe/webhook/'  # Add dj-stripe webhook URL
        })


def recover_payment_intent(request, order_id=None):
    """
    Handle payment intent errors by redirecting to checkout
    """
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
                order.delete()
                messages.info(
                    request, "Your previous incomplete order has been removed.")
        except Order.DoesNotExist:
            pass

    # Redirect to checkout with refresh parameter to ensure a new payment
    # intent
    return redirect('shop:checkout') + '?refresh=' + str(int(time.time()))


def payment_cancel(request):
    """
    Handle cancelled payment
    """
    messages.warning(
        request,
        "Your payment was cancelled. Please try again when you're ready.")
    return redirect('shop:cart')
