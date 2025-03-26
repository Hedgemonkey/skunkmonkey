import json
import logging
import stripe
from django.conf import settings
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.utils import timezone
from products.models import Product
from .models import Order, OrderItem
from .utils.stripe_utils import get_stripe_key

# Get a logger instance for this file
logger = logging.getLogger(__name__)

class StripeWH_Handler:
    """Handle Stripe webhooks"""
    
    def __init__(self, request):
        self.request = request
        logger.debug("StripeWH_Handler initialized")
        # Set the Stripe API key using our utility function
        stripe.api_key = get_stripe_key('secret')
        
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
        logger.info(f"Payment intent succeeded webhook received for {pid}")
        logger.debug(f"Intent amount: {intent.amount}, currency: {intent.currency}, status: {intent.status}")
        
        # Extract metadata
        metadata = intent.metadata
        logger.debug(f"Intent metadata: {json.dumps(metadata, indent=2)}")
        
        # Get username from metadata
        username = metadata.get('username', 'AnonymousUser')
        logger.debug(f"Username from metadata: {username}")
        
        # Get save_info from metadata
        save_info = metadata.get('save_info') == "True"
        logger.debug(f"Save info: {save_info}")
        
        try:
            # Try to get the order from the database
            order = Order.objects.get(stripe_pid=pid)
            logger.info(f"Found existing order {order.order_number} for payment intent {pid}")
            
            # Ensure order is marked as paid if not already
            if not order.is_paid:
                order.status = 'paid'
                order.is_paid = True
                order.payment_status = 'completed'
                order.paid_at = timezone.now()
                order.save()
                logger.debug(f"Order {order.order_number} updated to paid status")
            
            # Send confirmation email
            self._send_confirmation_email(order)
            
            logger.info(f"Order {order.order_number} marked as paid via webhook")
            
            return HttpResponse(
                content=f"Webhook received: {event.type} | SUCCESS: Order {order.order_number} marked as paid via webhook",
                status=200
            )
        
        except Order.DoesNotExist:
            # If order doesn't exist, we need to create it from the webhook data
            logger.info(f"No order found for payment intent {pid}, creating from webhook data")
            
            try:
                # Extract cart data from metadata
                cart_data_str = metadata.get('cart')
                if not cart_data_str:
                    cart_data_str = metadata.get('cart_items')
                
                if cart_data_str:
                    try:
                        cart_data = json.loads(cart_data_str)
                        logger.debug(f"Parsed cart data: {cart_data}")
                    except json.JSONDecodeError:
                        logger.error(f"Failed to parse cart data: {cart_data_str}")
                        cart_data = {}
                else:
                    logger.warning("No cart data found in metadata")
                    cart_data = {}
                
                # Get user if authenticated
                user = None
                if username != 'AnonymousUser':
                    try:
                        user = User.objects.get(username=username)
                        logger.debug(f"Found user for order: {username}")
                    except User.DoesNotExist:
                        logger.warning(f"User {username} not found in database")
                
                # Try to get payment details from Stripe
                try:
                    # Use our utility function to get the Stripe API key
                    stripe_api_key = get_stripe_key('secret')
                    
                    if not stripe_api_key:
                        logger.error("Cannot retrieve payment details - no Stripe API key available")
                        return HttpResponse(
                            content=f"Webhook received: {event.type} | ERROR: No Stripe API key available",
                            status=500
                        )
                        
                    stripe.api_key = stripe_api_key
                    logger.debug("Retrieving full payment intent details from Stripe")
                    payment_intent = stripe.PaymentIntent.retrieve(pid)
                    
                    # Get payment method details if available
                    payment_method = None
                    if hasattr(payment_intent, 'payment_method') and payment_intent.payment_method:
                        try:
                            payment_method = stripe.PaymentMethod.retrieve(payment_intent.payment_method)
                            logger.debug(f"Retrieved payment method: {payment_method.id}")
                        except Exception as e:
                            logger.error(f"Error retrieving payment method: {str(e)}")
                    
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
                    if payment_method and hasattr(payment_method, 'billing_details'):
                        billing_details = payment_method.billing_details
                        logger.debug("Got billing details from payment method")
                    elif hasattr(payment_intent, 'charges') and payment_intent.charges.data:
                        # If charges are available, use them
                        charge = payment_intent.charges.data[0]
                        if hasattr(charge, 'billing_details'):
                            billing_details = charge.billing_details
                            logger.debug(f"Got billing details from charge: {charge.id}")
                    elif hasattr(payment_intent, 'customer') and payment_intent.customer:
                        # Try to get from customer
                        try:
                            customer = stripe.Customer.retrieve(payment_intent.customer)
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
                    
                    # Get shipping details from intent if available
                    shipping_details = getattr(payment_intent, 'shipping', billing_details)
                    
                    # Use safe access to get address components
                    def get_address_component(details, component, default=''):
                        if isinstance(details, dict) and 'address' in details and component in details['address']:
                            return details['address'][component]
                        elif hasattr(details, 'address') and hasattr(details.address, component):
                            return getattr(details.address, component)
                        return default
                    
                    # Create the order
                    logger.info("Creating order from webhook data")
                    
                    # Get name from billing or shipping details
                    full_name = ''
                    if isinstance(shipping_details, dict) and 'name' in shipping_details:
                        full_name = shipping_details['name']
                    elif hasattr(shipping_details, 'name'):
                        full_name = shipping_details.name
                    elif isinstance(billing_details, dict) and 'name' in billing_details:
                        full_name = billing_details['name']
                    elif hasattr(billing_details, 'name'):
                        full_name = billing_details.name
                    
                    # Get email from billing details
                    email = ''
                    if isinstance(billing_details, dict) and 'email' in billing_details:
                        email = billing_details['email']
                    elif hasattr(billing_details, 'email'):
                        email = billing_details.email
                    
                    # Get phone from billing or shipping details
                    phone = ''
                    if isinstance(shipping_details, dict) and 'phone' in shipping_details:
                        phone = shipping_details['phone']
                    elif hasattr(shipping_details, 'phone'):
                        phone = shipping_details.phone
                    elif isinstance(billing_details, dict) and 'phone' in billing_details:
                        phone = billing_details['phone']
                    elif hasattr(billing_details, 'phone'):
                        phone = billing_details.phone
                    
                    order = Order.objects.create(
                        full_name=full_name or username or 'Customer',
                        email=email or 'customer@example.com',
                        phone_number=phone or '',
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
                        total_price=round(payment_intent.amount / 100, 2),  # Convert from cents to dollars/pounds
                        grand_total=round(payment_intent.amount / 100, 2),
                        status='paid',
                        is_paid=True,
                        payment_status='completed',
                        paid_at=timezone.now(),
                        stripe_pid=pid,
                        stripe_client_secret=payment_intent.client_secret,
                        original_cart=cart_data_str,
                        user=user,
                    )
                    logger.debug(f"Order created with order number: {order.order_number}")
                    
                    # Create order items from cart data
                    items_count = 0
                    items_failed = 0
                    
                    # Handle different cart data formats
                    if isinstance(cart_data, dict):
                        if 'items' in cart_data and isinstance(cart_data['items'], dict):
                            # Format: {'items': {id: {quantity: x}}}
                            for item_id, item_data in cart_data['items'].items():
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
                                    if hasattr(product, 'stock_quantity'):
                                        product.stock_quantity = max(0, product.stock_quantity - quantity)
                                        product.save()
                                        logger.debug(f"Updated stock for {product.name}: new stock = {product.stock_quantity}")
                                except Product.DoesNotExist:
                                    logger.error(f"Product with ID {item_id} not found")
                                    items_failed += 1
                        elif 'items' in cart_data and isinstance(cart_data['items'], list):
                            # Format: {'items': [{product_id: x, quantity: y}]}
                            for item_data in cart_data['items']:
                                try:
                                    product_id = item_data.get('product_id')
                                    if not product_id:
                                        product_id = item_data.get('id')
                                    
                                    if product_id:
                                        product = Product.objects.get(id=product_id)
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
                                        if hasattr(product, 'stock_quantity'):
                                            product.stock_quantity = max(0, product.stock_quantity - quantity)
                                            product.save()
                                            logger.debug(f"Updated stock for {product.name}: new stock = {product.stock_quantity}")
                                except Product.DoesNotExist:
                                    logger.error(f"Product with ID {product_id} not found")
                                    items_failed += 1
                    
                    logger.info(f"Added {items_count} items to order, {items_failed} items failed")
                    
                    # Send confirmation email
                    self._send_confirmation_email(order)
                    
                    logger.info(f"Order {order.order_number} created via webhook")
                    
                    return HttpResponse(
                        content=f"Webhook received: {event.type} | SUCCESS: Created order {order.order_number} in webhook",
                        status=200
                    )
                
                except Exception as e:
                    logger.error(f"Error processing payment intent {pid} from webhook: {str(e)}", exc_info=True)
                    return HttpResponse(
                        content=f"Webhook received: {event.type} | ERROR: {str(e)}",
                        status=500
                    )
                    
            except Exception as e:
                logger.error(f"Webhook received: {event.type} | ERROR: {str(e)}", exc_info=True)
                return HttpResponse(
                    content=f"Webhook received: {event.type} | ERROR: {str(e)}",
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
