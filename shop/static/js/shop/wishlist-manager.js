/**
 * WishlistManager - handles wishlist functionality
 * Manages adding and removing products from user wishlists
 */
import Swal from 'sweetalert2';

class WishlistManager {
    constructor() {
        this.initEventListeners();
    }

    /**
     * Initialize all event listeners
     * Sets up handlers for wishlist buttons
     */
    initEventListeners() {
        // Add event listeners to wishlist buttons
        document.querySelectorAll('.remove-wishlist-btn').forEach(button => {
            button.addEventListener('click', this.handleRemoveFromWishlist.bind(this));
        });
        
        // Add event listeners to 'Add to Wishlist' buttons on product pages
        document.querySelectorAll('.add-to-wishlist-btn').forEach(button => {
            button.addEventListener('click', this.handleAddToWishlist.bind(this));
        });
    }
    
    /**
     * Handle add to wishlist button click
     * @param {Event} event - The click event
     */
    handleAddToWishlist(event) {
        event.preventDefault();
        
        const button = event.currentTarget;
        const productId = button.dataset.productId;
        const url = button.href;
        
        this.sendAjaxRequest(url, null, 'GET', response => {
            if (response.success) {
                // Update button to show it's now in wishlist
                button.classList.remove('btn-outline-danger');
                button.classList.add('btn-danger');
                button.innerHTML = '<i class="fas fa-heart"></i>';
                button.title = 'Remove from wishlist';
                button.setAttribute('data-bs-original-title', 'Remove from wishlist');
                
                // Change the URL to the remove endpoint
                const newUrl = button.href.replace('add_to_wishlist', 'remove_from_wishlist');
                button.href = newUrl;
                
                // Change the class for event handling
                button.classList.remove('add-to-wishlist-btn');
                button.classList.add('remove-wishlist-btn');
                
                // Re-bind the event listener for this button
                button.removeEventListener('click', this.handleAddToWishlist.bind(this));
                button.addEventListener('click', this.handleRemoveFromWishlist.bind(this));
                
                this.showNotification('Added to Wishlist', 'Product has been added to your wishlist.', 'success');
            }
        });
    }
    
    /**
     * Handle remove from wishlist button click
     * @param {Event} event - The click event
     */
    handleRemoveFromWishlist(event) {
        event.preventDefault();
        
        const button = event.currentTarget;
        const url = button.href;
        const productName = button.dataset.productName || 'this item';
        
        this.showConfirmation(`Remove ${productName}?`, 'Are you sure you want to remove this item from your wishlist?', () => {
            this.sendAjaxRequest(url, null, 'GET', response => {
                if (response.success && response.removed) {
                    // Check if we're on the wishlist page
                    if (window.location.pathname.includes('/wishlist/')) {
                        // Remove the product card from the wishlist
                        const card = button.closest('.col');
                        card.classList.add('fade-out');
                        
                        setTimeout(() => {
                            card.remove();
                            
                            // If no more items in wishlist, show empty state
                            const wishlistItems = document.querySelectorAll('.wishlist-card');
                            if (wishlistItems.length === 0) {
                                window.location.reload();
                            }
                        }, 300);
                    } else {
                        // We're on a product grid page, update the button
                        button.classList.remove('btn-danger');
                        button.classList.add('btn-outline-danger');
                        button.innerHTML = '<i class="far fa-heart"></i>';
                        button.title = 'Add to wishlist';
                        button.setAttribute('data-bs-original-title', 'Add to wishlist');
                        
                        // Change the URL to the add endpoint
                        const newUrl = button.href.replace('remove_from_wishlist', 'add_to_wishlist');
                        button.href = newUrl;
                        
                        // Change the class for event handling
                        button.classList.remove('remove-wishlist-btn');
                        button.classList.add('add-to-wishlist-btn');
                        
                        // Re-bind the event listener for this button
                        button.removeEventListener('click', this.handleRemoveFromWishlist.bind(this));
                        button.addEventListener('click', this.handleAddToWishlist.bind(this));
                    }
                    
                    this.showNotification('Removed from Wishlist', 'Product has been removed from your wishlist.', 'success');
                }
            });
        });
    }
    
    /**
     * Show a confirmation dialog
     * @param {string} title - The dialog title
     * @param {string} message - The dialog message
     * @param {Function} confirmCallback - Function to call when confirmed
     */
    showConfirmation(title, message, confirmCallback) {
        Swal.fire({
            title: title,
            text: message,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, remove it',
            cancelButtonText: 'No, keep it'
        }).then((result) => {
            if (result.isConfirmed) {
                confirmCallback();
            }
        });
    }
    
    /**
     * Send an AJAX request with improved error handling
     * @param {string} url - The URL to send the request to
     * @param {FormData|null} data - Form data to send, or null for GET requests
     * @param {string} method - HTTP method (GET, POST, etc.)
     * @param {Function} successCallback - Function to call on success
     */
    sendAjaxRequest(url, data, method, successCallback) {
        const options = {
            method: method,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };
        
        if (data && method === 'POST') {
            options.body = data;
        }
        
        fetch(url, options)
            .then(response => {
                if (!response.ok) {
                    // More detailed error handling
                    if (response.status === 403) {
                        throw new Error('You need to be logged in to use the wishlist.');
                    } else if (response.status === 404) {
                        throw new Error('Product not found.');
                    } else if (response.status === 500) {
                        throw new Error('Server error. Please try again later.');
                    } else {
                        throw new Error(`Request failed with status: ${response.status}`);
                    }
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    successCallback(data);
                } else if (data.error) {
                    this.showNotification('Error', data.error, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                this.showNotification('Error', error.message || 'There was a problem with your request.', 'error');
            });
    }
    
    /**
     * Show a notification using SweetAlert
     * @param {string} title - The notification title
     * @param {string} message - The notification message
     * @param {string} type - The notification type (success, error, info)
     */
    showNotification(title, message, type) {
        Swal.fire({
            title: title,
            text: message,
            icon: type,
            confirmButtonColor: '#0d6efd',
            timer: 2000,
            timerProgressBar: true
        });
    }
}

// Initialize the wishlist manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.wishlistManager = new WishlistManager();
});

export default WishlistManager;
