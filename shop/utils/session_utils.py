"""
Session utility functions for the shop app
Handles Stripe client secrets and checkout session data
"""
import hashlib
import json
import logging

logger = logging.getLogger(__name__)


def get_cart_signature(cart):
    """
    Generate a signature for the current cart state.
    This will be used to determine if the cart has changed since
    the client secret was generated.

    Args:
        cart: The shopping cart object

    Returns:
        str: A hash signature of the cart state
    """
    # Create a representation of the cart state
    cart_items = []
    for item in cart.items.all():
        cart_items.append({
            'product_id': item.product.id,
            'quantity': item.quantity,
            'price': str(item.price)
        })

    # Sort to ensure consistent ordering
    cart_items.sort(key=lambda x: x['product_id'])

    # Include total price in the signature
    cart_state = {
        'items': cart_items,
        'total_price': str(cart.total_price),
        'item_count': cart.items.count()
    }

    # Create a hash of the cart state
    cart_string = json.dumps(cart_state, sort_keys=True)
    return hashlib.md5(cart_string.encode()).hexdigest()


def is_client_secret_valid(request, cart):
    """
    Check if the stored client secret is valid for the current cart state.

    Args:
        request: The HTTP request object
        cart: The shopping cart object

    Returns:
        bool: True if the client secret is valid, False otherwise
    """
    # Get stored cart signature and client secret
    stored_signature = request.session.get('cart_signature')
    client_secret = request.session.get('client_secret')

    # If either is missing, the client secret is invalid
    if not stored_signature or not client_secret:
        logger.debug("Missing stored_signature or client_secret in session")
        return False

    # Generate a new signature for the current cart
    current_signature = get_cart_signature(cart)

    # Compare signatures
    is_valid = stored_signature == current_signature

    if not is_valid:
        logger.debug(f"Cart signature mismatch: stored={
                     stored_signature}, current={current_signature}")

    return is_valid


def store_stripe_session_data(request, cart, client_secret):
    """
    Store the Stripe session data and cart signature in the session.

    Args:
        request: The HTTP request object
        cart: The shopping cart object
        client_secret: The Stripe client secret
    """
    # Generate cart signature
    cart_signature = get_cart_signature(cart)

    # Store in session
    request.session['cart_signature'] = cart_signature
    request.session['client_secret'] = client_secret
    request.session.modified = True

    logger.debug(f"Stored new client_secret and cart_signature: {
                 cart_signature}")


def clear_stripe_session_data(request):
    """
    Clear all Stripe-related session data.

    Args:
        request: The HTTP request object
    """
    # Clear Stripe-related session data
    if 'client_secret' in request.session:
        logger.debug("Clearing client_secret from session")
        del request.session['client_secret']

    if 'cart_signature' in request.session:
        logger.debug("Clearing cart_signature from session")
        del request.session['cart_signature']

    request.session.modified = True
