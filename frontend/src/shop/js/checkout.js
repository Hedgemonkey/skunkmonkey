/**
 * Checkout form handling with Stripe Payment Element integration
 * Features:
 * - Stripe Payment Element for comprehensive payment processing
 * - Billing information handled by Stripe Payment Element
 * - Auto-population of shipping fields
 * - Robust error handling
 */
import '../css/checkout.css';
import '../css/stripe.css';

document.addEventListener('DOMContentLoaded', function() {
    // Keep track of form submission status
    let isSubmitting = false;

    /**
     * Store client secret in sessionStorage with a timestamp
     * @param {string} clientSecret - The Stripe client secret
     */
    function storeClientSecret(clientSecret) {
        // Store the client secret and a timestamp
        const now = new Date().getTime();
        sessionStorage.setItem('client_secret', clientSecret);
        sessionStorage.setItem('client_secret_timestamp', now);

        // Store the cart total as an additional verification
        const cartTotalElement = document.querySelector('.checkout-total') ||
                               document.querySelector('.cart-total') ||
                               document.getElementById('cart-total');
        if (cartTotalElement) {
            sessionStorage.setItem('cart_total', cartTotalElement.textContent.trim());
        }
    }

    /**
     * Clear client secret data from sessionStorage
     */
    function clearClientSecretData() {
        sessionStorage.removeItem('client_secret');
        sessionStorage.removeItem('client_secret_timestamp');
        sessionStorage.removeItem('cart_total');
    }

    /**
     * Check if the stored client secret is expired
     */
    function checkClientSecretExpiry() {
        const storedSecret = sessionStorage.getItem('client_secret');
        const timestamp = sessionStorage.getItem('client_secret_timestamp');

        if (storedSecret && timestamp) {
            const now = new Date().getTime();
            const timeDiff = now - parseInt(timestamp);

            // If more than 1 hour old, consider it expired (60 * 60 * 1000 = 3600000 ms)
            if (timeDiff > 3600000) {
                clearClientSecretData();

                // Show a message if we're on the checkout page
                if (window.location.href.includes('checkout')) {
                    handlePaymentIntentIssue('Your payment session has expired. Please refresh the page to continue.');
                }
            }
        }
    }

    /**
     * Disable the submit button
     */
    function disableSubmitButton() {
        const submitButton = document.getElementById('submit-button');
        if (submitButton) {
            submitButton.disabled = true;
        }
    }

    /**
     * Show an error message
     * @param {string} message - The error message to display
     */
    function showError(message) {
        const paymentErrorsElement = document.getElementById('payment-errors');
        if (paymentErrorsElement) {
            paymentErrorsElement.textContent = message;
            paymentErrorsElement.classList.remove('d-none');
        }
    }

    /**
     * Clear error messages
     */
    function clearError() {
        const paymentErrorsElement = document.getElementById('payment-errors');
        if (paymentErrorsElement) {
            paymentErrorsElement.textContent = '';
            paymentErrorsElement.classList.add('d-none');
        }
    }

    /**
     * Handle payment intent issues by showing error and refresh button
     * @param {string} errorMessage - The error message to display
     */
    function handlePaymentIntentIssue(errorMessage = 'The payment session has expired. Please refresh the page to continue.') {
        // Show error message
        showError(errorMessage);

        // Create a refresh button
        const refreshButton = document.createElement('button');
        refreshButton.className = 'btn btn-warning mt-3';
        refreshButton.innerText = 'Refresh Page';
        refreshButton.onclick = function() {
            // Clear any stored client secret data
            clearClientSecretData();

            // Force a hard refresh of the page to get a new payment intent
            window.location.href = window.location.href.split('?')[0] + '?refresh=' + new Date().getTime();
        };

        // Add the refresh button after the error message
        const paymentErrorsElement = document.getElementById('payment-errors');
        if (paymentErrorsElement && !document.getElementById('refresh-button')) {
            refreshButton.id = 'refresh-button';
            paymentErrorsElement.parentNode.insertBefore(refreshButton, paymentErrorsElement.nextSibling);
        }

        // Reset submission status
        isSubmitting = false;

        // Re-enable the submit button and hide overlay
        const submitButton = document.getElementById('submit-button');
        const loadingOverlay = document.getElementById('loading-overlay');
        if (submitButton) submitButton.disabled = false;
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    }

    // Get Stripe data from the DOM
    const stripeDataElement = document.getElementById('stripe-data');

    // Check if the Stripe data element exists
    if (!stripeDataElement) {
        showError('Payment system initialization error. Please refresh the page or contact support.');
        return;
    }

    const stripePublishableKey = stripeDataElement.dataset.publishableKey;
    const clientSecret = stripeDataElement.dataset.clientSecret;
    const cacheCheckoutUrl = stripeDataElement.dataset.cacheUrl;

    // Store the client secret in sessionStorage with a timestamp
    if (clientSecret) {
        storeClientSecret(clientSecret);
    }

    // Check for expired client secret
    checkClientSecretExpiry();

    // Check if required data is present
    if (!stripePublishableKey) {
        showError('Payment system configuration error. Please contact support.');
        disableSubmitButton();
        return;
    }

    if (!clientSecret) {
        showError('Payment session could not be initialized. Please refresh the page or contact support.');
        disableSubmitButton();
        return;
    }

    // Initialize Stripe
    const stripe = Stripe(stripePublishableKey);

    // Initialize variables
    const form = document.getElementById('checkout-form');
    const submitButton = document.getElementById('submit-button');
    const loadingOverlay = document.getElementById('loading-overlay');
    const paymentElement = document.getElementById('payment-element');

    if (!form) {
        return;
    }

    if (!submitButton) {
        return;
    }

    if (!paymentElement) {
        return;
    }

    // Create Stripe Elements instance
    const options = {
        clientSecret: clientSecret,
        appearance: {
            theme: 'stripe',
            variables: {
                colorPrimary: '#007bff',
                colorBackground: '#ffffff',
                colorText: '#32325d',
                colorDanger: '#dc3545',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                spacingUnit: '4px',
                borderRadius: '4px'
            }
        }
    };

    // Create the Payment Element
    const elements = stripe.elements(options);
    const paymentElementInstance = elements.create('payment', {
        layout: {
            type: 'tabs',
            defaultCollapsed: false
        },
        fields: {
            billingDetails: {
                address: {
                    country: 'auto'
                }
            }
        },
        terms: { card: 'never' }, // Don't show terms text in the Element
        wallets: {
            applePay: 'auto',
            googlePay: 'auto'
        }
    });

    // Mount the Payment Element
    paymentElementInstance.mount('#payment-element');

    /**
     * Function to fix Stripe iframe styling issues
     */
    function fixStripeIframeStyles() {
        // Find the Stripe iframe
        const stripeIframe = document.querySelector('#payment-element iframe');
        if (stripeIframe) {
            // Create a style element to add to the head
            const styleEl = document.createElement('style');
            styleEl.textContent = `
                #payment-element iframe {
                    margin: 0 !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    min-width: 100% !important;
                    transform: none !important;
                    position: static !important;
                }
                #payment-element .__PrivateStripeElement {
                    margin: 0 !important;
                    position: relative !important;
                    transform: none !important;
                }
                .payment-element-container {
                    position: relative !important;
                    z-index: 1 !important;
                    overflow: visible !important;
                    min-height: 350px !important;
                }
            `;
            document.head.appendChild(styleEl);
        }
    }

    // Apply fix for Stripe iframe styling immediately and after delays
    fixStripeIframeStyles();
    setTimeout(fixStripeIframeStyles, 500);
    setTimeout(fixStripeIframeStyles, 1000);

    // Listen for changes to the Payment Element to handle validation errors and adjust sizing
    paymentElementInstance.on('change', function(event) {
        if (event.error) {
            showError(event.error.message);
        } else {
            clearError();
        }

        // Adjust container height if needed
        adjustContainerHeight();
        enhanceContainerHeightAdjustment();
    });

    // Also listen for the ready event to adjust the container height and fix styles
    paymentElementInstance.on('ready', function() {
        // Allow a brief delay for the iframe to fully render
        setTimeout(adjustContainerHeight, 100);
        // Fix Stripe iframe styles
        fixStripeIframeStyles();
        setTimeout(fixStripeIframeStyles, 100);
        // Apply enhanced height adjustment
        enhanceContainerHeightAdjustment();
        setupExpansionDetection();
    });

    // Handle window resize and orientation changes for mobile responsiveness
    window.addEventListener('resize', function() {
        setTimeout(function() {
            adjustContainerHeight();
            enhanceContainerHeightAdjustment();
        }, 100);
    });

    // Handle orientation change specifically for mobile devices
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            adjustContainerHeight();
            enhanceContainerHeightAdjustment();
        }, 300);
    });    /**
     * Helper function to adjust the container height based on the iframe content
     */
    function adjustContainerHeight() {
        const iframeElement = document.querySelector('#payment-element iframe');
        const containerElement = document.querySelector('.payment-element-container');

        if (iframeElement && containerElement) {
            const isMobile = window.innerWidth <= 767.98;
            const isSmallMobile = window.innerWidth <= 575.98;
            const isVerySmallMobile = window.innerWidth <= 375;

            if (isMobile) {
                // CRITICAL: Set iframe min-height directly for mobile field visibility
                if (isVerySmallMobile) {
                    iframeElement.style.minHeight = '700px';
                    containerElement.style.minHeight = '720px';
                } else if (isSmallMobile) {
                    iframeElement.style.minHeight = '650px';
                    containerElement.style.minHeight = '670px';
                } else {
                    iframeElement.style.minHeight = '600px';
                    containerElement.style.minHeight = '620px';
                }

                // Ensure container has proper overflow settings
                containerElement.style.height = 'auto';
                containerElement.style.overflow = 'visible';
            } else {
                // Desktop: calculate height based on iframe
                const iframeHeight = iframeElement.scrollHeight || iframeElement.offsetHeight;
                const newHeight = iframeHeight + 50;

                // Only update if the new height is larger than the minimum
                if (newHeight > 300) {
                    containerElement.style.minHeight = `${newHeight}px`;
                }
            }
        }
    }

    /**
     * Sets up expansion detection for Stripe iframe
     */
    function setupExpansionDetection() {
        // Check for expansion periodically (fallback approach)
        const expansionChecker = setInterval(function() {
            const iframe = document.querySelector('#payment-element iframe');
            if (!iframe) {
                clearInterval(expansionChecker);
                return;
            }

            // Store current height to check for changes
            const currentHeight = iframe.style.height || iframe.offsetHeight;

            // Check again after a short delay
            setTimeout(function() {
                const newHeight = iframe.style.height || iframe.offsetHeight;
                if (newHeight !== currentHeight) {
                    adjustContainerHeight();
                    enhanceContainerHeightAdjustment();
                }
            }, 50);
        }, 500); // Check every 500ms

        // Clean up after 1 minute (when most interactions should be complete)
        setTimeout(function() {
            clearInterval(expansionChecker);
        }, 60000);

        // Add click listeners to detect user interaction with payment element
        const paymentElement = document.getElementById('payment-element');
        if (paymentElement) {
            paymentElement.addEventListener('click', function() {
                // Check height after interaction
                setTimeout(function() {
                    adjustContainerHeight();
                    enhanceContainerHeightAdjustment();
                }, 300);
            });

            // Also listen for focus events which might trigger expansions
            paymentElement.addEventListener('focusin', function() {
                setTimeout(function() {
                    adjustContainerHeight();
                    enhanceContainerHeightAdjustment();
                }, 300);
            });
        }
    }

    /**
     * Enhance container height adjustment to capture and propagate iframe height changes
     * This function should be called after adjustContainerHeight
     */
    function enhanceContainerHeightAdjustment() {
        // Find all the relevant elements
        const iframeElement = document.querySelector('#payment-element iframe');
        const containerElement = document.querySelector('.payment-element-container');
        const wrapperElement = document.querySelector('.stripe-element-wrapper');
        const paymentElement = document.getElementById('payment-element');
        const privateElement = document.querySelector('#payment-element .__PrivateStripeElement');

        if (!iframeElement) return;

        // Function to check and update heights
        function updateHeights() {
            // Get actual height of iframe (try multiple methods)
            const iframeHeight = iframeElement.scrollHeight ||
                                iframeElement.offsetHeight ||
                                iframeElement.clientHeight ||
                                parseInt(iframeElement.style.height, 10) ||
                                280; // Fallback

            // Only proceed if we got a reasonable height
            if (iframeHeight > 100) {
                // Set explicit height on elements to ensure expansion
                if (privateElement) privateElement.style.height = (iframeHeight + 5) + 'px';
                if (paymentElement) paymentElement.style.height = (iframeHeight + 25) + 'px';
                if (wrapperElement) wrapperElement.style.height = (iframeHeight + 35) + 'px';
                if (containerElement) containerElement.style.height = (iframeHeight + 50) + 'px';
            }
        }

        // Call immediately
        updateHeights();

        // Set up mutation observer to detect iframe height changes
        const observer = new MutationObserver(function() {
            updateHeights();
        });

        // Start observing iframe for style changes that could affect height
        observer.observe(iframeElement, {
            attributes: true,
            attributeFilter: ['style', 'height', 'class']
        });

        // Also check periodically (as a fallback)
        const heightInterval = setInterval(updateHeights, 1000);

        // Stop checking after 60 seconds (when most interactions should be complete)
        setTimeout(() => clearInterval(heightInterval), 60000);
    }

    /**
     * Helper function to get value from any field
     * @param {string} fieldName - The name of the field
     * @returns {string} The field value
     */
    function getFieldValue(fieldName) {
        // Try with both regular name and id_ prefix (Django convention)
        const field = form.elements[fieldName] || form.elements[`id_${fieldName}`] ||
                      document.getElementById(`id_${fieldName}`);
        return field ? field.value : '';
    }

    /**
     * Verify cart total matches stored value
     */
    function verifyCartTotal() {
        const storedTotal = sessionStorage.getItem('cart_total');
        const currentTotalElement = document.querySelector('.checkout-total') ||
                                   document.querySelector('.cart-total') ||
                                   document.getElementById('cart-total');

        if (storedTotal && currentTotalElement) {
            const currentTotal = currentTotalElement.textContent.trim();

            // If cart total has changed, clear the client secret
            if (storedTotal !== currentTotal) {
                clearClientSecretData();
            }
        }
    }

    // Handle form submission
    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        // Prevent multiple submissions
        if (isSubmitting) {
            return;
        }

        // Verify terms checkbox is checked
        const termsCheckbox = document.getElementById('terms-check');
        if (!termsCheckbox || !termsCheckbox.checked) {
            showError('Please agree to the terms and conditions.');
            return;
        }

        // Set submission status
        isSubmitting = true;

        // Disable the submit button to prevent double clicks
        submitButton.disabled = true;

        // Show loading indicator in button
        const buttonText = document.getElementById('button-text');
        const spinner = document.getElementById('spinner');

        if (buttonText) buttonText.classList.add('d-none');
        if (spinner) spinner.classList.remove('d-none');

        // Show the loading overlay
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }

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
            formData.append('save_info', document.getElementById('id_save_payment_info')?.checked || false);

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
                    handlePaymentIntentIssue(responseData.message || 'The payment session has expired. Please refresh the page to continue.');
                    return;
                }

                if (!response.ok) {
                    // Handle server error
                    console.error('Server error:', responseData);
                    showError(responseData.error || 'An error occurred. Please try again.');
                    isSubmitting = false;
                    submitButton.disabled = false;
                    if (buttonText) buttonText.classList.remove('d-none');
                    if (spinner) spinner.classList.add('d-none');
                    if (loadingOverlay) loadingOverlay.style.display = 'none';
                    return;
                }
            } catch (fetchError) {
                console.error('Error during fetch operation:', fetchError);
                showError('Network error. Please check your connection and try again.');
                isSubmitting = false;
                submitButton.disabled = false;
                if (buttonText) buttonText.classList.remove('d-none');
                if (spinner) spinner.classList.add('d-none');
                if (loadingOverlay) loadingOverlay.style.display = 'none';
                return;
            }

            // Create return URL for redirect after successful payment
            let returnUrl;
            try {
                // Get the base URL
                let baseUrl = window.location.origin;

                // Make sure origin ends with a trailing slash if needed
                if (!baseUrl.endsWith('/')) {
                    baseUrl += '/';
                }

                // Get the form action URL
                let formAction = form.action;

                // If form.action is a relative URL, construct a proper absolute URL
                if (formAction.startsWith('/') || !formAction.includes('://')) {
                    // If it starts with /, it's already relative to origin
                    if (formAction.startsWith('/')) {
                        returnUrl = baseUrl + formAction.substring(1).replace('checkout', 'checkout/success');
                    } else {
                        // Otherwise it's relative to current path
                        const currentPath = window.location.pathname;
                        const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
                        returnUrl = baseUrl + currentDir + formAction.replace('checkout', 'checkout/success');
                    }
                } else {
                    // It's already an absolute URL
                    returnUrl = formAction.replace('checkout', 'checkout/success');
                }

                // Ensure we don't have double slashes in the URL (except after protocol)
                returnUrl = returnUrl.replace(/([^:])\/\//g, '$1/');

                // Ensure the return URL is a valid absolute URL
                if (!returnUrl.startsWith('http')) {
                    throw new Error('Return URL is not absolute: ' + returnUrl);
                }

                // Additional validation: make sure it doesn't end with two slashes
                if (returnUrl.endsWith('//')) {
                    returnUrl = returnUrl.slice(0, -1);
                }
            } catch (urlError) {
                // Fallback to a simple, reliable approach if there's any error
                console.error('Error constructing return URL:', urlError);
                returnUrl = window.location.origin + '/shop/checkout/success/';
            }

            // Get shipping details to pass to Stripe
            const shipping = getShippingDetails();

            // Confirm payment using the Payment Element
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    // Return to checkout success page after payment
                    return_url: returnUrl,
                    shipping: shipping,
                    receipt_email: getFieldValue('email')
                },
                redirect: 'if_required'
            });

            if (error) {
                // Handle payment confirmation error
                if (error.type === 'card_error' || error.type === 'validation_error') {
                    showError(error.message);
                } else if (error.type === 'invalid_request_error' &&
                          (error.code === 'payment_intent_unexpected_state' ||
                           error.message.includes('is not available') ||
                           error.message.includes('payment_intent'))) {
                    // Handle payment intent issues
                    clearClientSecretData();
                    handlePaymentIntentIssue('The payment session has expired. Please refresh the page to continue.');
                } else {
                    showError('An unexpected error occurred.');
                    console.error('Payment error:', error);
                }

                // Reset form state
                isSubmitting = false;
                submitButton.disabled = false;
                if (buttonText) buttonText.classList.remove('d-none');
                if (spinner) spinner.classList.add('d-none');
                if (loadingOverlay) loadingOverlay.style.display = 'none';
            } else {
                // The payment has been processed!
                // Add payment intent ID to form if available
                const paymentIntentIdField = document.getElementById('id_payment_intent_id');
                if (paymentIntentIdField && clientSecret) {
                    paymentIntentIdField.value = clientSecret.split('_secret')[0];
                }

                // Update payment method type in form if needed
                const paymentMethodTypeField = document.getElementById('id_payment_method_type');
                if (paymentMethodTypeField) {
                    // Default to 'card' if not specified
                    paymentMethodTypeField.value = 'card';
                }

                // Clear session storage as payment is being processed
                clearClientSecretData();

                // Submit the form to complete order processing
                form.submit();
            }
        } catch (error) {
            console.error('Error in checkout process:', error);
            // Show error to user
            showError(error.message || 'An unexpected error occurred. Please try again.');

            // Reset form state
            isSubmitting = false;
            submitButton.disabled = false;
            if (buttonText) buttonText.classList.remove('d-none');
            if (spinner) spinner.classList.add('d-none');
            if (loadingOverlay) loadingOverlay.style.display = 'none';
        }
    });

    /**
     * Get shipping details from form fields
     * @returns {Object} Shipping details for Stripe
     */
    function getShippingDetails() {
        return {
            name: `${getFieldValue('shipping_first_name')} ${getFieldValue('shipping_last_name')}`.trim(),
            address: {
                line1: getFieldValue('shipping_address1'),
                line2: getFieldValue('shipping_address2') || undefined,
                city: getFieldValue('shipping_city'),
                state: getFieldValue('shipping_state'),
                postal_code: getFieldValue('shipping_zipcode'),
                country: getFieldValue('shipping_country') || 'US'
            }
        };
    }

    // Auto-propagate contact info to shipping when empty
    const contactFields = [
        { source: 'first_name', target: 'shipping_first_name' },
        { source: 'last_name', target: 'shipping_last_name' }
    ];

    contactFields.forEach(pair => {
        const sourceField = document.getElementById(`id_${pair.source}`);
        const targetField = document.getElementById(`id_${pair.target}`);

        if (sourceField && targetField) {
            sourceField.addEventListener('change', function() {
                if (!targetField.value) {
                    targetField.value = sourceField.value;
                    // Billing check removed to eliminate error
                }
            });
        }
    });

    // Run initial cart verification
    verifyCartTotal();

    // Listen for resize events which might change the iframe size
    window.addEventListener('resize', function() {
        // Use debounce technique to prevent too many adjustments
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(function() {
            adjustContainerHeight();
            enhanceContainerHeightAdjustment();
        }, 200);
    });

    console.log('Checkout script with Payment Element initialization complete');
});
