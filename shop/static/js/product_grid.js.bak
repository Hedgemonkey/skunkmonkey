/**
 * Product Grid JavaScript
 * Handles the functionality for the product grid component
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Check if WishlistManager is already loaded
    if (typeof window.wishlistManager !== 'undefined') {
        // If it's already loaded, initialize it
        initializeWishlistButtons();
    } else {
        // If not, initialize directly with our own handlers
        initializeWishlistButtons();
    }
    
    // Initialize other product grid functionality
    initializeProductGrid();
});

/**
 * Initialize wishlist buttons in the product grid
 */
function initializeWishlistButtons() {
    // Add event listeners to 'Remove from Wishlist' buttons
    document.querySelectorAll('.remove-wishlist-btn').forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Get product name for better UX
            const productName = this.dataset.productName || 'this item';
            const confirmMessage = `Are you sure you want to remove ${productName} from your wishlist?`;
            
            // Check if WishlistManager is available
            if (window.wishlistManager && typeof window.wishlistManager.handleRemoveFromWishlist === 'function') {
                // Call the WishlistManager method
                window.wishlistManager.handleRemoveFromWishlist(event);
            } else {
                // Fallback to basic confirmation
                if (confirm(confirmMessage)) {
                    window.location.href = this.href;
                }
            }
        });
    });
    
    // Initialize 'Add to Wishlist' buttons if they're not already handled
    document.querySelectorAll('.add-to-wishlist-btn').forEach(button => {
        button.addEventListener('click', function(event) {
            // If WishlistManager is loaded, use that instead
            if (window.wishlistManager && typeof window.wishlistManager.handleAddToWishlist === 'function') {
                event.preventDefault();
                window.wishlistManager.handleAddToWishlist(event);
            }
            // Otherwise, let the default link behavior handle it
        });
    });
}

/**
 * Initialize other product grid functionality
 */
function initializeProductGrid() {
    // Add quick view functionality or other features as needed
    
    // Example: Add to cart forms
    document.querySelectorAll('.add-to-cart-form').forEach(form => {
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
    });
}
