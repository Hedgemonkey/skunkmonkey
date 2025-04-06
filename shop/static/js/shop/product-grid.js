/**
 * Product Grid JavaScript
 * Handles the functionality for the product grid component
 * Imports wishlist functionality rather than reimplementing it
 */

// Import dependencies
import { Tooltip } from 'bootstrap'; // Correct: Import only the Tooltip component
import wishlistManager from './wishlist-initializer.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize add to cart forms
    initializeAddToCartForms();
    
    // Initialize compare buttons
    initializeCompareButtons();
    
    // No need to initialize wishlist buttons as they're handled by the wishlist manager
    console.log('Product grid initialized with wishlist manager');
});

/**
 * Initialize compare buttons
 */
function initializeCompareButtons() {
    document.querySelectorAll('.add-to-comparison-btn').forEach(button => {
        // Only add event listener if it doesn't already have one
        if (!button.hasAttribute('data-event-bound')) {
            button.setAttribute('data-event-bound', 'true');
            
            button.addEventListener('click', function(event) {
                event.preventDefault();
                
                const productId = this.dataset.productId;
                
                // If we have a comparison manager, use it
                if (window.comparisonManager && typeof window.comparisonManager.addToComparison === 'function') {
                    window.comparisonManager.addToComparison(productId);
                } else {
                    // Otherwise do a simple redirect
                    window.location.href = this.href;
                }
            });
        }
    });
}

/**
 * Initialize add to cart forms
 */
function initializeAddToCartForms() {
    document.querySelectorAll('.add-to-cart-form').forEach(form => {
        if (!form.hasAttribute('data-event-bound')) {
            form.setAttribute('data-event-bound', 'true');
            
            form.addEventListener('submit', function(event) {
                // Get the product card container
                const productCard = form.closest('.product-card');
                if (productCard) {
                    // Use the standardized loading-container class for consistent UI
                    productCard.classList.add('loading-container');
                    
                    // Store original button text for restoring later
                    const button = form.querySelector('.add-to-cart-btn');
                    const originalText = button.innerHTML;
                    
                    // After 2 seconds (simulating AJAX completion), restore the state
                    // In a real implementation, you'd do this in the AJAX success callback
                    setTimeout(() => {
                        productCard.classList.remove('loading-container');
                        // You could also update the button text to "Added!" or similar
                    }, 2000);
                }
            });
        }
    });
}

// Export for use in other modules if needed
export default {
    initializeCompareButtons,
    initializeAddToCartForms
};

