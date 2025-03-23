/**
 * Wishlist Initializer Script
 * Ensures that wishlist functionality is properly initialized on any page that includes wishlist buttons
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if the WishlistManager was already loaded
    if (window.wishlistManager) {
        console.log('WishlistManager already initialized');
        return;
    }
    
    // Helper function to dynamically load the wishlist-manager.js script
    const loadWishlistManager = () => {
        // Check if we're using bundled or unbundled versions
        const useBundle = document.querySelector('script[src*="bundles"]') !== null;
        const scriptPath = useBundle ? '/static/bundles/js/shop/wishlist.js' : '/static/js/shop/wishlist-manager.js';
        
        // Create script element
        const script = document.createElement('script');
        script.src = scriptPath;
        script.type = 'text/javascript';
        script.onload = function() {
            console.log('WishlistManager script loaded');
            
            // If not using modules, manually initialize
            if (!window.wishlistManager && typeof WishlistManager === 'function') {
                window.wishlistManager = new WishlistManager();
            }
            
            // Initialize tooltips after WishlistManager is loaded
            initializeWishlistTooltips();
        };
        document.head.appendChild(script);
    };
    
    // Initialize tooltips for wishlist buttons
    const initializeWishlistTooltips = () => {
        const wishlistButtons = document.querySelectorAll('.add-to-wishlist-btn, .remove-wishlist-btn');
        wishlistButtons.forEach(button => {
            // Initialize Bootstrap tooltips if Bootstrap is available
            if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
                // Dispose existing tooltip if any
                const existingTooltip = bootstrap.Tooltip.getInstance(button);
                if (existingTooltip) {
                    existingTooltip.dispose();
                }
                
                new bootstrap.Tooltip(button, {
                    trigger: 'hover',
                    placement: 'left'
                });
            }
            
            // Add ARIA labels for accessibility
            const isInWishlist = button.classList.contains('remove-wishlist-btn');
            const productName = button.dataset.productName || 'this product';
            button.setAttribute('aria-label', `${isInWishlist ? 'Remove' : 'Add'} ${productName} ${isInWishlist ? 'from' : 'to'} wishlist`);
        });
    };
    
    // If the page has wishlist buttons and WishlistManager isn't loaded, load it
    const hasWishlistButtons = document.querySelector('.add-to-wishlist-btn, .remove-wishlist-btn') !== null;
    if (hasWishlistButtons) {
        loadWishlistManager();
        // Initialize tooltips immediately in case we already have Bootstrap
        initializeWishlistTooltips();
    }
    
    // Add event handlers for wishlist buttons
    document.querySelectorAll('.add-to-wishlist-btn, .remove-wishlist-btn').forEach(button => {
        // Only add if it doesn't already have a click handler
        if (!button.hasAttribute('data-event-bound')) {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                
                // Check if WishlistManager is available
                if (window.wishlistManager) {
                    if (this.classList.contains('remove-wishlist-btn')) {
                        window.wishlistManager.handleRemoveFromWishlist(event);
                    } else {
                        window.wishlistManager.handleAddToWishlist(event);
                    }
                    return;
                }
                
                // Fallback implementation if WishlistManager is not available
                const url = this.getAttribute('href');
                const productId = this.dataset.productId;
                const productName = this.dataset.productName || 'this product';
                const isRemove = this.classList.contains('remove-wishlist-btn');
                
                // Confirm removal if needed
                if (isRemove && !confirm('Are you sure you want to remove this item from your wishlist?')) {
                    return;
                }
                
                fetch(url, {
                    method: 'GET',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Toggle button state
                        if (!isRemove) {
                            // Change to remove button
                            this.classList.remove('add-to-wishlist-btn');
                            this.classList.add('remove-wishlist-btn');
                            this.querySelector('i')?.classList.replace('far', 'fas');
                            this.setAttribute('title', 'Remove from wishlist');
                            this.setAttribute('aria-label', `Remove ${productName} from wishlist`);
                            
                            // Update href
                            const newUrl = url.replace('add_to_wishlist', 'remove_from_wishlist');
                            this.setAttribute('href', newUrl);
                            
                            // Show notification
                            if (window.showToast) {
                                window.showToast('Added to Wishlist', `${productName} added to your wishlist.`, 'success');
                            }
                        } else {
                            // Change to add button
                            this.classList.remove('remove-wishlist-btn');
                            this.classList.add('add-to-wishlist-btn');
                            this.querySelector('i')?.classList.replace('fas', 'far');
                            this.setAttribute('title', 'Add to wishlist');
                            this.setAttribute('aria-label', `Add ${productName} to wishlist`);
                            
                            // Update href
                            const newUrl = url.replace('remove_from_wishlist', 'add_to_wishlist');
                            this.setAttribute('href', newUrl);
                            
                            // Show notification
                            if (window.showToast) {
                                window.showToast('Removed from Wishlist', `${productName} removed from your wishlist.`, 'info');
                            }
                        }
                        
                        // Update tooltips
                        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
                            const tooltip = bootstrap.Tooltip.getInstance(this);
                            if (tooltip) {
                                tooltip.dispose();
                            }
                            new bootstrap.Tooltip(this, {
                                trigger: 'hover',
                                placement: 'left'
                            });
                        }
                        
                        // Update wishlist count if available
                        if (data.wishlist_count !== undefined) {
                            document.querySelectorAll('.wishlist-count').forEach(element => {
                                element.textContent = data.wishlist_count;
                            });
                        }
                    } else {
                        // Show error
                        if (window.showToast) {
                            window.showToast('Error', data.error || 'There was an error processing your request.', 'error');
                        } else {
                            alert(data.error || 'There was an error processing your request.');
                        }
                    }
                })
                .catch(error => {
                    console.error('Error toggling wishlist:', error);
                    if (window.showToast) {
                        window.showToast('Error', 'There was an error processing your request.', 'error');
                    } else {
                        alert('There was an error processing your request.');
                    }
                });
            });
            
            // Mark as bound to prevent duplicate event listeners
            button.setAttribute('data-event-bound', 'true');
        }
    });
});

// Function to reinitialize wishlist buttons
// This can be useful for dynamically loaded content
function reinitializeWishlistButtons() {
    // Initialize tooltips
    const initTooltips = () => {
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            document.querySelectorAll('.add-to-wishlist-btn, .remove-wishlist-btn').forEach(button => {
                const existingTooltip = bootstrap.Tooltip.getInstance(button);
                if (existingTooltip) {
                    existingTooltip.dispose();
                }
                
                new bootstrap.Tooltip(button, {
                    trigger: 'hover',
                    placement: 'left'
                });
                
                // Add ARIA labels for accessibility
                const isInWishlist = button.classList.contains('remove-wishlist-btn');
                const productName = button.dataset.productName || 'this product';
                button.setAttribute('aria-label', `${isInWishlist ? 'Remove' : 'Add'} ${productName} ${isInWishlist ? 'from' : 'to'} wishlist`);
            });
        }
    };

    if (window.wishlistManager) {
        window.wishlistManager.initEventListeners();
        initTooltips();
    } else {
        // Try to load the WishlistManager if it's not available
        const useBundle = document.querySelector('script[src*="bundles"]') !== null;
        const scriptPath = useBundle ? '/static/bundles/js/shop/wishlist.js' : '/static/js/shop/wishlist-manager.js';
        
        const script = document.createElement('script');
        script.src = scriptPath;
        script.onload = function() {
            if (typeof WishlistManager === 'function' && !window.wishlistManager) {
                window.wishlistManager = new WishlistManager();
            }
            initTooltips();
        };
        document.head.appendChild(script);
    }
    
    // Rebind event handlers for any new buttons
    document.querySelectorAll('.add-to-wishlist-btn, .remove-wishlist-btn').forEach(button => {
        if (!button.hasAttribute('data-event-bound')) {
            // The DOMContentLoaded event handler will take care of binding events
            // This is a trigger to force that process for new elements
            button.dispatchEvent(new Event('needsBinding'));
        }
    });
}

// Make the function available globally
window.reinitializeWishlistButtons = reinitializeWishlistButtons;
