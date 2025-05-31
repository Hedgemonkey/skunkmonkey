/**
 * Checkout Success Page JavaScript
 * Handles post-checkout cleanup and page refresh logic
 */

/**
 * Clear payment-related session storage items
 */
function clearPaymentSession() {
    // Clear any saved payment info in session
    if (window.sessionStorage.getItem('save_info')) {
        window.sessionStorage.removeItem('save_info');
    }

    // Clear any client_secret from session
    if (window.sessionStorage.getItem('client_secret')) {
        window.sessionStorage.removeItem('client_secret');
    }
}

/**
 * Set up auto-refresh for pending payments
 * This will check for data attributes on the page to determine if refresh is needed
 */
function setupAutoRefresh() {
    // Check if we need to auto-refresh based on payment status
    const container = document.querySelector('.container[data-payment-pending]');
    const refreshNeeded = container ? container.getAttribute('data-payment-pending') : 'false';

    if (refreshNeeded === 'true') {
        // If payment is not confirmed, refresh the page every 5 seconds
        setTimeout(function() {
            location.reload();
        }, 5000);
    }
}

/**
 * Initialize checkout success functionality
 */
function initCheckoutSuccess() {
    clearPaymentSession();
    setupAutoRefresh();
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initCheckoutSuccess);
