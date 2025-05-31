import logging

from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

import stripe

from .utils.stripe_utils import get_stripe_key
from .webhook_handler import StripeWH_Handler

# Get a logger instance for this file
logger = logging.getLogger(__name__)


@require_POST
@csrf_exempt
def webhook(request):
    """
    Listen for webhooks from Stripe
    Enhanced for Payment Element integration
    """
    # Setup
    wh_secret = settings.DJSTRIPE_WEBHOOK_SECRET
    logger.info("Webhook received - Starting processing")

    # Get the Stripe API key
    stripe_api_key = get_stripe_key('secret')
    if not stripe_api_key:
        logger.error("No Stripe API key available for webhook processing")
        return HttpResponse("Configuration error", status=500)

    # Set the API key for this request
    stripe.api_key = stripe_api_key

    # Get the webhook data and verify its signature
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    event = None

    if not sig_header:
        logger.warning("Webhook received without signature header")
        return HttpResponse(status=400)

    try:
        logger.debug(
            f"Constructing event with signature: {sig_header[:10]}..."
        )
        event = stripe.Webhook.construct_event(
            payload, sig_header, wh_secret
        )
        logger.info(
            f"Event constructed successfully: {event.id}, type: {event.type}")
    except ValueError as e:
        # Invalid payload
        logger.error(f"Webhook error (Invalid payload): {str(e)}")
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        logger.error(f"Signature verification failed: {str(e)}")
        return HttpResponse(status=400)
    except Exception as e:
        # General exception
        logger.error(f"Webhook error: {str(e)}", exc_info=True)
        return HttpResponse(content=str(e), status=400)

    # Set up a webhook handler
    handler = StripeWH_Handler(request)
    logger.debug("Webhook handler initialized")

    # Map webhook events to relevant handler functions
    # Enhanced to support Payment Element events
    event_map = {
        # Payment Intent events
        'payment_intent.succeeded': handler.handle_payment_intent_succeeded,
        'payment_intent.payment_failed': (
            handler.handle_payment_intent_payment_failed),
        'payment_intent.created': handler.handle_event,
        'payment_intent.canceled': handler.handle_event,

        # Payment Method events
        'payment_method.attached': handler.handle_payment_method_attached,
        'payment_method.detached': handler.handle_event,
        'payment_method.updated': handler.handle_event,

        # Setup Intent events (for saving payment methods)
        'setup_intent.created': handler.handle_event,
        'setup_intent.setup_failed': handler.handle_event,
        'setup_intent.succeeded': handler.handle_event,

        # Customer events
        'customer.created': handler.handle_event,
        'customer.updated': handler.handle_event,
        'customer.deleted': handler.handle_event,

        # Checkout Session events (if using Checkout)
        'checkout.session.completed': handler.handle_event,
        'checkout.session.async_payment_succeeded': handler.handle_event,
        'checkout.session.async_payment_failed': handler.handle_event,
    }

    # Get the webhook type from Stripe
    event_type = event.type

    logger.info(f"Processing webhook: {event_type} (ID: {event.id})")

    # If there's a handler for it, get it from the event map
    # Use the generic one by default
    event_handler = event_map.get(event_type, handler.handle_event)
    logger.debug(f"Using handler: {event_handler.__name__}")

    # Call the event handler with the event
    try:
        response = event_handler(event)
        logger.info(
            f"Webhook {event_type} handled successfully - "
            f"Response: {response.status_code}"
        )
        return response
    except Exception as e:
        logger.error(
            f"Error during webhook handler execution: {str(e)}",
            exc_info=True
        )
        return HttpResponse(
            content=f"Webhook handler error: {str(e)}",
            status=500
        )
