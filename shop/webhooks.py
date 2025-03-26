import stripe
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
import logging
from djstripe.models import APIKey

from .webhook_handler import StripeWH_Handler

# Get a logger instance for this file
logger = logging.getLogger(__name__)

@require_POST
@csrf_exempt
def webhook(request):
    """
    Listen for webhooks from Stripe
    """
    # Setup
    wh_secret = settings.STRIPE_WEBHOOK_SECRET
    logger.info("Webhook received - Starting processing")

    # Get the API key from the database
    api_key = APIKey.objects.filter(type="sk_test").first()
    if api_key:
        stripe.api_key = api_key.secret
        logger.debug(f"Using API key: {api_key.type} ({api_key.name})")
    else:
        logger.warning("No API key found in database, using settings.STRIPE_SECRET_KEY")
    
    # Get the webhook data and verify its signature
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    event = None

    if not sig_header:
        logger.warning("Webhook received without signature header")
        return HttpResponse(status=400)

    try:
        logger.debug(f"Constructing event with signature: {sig_header[:10]}...")
        event = stripe.Webhook.construct_event(
            payload, sig_header, wh_secret
        )
        logger.info(f"Event constructed successfully: {event.id}")
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
    # Removed subscription-related handlers that aren't needed for this project
    event_map = {
        'payment_intent.succeeded': handler.handle_payment_intent_succeeded,
        'payment_intent.payment_failed': handler.handle_payment_intent_payment_failed,
        'payment_method.attached': handler.handle_payment_method_attached,
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
        logger.info(f"Webhook {event_type} handled successfully - Response: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Error during webhook handler execution: {str(e)}", exc_info=True)
        return HttpResponse(content=f"Webhook handler error: {str(e)}", status=500)
