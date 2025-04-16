"""
Stripe utility functions for managing API keys and common operations
"""
import json
import logging
import time

from django.conf import settings
from django.utils import timezone

import stripe
from djstripe.models import APIKey

logger = logging.getLogger(__name__)


def get_stripe_key(key_type='secret'):
    """
    Get the appropriate Stripe API key from multiple possible sources

    Args:
        key_type: Type of key to retrieve ('secret' or 'publishable')

    Returns:
        String containing the API key or None if not found
    """
    # First try from settings
    if key_type == 'secret':
        if hasattr(
                settings,
                'STRIPE_SECRET_KEY') and settings.STRIPE_SECRET_KEY:
            logger.debug("Using STRIPE_SECRET_KEY from settings")
            return settings.STRIPE_SECRET_KEY
    elif key_type == 'publishable':
        if hasattr(
                settings,
                'STRIPE_PUBLISHABLE_KEY') and settings.STRIPE_PUBLISHABLE_KEY:
            logger.debug("Using STRIPE_PUBLISHABLE_KEY from settings")
            return settings.STRIPE_PUBLISHABLE_KEY

    # Then try from database
    try:
        # For secret key
        if key_type == 'secret':
            key_prefix = 'sk_'
            possible_names = ["test_secret", "Test Secret", "secret", "Secret"]
            key_types = ["sk_test", "sk_live"]
        # For publishable key
        else:
            key_prefix = 'pk_'
            possible_names = [
                "test_publishable",
                "Test Publishable",
                "publishable",
                "Publishable"]
            key_types = ["pk_test", "pk_live"]

        # Try by type first
        for key_type_name in key_types:
            api_key = APIKey.objects.filter(type=key_type_name).first()
            if api_key and api_key.secret:
                logger.debug(f"Using API key from database: {key_type_name}")
                return api_key.secret

        # If that doesn't work, try by name
        for possible_name in possible_names:
            api_key = APIKey.objects.filter(name__iexact=possible_name).first()
            if api_key and api_key.secret:
                logger.debug(f"Using API key from database: {possible_name}")
                return api_key.secret

        # If that doesn't work, try any key with appropriate prefix
        for key in APIKey.objects.all():
            if key.secret and key.secret.startswith(key_prefix):
                logger.debug(
                    f"Using API key from database with prefix {key_prefix}")
                return key.secret

    except Exception as e:
        logger.error(f"Error retrieving API key from database: {e}")

    # Final fallback for development
    if settings.DEBUG:
        fallback_key = ('sk_test_your_development_key'
                        if key_type == 'secret'
                        else 'pk_test_your_development_key')
        logger.warning(f"Using development fallback for Stripe {key_type} key")
        return fallback_key

    # Log error if we get here
    logger.error(f"No {key_type} Stripe API key found in settings or database")
    return None


def get_stripe_secret_key():
    """
    Get the Stripe secret key using the consolidated method
    Falls back to settings if not found in database
    """
    return get_stripe_key('secret')


def get_stripe_publishable_key():
    """
    Get the Stripe publishable key using the consolidated method
    Falls back to settings if not found in database
    """
    return get_stripe_key('publishable')


def create_payment_intent(request):
    """
    Create a new Stripe payment intent and store client_secret in session
    Returns (client_secret, error_message)
    """
    logger.info("Creating new payment intent")

    cart = request.cart

    # Check if cart is empty
    if not cart or cart.items.count() == 0:
        logger.warning("Attempted to create payment intent with empty cart")
        return None, "Your cart is empty"

    # Get Stripe API key
    stripe_api_key = get_stripe_key('secret')
    if not stripe_api_key:
        logger.error("No Stripe API key found")
        return None, "Payment system configuration error"

    # Set the API key for this request
    stripe.api_key = stripe_api_key

    try:
        # Calculate total for Stripe payment intent
        total = cart.total_price
        # Stripe requires amount in cents/pence
        stripe_total = round(total * 100)

        # Create a timestamp to ensure uniqueness
        timestamp = int(time.time())

        # Create metadata about the cart for the payment intent
        metadata = {
            'username': (
                request.user.username if request.user.is_authenticated
                else 'AnonymousUser'),
            'cart_items': json.dumps(
                cart_to_dict(cart)),
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
                (request.user.username if request.user.is_authenticated
                 else 'AnonymousUser')}")

        return intent.client_secret, None

    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating new payment intent: {e}")
        return None, f"Error with payment system: {str(e)}"
    except Exception as e:
        logger.error(f"Unexpected error creating payment intent: {e}")
        return None, "An unexpected error occurred"


def cart_to_dict(cart):
    """
    Convert cart to a dictionary suitable for JSON serialization
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
