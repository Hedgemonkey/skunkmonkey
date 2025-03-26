/**
 * Checkout form handling with Stripe integration
 * Handles secure payment processing
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded - initializing checkout script');
    
    // Get Stripe data from the DOM
    const stripeDataElement = document.getElementById('stripe-data');
    
    // Check if the Stripe data element exists
    if (!stripeDataElement) {
        console.error('Stripe data element not found');
        const cardErrorsElement = document.getElementById('card-errors');
        if (cardErrorsElement) {
            cardErrorsElement.textContent = 
                'Payment system initialization error. Please refresh the page or contact support.';
        }
        return;
    }
    
    const stripePublishableKey = stripeDataElement.dataset.publishableKey;
    const clientSecret = stripeDataElement.dataset.clientSecret;
    const cacheCheckoutUrl = stripeDataElement.dataset.cacheUrl;
    
    // Debug logging to verify data is available
    console.log('Stripe publishable key:', stripePublishableKey);
    console.log('Client secret available:', clientSecret);
    console.log('Cache checkout URL:', cacheCheckoutUrl);
    
    // Check if required data is present
    if (!stripePublishableKey) {
        console.error('Stripe publishable key is missing');
        const cardErrorsElement = document.getElementById('card-errors');
        if (cardErrorsElement) {
            cardErrorsElement.textContent = 
                'Payment system configuration error. Please contact support.';
        }
        const submitButtonElement = document.getElementById('submit-button');
        if (submitButtonElement) {
            submitButtonElement.disabled = true;
        }
        return;
    }
    
    if (!clientSecret) {
        console.error('Client secret is missing');
        const cardErrorsElement = document.getElementById('card-errors');
        if (cardErrorsElement) {
            cardErrorsElement.textContent = 
                'Payment session could not be initialized. Please refresh the page or contact support.';
        }
        const submitButtonElement = document.getElementById('submit-button');
        if (submitButtonElement) {
            submitButtonElement.disabled = true;
        }
        return;
    }
    
    // Verify we're using the test key in non-production environments
    if (stripePublishableKey.startsWith('pk_test_')) {
        console.log('Using Stripe TEST mode - no real payments will be processed');
    } else if (stripePublishableKey.startsWith('pk_live_')) {
        console.log('CAUTION: Using Stripe LIVE mode - real payments will be processed');
    }
    
    // Initialize Stripe
    const stripe = Stripe(stripePublishableKey);
    const elements = stripe.elements();
    
    // Create and mount the card Element
    const cardElement = elements.create('card', {
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
    
    cardElement.mount('#card-element');
    
    // Handle validation errors on the card Element
    cardElement.addEventListener('change', function(event) {
        const displayError = document.getElementById('card-errors');
        if (event.error) {
            displayError.textContent = event.error.message;
        } else {
            displayError.textContent = '';
        }
    });
    
    // Handle form submission
    const form = document.getElementById('checkout-form');
    const submitButton = document.getElementById('submit-button');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    if (!form) {
        console.error('Checkout form not found');
        return;
    }
    
    if (!submitButton) {
        console.error('Submit button not found');
        return;
    }
    
    // Handle payment intent issues
    function handlePaymentIntentIssue(errorMessage = 'The payment session has expired. Please refresh the page to continue.') {
        // Show error message
        const cardErrorsElement = document.getElementById('card-errors');
        if (cardErrorsElement) {
            cardErrorsElement.textContent = errorMessage;
        }
        
        // Create a refresh button
        const refreshButton = document.createElement('button');
        refreshButton.className = 'btn btn-warning mt-3';
        refreshButton.innerText = 'Refresh Page';
        refreshButton.onclick = function() {
            // Force a hard refresh of the page to get a new payment intent
            window.location.href = window.location.href.split('?')[0] + '?refresh=' + new Date().getTime();
        };
        
        // Add the refresh button after the error message
        if (cardErrorsElement && !document.getElementById('refresh-button')) {
            refreshButton.id = 'refresh-button';
            cardErrorsElement.parentNode.insertBefore(refreshButton, cardErrorsElement.nextSibling);
        }
        
        // Re-enable the submit button and hide overlay
        if (submitButton) submitButton.disabled = false;
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    }
    
    // Helper function to get value from any field
    function getFieldValue(fieldName) {
        // Try with both regular name and id_ prefix (Django convention)
        const field = form.elements[fieldName] || form.elements[`id_${fieldName}`] || 
                      document.getElementById(`id_${fieldName}`);
        return field ? field.value : '';
    }
    
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        console.log('Form submission started');
        
        // Verify terms checkbox is checked
        const termsCheckbox = document.getElementById('terms-check');
        if (!termsCheckbox || !termsCheckbox.checked) {
            const cardErrorsElement = document.getElementById('card-errors');
            if (cardErrorsElement) {
                cardErrorsElement.textContent = 'Please agree to the terms and conditions.';
            }
            return;
        }
        
        // Disable the submit button to prevent double clicks
        submitButton.disabled = true;
        
        // Show the loading overlay
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
        
        // Display error and stop processing
        const showError = (message) => {
            console.error(message);
            const cardErrorsElement = document.getElementById('card-errors');
            if (cardErrorsElement) {
                cardErrorsElement.textContent = message;
            }
            submitButton.disabled = false;
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
        };
        
        // Confirm the card payment
        try {
            // First cache the checkout data on the server
            const csrfTokenElement = form.querySelector('input[name="csrfmiddlewaretoken"]');
            if (!csrfTokenElement) {
                throw new Error('CSRF token not found in form');
            }
            const csrfToken = csrfTokenElement.value;
            
            // Get form data that we want to pass to the payment intent
            const formData = new FormData();
            formData.append('client_secret', clientSecret);
            
            // Add save_info from terms checkbox
            formData.append('save_info', termsCheckbox.checked);
            
            console.log('Sending data to cache_checkout_data...');
            
            try {
                // Send the data to your cache_checkout_data view
                const response = await fetch(cacheCheckoutUrl, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrfToken,
                    },
                    body: formData
                });
                
                let responseData;
                try {
                    responseData = await response.json();
                } catch (e) {
                    console.error('Failed to parse response JSON:', e);
                    responseData = {};
                }
                
                // Check for special payment intent error
                if (response.status === 409 && responseData.error === 'payment_intent_unexpected_state') {
                    console.error('Payment intent is in an unexpected state');
                    handlePaymentIntentIssue(responseData.message || 'The payment session has expired. Please refresh the page to continue.');
                    return;
                }
                
                if (!response.ok) {
                    // Handle server error
                    console.error('Server error:', responseData);
                    showError(responseData.error || 'An error occurred. Please try again.');
                    return;
                }
                
                console.log('Cache checkout data successful');
            } catch (fetchError) {
                console.error('Error during fetch operation:', fetchError);
                showError('Network error. Please check your connection and try again.');
                return;
            }
            
            // Check if billing should be same as shipping
            const billingSameAsShipping = document.getElementById('billing_same_as_shipping')?.checked;
            console.log('Billing same as shipping:', billingSameAsShipping);
            
            // Prepare billing information using our helper function
            const billingDetails = {
                name: getFieldValue('full_name'),
                email: getFieldValue('email'),
                phone: getFieldValue('phone_number'),
                address: {
                    line1: getFieldValue(billingSameAsShipping ? 'shipping_address1' : 'billing_address1'),
                    line2: getFieldValue(billingSameAsShipping ? 'shipping_address2' : 'billing_address2'),
                    city: getFieldValue(billingSameAsShipping ? 'shipping_city' : 'billing_city'),
                    state: getFieldValue(billingSameAsShipping ? 'shipping_state' : 'billing_state'),
                    postal_code: getFieldValue(billingSameAsShipping ? 'shipping_zipcode' : 'billing_zipcode'),
                    country: getFieldValue(billingSameAsShipping ? 'shipping_country' : 'billing_country') || 'GB'
                }
            };
            
            console.log('Proceeding with billing details:', billingDetails);
            
            // Verify country is not empty before proceeding
            if (!billingDetails.address.country) {
                showError('Country is required for payment processing. Please select a country and try again.');
                return;
            }
            
            try {
                const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
                    payment_method: {
                        card: cardElement,
                        billing_details: billingDetails
                    }
                });
                
                if (error) {
                    // Check for specific payment intent errors that indicate it's expired or invalid
                    if (error.type === 'invalid_request_error' && 
                       (error.code === 'payment_intent_unexpected_state' || 
                        error.message.includes('is not available') ||
                        error.message.includes('payment_intent'))) {
                        console.error('Payment intent issue:', error.message);
                        handlePaymentIntentIssue('The payment session has expired. Please refresh the page to continue.');
                    } else {
                        // Show other errors to customer
                        console.error('Payment confirmation error:', error);
                        showError(error.message);
                    }
                } else {
                    if (paymentIntent.status === 'succeeded') {
                        console.log('Payment succeeded! Submitting form...');
                        // The payment was successful
                        // Submit the form to complete order processing
                        form.submit();
                    } else {
                        console.warn('Payment intent status not succeeded:', paymentIntent.status);
                        showError('Payment processing issue. Please try again.');
                    }
                }
            } catch (stripeError) {
                console.error('Error in Stripe operation:', stripeError);
                
                // Check if this is a payment intent issue
                if (stripeError.type === 'invalid_request_error' && 
                    (stripeError.code === 'payment_intent_unexpected_state' ||
                     stripeError.message.includes('is not available') ||
                     stripeError.message.includes('payment_intent'))) {
                    handlePaymentIntentIssue('The payment session has expired. Please refresh the page to continue.');
                } else {
                    showError(stripeError.message || 'An error occurred with the payment process. Please try again.');
                }
            }
            
        } catch (error) {
            console.error('Error in checkout process:', error);
            // Show error to user
            showError(error.message);
        }
    });
    
    // Handle "billing same as shipping" checkbox if it exists
    const billingSameAsShippingCheckbox = document.getElementById('billing_same_as_shipping');
    const billingAddressFields = document.querySelector('.billing-address-fields');
    
    if (billingSameAsShippingCheckbox && billingAddressFields) {
        // Function to toggle visibility of billing fields
        const toggleBillingFields = () => {
            if (billingSameAsShippingCheckbox.checked) {
                billingAddressFields.style.display = 'none';
            } else {
                billingAddressFields.style.display = 'block';
            }
        };
        
        // Set initial state
        toggleBillingFields();
        
        // Listen for changes
        billingSameAsShippingCheckbox.addEventListener('change', toggleBillingFields);
    }
    
    console.log('Checkout script initialization complete');
});
