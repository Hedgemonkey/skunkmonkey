"""
Views for checkout process
"""
import json
import logging

from django.contrib import messages
from django.shortcuts import get_object_or_404, redirect, render
from django.views.generic import TemplateView, View

import stripe

from ..forms import CheckoutForm
from ..models import Order, OrderItem
from ..utils.session_utils import (
    clear_stripe_session_data, is_client_secret_valid,
    store_stripe_session_data,
)
from ..utils.stripe_utils import (
    create_payment_intent, get_stripe_publishable_key, get_stripe_secret_key,
)
from .mixins import CartAccessMixin

logger = logging.getLogger(__name__)


class CheckoutView(CartAccessMixin, View):
    """
    View for processing checkout with Stripe integration
    Enhanced with detailed logging
    """
    template_name = 'shop/checkout.html'

    def get(self, request, *args, **kwargs):
        """
        Display checkout form or redirect to cart if empty
        """
        logger.info("CheckoutView GET request started")
        cart = request.cart

        # Check if cart is empty - redirect to cart instead of prefilling forms
        if cart.items.count() == 0:
            logger.debug("Cart is empty, redirecting to cart")
            messages.warning(request, "Your cart is empty!")
            return redirect('shop:cart')

        logger.debug(
            f"Cart contains {cart.items.count()} \
                items with total price {cart.total_price}")

        # Get Stripe publishable key from utils
        stripe_publishable_key = get_stripe_publishable_key()
        logger.debug(
            f"Retrieved stripe_publishable_key in GET: "
            f"'{stripe_publishable_key}' "
            f"(type: {type(stripe_publishable_key)})"
        )

        # Check if we have a valid client secret for the current cart
        has_valid_client_secret = is_client_secret_valid(request, cart)

        if has_valid_client_secret:
            logger.debug("Using existing valid client_secret from session")
            client_secret = request.session.get('client_secret')
        else:
            # Clear any existing invalid client secret
            clear_stripe_session_data(request)

            # Create a new payment intent for the checkout
            logger.debug("Creating new payment intent for checkout")
            client_secret, error = create_payment_intent(request)

            if error:
                logger.error(f"Error creating payment intent: {error}")
                messages.error(
                    request,
                    f"Payment error: {error}. Please try again.")
                # Redirect back to cart since we can't continue without a
                # payment intent
                return redirect('shop:cart')
            else:
                # Store the new client secret and cart signature
                store_stripe_session_data(request, cart, client_secret)

        # Additional safety check before rendering
        if not client_secret:
            logger.error("No client_secret available for checkout rendering")
            messages.error(
                request,
                "Payment system error. Please try again or contact support.")
            return redirect('shop:cart')

        # Initialize form with default values if the user has a default address
        initial_data = {}

        if request.user.is_authenticated:
            # Try to get user's profile and default address
            try:
                # Pre-fill user's email and name if available
                initial_data['email'] = request.user.email

                # Get first and last name if available on the user model
                if (
                    hasattr(request.user, 'first_name')
                    and request.user.first_name
                ):
                    initial_data['first_name'] = request.user.first_name
                if (
                    hasattr(request.user, 'last_name')
                    and request.user.last_name
                ):
                    initial_data['last_name'] = request.user.last_name

                # Check if user has a userprofile with default address
                if hasattr(request.user, 'userprofile'):
                    userprofile = request.user.userprofile

                    # Pre-fill phone number from profile if available
                    if userprofile.phone_number:
                        initial_data['phone_number'] = userprofile.phone_number

                    # Check if there's a default delivery address
                    if userprofile.default_delivery_address:
                        default_address = userprofile.default_delivery_address
                        logger.debug(f"Auto-filling form with default address \
                                     for user {request.user.username}")

                        # Map address fields to form fields
                        address_mapping = {
                            'address_line_1': 'shipping_address1',
                            'address_line_2': 'shipping_address2',
                            'town_or_city': 'shipping_city',
                            'county': 'shipping_state',
                            'postcode': 'shipping_zipcode',
                            'country': 'shipping_country',
                            'phone_number': 'phone_number',
                        }

                        # Copy values from default address to initial data
                        for address_field, form_field in (
                                address_mapping.items()):
                            if (
                                hasattr(default_address, address_field)
                                and getattr(default_address, address_field)
                            ):
                                initial_data[form_field] = getattr(
                                    default_address,
                                    address_field
                                )

                        # Split user's name for shipping fields if we don't
                        # have first/last name
                        # This is a fallback if user model doesn't have
                        # separate name fields
                        if (
                            'first_name' not in initial_data
                            and 'last_name' not in initial_data
                        ):
                            # Try to get full name from user model
                            full_name = (
                                request.user.get_full_name()
                                if hasattr(request.user, 'get_full_name')
                                else ''
                            )
                            if full_name:
                                # Simple split on first space - not perfect
                                # but a reasonable fallback
                                name_parts = full_name.split(' ', 1)
                                initial_data['shipping_first_name'] = (
                                    name_parts[0]
                                )
                                initial_data['shipping_last_name'] = (
                                    name_parts[1]
                                    if len(name_parts) > 1 else ''
                                )
                        else:
                            # Use the first/last name we already have
                            initial_data['shipping_first_name'] = (
                                initial_data.get('first_name', '')
                            )
                            initial_data['shipping_last_name'] = (
                                initial_data.get('last_name', '')
                            )

            except Exception as e:
                # Log the error but continue with empty form
                logger.error(
                    f"Error pre-filling form with default address: {e}"
                )

        # Initialize the form, either empty or with pre-filled data
        form = CheckoutForm(initial=initial_data)

        # Debug logging for context variables
        logger.debug(
            f"Context creation - stripe_publishable_key: "
            f"'{stripe_publishable_key}' "
            f"(type: {type(stripe_publishable_key)})"
        )
        logger.debug(
            f"Context creation - client_secret: "
            f"'{client_secret}' (type: {type(client_secret)})"
        )

        context = {
            'cart': cart,
            'form': form,
            'stripe_publishable_key': stripe_publishable_key,
            'client_secret': client_secret,
            'djstripe_webhook_url': '/stripe/webhook/'
        }

        logger.debug(f"Final context keys: {list(context.keys())}")
        return render(request, self.template_name, context)

    def post(self, request):
        """
        Process checkout form submission
        """
        cart = request.cart
        logger.info("Processing checkout form submission")

        # Return to cart if empty
        if cart.items.count() == 0:
            logger.warning("Attempted to submit checkout with empty cart")
            messages.error(request, "Your cart is empty!")
            return redirect('shop:cart')

        # Get Stripe API key from utils
        stripe_publishable_key = get_stripe_publishable_key()
        logger.debug(f"Using stripe_publishable_key: {stripe_publishable_key}")

        if not stripe_publishable_key:
            logger.error(
                "Stripe publishable key not found during form submission")
            messages.error(
                request,
                "Payment configuration error. Please contact support.")
            return redirect('shop:checkout')

        # Check if "billing address same as shipping" is checked
        billing_same_as_shipping = request.POST.get(
            'billing_same_as_shipping') == 'on'

        # If billing_same_as_shipping is checked, copy shipping address to
        # billing address
        form_data = request.POST.copy()
        if billing_same_as_shipping:
            # Copy all shipping fields to billing fields
            form_data['billing_address1'] = form_data.get(
                'shipping_address1', '')
            form_data['billing_address2'] = form_data.get(
                'shipping_address2', '')
            form_data['billing_city'] = form_data.get('shipping_city', '')
            form_data['billing_state'] = form_data.get('shipping_state', '')
            form_data['billing_zipcode'] = form_data.get(
                'shipping_zipcode', '')
            form_data['billing_country'] = form_data.get(
                'shipping_country', '')
            # Also copy name fields if they exist in the form
            if 'shipping_first_name' in form_data:
                form_data['billing_first_name'] = form_data.get(
                    'shipping_first_name', '')
            if 'shipping_last_name' in form_data:
                form_data['billing_last_name'] = form_data.get(
                    'shipping_last_name', '')
            logger.debug("Copied shipping address to billing address")

        # Create form with potentially modified data
        form = CheckoutForm(form_data)

        # Validate client_secret against current cart state
        has_valid_client_secret = is_client_secret_valid(request, cart)

        # Get client_secret from POST or session
        client_secret = request.POST.get('client_secret')
        if client_secret:
            logger.debug(
                f"Received client_secret from POST: {client_secret[:10]}...")
        else:
            logger.debug("No client_secret in POST data, checking session")
            client_secret = request.session.get('client_secret')

        # Check if we need to create a new payment intent
        if not client_secret or not has_valid_client_secret:
            logger.warning(
                "No valid client_secret found, creating new payment intent")
            # Clear any existing invalid client secret
            clear_stripe_session_data(request)

            # Create a new payment intent
            client_secret, error = create_payment_intent(request)

            if error:
                logger.error(f"Error creating new payment intent: {error}")
                messages.error(
                    request,
                    f"Payment error: {error}. Please try again.")
                return redirect('shop:checkout')

            # Store the new client secret and cart signature
            store_stripe_session_data(request, cart, client_secret)
            logger.info(
                f"Created new payment intent, client_secret: \
                    {client_secret[:10]}...")

        # At this point, we should have a client_secret
        if not client_secret:
            logger.error("Failed to create a valid client_secret")
            messages.error(request, "Payment system error. Please try again.")
            return redirect('shop:checkout')

        logger.debug(f"Using client_secret: {client_secret[:10]}...")

        if form.is_valid():
            logger.info(
                "Checkout form is valid - proceeding with payment processing")
            try:

                # Extract the payment intent ID from client secret
                pid = client_secret.split('_secret')[0]
                logger.info(f"Processing payment intent: {pid}")

                # Verify the payment intent is valid
                try:
                    # Get the API key from utils
                    stripe_api_key = get_stripe_secret_key()
                    if stripe_api_key:
                        stripe.api_key = stripe_api_key

                        # Retrieve the payment intent to verify it exists and
                        # is valid
                        payment_intent = stripe.PaymentIntent.retrieve(pid)

                        # Check if the payment intent is in a valid state
                        valid_states = [
                            'requires_payment_method',
                            'requires_confirmation',
                            'requires_action',
                            'processing',
                            'succeeded']
                        if payment_intent.status not in valid_states:
                            logger.warning(
                                f"Payment intent {pid} is in an invalid state:\
                                 {payment_intent.status}")
                            # Create a new payment intent
                            client_secret, error = create_payment_intent(
                                request)

                            if error:
                                logger.error(
                                    f"Error creating new payment intent: \
                                        {error}")
                                messages.error(
                                    request,
                                    f"Payment error: {error}. \
                                        Please try again.")
                                return redirect('shop:checkout')

                            # Update the pid with the new payment intent ID
                            pid = client_secret.split('_secret')[0]
                            logger.info(
                                f"Created new payment intent, new pid: {pid}")
                    else:
                        logger.warning(
                            "Could not verify payment intent - \
                                Stripe API key not available")
                except Exception as e:
                    logger.warning(
                        f"Error verifying payment intent {pid}: {e}")
                    # Create a new payment intent since verification failed
                    client_secret, error = create_payment_intent(request)

                    if error:
                        logger.error(
                            f"Error creating new payment intent after \
                                verification failure: {error}")
                        messages.error(
                            request,
                            f"Payment error: {error}. Please try again.")
                        return redirect('shop:checkout')

                    # Update the pid with the new payment intent ID
                    pid = client_secret.split('_secret')[0]
                    logger.info(
                        f"Created new payment intent after verification \
                            failure, new pid: {pid}")

                # Create the order
                logger.info("Creating order record in database")
                order = form.save(commit=False)

                # Set payment information
                order.stripe_pid = pid
                order.stripe_client_secret = client_secret
                order.original_cart = json.dumps(
                    cart.to_dict() if hasattr(cart, 'to_dict') else {})
                order.total_price = cart.total_price
                order.grand_total = cart.total_price

                # Store whether billing address is same as shipping
                order.billing_same_as_shipping = billing_same_as_shipping

                # The webhook will mark this as paid once confirmed by Stripe
                # Set as pending for now
                order.is_paid = False
                order.payment_status = 'pending'
                order.status = 'created'

                # If user is authenticated, associate order with user
                if request.user.is_authenticated:
                    logger.debug(
                        f"Associating order with user: "
                        f"{request.user.username}")
                    order.user = request.user

                # Save the order to generate order number
                order.save()
                logger.info(
                    f"Order created with number: {order.order_number}")
                logger.debug(
                    f"Billing same as shipping: {billing_same_as_shipping}")

                # Populate order with items from cart
                logger.debug("Adding cart items to order")
                for item in cart.items.all():
                    try:
                        OrderItem.objects.create(
                            order=order,
                            product=item.product,
                            quantity=item.quantity,
                            price=item.price,
                        )
                    except Exception as item_creation_exception:
                        logger.error(
                            f"Error creating order item for product "
                            f"{item.product.name}: {item_creation_exception}"
                        )
                        order.delete()  # Remove incomplete order
                        messages.error(
                            request,
                            "There was an error processing your order. \
                                Please try again.")
                        return redirect('shop:checkout')

                # Clear the cart
                cart.clear()
                logger.info("Cart cleared after successful order")

                # Store order ID in session for payment success page
                request.session['order_id'] = order.id
                logger.info(
                    f"Order processing completed successfully for order "
                    f"{order.order_number}"
                )

                return redirect('shop:checkout_success', order_id=order.id)

            except Exception as e:
                logger.error(f"Payment processing error: {e}")
                messages.error(
                    request,
                    "There was an error processing your payment. \
                        Please try again.")
                return redirect('shop:checkout')
        else:
            logger.warning(
                "Checkout form is invalid - re-rendering checkout page")
            messages.error(
                request, "Please correct the errors in the form below.")
            context = {
                'cart': cart,
                'form': form,
                'stripe_publishable_key': stripe_publishable_key,
                'client_secret': client_secret,
                'djstripe_webhook_url': '/stripe/webhook/'
            }
            return render(request, self.template_name, context)


class CheckoutSuccessView(TemplateView):
    """
    Display checkout success page for a specific order
    Takes order_id as URL parameter
    Shows different information depending on payment status
    """
    template_name = 'shop/checkout_success.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        order_id = self.kwargs.get('order_id')

        if order_id:
            try:
                order = Order.objects.get(id=order_id)
                context['order'] = order

                # Additional context based on payment status
                context['payment_confirmed'] = order.is_paid

                # Clear Stripe session data after successful checkout
                clear_stripe_session_data(self.request)

                logger.info(
                    f"Displaying checkout success page for order "
                    f"{order.order_number}"
                )
            except Order.DoesNotExist:
                logger.warning(
                    f"Order with ID {order_id} not found for checkout "
                    f"success page"
                )
                messages.error(self.request,
                               "The requested order could not be found.")
        else:
            logger.warning("Checkout success page requested without order_id")
            messages.error(self.request, "No order information provided.")

        return context


# Using a single success view - CheckoutSuccessView
# The webhook handler will update the order status which will be reflected
# in the CheckoutSuccessView


def payment_cancel(request):
    """
    Handle cancelled payment
    """
    logger.info("Payment cancelled by user")
    messages.warning(
        request,
        "Your payment was cancelled. Please try again when you're ready.")
    return redirect('shop:cart_detail')


def recover_payment_intent(request, order_id=None):
    """
    Handle payment intent errors by redirecting to checkout
    """
    logger.info("Recovering from payment intent error")

    # Clear any existing payment intent from the session
    if 'client_secret' in request.session:
        del request.session['client_secret']

    messages.info(
        request, "We've refreshed your checkout session. Please try again.")

    # If we have an order ID, we might want to delete the incomplete order
    if order_id:
        try:
            order = Order.objects.get(id=order_id)
            # Only delete if not paid
            if not order.is_paid:
                logger.info(f"Deleting incomplete order {order.order_number}")
                order.delete()
                messages.info(
                    request,
                    "Your previous incomplete order has been removed.")
        except Order.DoesNotExist:
            logger.warning(f"Order with ID {order_id} not found for recovery")

    # Redirect to checkout with refresh parameter to ensure a new payment
    # intent
    return redirect('shop:checkout')


def reset_payment_intent(request):
    """
    Reset the payment intent by removing it from session and
    creating a fresh one
    This is useful when the payment process needs to be restarted
    """
    logger.info("Reset payment intent requested")

    # Clear any existing payment intent from the session
    clear_stripe_session_data(request)

    # Redirect to checkout to create a new payment intent
    messages.info(
        request,
        "Your payment session has been refreshed. You can now proceed with \
            checkout.")
    return redirect('shop:checkout')


class OrderDetailView(View):
    """
    Display details of a specific order
    """
    template_name = 'shop/order_detail.html'

    def get(self, request, order_id):
        # Check if the user is authorized to view this order
        if request.user.is_authenticated:
            # Staff can view any order
            if request.user.is_staff:
                order = get_object_or_404(Order, id=order_id)
            else:
                # Regular users can only view their own orders
                order = get_object_or_404(
                    Order, id=order_id, user=request.user)
        else:
            # For guests, check if the order is in their session
            session_order_id = request.session.get('order_id')
            if session_order_id and str(session_order_id) == str(order_id):
                order = get_object_or_404(Order, id=order_id)
            else:
                messages.error(
                    request, "You do not have permission to view this order.")
                return redirect('shop:product_list')

        context = {
            'order': order,
        }

        return render(request, self.template_name, context)
