/**
 * Product Grid functionality
 * Handles product grid layout and interactions
 */
import '../css/product-list.css';
import '../css/components/product-images.css';

// Import dependencies
import * as bootstrap from 'bootstrap'; // Import the entire bootstrap library
import './quantity-modal-manager.js'; // Import quantity modal functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize compare buttons
    initializeCompareButtons();

    console.log('Product grid initialized with quantity modal support');
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

// Export for use in other modules if needed
export default {
    initializeCompareButtons
};
