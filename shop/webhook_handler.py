import json
import logging
import stripe
from django.conf import settings
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.utils import timezone
from django.db import transaction
from products.models import Product
from .models import Order, OrderItem
from .utils.stripe_utils import get_stripe_key

# Get a logger instance for this file
logger = logging.getLogger(__name__)


class StripeWH_Handler:
    """
    Handle Stripe webhooks for Payment Element integration
    with enhanced billing information storage
    """

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
        Enhanced to support storing payment methods
        """
        payment_method = event.data.object
        logger.info(f"Payment method attached: {payment_method.id}")
        logger.debug(f"Payment method details: type={payment_method.type}, customer={getattr(payment_method, 'customer', 'None')}")

        # Check if this payment method is attached to a customer
        customer_id = getattr(payment_method, 'customer', None)
        if customer_id:
            # In a real implementation, you'd store this payment method in your database
            # associated with the user who matches the Stripe customer ID
            logger.info(f"Payment method {payment_method.id} attached to customer {customer_id}")
            
            # You could also tag this payment method as the default for the customer
            # if user requested to save their payment information
            try:
                # Example: Update customer to set this payment method as default
                # stripe.Customer.modify(
                #    customer_id,
                #    invoice_settings={
                #        'default_payment_method': payment_method.id,
                #    }
                # )
                logger.debug(f"Could set payment method {payment_method.id} as default for customer {customer_id}")
            except Exception as e:
                logger.error(f"Error setting default payment method: {e}")

        return HttpResponse(
            content=f'Webhook received: {event.type} | SUCCESS: Payment method attached',
            status=200
        )

    @transaction.atomic
    def handle_payment_intent_succeeded(self, event):
        """
        Handle the payment_intent.succeeded webhook from Stripe
        Enhanced to support Payment Element and comprehensive billing information
        """
        intent = event.data.object
        pid = intent.id
        logger.info(f"Payment intent succeeded webhook received for {pid}")
        logger.debug(f"Intent amount: {intent.amount}, currency: {intent.currency}, status: {intent.status}")

        # Extract metadata
        metadata = intent.metadata
        logger.debug(f"Intent metadata: {json.dumps(metadata, indent=2) if isinstance(metadata, dict) else str(metadata)}")

        # Get username from metadata
        username = metadata.get('username', 'AnonymousUser')
        logger.debug(f"Username from metadata: {username}")

        # Get save_info from metadata
        save_info = metadata.get('save_info') == "True"
        logger.debug(f"Save info: {save_info}")
        
        # Get billing_same_as_shipping from metadata
        billing_same_as_shipping = metadata.get('billing_same_as_shipping') == "True"
        logger.debug(f"Billing same as shipping: {billing_same_as_shipping}")

        try:
            # Try to get the order from the database - use filter().first() instead of get()
            # to avoid MultipleObjectsReturned error
            order = Order.objects.filter(stripe_pid=pid).first()

            if order:
                logger.info(f"Found existing order {order.order_number} for payment intent {pid}")

                # Ensure order is marked as paid if not already
                if not order.is_paid:
                    order.status = 'paid'
                    order.is_paid = True
                    order.payment_status = 'completed'
                    order.paid_at = timezone.now()
                    
                    # Update payment method type if available
                    payment_method_type = self.get_payment_method_type(intent)
                    if payment_method_type:
                        order.payment_method_type = payment_method_type
                    
                    # Update billing information if needed
                    self.update_billing_information(order, intent, billing_same_as_shipping)
                    
                    order.save()
                    logger.debug(f"Order {order.order_number} updated to paid status")

                # Send confirmation email
                self._send_confirmation_email(order)

                logger.info(f"Order {order.order_number} marked as paid via webhook")

                return HttpResponse(
                    content=f"Webhook received: {event.type} | SUCCESS: Order {order.order_number} marked as paid via webhook",
                    status=200
                )
            else:
                # No existing order found, continue with creation
                logger.info(f"No order found for payment intent {pid}, creating from webhook data")

        except Exception as e:
            logger.error(f"Error checking for existing order: {str(e)}", exc_info=True)
            return HttpResponse(
                content=f"Webhook received: {event.type} | ERROR: {str(e)}",
                status=500
            )

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
                shipping_details = getattr(payment_intent, 'shipping', None)
                if not shipping_details:
                    # If no shipping details in intent, use billing details as fallback
                    shipping_details = billing_details
                
                # Use safe access to get address components
                def get_address_component(details, component, default=''):
                    if isinstance(details, dict) and 'address' in details and component in details['address']:
                        return details['address'][component]
                    elif hasattr(details, 'address') and hasattr(details.address, component):
                        return getattr(details.address, component)
                    return default

                # Double-check for existing orders to prevent duplicates
                existing_order = Order.objects.filter(stripe_pid=pid).first()
                if existing_order:
                    logger.warning(f"Order with pid {pid} already exists (order number: {existing_order.order_number}), skipping creation")
                    # Update the existing order if needed
                    if not existing_order.is_paid:
                        existing_order.status = 'paid'
                        existing_order.is_paid = True
                        existing_order.payment_status = 'completed'
                        existing_order.paid_at = timezone.now()
                        
                        # Update payment method type
                        payment_method_type = self.get_payment_method_type(payment_intent)
                        if payment_method_type:
                            existing_order.payment_method_type = payment_method_type
                        
                        # Update billing information
                        self.update_billing_information(existing_order, payment_intent, billing_same_as_shipping)
                        
                        existing_order.save()
                        logger.debug(f"Existing order {existing_order.order_number} updated to paid status")

                    # Send confirmation email
                    self._send_confirmation_email(existing_order)

                    return HttpResponse(
                        content=f"Webhook received: {event.type} | SUCCESS: Order {existing_order.order_number} already exists",
                        status=200
                    )

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

                # Parse the full name into first and last name
                first_name, last_name = self.parse_full_name(full_name)

                # Create the order
                logger.info("Creating order from webhook data")
                
                # Get the payment method type
                payment_method_type = self.get_payment_method_type(payment_intent)
                
                # Create new order with enhanced billing information
                order = Order.objects.create(
                    user=user,
                    first_name=first_name,
                    last_name=last_name,
                    full_name=full_name,
                    email=email or (user.email if user else 'customer@example.com'),
                    phone_number=phone or '',
                    shipping_first_name=first_name,
                    shipping_last_name=last_name,
                    shipping_address1=get_address_component(shipping_details, 'line1'),
                    shipping_address2=get_address_component(shipping_details, 'line2'),
                    shipping_city=get_address_component(shipping_details, 'city'),
                    shipping_state=get_address_component(shipping_details, 'state'),
                    shipping_zipcode=get_address_component(shipping_details, 'postal_code'),
                    shipping_country=get_address_component(shipping_details, 'country'),
                    billing_name=get_billing_name(billing_details),
                    billing_address1=get_address_component(billing_details, 'line1'),
                    billing_address2=get_address_component(billing_details, 'line2'),
                    billing_city=get_address_component(billing_details, 'city'),
                    billing_state=get_address_component(billing_details, 'state'),
                    billing_zipcode=get_address_component(billing_details, 'postal_code'),
                    billing_country=get_address_component(billing_details, 'country'),
                    total_price=round(payment_intent.amount / 100, 2),
                    grand_total=round(payment_intent.amount / 100, 2),
                    status='paid',
                    is_paid=True,
                    payment_status='completed',
                    paid_at=timezone.now(),
                    stripe_pid=pid,
                    stripe_client_secret=payment_intent.client_secret,
                    payment_method_type=payment_method_type,
                    original_cart=cart_data_str,
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
                                    price=product.price
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
                                        price=product.price
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

                # Save payment method for future use if requested
                if save_info and user and payment_method and hasattr(payment_intent, 'customer'):
                    try:
                        # This would be implemented to save the payment method to the user's profile
                        logger.info(f"Would save payment method {payment_method.id} for user {user.username}")
                        
                        # Example implementation:
                        # user_profile = UserProfile.objects.get(user=user)
                        # user_profile.stripe_customer_id = payment_intent.customer
                        # user_profile.save()
                    except Exception as e:
                        logger.error(f"Error saving payment info: {e}")

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
    
    def get_payment_method_type(self, payment_intent):
        """
        Get the payment method type from a payment intent
        
        Args:
            payment_intent: The Stripe payment intent object
            
        Returns:
            The payment method type as a string (e.g., 'card', 'sepa_debit')
        """
        # Check if payment method is directly available on the intent
        if hasattr(payment_intent, 'payment_method_types') and payment_intent.payment_method_types:
            return payment_intent.payment_method_types[0]
        
        # Try to get from the payment method
        if hasattr(payment_intent, 'payment_method') and payment_intent.payment_method:
            try:
                payment_method = stripe.PaymentMethod.retrieve(payment_intent.payment_method)
                if hasattr(payment_method, 'type'):
                    return payment_method.type
            except Exception as e:
                logger.error(f"Error retrieving payment method for type: {e}")
        
        # Try to get from charges
        if hasattr(payment_intent, 'charges') and payment_intent.charges.data:
            charge = payment_intent.charges.data[0]
            if hasattr(charge, 'payment_method_details'):
                details = charge.payment_method_details
                if hasattr(details, 'type'):
                    return details.type
        
        # Default
        return 'unknown'
    
    def parse_full_name(self, full_name):
        """
        Parse a full name into first and last name
        
        Args:
            full_name: The full name string
            
        Returns:
            Tuple of (first_name, last_name)
        """
        if not full_name:
            return '', ''
        
        # Split by spaces and handle different cases
        name_parts = full_name.split()
        
        if len(name_parts) == 1:
            # Just a single name
            return name_parts[0], ''
        
        # First name is the first part, last name is everything else joined
        first_name = name_parts[0]
        last_name = ' '.join(name_parts[1:])
        
        return first_name, last_name
    
    def update_billing_information(self, order, payment_intent, billing_same_as_shipping=False):
        """
        Update billing information for an order from a payment intent
        
        Args:
            order: The Order instance to update
            payment_intent: The Stripe payment intent object
            billing_same_as_shipping: Whether billing address is same as shipping
        """
        # If billing is same as shipping, use shipping address
        if billing_same_as_shipping:
            order.billing_name = order.shipping_full_name
            order.billing_address1 = order.shipping_address1
            order.billing_address2 = order.shipping_address2
            order.billing_city = order.shipping_city
            order.billing_state = order.shipping_state
            order.billing_zipcode = order.shipping_zipcode
            order.billing_country = order.shipping_country
            return
        
        # Otherwise, try to get billing details from payment intent
        payment_method = None
        if hasattr(payment_intent, 'payment_method') and payment_intent.payment_method:
            try:
                payment_method = stripe.PaymentMethod.retrieve(payment_intent.payment_method)
            except Exception as e:
                logger.error(f"Error retrieving payment method: {e}")
        
        # Get billing details from payment method
        if payment_method and hasattr(payment_method, 'billing_details'):
            billing_details = payment_method.billing_details
            
            # Name
            if hasattr(billing_details, 'name') and billing_details.name:
                order.billing_name = billing_details.name
            
            # Address
            if hasattr(billing_details, 'address'):
                address = billing_details.address
                
                if hasattr(address, 'line1') and address.line1:
                    order.billing_address1 = address.line1
                
                if hasattr(address, 'line2') and address.line2:
                    order.billing_address2 = address.line2
                
                if hasattr(address, 'city') and address.city:
                    order.billing_city = address.city
                
                if hasattr(address, 'state') and address.state:
                    order.billing_state = address.state
                
                if hasattr(address, 'postal_code') and address.postal_code:
                    order.billing_zipcode = address.postal_code
                
                if hasattr(address, 'country') and address.country:
                    order.billing_country = address.country


def get_billing_name(billing_details):
    """
    Extract billing name from billing details
    
    Args:
        billing_details: The billing details from Stripe
        
    Returns:
        The billing name as a string
    """
    if isinstance(billing_details, dict) and 'name' in billing_details:
        return billing_details['name']
    elif hasattr(billing_details, 'name'):
        return billing_details.name
    return ''