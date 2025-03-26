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

def get_stripe_key(key_type='publishable'):
    """
    Consolidated method to get Stripe keys - prioritizing database keys
    Args:
        key_type: Either 'publishable' or 'secret'
    Returns:
        The requested Stripe API key
    """
    # Set variables based on key type
    if key_type == 'publishable':
        settings_key = 'STRIPE_PUBLISHABLE_KEY'
        api_key_type = "pk_test"
        key_prefix = "pk_"
        possible_names = ["test_publishable", "Test Publishable", "publishable", "Publishable"]
        fallback_key = 'pk_test_your_development_key'
    else:  # secret
        settings_key = 'STRIPE_SECRET_KEY'
        api_key_type = "sk_test"
        key_prefix = "sk_"
        possible_names = ["test_secret", "Test Secret", "secret", "Secret"]
        fallback_key = 'sk_test_your_development_key'
    
    # First try from database (primary source)
    try:
        # Import here to avoid circular imports
        from djstripe.models import APIKey
        
        # Try by type first
        api_key = APIKey.objects.filter(type=api_key_type).first()
        
        # If that doesn't work, try by name
        if not api_key:
            for possible_name in possible_names:
                api_key = APIKey.objects.filter(name__iexact=possible_name).first()
                if api_key:
                    break
        
        # If that doesn't work, try any key with the correct prefix
        if not api_key:
            for key in APIKey.objects.all():
                if key.secret and key.secret.startswith(key_prefix):
                    api_key = key
                    break
        
        if api_key and api_key.secret:
            logger.debug(f"Using Stripe {key_type} key from database: {getattr(api_key, 'name', 'unknown')}")
            return api_key.secret
    except Exception as e:
        logger.error(f"Error retrieving Stripe {key_type} key from database: {e}")
    
    # Fall back to settings (secondary source)
    try:
        if hasattr(settings, settings_key) and getattr(settings, settings_key):
            logger.debug(f"Using {settings_key} from settings")
            return getattr(settings, settings_key)
    except Exception as e:
        logger.error(f"Error retrieving {settings_key} from settings: {e}")
    
    # Final fallback for development
    if settings.DEBUG:
        logger.warning(f"Using development fallback for Stripe {key_type} key")
        return fallback_key
        
    logger.error(f"No Stripe {key_type} key found in database or settings")
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
