import stripe
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import logging
from djstripe import models as djstripe_models
from .models import Order

logger = logging.getLogger(__name__)

@csrf_exempt
@require_POST
def stripe_webhook(request):
    """
    Stripe webhook handler to process events from Stripe.
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    if not sig_header:
        logger.warning("Webhook received without signature header")
        return HttpResponse(status=400)
    
    try:
        # Verify the webhook signature
        stripe.api_key = settings.STRIPE_SECRET_KEY
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        # Invalid payload
        logger.warning(f"Invalid webhook payload: {str(e)}")
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        logger.warning(f"Invalid webhook signature: {str(e)}")
        return HttpResponse(status=400)
    
    # Handle the event
    event_type = event['type']
    event_object = event['data']['object']
    
    logger.info(f"Processing webhook: {event_type}")
    
    if event_type == 'payment_intent.succeeded':
        handle_payment_intent_succeeded(event_object)
    elif event_type == 'payment_intent.payment_failed':
        handle_payment_intent_failed(event_object)
    elif event_type == 'customer.subscription.created':
        handle_subscription_created(event_object)
    elif event_type == 'customer.subscription.updated':
        handle_subscription_updated(event_object)
    elif event_type == 'customer.subscription.deleted':
        handle_subscription_deleted(event_object)
    elif event_type == 'invoice.payment_succeeded':
        handle_invoice_payment_succeeded(event_object)
    elif event_type == 'invoice.payment_failed':
        handle_invoice_payment_failed(event_object)
    else:
        logger.info(f"Unhandled event type: {event_type}")
    
    return HttpResponse(status=200)


def handle_payment_intent_succeeded(payment_intent):
    """
    Handle successful payment intent.
    """
    logger.info(f"Payment succeeded: {payment_intent['id']}")
    
    # Get the order ID from the metadata
    order_id = payment_intent.get('metadata', {}).get('order_id')
    if not order_id:
        logger.warning("Payment intent has no order_id in metadata")
        return
    
    try:
        # Update the order status
        order = Order.objects.get(id=order_id)
        order.is_paid = True
        order.payment_id = payment_intent['id']
        order.save()
        
        logger.info(f"Order {order_id} marked as paid")
    except Order.DoesNotExist:
        logger.warning(f"Order {order_id} not found")


def handle_payment_intent_failed(payment_intent):
    """
    Handle failed payment intent.
    """
    logger.info(f"Payment failed: {payment_intent['id']}")
    
    # Get the order ID from the metadata
    order_id = payment_intent.get('metadata', {}).get('order_id')
    if not order_id:
        logger.warning("Payment intent has no order_id in metadata")
        return
    
    try:
        # Update the order status
        order = Order.objects.get(id=order_id)
        order.payment_status = 'failed'
        order.payment_id = payment_intent['id']
        order.save()
        
        logger.info(f"Order {order_id} marked as payment failed")
    except Order.DoesNotExist:
        logger.warning(f"Order {order_id} not found")


def handle_subscription_created(subscription):
    """
    Handle subscription created event.
    """
    logger.info(f"Subscription created: {subscription['id']}")
    
    # Sync the subscription with djstripe
    djstripe_models.Subscription.sync_from_stripe_data(subscription)


def handle_subscription_updated(subscription):
    """
    Handle subscription updated event.
    """
    logger.info(f"Subscription updated: {subscription['id']}")
    
    # Sync the subscription with djstripe
    djstripe_models.Subscription.sync_from_stripe_data(subscription)


def handle_subscription_deleted(subscription):
    """
    Handle subscription deleted event.
    """
    logger.info(f"Subscription deleted: {subscription['id']}")
    
    # Sync the subscription with djstripe
    djstripe_models.Subscription.sync_from_stripe_data(subscription)


def handle_invoice_payment_succeeded(invoice):
    """
    Handle invoice payment succeeded event.
    """
    logger.info(f"Invoice payment succeeded: {invoice['id']}")
    
    # Sync the invoice with djstripe
    djstripe_models.Invoice.sync_from_stripe_data(invoice)


def handle_invoice_payment_failed(invoice):
    """
    Handle invoice payment failed event.
    """
    logger.info(f"Invoice payment failed: {invoice['id']}")
    
    # Sync the invoice with djstripe
    djstripe_models.Invoice.sync_from_stripe_data(invoice)