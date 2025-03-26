"""
Utility functions for Stripe integration
"""
import stripe
import json
import time
import logging
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

def get_stripe_secret_key():
    """
    Get the Stripe secret key from database (djstripe)
    Falls back to settings if not found in database
    """
    try:
        # Import here to avoid circular imports
        from djstripe.models import APIKey
        
        # Try by type first
        api_key = APIKey.objects.filter(type="sk_test").first()
        
        # If that doesn't work, try by name
        if not api_key:
            for possible_name in ["test_secret", "Test Secret", "secret", "Secret"]:
                api_key = APIKey.objects.filter(name__iexact=possible_name).first()
                if api_key:
                    break
        
        # If that doesn't work, try any key with sk_test
        if not api_key:
            for key in APIKey.objects.all():
                if key.secret and key.secret.startswith('sk_test'):
                    api_key = key
                    break
        
        if api_key and api_key.secret:
            logger.debug(f"Using Stripe secret key from database: {getattr(api_key, 'name', 'unknown')}")
            return api_key.secret
    except Exception as e:
        logger.error(f"Error retrieving Stripe secret key from database: {e}")
    
    # Fall back to settings
    if hasattr(settings, 'STRIPE_SECRET_KEY') and settings.STRIPE_SECRET_KEY:
        logger.debug("Using STRIPE_SECRET_KEY from settings")
        return settings.STRIPE_SECRET_KEY
    
    logger.error("No Stripe secret key found in database or settings")
    return None

def get_stripe_publishable_key():
    """
    Get the Stripe publishable key from database (djstripe)
    Falls back to settings if not found in database
    """
    try:
        # Import here to avoid circular imports
        from djstripe.models import APIKey
        
        # Try by type first
        api_key = APIKey.objects.filter(type="pk_test").first()
        
        # If that doesn't work, try by name
        if not api_key:
            for possible_name in ["test_publishable", "Test Publishable", "publishable", "Publishable"]:
                api_key = APIKey.objects.filter(name__iexact=possible_name).first()
                if api_key:
                    break
        
        # If that doesn't work, try any key with pk_test
        if not api_key:
            for key in APIKey.objects.all():
                if key.secret and key.secret.startswith('pk_test'):
                    api_key = key
                    break
        
        if api_key and api_key.secret:
            logger.debug(f"Using Stripe publishable key from database: {getattr(api_key, 'name', 'unknown')}")
            return api_key.secret
    except Exception as e:
        logger.error(f"Error retrieving Stripe publishable key from database: {e}")
    
    # Fall back to settings
    if hasattr(settings, 'STRIPE_PUBLISHABLE_KEY') and settings.STRIPE_PUBLISHABLE_KEY:
        logger.debug("Using STRIPE_PUBLISHABLE_KEY from settings")
        return settings.STRIPE_PUBLISHABLE_KEY
    
    logger.error("No Stripe publishable key found in database or settings")
    return None

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
    stripe_api_key = get_stripe_secret_key()
    if not stripe_api_key:
        logger.error("No Stripe API key found")
        return None, "Payment system configuration error"
    
    # Set the API key for this request
    stripe.api_key = stripe_api_key
    
    try:
        # Calculate total for Stripe payment intent
        total = cart.total_price
        stripe_total = round(total * 100)  # Stripe requires amount in cents/pence
        
        # Create a timestamp to ensure uniqueness
        timestamp = int(time.time())
        
        # Create metadata about the cart for the payment intent
        metadata = {
            'username': request.user.username if request.user.is_authenticated else 'AnonymousUser',
            'cart_items': json.dumps(cart_to_dict(cart)),
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
        logger.info(f"Created new payment intent {intent.id} for {request.user.username if request.user.is_authenticated else 'AnonymousUser'}")
        
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