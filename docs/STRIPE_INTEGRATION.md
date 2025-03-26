# Stripe Payment Processing Integration Guide

This guide provides comprehensive instructions for integrating Stripe payment processing into the SkunkMonkey Django shop application. The integration enables secure payment processing, subscription management, and saved payment methods.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Installation Steps](#installation-steps)
4. [Features Overview](#features-overview)
5. [Payment Flow](#payment-flow)
6. [Webhook Configuration](#webhook-configuration)
7. [Security Considerations](#security-considerations)
8. [Testing](#testing)
9. [Creating Subscription Products](#creating-subscription-products)
10. [Customization](#customization)
11. [File Structure Overview](#file-structure-overview)
12. [Troubleshooting](#troubleshooting)

## Prerequisites

Before beginning the integration, ensure you have the following:

- A Stripe account (create one at [stripe.com](https://stripe.com) if needed)
- Admin access to your Stripe Dashboard
- Python 3.8+ and Django 3.2+
- Node.js and npm for JavaScript dependencies

## Environment Variables

Set the following environment variables in your `.env` file:

```
# Stripe API Keys
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Configuration
STRIPE_CURRENCY=gbp  # Change to your preferred currency code
DJSTRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret  # Same as STRIPE_WEBHOOK_SECRET
```

> **Important:** Never commit your actual API keys to version control. Always use environment variables!

## Installation Steps

1. **Install Required Packages**

```bash
# Python packages
pip install stripe dj-stripe django-countries

# JavaScript dependencies
npm install stripe @stripe/stripe-js
```

2. **Add Applications to INSTALLED_APPS in settings.py**

```python
INSTALLED_APPS = [
    # ... existing apps
    'djstripe',
    'django_countries',
]
```

3. **Configure Stripe Settings in settings.py**

```python
# Stripe settings
STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY', '')
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY', '')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET', '')
STRIPE_CURRENCY = 'gbp'  # British Pound as default currency

# dj-stripe settings
DJSTRIPE_WEBHOOK_SECRET = STRIPE_WEBHOOK_SECRET  # Use the same secret as Stripe
DJSTRIPE_USE_NATIVE_JSONFIELD = True
DJSTRIPE_FOREIGN_KEY_TO_FIELD = "id"

# Keep backward compatibility with existing code
STRIPE_TEST_PUBLISHABLE_KEY = STRIPE_PUBLISHABLE_KEY
STRIPE_TEST_SECRET_KEY = STRIPE_SECRET_KEY
STRIPE_API_VERSION = "2023-10-16"  # Update to the latest Stripe API version as needed
```

4. **Update URLs Configuration**

Add the following to your project's `urls.py`:

```python
urlpatterns = [
    # ... existing URLs
    path('stripe/', include('djstripe.urls', namespace='djstripe')),
]
```

5. **Apply Database Migrations**

```bash
python manage.py migrate djstripe
```

6. **Run Initial Data Sync with Stripe**

```bash
python manage.py djstripe_sync_models
```

## Features Overview

This integration provides the following features:

1. **One-time Payments**
   - Secure checkout using Stripe Elements
   - Card payment processing
   - Support for multiple payment methods

2. **Customer Management**
   - Save and manage payment methods
   - View payment history
   - Update billing information

3. **Subscription Management**
   - Subscribe to recurring plans
   - Upgrade/downgrade subscriptions
   - Cancel subscriptions
   - Handle trial periods

4. **Webhook Processing**
   - Process async payment events
   - Handle subscription lifecycle events
   - Payment method updates

## Payment Flow

The payment flow follows these steps:

1. Customer adds products to cart
2. Customer proceeds to checkout
3. Customer enters shipping and billing information
4. A Stripe Payment Intent is created on the server
5. Customer enters payment details using Stripe Elements
6. Payment is confirmed with Stripe on the client-side
7. Webhooks confirm payment success asynchronously
8. Order is marked as paid and customer is redirected to success page

## Webhook Configuration

Webhooks are essential for reliable payment processing. To set up webhooks:

1. Go to the [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add Endpoint"
3. Enter your webhook URL: `https://your-domain.com/shop/webhooks/`
4. Select the following events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_method.attached`
   - `payment_method.detached`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. After creating the webhook, copy the Signing Secret and add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`

If running on a local development server, use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks to your local environment:

```bash
stripe listen --forward-to http://localhost:8000/shop/webhooks/
```

## Security Considerations

Stripe payment integration requires careful attention to security:

1. **PCI Compliance**: This implementation uses Stripe Elements, which keeps you outside of PCI scope by ensuring that card data never touches your server.

2. **API Keys**: Always use environment variables for API keys, never hardcode them.

3. **Webhook Validation**: Always validate webhook signatures to prevent fraudulent requests.

4. **HTTPS**: Always use HTTPS in production for all payment-related pages.

5. **CSRF Protection**: Ensure Django's CSRF protection is active for all forms, except the webhook endpoint.

6. **Client-Side Validation**: While client-side validation improves UX, always implement server-side validation as well.

## Testing

Stripe provides test cards for various scenarios:

| Card Number         | Scenario                |
|---------------------|-------------------------|
| 4242 4242 4242 4242 | Successful payment      |
| 4000 0027 6000 3184 | Requires authentication |
| 4000 0000 0000 9995 | Declined payment        |
| 4000 0000 0000 0341 | Attach to customer fails|

For testing webhooks locally:

1. Install the Stripe CLI
2. Run `stripe listen --forward-to http://localhost:8000/shop/webhooks/`
3. Use the webhook signing secret provided by the CLI in your `.env` file

## Creating Subscription Products

To set up subscription products in Stripe:

1. Go to the [Stripe Dashboard](https://dashboard.stripe.com/products)
2. Click "Add Product"
3. Fill in the product details
4. Add pricing information (recurring pricing for subscriptions)
5. Set the billing interval (monthly, yearly, etc.)
6. Save the product
7. Sync products and prices to your local database:
   ```bash
   python manage.py djstripe_sync_models Product Price
   ```

## Customization

### Custom Checkout UI

To customize the checkout UI:

1. Modify the `checkout.html` template to match your brand
2. Update the CSS in `stripe.css` to style the Stripe Elements
3. Adjust the fields in `CheckoutForm` if you need additional information

### Adding Payment Methods

The integration supports adding multiple payment methods per customer:

1. Users can add payment methods from their account page
2. Payment methods can be set as default
3. Default payment methods are automatically used for subscriptions and future purchases

## File Structure Overview

The integration consists of the following key files:

- **JavaScript**: `static/js/stripe_elements.js` - Client-side Stripe integration
- **CSS**: `static/css/stripe.css` - Styling for Stripe Elements
- **Python Views**:
  - `shop/views.py` - One-time checkout views
  - `shop/payment_methods.py` - Payment method management views
  - `shop/subscription_views.py` - Subscription management views
- **Webhook Handling**:
  - `shop/webhooks.py` - Webhook endpoint
  - `shop/webhook_handler.py` - Webhook event processing
- **Templates**:
  - `shop/templates/shop/checkout.html` - Checkout page
  - `shop/templates/shop/payment_methods.html` - Payment method management
  - `shop/templates/shop/subscription_plans.html` - Subscription plan selection
  - `shop/templates/shop/subscription_list.html` - List of user subscriptions
  - `shop/templates/shop/subscription_detail.html` - Subscription details

## Creating Subscription Products

To set up subscription products in Stripe:

1. Go to the [Stripe Dashboard](https://dashboard.stripe.com/products)
2. Click "Add Product"
3. Fill in the product details
4. Add pricing information (recurring pricing for subscriptions)
5. Set the billing interval (monthly, yearly, etc.)
6. Save the product
7. Sync products and prices to your local database:
   ```bash
   python manage.py djstripe_sync_models Product Price
   ```

## Customization

### Custom Checkout UI

To customize the checkout UI:

1. Modify the `checkout.html` template to match your brand
2. Update the CSS in `stripe.css` to style the Stripe Elements
3. Adjust the fields in `CheckoutForm` if you need additional information

### Adding Payment Methods

The integration supports adding multiple payment methods per customer:

1. Users can add payment methods from their account page
2. Payment methods can be set as default
3. Default payment methods are automatically used for subscriptions and future purchases

## File Structure Overview

The integration consists of the following key files:

- **JavaScript**: `static/js/stripe_elements.js` - Client-side Stripe integration
- **CSS**: `static/css/stripe.css` - Styling for Stripe Elements
- **Python Views**:
  - `shop/views.py` - One-time checkout views
  - `shop/payment_methods.py` - Payment method management views
  - `shop/subscription_views.py` - Subscription management views
- **Webhook Handling**:
  - `shop/webhooks.py` - Webhook endpoint
  - `shop/webhook_handler.py` - Webhook event processing
- **Templates**:
  - `shop/templates/shop/checkout.html` - Checkout page
  - `shop/templates/shop/payment_methods.html` - Payment method management
  - `shop/templates/shop/subscription_plans.html` - Subscription plan selection
  - `shop/templates/shop/subscription_list.html` - List of user subscriptions
  - `shop/templates/shop/subscription_detail.html` - Subscription details

## Troubleshooting

### Common Issues

1. **Payment Intent Creation Fails**
   - Check Stripe API key is correct and active
   - Verify you're using the correct API version
   - Ensure the amount is in the smallest currency unit (cents/pence)

2. **Webhooks Not Receiving Events**
   - Verify the webhook URL is publicly accessible
   - Check the webhook signing secret is correct
   - Ensure you've registered for the correct events in the Stripe Dashboard
   - For local development, use Stripe CLI

3. **Payment Element Not Appearing**
   - Check browser console for JavaScript errors
   - Verify Stripe publishable key is correct
   - Ensure Stripe Elements JavaScript is loading correctly

4. **Subscription Creation Fails**
   - Verify the customer has a default payment method
   - Check that the price ID exists and is active
   - Ensure the subscription request matches Stripe's API requirements

For more detailed troubleshooting, check the Stripe logs in your Stripe Dashboard and your application server logs.

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [dj-stripe Documentation](https://dj-stripe.readthedocs.io/en/master/)
- [Stripe Elements Documentation](https://stripe.com/docs/stripe-js)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
