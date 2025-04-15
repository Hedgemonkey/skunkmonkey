/*
    Core logic/payment flow for this comes from here:
    https://stripe.com/docs/payments/accept-a-payment

    CSS from here:
    https://stripe.com/docs/stripe-js
*/

// Get Stripe publishable key and client secret
const stripePublicKey = document.getElementById('id_stripe_public_key').textContent.slice(1, -1);
const clientSecret = document.getElementById('id_client_secret').textContent.slice(1, -1);

// Create a Stripe instance with your publishable API key
const stripe = Stripe(stripePublicKey);

// Create an instance of Elements
const elements = stripe.elements();

// Custom styling for the card Element
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
        color: '#fa755a',
        iconColor: '#fa755a'
    }
};

// Create a card Element and mount it to the card-element div
const card = elements.create('card', {style: style});
card.mount('#card-element');

// Handle real-time validation errors from the card Element
card.addEventListener('change', function(event) {
    const errorElement = document.getElementById('card-errors');
    if (event.error) {
        errorElement.textContent = event.error.message;
    } else {
        errorElement.textContent = '';
    }
});

// Handle address validation
function validateAddress(prefix) {
    const address1 = document.getElementById(`id_${prefix}_address1`).value;
    const city = document.getElementById(`id_${prefix}_city`).value;
    const state = document.getElementById(`id_${prefix}_state`).value;
    const zipcode = document.getElementById(`id_${prefix}_zipcode`).value;
    const country = document.getElementById(`id_${prefix}_country`).value;

    if (!address1 || !city || !state || !zipcode || !country) {
        return false;
    }

    // Basic zip/postal code validation based on country
    if (country === 'US' && !/^\d{5}(-\d{4})?$/.test(zipcode)) {
        return false;
    }

    return true;
}

// Handle billing address same as shipping checkbox
const billingCheckbox = document.getElementById('billing_same_as_shipping');
const billingContainer = document.getElementById('billing-address-container');

billingCheckbox.addEventListener('change', function() {
    if (this.checked) {
        billingContainer.style.display = 'none';

        // Copy shipping address to billing address fields
        const fields = ['address1', 'address2', 'city', 'state', 'zipcode', 'country'];
        fields.forEach(field => {
            const shippingField = document.getElementById(`id_shipping_${field}`);
            const billingField = document.getElementById(`id_billing_${field}`);
            if (shippingField && billingField) {
                billingField.value = shippingField.value;
            }
        });
    } else {
        billingContainer.style.display = 'block';
    }
});

// Handle form submission
const form = document.getElementById('payment-form');
const submitButton = document.getElementById('submit-button');
const loadingOverlay = document.getElementById('loading-overlay');

form.addEventListener('submit', function(event) {
    event.preventDefault();

    // Disable the submit button to prevent repeated clicks
    submitButton.disabled = true;

    // Show the loading overlay
    loadingOverlay.style.display = 'block';

    // Validate shipping address
    if (!validateAddress('shipping')) {
        showError('Please provide a valid shipping address.');
        return;
    }

    // Validate billing address if not same as shipping
    if (!billingCheckbox.checked && !validateAddress('billing')) {
        showError('Please provide a valid billing address.');
        return;
    }

    // Stripe payment processing
    const saveInfo = Boolean(document.getElementById('id_save_info')?.checked);

    // Create a token for the card
    stripe.createPaymentMethod({
        type: 'card',
        card: card,
        billing_details: {
            name: document.getElementById('id_full_name').value,
            email: document.getElementById('id_email').value,
            phone: document.getElementById('id_phone_number').value,
            address: {
                line1: billingCheckbox.checked ?
                    document.getElementById('id_shipping_address1').value :
                    document.getElementById('id_billing_address1').value,
                line2: billingCheckbox.checked ?
                    document.getElementById('id_shipping_address2').value :
                    document.getElementById('id_billing_address2').value,
                city: billingCheckbox.checked ?
                    document.getElementById('id_shipping_city').value :
                    document.getElementById('id_billing_city').value,
                state: billingCheckbox.checked ?
                    document.getElementById('id_shipping_state').value :
                    document.getElementById('id_billing_state').value,
                postal_code: billingCheckbox.checked ?
                    document.getElementById('id_shipping_zipcode').value :
                    document.getElementById('id_billing_zipcode').value,
                country: billingCheckbox.checked ?
                    document.getElementById('id_shipping_country').value :
                    document.getElementById('id_billing_country').value,
            }
        }
    }).then(({error, paymentMethod}) => {
        if (error) {
            showError(error.message);
            return;
        }

        // The payment method was created successfully
        // Now we can post the form with the payment method ID
        const form = document.getElementById('payment-form');
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

        // Send the payment info to our backend
        fetch('/shop/checkout/cache_checkout_data/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({
                'client_secret': clientSecret,
                'save_info': saveInfo,
                'payment_method_id': paymentMethod.id
            })
        }).then(response => {
            if (response.status === 200) {
                // Confirm the payment with Stripe
                stripe.confirmCardPayment(clientSecret, {
                    payment_method: {
                        card: card,
                        billing_details: {
                            name: document.getElementById('id_full_name').value,
                            phone: document.getElementById('id_phone_number').value,
                            email: document.getElementById('id_email').value,
                            address: {
                                line1: billingCheckbox.checked ?
                                    document.getElementById('id_shipping_address1').value :
                                    document.getElementById('id_billing_address1').value,
                                line2: billingCheckbox.checked ?
                                    document.getElementById('id_shipping_address2').value :
                                    document.getElementById('id_billing_address2').value,
                                city: billingCheckbox.checked ?
                                    document.getElementById('id_shipping_city').value :
                                    document.getElementById('id_billing_city').value,
                                state: billingCheckbox.checked ?
                                    document.getElementById('id_shipping_state').value :
                                    document.getElementById('id_billing_state').value,
                                postal_code: billingCheckbox.checked ?
                                    document.getElementById('id_shipping_zipcode').value :
                                    document.getElementById('id_billing_zipcode').value,
                                country: billingCheckbox.checked ?
                                    document.getElementById('id_shipping_country').value :
                                    document.getElementById('id_billing_country').value,
                            }
                        }
                    },
                    shipping: {
                        name: document.getElementById('id_full_name').value,
                        phone: document.getElementById('id_phone_number').value,
                        address: {
                            line1: document.getElementById('id_shipping_address1').value,
                            line2: document.getElementById('id_shipping_address2').value,
                            city: document.getElementById('id_shipping_city').value,
                            state: document.getElementById('id_shipping_state').value,
                            postal_code: document.getElementById('id_shipping_zipcode').value,
                            country: document.getElementById('id_shipping_country').value,
                        }
                    }
                }).then(function(result) {
                    if (result.error) {
                        // Show error to customer
                        showError(result.error.message);
                    } else {
                        // The payment succeeded!
                        form.submit();
                    }
                });
            } else {
                location.reload();
            }
        }).catch(error => {
            console.error('Error:', error);
            showError('There was an error processing your payment. Please try again.');
        });
    });
});

function showError(message) {
    const errorElement = document.getElementById('card-errors');
    errorElement.textContent = message;
    submitButton.disabled = false;
    loadingOverlay.style.display = 'none';
    window.scrollTo(0, 0);
}
