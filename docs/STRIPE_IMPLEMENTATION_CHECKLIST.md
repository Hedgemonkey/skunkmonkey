# Stripe Integration Implementation Checklist

Use this checklist to track your progress implementing Stripe payment processing in your Django shop application.

## Initial Setup

- [ ] Sign up for a Stripe account or login to your existing account
- [ ] Get API keys from the Stripe Dashboard (Developers > API Keys)
- [ ] Set up environment variables in your `.env` file:
  - [ ] `STRIPE_PUBLISHABLE_KEY`
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET` (will add after webhook setup)
  - [ ] `STRIPE_CURRENCY`

## Install Dependencies

- [ ] Install Python packages:
  ```bash
  pip install stripe dj-stripe django-countries
  ```
- [ ] Install JavaScript dependencies:
  ```bash
  npm install stripe @stripe/stripe-js
  ```
- [ ] Add dependencies to your `package.json`

## Django Configuration

- [ ] Add new apps to `INSTALLED_APPS` in `settings.py`:
  - [ ] `djstripe`
  - [ ] `django_countries`
- [ ] Add Stripe configuration to `settings.py`
- [ ] Run migrations: `python manage.py migrate djstripe`
- [ ] Sync Stripe models: `python manage.py djstripe_sync_models`

## File Implementation

### Backend Files

- [ ] Implement webhook handler (`webhook_handler.py`)
- [ ] Implement webhook view (`webhooks.py`)
- [ ] Implement payment methods views (`payment_methods.py`)
- [ ] Implement subscription views (`subscription_views.py`)
- [ ] Update shop URLs (`urls.py`)

### Templates

- [ ] Implement checkout template (`checkout.html`)
- [ ] Implement payment methods template (`payment_methods.html`)
- [ ] Implement subscription plans template (`subscription_plans.html`)
- [ ] Implement subscription list template (`subscription_list.html`)
- [ ] Implement subscription detail template (`subscription_detail.html`)
- [ ] Implement email templates:
  - [ ] Payment confirmation email (`confirmation_email_body.html`)
  - [ ] Payment failed email (`payment_failed_email_body.html`)

### Frontend Assets

- [ ] Implement Stripe Elements JS (`stripe_elements.js`)
- [ ] Implement Stripe CSS (`stripe.css`)
- [ ] Make sure WebPack config loads these files

## Webhook Setup

- [ ] Set up webhooks in Stripe Dashboard or using Stripe CLI
- [ ] Select required events:
  - [ ] `payment_intent.succeeded`
  - [ ] `payment_intent.payment_failed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `payment_method.attached`
  - [ ] `payment_method.detached`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
- [ ] Add webhook secret to environment variables

## Testing

- [ ] Test one-time payment with test card: `4242 4242 4242 4242`
- [ ] Test payment requiring authentication with test card: `4000 0025 0000 3155`
- [ ] Test payment failure with test card: `4000 0000 0000 0002`
- [ ] Test saving and managing payment methods
- [ ] Test creating a subscription
- [ ] Test canceling a subscription
- [ ] Test webhook handling:
  - [ ] Use Stripe CLI to trigger test webhook events
  - [ ] Verify events are processed correctly

## Security Review

- [ ] Ensure all payment pages use HTTPS
- [ ] Verify API keys are not in version control
- [ ] Confirm CSRF protection on all non-webhook endpoints
- [ ] Check for proper server-side validation of payment amounts
- [ ] Verify all endpoints validate authentication/authorization

## Stripe Dashboard Setup

- [ ] Configure products and prices for subscriptions
- [ ] Set up email receipt templates
- [ ] Configure webhook notifications
- [ ] Set tax rates if applicable

## Production Preparation

- [ ] Switch from test to live API keys
- [ ] Set up production webhooks
- [ ] Update documentation for production environment
- [ ] Perform end-to-end testing in staging environment
- [ ] Implement error monitoring and logging

## Final Steps

- [ ] Train staff on payment processes and troubleshooting
- [ ] Create internal documentation for the payment system
- [ ] Schedule regular review of Stripe logs and webhooks