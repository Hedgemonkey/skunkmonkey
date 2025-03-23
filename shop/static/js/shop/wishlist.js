/**
 * Wishlist functionality for shop
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all wishlist toggle buttons
    const wishlistButtons = document.querySelectorAll('.wishlist-toggle');
    wishlistButtons.forEach(button => {
        button.addEventListener('click', handleWishlistToggle);
        
        // Add hover effect for remove buttons
        if (button.dataset.action === 'remove') {
            button.addEventListener('mouseenter', function() {
                const icon = this.querySelector('i');
                if (icon) {
                    icon.classList.remove('fas', 'fa-heart');
                    icon.classList.add('fas', 'fa-heart-broken');
                }
            });
            
            button.addEventListener('mouseleave', function() {
                const icon = this.querySelector('i');
                if (icon) {
                    icon.classList.remove('fas', 'fa-heart-broken');
                    icon.classList.add('fas', 'fa-heart');
                }
            });
        }
    });
});

/**
 * Handle wishlist toggle button clicks
 * Exported function for use in product-filters.js
 */
function handleWishlistToggle(e) {
    e.preventDefault();
    
    const button = e.currentTarget;
    const productId = button.dataset.productId;
    const productName = button.dataset.productName || 'this product';
    const action = button.dataset.action;
    const url = button.dataset.url;
    
    fetch(url, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update button state
            if (action === 'add') {
                button.dataset.action = 'remove';
                button.dataset.url = button.dataset.url.replace('add_to_wishlist', 'remove_from_wishlist');
                button.classList.add('active');
                button.classList.remove('add-to-wishlist-btn');
                button.classList.add('remove-wishlist-btn');
                button.querySelector('i').classList.remove('far');
                button.querySelector('i').classList.add('fas');
                
                // Add hover effect for broken heart
                button.addEventListener('mouseenter', function() {
                    const icon = this.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fas', 'fa-heart');
                        icon.classList.add('fas', 'fa-heart-broken');
                    }
                });
                
                button.addEventListener('mouseleave', function() {
                    const icon = this.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fas', 'fa-heart-broken');
                        icon.classList.add('fas', 'fa-heart');
                    }
                });
                
                // Update tooltip if using Bootstrap
                if (typeof bootstrap !== 'undefined') {
                    const tooltip = bootstrap.Tooltip.getInstance(button);
                    if (tooltip) {
                        button.setAttribute('title', 'Remove from wishlist');
                        button.setAttribute('data-bs-original-title', 'Remove from wishlist');
                        tooltip.dispose();
                        new bootstrap.Tooltip(button);
                    }
                }
                
                // Show success message
                showToast('Added to Wishlist', `${productName} added to your wishlist.`, 'success');
            } else {
                button.dataset.action = 'add';
                button.dataset.url = button.dataset.url.replace('remove_from_wishlist', 'add_to_wishlist');
                button.classList.remove('active');
                button.classList.remove('remove-wishlist-btn');
                button.classList.add('add-to-wishlist-btn');
                button.querySelector('i').classList.remove('fas');
                button.querySelector('i').classList.add('far');
                
                // Remove hover event listeners
                button.removeEventListener('mouseenter', function() {});
                button.removeEventListener('mouseleave', function() {});
                
                // Update tooltip if using Bootstrap
                if (typeof bootstrap !== 'undefined') {
                    const tooltip = bootstrap.Tooltip.getInstance(button);
                    if (tooltip) {
                        button.setAttribute('title', 'Add to wishlist');
                        button.setAttribute('data-bs-original-title', 'Add to wishlist');
                        tooltip.dispose();
                        new bootstrap.Tooltip(button);
                    }
                }
                
                // Show success message
                showToast('Removed from Wishlist', `${productName} removed from your wishlist.`, 'info');
            }
            
            // Update wishlist count in navbar if it exists
            const wishlistCountElements = document.querySelectorAll('.wishlist-count');
            if (wishlistCountElements.length > 0 && data.wishlist_count !== undefined) {
                wishlistCountElements.forEach(element => {
                    element.textContent = data.wishlist_count;
                });
            }
        } else {
            // Show error message
            showToast('Error', data.error || 'There was an error processing your request.', 'error');
        }
    })
    .catch(error => {
        console.error('Error toggling wishlist:', error);
        showToast('Error', 'There was an error processing your request.', 'error');
    });
}

/**
 * Show a toast notification
 */
function showToast(title, message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = `toast-${Date.now()}`;
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type} border-0`;
    toast.id = toastId;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    // Toast content
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <strong>${title}</strong><br>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Initialize and show toast with Bootstrap
    const bsToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: 5000
    });
    bsToast.show();
    
    // Remove from DOM after hiding
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}

// Make handleWishlistToggle and showToast available globally
window.handleWishlistToggle = handleWishlistToggle;
window.showToast = showToast;
