"""
Views for payment processing
"""
import json
import logging
import time

from django.conf import settings
from django.contrib import messages
from django.http import JsonResponse
from django.shortcuts import redirect
from django.utils import timezone
from django.views import View
from django.views.decorators.http import require_POST

import stripe
from djstripe.models import APIKey

logger = logging.getLogger(__name__)


class CreatePaymentIntentView(View):
    """
    Create a Stripe payment intent and return the client secret
    """

    def post(self, request, *args, **kwargs):
        cart = request.cart

        # Calculate total for Stripe payment intent
        total = cart.total_price
        # Stripe requires amount in cents/pence
        stripe_total = round(total * 100)

        # Stop if cart is empty
        if cart.items.count() == 0:
            logger.warning(
                "Attempted to create payment intent with empty cart")
            return JsonResponse({'error': 'Your cart is empty'}, status=400)

        # Get Stripe API key
        try:
            stripe_api_key = self.get_stripe_api_key()
            if not stripe_api_key:
                logger.error("No Stripe API key found")
                return JsonResponse(
                    {'error': 'Stripe API key is not configured correctly'}, status=500)

            # Set the API key for this request
            stripe.api_key = stripe_api_key
        except Exception as e:
            logger.error(f"Error getting Stripe API key: {e}")
            return JsonResponse(
                {'error': 'Payment system configuration error'}, status=500)

        try:
            # Create a payment intent with the order amount and currency
            # Add a timestamp to ensure uniqueness
            timestamp = int(time.time())

            # Clear any existing payment intent from the session first
            if 'client_secret' in request.session:
                del request.session['client_secret']

            # Create metadata about the cart for the payment intent
            metadata = {
                'username': request.user.username if request.user.is_authenticated else 'AnonymousUser',
                'cart_items': json.dumps(self.get_cart_data(cart)),
                # Add timestamp to ensure freshness
                'timestamp': str(timestamp),
                # Add ISO timestamp for better tracking
                'created_at': timezone.now().isoformat(),
            }

            intent = stripe.PaymentIntent.create(
                amount=stripe_total,
                currency=settings.STRIPE_CURRENCY,
                metadata=metadata,
                automatic_payment_methods={
                    'enabled': True,
                },
            )

            # Store the client secret in the session as a backup
            request.session['client_secret'] = intent.client_secret
            logger.info(
                f"Created payment intent {
                    intent.id} for {
                    request.user.username if request.user.is_authenticated else 'AnonymousUser'}")

            return JsonResponse({
                'clientSecret': intent.client_secret,
                'total': total,
                'webhook_url': '/stripe/webhook/'  # Add dj-stripe webhook URL
            })

        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating payment intent: {e}")
            return JsonResponse({'error': str(e)}, status=400)
        except Exception as e:
            logger.error(f"Unexpected error creating payment intent: {e}")
            return JsonResponse(
                {'error': 'An unexpected error occurred'}, status=500)

    def get_stripe_api_key(self):
        """
        Get the Stripe API key from multiple possible sources
        """
        # First try from settings
        if hasattr(
                settings,
                'STRIPE_SECRET_KEY') and settings.STRIPE_SECRET_KEY:
            logger.debug("Using STRIPE_SECRET_KEY from settings")
            return settings.STRIPE_SECRET_KEY

        # Then try from database
        try:
            # Try by type first
            api_key = APIKey.objects.filter(type="sk_test").first()

            # If that doesn't work, try by name
            if not api_key:
                for possible_name in [
                    "test_secret",
                    "Test Secret",
                    "secret",
                        "Secret"]:
                    api_key = APIKey.objects.filter(
                        name__iexact=possible_name).first()
                    if api_key:
                        break

            # If that doesn't work, try any key with sk_test
            if not api_key:
                for key in APIKey.objects.all():
                    if key.secret and key.secret.startswith('sk_test'):
                        api_key = key
                        break

            if api_key and api_key.secret:
                logger.debug(
                    f"Using API key from database: {
                        getattr(
                            api_key,
                            'name',
                            'unknown')}")
                return api_key.secret
        except Exception as e:
            logger.error(f"Error retrieving API key from database: {e}")

        return None

    def get_cart_data(self, cart):
        """
        Convert cart to JSON-serializable dict
        """
        if hasattr(cart, 'to_dict'):
            return cart.to_dict()

        # Fall back to manual conversion
        cart_data = {
            'items': [],
            'total': str(cart.total_price)
        }

        for item in cart.items.all():
            cart_data['items'].append({
                'product_id': item.product.id,
                'product_name': item.product.name,
                'quantity': item.quantity,
                'price': str(item.price),
            })

        return cart_data


@require_POST
def cache_checkout_data(request):
    """
    Cache checkout data in the Stripe payment intent metadata
    """
    logger.debug("cache_checkout_data called")
    try:
        # Get client_secret from either JSON or form data
        data = None
        client_secret = None
        save_info = False

        # Check content type and parse appropriately
        if request.content_type == 'application/json':
            data = json.loads(request.body.decode('utf-8'))
            client_secret = data.get('client_secret', '')
            save_info = data.get('save_info', False)
        else:
            # Form data submission
            client_secret = request.POST.get('client_secret', '')
            save_info = request.POST.get('save_info') == 'true'

        if not client_secret:
            logger.warning("Missing client_secret in cache_checkout_data")
            return JsonResponse({
                'error': 'Missing client_secret parameter'
            }, status=400)

        # Extract the payment intent ID from the client secret
        try:
            pid = client_secret.split('_secret')[0]
            logger.debug(f"Extracted payment intent ID: {pid}")
        except BaseException:
            logger.error("Invalid client_secret format")
            return JsonResponse({
                'error': 'Invalid client_secret format'
            }, status=400)

        # Get Stripe API key
        stripe.api_key = CreatePaymentIntentView().get_stripe_api_key()
        if not stripe.api_key:
            logger.error("No Stripe API key available")
            return JsonResponse(
                {'error': 'Stripe API key is not configured correctly'}, status=500)

        # Extract cart data
        cart_data = {}
        if hasattr(request.cart, 'to_dict'):
            cart_data = request.cart.to_dict()
        elif hasattr(request.cart, 'items'):
            cart_items = []
            for item in request.cart.items.all():
                cart_items.append({
                    'product_id': item.product.id,
                    'quantity': item.quantity,
                    'price': str(item.product.price),
                })
            cart_data = {'items': cart_items}

        # Modify the payment intent with metadata
        try:
            logger.info(f"Modifying payment intent: {pid}")
            try:
                stripe.PaymentIntent.modify(pid, metadata={
                    'cart': json.dumps(cart_data),
                    'save_info': save_info,
                    'username': request.user.username if request.user.is_authenticated else 'AnonymousUser',
                    'timestamp_modified': str(int(time.time())),
                })

                logger.info("Payment intent metadata updated successfully")
                return JsonResponse({'success': True})
            except stripe.error.InvalidRequestError as e:
                # Handle payment intent in unexpected state
                if "payment_intent_unexpected_state" in str(e):
                    logger.warning(f"Payment intent in unexpected state: {e}")
                    return JsonResponse({
                        'error': 'payment_intent_unexpected_state',
                        'message': 'The payment session has expired. Please refresh the page to continue.'
                    }, status=409)
                else:
                    raise e
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {e}")
            return JsonResponse({'error': str(e)}, status=400)

    except json.JSONDecodeError:
        logger.error("Invalid JSON in request")
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        logger.error(f"Error in cache_checkout_data: {e}")
        return JsonResponse({'error': str(e)}, status=500)


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

    cart = request.cart

    # Check if cart is empty
    if not cart or cart.items.count() == 0:
        logger.warning("Attempted to reset payment intent with empty cart")
        messages.warning(
            request,
            "Your cart is empty. Please add some products first.")
        return redirect('shop:product_list')

    # Get Stripe API key
    try:
        create_payment_view = CreatePaymentIntentView()
        stripe_api_key = create_payment_view.get_stripe_api_key()
        if not stripe_api_key:
            logger.error("No Stripe API key found")
            messages.error(
                request,
                "Payment system configuration error. Please try again later.")
            return redirect('shop:checkout')

        # Set the API key for this request
        stripe.api_key = stripe_api_key
    except Exception as e:
        logger.error(f"Error getting Stripe API key: {e}")
        messages.error(
            request,
            "Payment system configuration error. Please try again later.")
        return redirect('shop:checkout')

    try:
        # Calculate total for Stripe payment intent
        total = cart.total_price
        # Stripe requires amount in cents/pence
        stripe_total = round(total * 100)

        # Create a timestamp to ensure uniqueness
        timestamp = int(time.time())

        # Create metadata about the cart for the payment intent
        metadata = {
            'username': request.user.username if request.user.is_authenticated else 'AnonymousUser',
            'cart_items': json.dumps(create_payment_view.get_cart_data(cart)),
            'timestamp': str(timestamp),  # Add timestamp to ensure freshness
            # Add ISO timestamp for better tracking
            'created_at': timezone.now().isoformat(),
            'reset_initiated': 'true',
        }

        # Create a fresh payment intent
        intent = stripe.PaymentIntent.create(
            amount=stripe_total,
            currency=settings.STRIPE_CURRENCY,
            metadata=metadata,
            automatic_payment_methods={
                'enabled': True,
            },
        )

        # Store the new client secret in the session
        request.session['client_secret'] = intent.client_secret
        logger.info(
            f"Created new payment intent {
                intent.id} after reset for {
                request.user.username if request.user.is_authenticated else 'AnonymousUser'}")

        messages.success(
            request,
            "Your payment session has been refreshed. You can now proceed with checkout.")
        return redirect('shop:checkout')

    except stripe.error.StripeError as e:
        logger.error(
            f"Stripe error creating new payment intent during reset: {e}")
        messages.error(request, f"Error with payment system: {str(e)}")
        return redirect('shop:checkout')
    except Exception as e:
        logger.error(
            f"Unexpected error creating payment intent during reset: {e}")
        messages.error(
            request,
            "An unexpected error occurred. Please try again.")
        return redirect('shop:checkout')


def create_new_payment_intent(request):
    """
    Create a new payment intent and return the client secret
    Similar to reset_payment_intent but returns the client_secret directly
    instead of redirecting
    """
    logger.info("Creating new payment intent")

    cart = request.cart

    # Check if cart is empty
    if not cart or cart.items.count() == 0:
        logger.warning("Attempted to create payment intent with empty cart")
        return None, "Your cart is empty"

    # Get Stripe API key
    try:
        create_payment_view = CreatePaymentIntentView()
        stripe_api_key = create_payment_view.get_stripe_api_key()
        if not stripe_api_key:
            logger.error("No Stripe API key found")
            return None, "Payment system configuration error"

        # Set the API key for this request
        stripe.api_key = stripe_api_key
    except Exception as e:
        logger.error(f"Error getting Stripe API key: {e}")
        return None, "Payment system configuration error"

    try:
        # Calculate total for Stripe payment intent
        total = cart.total_price
        # Stripe requires amount in cents/pence
        stripe_total = round(total * 100)

        # Create a timestamp to ensure uniqueness
        timestamp = int(time.time())

        # Create metadata about the cart for the payment intent
        metadata = {
            'username': request.user.username if request.user.is_authenticated else 'AnonymousUser',
            'cart_items': json.dumps(
                create_payment_view.get_cart_data(cart)),
            'timestamp': str(timestamp),
            'created_at': timezone.now().isoformat(),
        }

        # Create a fresh payment intent
        intent = stripe.PaymentIntent.create(
            amount=stripe_total,
            currency=settings.STRIPE_CURRENCY,
            metadata=metadata,
            automatic_payment_methods={
                'enabled': True,
            },
        )

        # Store the new client secret in the session
        request.session['client_secret'] = intent.client_secret
        logger.info(
            f"Created new payment intent {
                intent.id} for {
                request.user.username if request.user.is_authenticated else 'AnonymousUser'}")

        return intent.client_secret, None

    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating new payment intent: {e}")
        return None, f"Error with payment system: {str(e)}"
    except Exception as e:
        logger.error(f"Unexpected error creating payment intent: {e}")
        return None, "An unexpected error occurred"
