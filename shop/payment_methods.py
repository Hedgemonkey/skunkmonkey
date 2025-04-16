"""
Payment Methods Management

Views and utilities for handling Stripe payment methods.
"""
import json
import logging

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_POST

import stripe
# Import djstripe models
from djstripe.models import Customer, PaymentMethod

logger = logging.getLogger(__name__)

# Set the Stripe API key
# stripe.api_key = settings.STRIPE_SECRET_KEY


@login_required
def payment_methods_list(request):
    """
    View to list the user's saved payment methods
    """
    try:
        # Get or create the Stripe customer for this user
        customer, created = Customer.get_or_create(subscriber=request.user)

        # Get the payment methods from Stripe
        payment_methods = []

        if not created:
            # Get the payment methods from Stripe API directly to ensure latest
            # data
            stripe_payment_methods = stripe.PaymentMethod.list(
                customer=customer.id,
                type="card",
            )

            # Format the payment methods for the frontend
            payment_methods = [{
                'id': pm.id,
                'type': pm.type,
                'card': {
                    'brand': pm.card.brand,
                    'exp_month': pm.card.exp_month,
                    'exp_year': pm.card.exp_year,
                    'last4': pm.card.last4,
                },
                'isDefault': customer.default_payment_method and (
                    customer.default_payment_method.id == pm.id)
            } for pm in stripe_payment_methods.data]

        return JsonResponse({
            'success': True,
            'payment_methods': payment_methods
        })
    except Exception as e:
        logger.error(f"Error retrieving payment methods: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


@login_required
@require_POST
def attach_payment_method(request):
    """
    View to attach a payment method to the customer
    """
    try:
        data = json.loads(request.body)
        payment_method_id = data.get('payment_method_id')
        set_as_default = data.get('set_as_default', False)

        if not payment_method_id:
            return JsonResponse({
                'success': False,
                'error': 'Payment method ID is required'
            }, status=400)

        # Get or create the customer
        customer, created = Customer.get_or_create(subscriber=request.user)

        # Attach the payment method to the customer
        payment_method = stripe.PaymentMethod.attach(
            payment_method_id,
            customer=customer.id
        )

        # Sync the payment method to the local database
        PaymentMethod.sync_from_stripe_data(payment_method)

        # Set as default if requested
        if set_as_default:
            customer = stripe.Customer.modify(
                customer.id,
                invoice_settings={
                    'default_payment_method': payment_method_id
                }
            )

            # Update the local customer record
            Customer.sync_from_stripe_data(customer)

        return JsonResponse({
            'success': True,
            'payment_method': {
                'id': payment_method.id,
                'type': payment_method.type,
                'card': {
                    'brand': payment_method.card.brand,
                    'exp_month': payment_method.card.exp_month,
                    'exp_year': payment_method.card.exp_year,
                    'last4': payment_method.card.last4,
                }
            }
        })
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error attaching payment method: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e.user_message)
        }, status=400)
    except Exception as e:
        logger.error(f"Error attaching payment method: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'An unexpected error occurred'
        }, status=500)


@login_required
@require_POST
def delete_payment_method(request, payment_method_id):
    """
    View to delete a payment method
    """
    try:
        # Get the customer
        customer, _ = Customer.get_or_create(subscriber=request.user)

        # Get the payment method from the database
        payment_method = get_object_or_404(PaymentMethod, id=payment_method_id)

        # Verify the payment method belongs to this customer
        if payment_method.customer.id != customer.id:
            return JsonResponse({
                'success': False,
                'error': 'This payment method does not belong to you'
            }, status=403)

        # If this is the default payment method, unset it first
        if (customer.default_payment_method
                and customer.default_payment_method.id == payment_method_id):
            stripe.Customer.modify(
                customer.id,
                invoice_settings={'default_payment_method': None}
            )

            # Update the local customer record
            customer.default_payment_method = None
            customer.save()

        # Detach the payment method from the customer
        stripe.PaymentMethod.detach(payment_method_id)

        # Delete from local database
        payment_method.delete()

        return JsonResponse({'success': True})
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error deleting payment method: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e.user_message)
        }, status=400)
    except Exception as e:
        logger.error(f"Error deleting payment method: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'An unexpected error occurred'
        }, status=500)


@login_required
@require_POST
def set_default_payment_method(request, payment_method_id):
    """
    View to set a payment method as default
    """
    try:
        # Get the customer
        customer, _ = Customer.get_or_create(subscriber=request.user)

        # Get the payment method
        payment_method = get_object_or_404(PaymentMethod, id=payment_method_id)

        # Verify the payment method belongs to this customer
        if payment_method.customer.id != customer.id:
            return JsonResponse({
                'success': False,
                'error': 'This payment method does not belong to you'
            }, status=403)

        # Set as default in Stripe
        stripe_customer = stripe.Customer.modify(
            customer.id,
            invoice_settings={
                'default_payment_method': payment_method_id
            }
        )

        # Update the local customer record
        Customer.sync_from_stripe_data(stripe_customer)

        return JsonResponse({'success': True})
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error setting default payment method: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e.user_message)
        }, status=400)
    except Exception as e:
        logger.error(f"Error setting default payment method: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'An unexpected error occurred'
        }, status=500)
