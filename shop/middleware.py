import logging
import uuid

from django.utils.deprecation import MiddlewareMixin

from .models import Cart, ComparisonList

logger = logging.getLogger(__name__)


class CartMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Get or create cart for the current user/session
        if request.user.is_authenticated:
            cart, created = Cart.objects.get_or_create(user=request.user)
        else:
            session_id = request.session.get('cart_id')
            if not session_id:
                # If no session ID exists, create a new cart with a new session
                # ID
                session_id = str(uuid.uuid4())
                request.session['cart_id'] = session_id
                cart = Cart.objects.create(session_id=session_id)
            else:
                cart, created = Cart.objects.get_or_create(
                    session_id=session_id)

        # Attach the cart to the request
        request.cart = cart

        response = self.get_response(request)
        return response


class CheckoutDebugMiddleware(MiddlewareMixin):
    """
    Middleware to debug checkout redirection issues
    """

    def process_response(self, request, response):
        # Check if this is a checkout request that's being redirected
        if request.path == '/shop/checkout/' and response.status_code == 302:
            # Log detailed information
            logger.error(
                f"CHECKOUT REDIRECT DETECTED: Redirecting to {
                    response.url}")

            # Log cart information
            if hasattr(request, 'cart'):
                cart = request.cart
                logger.error(
                    f"Cart info: Items count: {
                        cart.items.count()}, Total: {
                        cart.total_price}")

                # Log individual items
                for item in cart.items.all():
                    logger.error(
                        f"Cart item: {
                            item.product.name}, Quantity: {
                            item.quantity}")
            else:
                logger.error("Cart attribute not found on request")

            # Log Stripe configuration
            from django.conf import settings
            logger.error(
                f"Stripe public key present: {
                    'Yes' if hasattr(
                        settings,
                        'STRIPE_PUBLISHABLE_KEY') and settings.STRIPE_PUBLISHABLE_KEY else 'No'}")
            logger.error(
                f"Stripe secret key present: {
                    'Yes' if hasattr(
                        settings,
                        'STRIPE_SECRET_KEY') and settings.STRIPE_SECRET_KEY else 'No'}")

            # Log session information
            logger.error(f"Session ID: {request.session.session_key}")
            logger.error(f"Session data: {dict(request.session)}")

            # Log request information
            logger.error(
                f"User authenticated: {
                    request.user.is_authenticated}")
            if request.user.is_authenticated:
                logger.error(f"Username: {request.user.username}")

        return response


class ComparisonMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Get or create comparison list for the current user/session
        if request.user.is_authenticated:
            # For authenticated users, use user_id
            comparison_lists = ComparisonList.objects.filter(
                user=request.user).order_by('-updated_at')

            if comparison_lists.exists():
                comparison_list = comparison_lists.first()

                # If there are duplicates, log it
                if comparison_lists.count() > 1:
                    logger.warning(
                        f"Multiple comparison lists found for user {
                            request.user.id}. Using most recent.")
            else:
                # Create a new list if none exists
                comparison_list = ComparisonList.objects.create(
                    user=request.user)
        else:
            # For anonymous users, use session_id
            session_id = request.session.get('comparison_id')

            if not session_id:
                # If no session ID exists, create a new comparison list with a
                # new session ID
                session_id = str(uuid.uuid4())
                request.session['comparison_id'] = session_id
                comparison_list = ComparisonList.objects.create(
                    session_id=session_id)
            else:
                # Get the comparison lists for this session
                comparison_lists = ComparisonList.objects.filter(
                    session_id=session_id).order_by('-updated_at')

                if comparison_lists.exists():
                    comparison_list = comparison_lists.first()

                    # If there are duplicates, log it
                    if comparison_lists.count() > 1:
                        logger.warning(f"Multiple comparison lists found for session {
                                       session_id}. Using most recent.")
                else:
                    # Create a new list if none exists for this session
                    comparison_list = ComparisonList.objects.create(
                        session_id=session_id)

        # Attach the comparison list to the request
        request.comparison_list = comparison_list
        request.comparison_list.product_ids = [
            product.id for product in comparison_list.products.all()
        ]

        response = self.get_response(request)
        return response
