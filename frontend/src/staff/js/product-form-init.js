/**
 * Product Form Initializer
 * Initializes ProductEditor functionality for product forms
 */

/**
 * Initialize product form functionality
 */
function initProductForm() {
    // Initialize ProductEditor when available
    if (window.ProductEditor) {
        console.log('Initializing ProductEditor...');
        window.ProductEditor.initImageCropper();
        console.log('ProductEditor initialized successfully');
    } else {
        console.error('ProductEditor not found - JavaScript may not have loaded');

        // Retry after a short delay in case scripts are still loading
        setTimeout(function() {
            if (window.ProductEditor) {
                console.log('Retrying ProductEditor initialization...');
                window.ProductEditor.initImageCropper();
                console.log('ProductEditor initialized successfully (retry)');
            }
        }, 100);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initProductForm);
