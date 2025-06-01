/**
 * StripePaymentManager - handles Stripe payment integration
 * Dynamically loads Stripe.js and configures payment elements
 */
class StripePaymentManager {
    constructor() {
        this.stripe = null;
        this.elements = null;
        this.card = null;
        this.form = null;
        this.cardElement = null;
        this.cardErrors = null;
        this.submitButton = null;
        this.publishableKey = null;
        this.clientSecret = null;
        this.orderCompleteUrl = null;

        // Load Stripe.js dynamically if not already loaded
        this.loadStripeJs().then(() => {
            this.init();
        }).catch(error => {
            console.error('Error loading Stripe.js:', error);
        });
    }

    /**
     * Dynamically load the Stripe.js script if not already loaded
     * @returns {Promise} - Resolves when Stripe.js is loaded
     */
    loadStripeJs() {
        return new Promise((resolve, reject) => {
            if (window.Stripe) {
                resolve(window.Stripe);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.onload = () => resolve(window.Stripe);
            script.onerror = () => reject(new Error('Failed to load Stripe.js'));
            document.head.appendChild(script);
        });
    }

    /**
     * Initialize Stripe elements and set up event listeners
     */
    init() {
        // Get configuration from hidden fields
        this.publishableKey = document.getElementById('stripe_public_key')?.value ||
                             document.getElementById('id_stripe_public_key')?.value;
        this.clientSecret = document.getElementById('client_secret')?.value;
        this.orderCompleteUrl = document.getElementById('order_complete_url')?.value;

        if (!this.publishableKey) {
            console.error('Stripe publishable key not found');
            return;
        }

        console.log('Initializing Stripe with key:', this.publishableKey);
        this.stripe = window.Stripe(this.publishableKey);
        this.elements = this.stripe.elements();

        // Different initialization based on the current page
        if (window.location.pathname.includes('checkout')) {
            this.initializeCheckout();
        } else if (window.location.pathname.includes('payment')) {
            this.initializePayment();
        } else if (window.location.pathname.includes('payment_methods')) {
            this.initializePaymentMethods();
        }
    }

    /**
     * Initialize checkout page functionality
     */
    initializeCheckout() {
        this.form = document.getElementById('checkout-form');
        this.cardElement = document.getElementById('card-element');
        this.cardErrors = document.getElementById('card-errors');
        this.submitButton = document.getElementById('submit-button');

        if (!this.form || !this.cardElement) {
            console.warn('Required checkout elements not found');
            return;
        }

        // Create and mount the card element
        const style = {
            base: {
                color: '#32325d',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                    color: '#aab7c4'
                }
            },
            invalid: {
                color: '#dc3545',
                iconColor: '#dc3545'
            }
        };

        this.card = this.elements.create('card', {style: style});
        this.card.mount(this.cardElement);

        // Handle form submission
        this.form.addEventListener('submit', this.handleCheckoutSubmit.bind(this));
    }

    /**
     * Handle checkout form submission
     * @param {Event} event - The form submit event
     */
    handleCheckoutSubmit(event) {
        event.preventDefault();

        // Disable the submit button to prevent multiple submissions
        this.setLoading(true);

        // Collect form data
        const formData = new FormData(this.form);
        const billingDetails = {
            name: formData.get('full_name'),
            email: formData.get('email'),
            address: {
                line1: formData.get('shipping_address')
            }
        };

        if (this.clientSecret) {
            // Process payment with Stripe
            this.stripe.confirmCardPayment(this.clientSecret, {
                payment_method: {
                    card: this.card,
                    billing_details: billingDetails
                }
            }).then(result => {
                if (result.error) {
                    this.showError(result.error.message);
                    this.setLoading(false);
                } else {
                    if (result.paymentIntent.status === 'succeeded') {
                        // Payment successful, submit the form
                        this.form.submit();
                    }
                }
            });
        } else {
            // If no client secret (e.g. in development/testing), just submit the form
            console.warn('No client secret found, submitting form without payment processing');
            setTimeout(() => {
                this.form.submit();
            }, 1000);
        }
    }

    /**
     * Initialize payment page functionality
     */
    initializePayment() {
        this.form = document.getElementById('payment-form');
        this.paymentElement = document.getElementById('payment-element');
        this.errorElement = document.getElementById('error-message');
        this.submitButton = document.getElementById('submit-button');

        if (!this.form || !this.paymentElement) {
            console.warn('Required payment elements not found');
            return;
        }

        // Create and mount payment element
        const paymentElement = this.elements.create('payment');
        paymentElement.mount(this.paymentElement);

        // Handle form submission
        this.form.addEventListener('submit', this.handlePaymentSubmit.bind(this));
    }

    /**
     * Handle payment form submission
     * @param {Event} event - The form submit event
     */
    handlePaymentSubmit(event) {
        event.preventDefault();
        this.setLoading(true);

        if (this.clientSecret) {
            this.stripe.confirmPayment({
                elements: this.elements,
                confirmParams: {
                    return_url: this.orderCompleteUrl || window.location.origin
                }
            }).then(result => {
                if (result.error) {
                    this.showError(result.error.message);
                    this.setLoading(false);
                }
            });
        } else {
            console.warn('No client secret found');
            this.setLoading(false);
        }
    }

    /**
     * Initialize payment methods page functionality
     */
    initializePaymentMethods() {
        const cardElement = document.getElementById('add-payment-method-card');
        const paymentMethodForm = document.getElementById('add-payment-method-form');
        const customerId = document.getElementById('customer-id')?.value;
        const paymentMethodsContainer = document.getElementById('payment-methods-container');
        const paymentMethodErrors = document.getElementById('payment-method-errors');

        if (!cardElement || !paymentMethodForm) {
            console.warn('Required payment method elements not found');
            return;
        }

        // Create and mount card element
        const card = this.elements.create('card', {
            style: {
                base: {
                    color: '#32325d',
                    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                    fontSmoothing: 'antialiased',
                    fontSize: '16px',
                    '::placeholder': {
                        color: '#aab7c4'
                    }
                },
                invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a'
                }
            }
        });

        card.mount(cardElement);

        // Handle form submission
        paymentMethodForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const cardholderName = document.getElementById('cardholder_name').value;

            try {
                const result = await this.stripe.createPaymentMethod({
                    type: 'card',
                    card: card,
                    billing_details: {
                        name: cardholderName,
                    }
                });

                if (result.error) {
                    if (paymentMethodErrors) {
                        paymentMethodErrors.textContent = result.error.message;
                    }
                } else {
                    // Here you would send the payment method ID to your server
                    console.log('Payment method created:', result.paymentMethod.id);

                    // Clear form and show success message
                    paymentMethodForm.reset();
                    card.clear();

                    // In a real implementation, you would reload payment methods
                    if (customerId && this.loadSavedPaymentMethods) {
                        this.loadSavedPaymentMethods();
                    }
                }
            } catch (error) {
                console.error('Error creating payment method:', error);
            }
        });

        // Load saved payment methods if available
        if (customerId && paymentMethodsContainer) {
            this.loadSavedPaymentMethods(customerId, paymentMethodsContainer);
        }
    }

    /**
     * Load saved payment methods - placeholder that would be implemented on the server
     * @param {string} customerId - Stripe customer ID
     * @param {HTMLElement} container - Container element to show payment methods
     */
    loadSavedPaymentMethods(customerId, container) {
        if (!customerId || !container) return;

        // This would typically be an API call to your Django backend
        // For now, show a placeholder message
        container.innerHTML = '<p class="text-center">You have no saved payment methods.</p>';
    }

    /**
     * Display error message
     * @param {string} message - The error message
     */
    showError(message) {
        const errorElement = this.cardErrors || this.errorElement;
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('alert', 'alert-danger', 'mt-3');
        } else {
            this.showNotification('Payment Error', message, 'error');
        }
    }

    /**
     * Set loading state
     * @param {boolean} isLoading - Whether loading is in progress
     */
    setLoading(isLoading) {
        if (!this.submitButton) return;

        if (isLoading) {
            // Disable the button and show a spinner
            this.submitButton.disabled = true;
            this.submitButton.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Processing...
            `;
        } else {
            this.submitButton.disabled = false;
            this.submitButton.innerHTML = 'Pay Now';
        }
    }

    /**
     * Show a notification using SweetAlert if available, or alert if not
     * @param {string} title - The notification title
     * @param {string} message - The notification message
     * @param {string} type - The notification type (success, error, info)
     */
    showNotification(title, message, type) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: title,
                text: message,
                icon: type,
                confirmButtonColor: '#0d6efd'
            });
        } else {
            alert(`${title}: ${message}`);
        }
    }
}

// Initialize the Stripe payment manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const stripePaymentManager = new StripePaymentManager();

    // Make it available globally for potential direct access
    window.StripePaymentManager = stripePaymentManager;
});

// Export for module usage
export default StripePaymentManager;
