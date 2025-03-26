import json
import logging
import stripe
from django.conf import settings
from django.http import HttpResponse
from django.contrib.auth.models import User
from products.models import Product
from .models import Order, OrderItem

# Get a logger instance for this file
logger = logging.getLogger(__name__)

class StripeWH_Handler:
    """Handle Stripe webhooks"""
    
    def __init__(self, request):
        self.request = request
        logger.debug("StripeWH_Handler initialized")
        
    def _send_confirmation_email(self, order):
        """Send the user a confirmation email"""
        # This would be implemented to send an actual email
        logger.info(f"Confirmation email would be sent for order {order.order_number}")
        
    def handle_event(self, event):
        """
        Handle a generic/unknown/unexpected webhook event
        """
        logger.info(f"Unhandled webhook received: {event.type} (ID: {event.id})")
        return HttpResponse(
            content=f'Webhook received: {event.type}',
            status=200
        )
    
    def handle_payment_method_attached(self, event):
        """
        Handle the payment_method.attached webhook from Stripe
        """
        payment_method = event.data.object
        logger.info(f"Payment method attached: {payment_method.id}")
        logger.debug(f"Payment method details: type={payment_method.type}, customer={getattr(payment_method, 'customer', 'None')}")
        
        return HttpResponse(
            content=f'Webhook received: {event.type} | SUCCESS: Payment method attached',
            status=200
        )
        
    def handle_payment_intent_succeeded(self, event):
        """
        Handle the payment_intent.succeeded webhook from Stripe
        """
        intent = event.data.object
        pid = intent.id
        
        # Log the entire intent structure for debugging
        logger.info(f"Payment intent succeeded webhook received for {pid}")
        logger.debug(f"Intent amount: {intent.amount}, currency: {intent.currency}, status: {intent.status}")
        
        # Safely extract metadata
        metadata = getattr(intent, 'metadata', {})
        logger.debug(f"Intent metadata: {metadata}")
        
        cart = getattr(metadata, 'cart', '{}')
        save_info = getattr(metadata, 'save_info', False)
        username = getattr(metadata, 'username', None)
        
        logger.debug(f"Username from metadata: {username}")
        logger.debug(f"Save info: {save_info}")
        
        # Get the order by payment intent ID
        try:
            order = Order.objects.get(stripe_pid=pid)
            logger.info(f"Found existing order {order.order_number} for payment intent {pid}")
            
            # Update order status
            order.status = 'paid'
            order.is_paid = True
            order.payment_status = 'completed'
            order.save()
            logger.debug(f"Order {order.order_number} updated to paid status")
            
            # Send confirmation email
            self._send_confirmation_email(order)
            
            logger.info(f"Order {order.order_number} marked as paid via webhook")
            
            return HttpResponse(
                content=f'Webhook received: {event.type} | SUCCESS: Order updated',
                status=200
            )
        except Order.DoesNotExist:
            # If the order doesn't exist yet (webhook received before checkout completed)
            # Create the order from the webhook data
            logger.info(f"No order found for payment intent {pid}, creating from webhook data")
            
            if not cart or not username:
                logger.error("Webhook received: payment_intent.succeeded | ERROR: Missing cart data or username")
                return HttpResponse(
                    content=f'Webhook received: {event.type} | ERROR: Missing cart data or username',
                    status=400
                )
            
            # Try to parse the cart data
            try:
                cart_data = json.loads(cart)
                logger.debug(f"Parsed cart data: {cart_data}")
            except json.JSONDecodeError:
                logger.error("Webhook received: payment_intent.succeeded | ERROR: Invalid cart data format")
                return HttpResponse(
                    content=f'Webhook received: {event.type} | ERROR: Invalid cart data format',
                    status=400
                )
            
            # Create the order
            try:
                # Find the user if logged in
                user = None
                if username != 'AnonymousUser':
                    try:
                        user = User.objects.get(username=username)
                        logger.debug(f"Found user for order: {user.username}")
                    except User.DoesNotExist:
                        logger.warning(f"User {username} not found")
                        pass
                
                # Extract billing and shipping details safely from the intent
                # Instead of relying on charges data which might not be present yet
                
                # Get the payment intent in full detail to ensure we have all data
                logger.debug("Retrieving full payment intent details from Stripe")
                stripe.api_key = settings.STRIPE_SECRET_KEY
                full_intent = stripe.PaymentIntent.retrieve(pid)
                logger.debug(f"Full intent retrieved, status: {full_intent.status}")
                
                # Default address information
                default_address = {
                    'line1': '',
                    'line2': '',
                    'city': '',
                    'state': '',
                    'postal_code': '',
                    'country': '',
                }
                
                # Try to get billing details
                billing_details = {
                    'name': '',
                    'email': '',
                    'phone': '',
                    'address': default_address.copy()
                }
                
                # Try multiple ways to get billing details
                if hasattr(full_intent, 'charges') and full_intent.charges.data:
                    # If charges are available, use them
                    charge = full_intent.charges.data[0]
                    if hasattr(charge, 'billing_details'):
                        billing_details = charge.billing_details
                        logger.debug(f"Got billing details from charge: {charge.id}")
                elif hasattr(full_intent, 'customer') and full_intent.customer:
                    # Try to get from customer
                    try:
                        customer = stripe.Customer.retrieve(full_intent.customer)
                        logger.debug(f"Got customer details: {customer.id}")
                        if hasattr(customer, 'email'):
                            billing_details['email'] = customer.email
                        if hasattr(customer, 'phone'):
                            billing_details['phone'] = customer.phone
                        if hasattr(customer, 'name'):
                            billing_details['name'] = customer.name
                        if hasattr(customer, 'address'):
                            billing_details['address'] = customer.address
                    except Exception as e:
                        logger.error(f"Error retrieving customer: {str(e)}")
                        pass
                
                # Get shipping details from intent if available
                shipping_details = getattr(full_intent, 'shipping', billing_details)
                logger.debug(f"Shipping name: {getattr(shipping_details, 'name', 'Not available')}")
                
                # Use safe access to get address components
                def get_address_component(details, component, default=''):
                    if hasattr(details, 'address') and hasattr(details.address, component):
                        return getattr(details.address, component)
                    return default
                
                # Create the order
                logger.info("Creating order from webhook data")
                order = Order.objects.create(
                    full_name=getattr(shipping_details, 'name', 'Customer'),
                    email=getattr(billing_details, 'email', 'customer@example.com'),
                    phone_number=getattr(shipping_details, 'phone', ''),
                    shipping_address1=get_address_component(shipping_details, 'line1'),
                    shipping_address2=get_address_component(shipping_details, 'line2'),
                    shipping_city=get_address_component(shipping_details, 'city'),
                    shipping_state=get_address_component(shipping_details, 'state'),
                    shipping_zipcode=get_address_component(shipping_details, 'postal_code'),
                    shipping_country=get_address_component(shipping_details, 'country'),
                    billing_address1=get_address_component(billing_details, 'line1'),
                    billing_address2=get_address_component(billing_details, 'line2'),
                    billing_city=get_address_component(billing_details, 'city'),
                    billing_state=get_address_component(billing_details, 'state'),
                    billing_zipcode=get_address_component(billing_details, 'postal_code'),
                    billing_country=get_address_component(billing_details, 'country'),
                    total_price=round(full_intent.amount / 100, 2),  # Convert from cents to dollars
                    grand_total=round(full_intent.amount / 100, 2),
                    status='paid',
                    is_paid=True,
                    payment_status='completed',
                    stripe_pid=pid,
                    original_cart=cart,
                    user=user,
                )
                logger.debug(f"Order created with order number: {order.order_number}")
                
                # Create order items from cart data
                items_count = 0
                items_failed = 0
                for item_id, item_data in cart_data.get('items', {}).items():
                    try:
                        product = Product.objects.get(id=item_id)
                        quantity = item_data.get('quantity', 1)
                        logger.debug(f"Adding order item: {product.name} x {quantity}")
                        
                        # Create the order item
                        OrderItem.objects.create(
                            order=order,
                            product=product,
                            quantity=quantity,
                            price=product.price,
                            total=product.price * quantity
                        )
                        items_count += 1
                        
                        # Decrease product stock
                        product.stock_quantity -= quantity
                        product.save()
                        logger.debug(f"Updated stock for {product.name}: new stock = {product.stock_quantity}")
                    except Product.DoesNotExist:
                        logger.error(f"Product with ID {item_id} not found")
                        items_failed += 1
                        # Continue processing other items
                
                logger.info(f"Added {items_count} items to order, {items_failed} items failed")
                
                # Send confirmation email
                self._send_confirmation_email(order)
                
                logger.info(f"Order {order.order_number} created via webhook")
                
                return HttpResponse(
                    content=f'Webhook received: {event.type} | SUCCESS: Created order in webhook',
                    status=200
                )
            except Exception as e:
                logger.error(f"Webhook received: {event.type} | ERROR: {str(e)}", exc_info=True)
                return HttpResponse(
                    content=f'Webhook received: {event.type} | ERROR: {str(e)}',
                    status=500
                )
        except Exception as e:
            logger.error(f"Webhook received: {event.type} | ERROR: {str(e)}", exc_info=True)
            return HttpResponse(
                content=f'Webhook received: {event.type} | ERROR: {str(e)}',
                status=500
            )
            
    def handle_payment_intent_payment_failed(self, event):
        """
        Handle the payment_intent.payment_failed webhook from Stripe
        """
        intent = event.data.object
        error = intent.last_payment_error if hasattr(intent, 'last_payment_error') else None
        error_message = error.message if hasattr(error, 'message') else 'Unknown error'
        
        logger.warning(f"Payment failed for intent {intent.id}: {error_message}")
        logger.debug(f"Payment intent details: amount={intent.amount}, status={intent.status}")
        
        if error:
            logger.debug(f"Payment error details: type={getattr(error, 'type', 'unknown')}, code={getattr(error, 'code', 'unknown')}")
        
        return HttpResponse(
            content=f'Webhook received: {event.type} | Payment Failed: {error_message}',
            status=200
        )