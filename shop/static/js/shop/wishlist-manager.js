/**
 * Wishlist Manager
 * Handles wishlist functionality for the shop
 */

import apiClient from '/static/js/api-client.js';

/**
 * WishlistManager class for handling wishlist functionality
 */
class WishlistManager {
    /**
     * Initialize the WishlistManager
     */
    constructor() {
        this.initialize();
        this.toastQueue = []; // Queue for storing toast notifications
        this.processingToast = false; // Flag to track if a toast is currently being processed
        this.debug = true; // Enable debug logging
    }

    /**
     * Initialize the wishlist manager with error handling
     */
    initialize() {
        try {
            this.initEventListeners();
            this.checkSweetAlert2Availability();
            
            // Process any queued toasts once SweetAlert2 is available
            document.addEventListener('swal2-initialized', () => {
                this.log('SweetAlert2 initialized event received, processing queued toasts');
                this.processToastQueue();
            });
        } catch (error) {
            console.error('Error initializing Wishlist Manager:', error);
        }
    }

    /**
     * Log debug messages if debug mode is enabled
     * @param {...any} args - Arguments to log
     */
    log(...args) {
        if (this.debug) {
            console.log('[WishlistManager]', ...args);
        }
    }

    /**
     * Check if SweetAlert2 is available and log the result
     */
    checkSweetAlert2Availability() {
        if (typeof window.Swal !== 'undefined') {
            this.log('SweetAlert2 is available for WishlistManager.');
            // Dispatch an event to signal SweetAlert2 is available
            document.dispatchEvent(new Event('swal2-initialized'));
        } else {
            console.warn('SweetAlert2 is not available for WishlistManager. Toast notifications will fall back to alerts.');
            // Set up a listener to check again when main.js might have loaded SweetAlert2
            window.addEventListener('load', () => {
                setTimeout(() => {
                    if (typeof window.Swal !== 'undefined') {
                        this.log('SweetAlert2 became available after window load');
                        document.dispatchEvent(new Event('swal2-initialized'));
                    }
                }, 500);
            });
        }
    }

    /**
     * Initialize event listeners for wishlist buttons
     */
    initEventListeners() {
        // Add to wishlist buttons
        document.addEventListener('click', (event) => {
            const addBtn = event.target.closest('.add-to-wishlist-btn');
            if (addBtn && !addBtn.hasAttribute('data-event-bound')) {
                addBtn.setAttribute('data-event-bound', 'true');
                addBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleAddToWishlist(e);
                });
            }
        });

        // Remove from wishlist buttons
        document.addEventListener('click', (event) => {
            const removeBtn = event.target.closest('.remove-wishlist-btn');
            if (removeBtn && !removeBtn.hasAttribute('data-event-bound')) {
                removeBtn.setAttribute('data-event-bound', 'true');
                removeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleRemoveFromWishlist(e);
                });
            }
        });

        this.log('Wishlist event listeners initialized');
    }

    /**
     * Handle adding a product to the wishlist
     * @param {Event} event - The click event
     */
    handleAddToWishlist(event) {
        const button = event.currentTarget;
        const url = button.getAttribute('href');
        const productId = button.dataset.productId;
        const productName = button.dataset.productName || 'Product';

        this.log('Adding product to wishlist:', productId, productName);

        // Add active state for visual feedback
        button.classList.add('wishlist-btn-active');
        
        // Show loading state
        const originalContent = button.innerHTML;
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
        button.classList.add('disabled');

        // Make API request using GET method to match server expectations
        apiClient.get(url)
            .then(data => {
                // Log the response for debugging
                this.log('Wishlist add response:', data);
                
                // Remove loading state
                button.innerHTML = originalContent;
                button.classList.remove('disabled');
                button.classList.remove('wishlist-btn-active');
                
                if (data.success) {
                    // Update button state
                    this.updateWishlistButtonState(button, true);
                    
                    // Show success message
                    this.showToast('Added to Wishlist', 
                        data.message || `${productName} added to your wishlist.`, 
                        'success');
                    
                    // Update wishlist count if available
                    this.updateWishlistCount(data.wishlist_count);
                } else {
                    // Show error message
                    this.showToast('Error', 
                        data.error || 'Failed to add product to wishlist.', 
                        'error');
                }
            })
            .catch(error => {
                // Log the error for debugging
                console.error('Error adding to wishlist:', error);
                
                // Remove loading state
                button.innerHTML = originalContent;
                button.classList.remove('disabled');
                button.classList.remove('wishlist-btn-active');
                
                this.showToast('Error', 'Failed to add product to wishlist.', 'error');
            });
    }

    /**
     * Handle removing a product from the wishlist
     * @param {Event} event - The click event
     */
    handleRemoveFromWishlist(event) {
        const button = event.currentTarget;
        const url = button.getAttribute('href');
        const productId = button.dataset.productId;
        const productName = button.dataset.productName || 'Product';

        this.log('Removing product from wishlist:', productId, productName);

        // Confirm removal
        if (typeof window.Swal !== 'undefined') {
            window.Swal.fire({
                title: 'Remove from Wishlist',
                text: 'Are you sure you want to remove this item from your wishlist?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Yes, remove it',
                cancelButtonText: 'No, keep it'
            }).then((result) => {
                if (result.isConfirmed) {
                    this.performWishlistRemoval(button, url, productId, productName);
                }
            });
        } else {
            if (confirm('Are you sure you want to remove this item from your wishlist?')) {
                this.performWishlistRemoval(button, url, productId, productName);
            }
        }
    }

    /**
     * Perform the wishlist removal action
     * @param {HTMLElement} button - The button element
     * @param {string} url - The URL to send the request to
     * @param {string} productId - The product ID
     * @param {string} productName - The product name
     */
    performWishlistRemoval(button, url, productId, productName) {
        // Add active state for visual feedback
        button.classList.add('wishlist-btn-active');
        
        // Show loading state
        const originalContent = button.innerHTML;
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
        button.classList.add('disabled');

        // Make API request using GET method to match server expectations
        apiClient.get(url)
            .then(data => {
                // Log the response for debugging
                this.log('Wishlist remove response:', data);
                
                // Remove loading state
                button.innerHTML = originalContent;
                button.classList.remove('disabled');
                button.classList.remove('wishlist-btn-active');
                
                if (data.success) {
                    // If we're on the wishlist page, reload to update the UI
                    if (window.location.pathname.includes('/wishlist/')) {
                        window.location.reload();
                    } else {
                        // Update button state
                        this.updateWishlistButtonState(button, false);
                        
                        // Show success message
                        this.showToast('Removed from Wishlist', 
                            data.message || `${productName} removed from your wishlist.`, 
                            'info');
                        
                        // Update wishlist count if available
                        this.updateWishlistCount(data.wishlist_count);
                    }
                } else {
                    // Show error message
                    this.showToast('Error', 
                        data.error || 'Failed to remove product from wishlist.', 
                        'error');
                }
            })
            .catch(error => {
                // Log the error for debugging
                console.error('Error removing from wishlist:', error);
                
                // Remove loading state
                button.innerHTML = originalContent;
                button.classList.remove('disabled');
                button.classList.remove('wishlist-btn-active');
                
                this.showToast('Error', 'Failed to remove product from wishlist.', 'error');
            });
    }

    /**
     * Update the wishlist button state
     * @param {HTMLElement} button - The button to update
     * @param {boolean} isInWishlist - Whether the product is in the wishlist
     */
    updateWishlistButtonState(button, isInWishlist) {
        this.log('Updating wishlist button state:', isInWishlist ? 'in wishlist' : 'not in wishlist');
        
        if (isInWishlist) {
            // Change to remove button
            button.classList.remove('add-to-wishlist-btn');
            button.classList.add('remove-wishlist-btn');
            button.querySelector('i')?.classList.replace('far', 'fas');
            button.setAttribute('title', 'Remove from wishlist');
            button.setAttribute('aria-label', `Remove ${button.dataset.productName || 'this product'} from wishlist`);
            
            // Update href
            const newUrl = button.getAttribute('href').replace('add_to_wishlist', 'remove_from_wishlist');
            button.setAttribute('href', newUrl);
        } else {
            // Change to add button
            button.classList.remove('remove-wishlist-btn');
            button.classList.add('add-to-wishlist-btn');
            button.querySelector('i')?.classList.replace('fas', 'far');
            button.setAttribute('title', 'Add to wishlist');
            button.setAttribute('aria-label', `Add ${button.dataset.productName || 'this product'} to wishlist`);
            
            // Update href
            const newUrl = button.getAttribute('href').replace('remove_from_wishlist', 'add_to_wishlist');
            button.setAttribute('href', newUrl);
        }
        
        // Update event binding
        button.removeAttribute('data-event-bound');
        this.initEventListeners();
    }

    /**
     * Update the wishlist count in the UI
     * @param {number} count - The new wishlist count
     */
    updateWishlistCount(count) {
        if (count !== undefined) {
            this.log('Updating wishlist count:', count);
            document.querySelectorAll('.wishlist-count').forEach(element => {
                element.textContent = count;
            });
        }
    }

    /**
     * Add a toast to the queue and process it
     * @param {string} title - The notification title
     * @param {string} message - The notification message
     * @param {string} type - The notification type (success, error, warning, info)
     */
    showToast(title, message, type = 'info') {
        this.log('Queueing toast notification:', title, message, type);
        
        // Add to queue
        this.toastQueue.push({ title, message, type });
        
        // Process queue if not already processing
        if (!this.processingToast) {
            this.processToastQueue();
        }
    }

    /**
     * Process the toast queue
     */
    processToastQueue() {
        if (this.toastQueue.length === 0) {
            this.processingToast = false;
            return;
        }

        this.processingToast = true;
        const { title, message, type } = this.toastQueue.shift();
        
        // Try to display the toast
        this.displayToast(title, message, type)
            .then(() => {
                // Process next toast after a short delay
                setTimeout(() => {
                    this.processToastQueue();
                }, 300);
            })
            .catch(error => {
                console.error('Error displaying toast:', error);
                // Continue processing queue despite error
                setTimeout(() => {
                    this.processToastQueue();
                }, 300);
            });
    }

    /**
     * Display a toast notification using SweetAlert2 or fallback
     * @param {string} title - The notification title
     * @param {string} message - The notification message
     * @param {string} type - The notification type (success, error, warning, info)
     * @returns {Promise} - A promise that resolves when the toast is displayed
     */
    displayToast(title, message, type) {
        return new Promise((resolve, reject) => {
            this.log('Attempting to display toast:', title, message, type);
            
            // Use global showToast function if available
            if (typeof window.showToast === 'function') {
                this.log('Using global showToast function');
                window.showToast(title, message, type);
                resolve();
            }
            // Use SweetAlert2 directly if available
            else if (typeof window.Swal !== 'undefined') {
                this.log('Using SweetAlert2 directly');
                const iconType = type === 'danger' ? 'error' : type;
                
                window.Swal.fire({
                    title: title,
                    text: message,
                    icon: iconType,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        // Apply additional styling to ensure visibility
                        toast.style.zIndex = '9999';
                        toast.style.opacity = '1';
                        toast.style.visibility = 'visible';
                        
                        this.log('Toast opened:', toast);
                        toast.addEventListener('mouseenter', window.Swal.stopTimer);
                        toast.addEventListener('mouseleave', window.Swal.resumeTimer);
                    }
                }).then(resolve).catch(reject);
            }
            // Wait for SweetAlert2 to be available
            else {
                this.log('SweetAlert2 not available, waiting...');
                // Set a timeout to avoid infinite waiting
                const timeout = setTimeout(() => {
                    console.warn('Timed out waiting for SweetAlert2, using fallback');
                    alert(`${title}: ${message}`);
                    resolve();
                }, 2000);
                
                // Listen for SweetAlert2 initialization
                document.addEventListener('swal2-initialized', () => {
                    clearTimeout(timeout);
                    this.log('SweetAlert2 became available, displaying toast');
                    if (typeof window.Swal !== 'undefined') {
                        const iconType = type === 'danger' ? 'error' : type;
                        
                        window.Swal.fire({
                            title: title,
                            text: message,
                            icon: iconType,
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                            didOpen: (toast) => {
                                // Apply additional styling to ensure visibility
                                toast.style.zIndex = '9999';
                                toast.style.opacity = '1';
                                toast.style.visibility = 'visible';
                                
                                toast.addEventListener('mouseenter', window.Swal.stopTimer);
                                toast.addEventListener('mouseleave', window.Swal.resumeTimer);
                            }
                        }).then(resolve).catch(reject);
                    } else {
                        alert(`${title}: ${message}`);
                        resolve();
                    }
                }, { once: true });
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('WishlistManager script loaded');
    window.wishlistManager = new WishlistManager();
});

export default WishlistManager;
