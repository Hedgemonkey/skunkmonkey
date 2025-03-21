/**
 * CartManager - handles all cart functionality
 * Manages adding, removing, and updating items in the shopping cart
 */
class CartManager {
    constructor() {
        this.initEventListeners();
        this.cartContainer = document.getElementById('cart-container');
        this.cartTotal = document.getElementById('cart-total');
        this.cartCount = document.getElementById('cart-count');
        this.cartCountBadge = document.querySelector('.cart-count-badge');
    }

    /**
     * Initialize all event listeners
     * Sets up event handlers for adding, updating and removing cart items
     */
    initEventListeners() {
        // Handle add to cart form submissions
        document.querySelectorAll('.add-to-cart-form').forEach(form => {
            form.addEventListener('submit', this.handleAddToCart.bind(this));
        });
        
        // Handle quantity update form submissions
        document.querySelectorAll('.update-cart-form').forEach(form => {
            form.addEventListener('submit', this.handleUpdateSubmit.bind(this));
        });

        // Handle remove item links
        document.querySelectorAll('.remove-cart-item').forEach(link => {
            link.addEventListener('click', this.handleRemoveItem.bind(this));
        });

        // Handle quantity buttons on product detail page
        this.initQuantityButtons();
    }

    /**
     * Initialize quantity selector controls for product detail page
     * Sets up increment/decrement functionality with quantity limits
     */
    initQuantityButtons() {
        const quantityInput = document.getElementById('quantity');
        const decreaseBtn = document.getElementById('decrease-quantity');
        const increaseBtn = document.getElementById('increase-quantity');
        
        if (decreaseBtn && increaseBtn && quantityInput) {
            decreaseBtn.addEventListener('click', () => {
                const currentValue = parseInt(quantityInput.value);
                if (currentValue > 1) {
                    quantityInput.value = currentValue - 1;
                }
            });
            
            increaseBtn.addEventListener('click', () => {
                const currentValue = parseInt(quantityInput.value);
                const maxValue = parseInt(quantityInput.getAttribute('max'));
                if (currentValue < maxValue) {
                    quantityInput.value = currentValue + 1;
                } else {
                    this.showNotification('Maximum Quantity', `Sorry, only ${maxValue} units available.`, 'info');
                }
            });
        }
    }

    /**
     * Handle adding a product to cart
     * @param {Event} event - The form submit event
     */
    handleAddToCart(event) {
        event.preventDefault();
        const form = event.target;
        const url = form.action;
        const formData = new FormData(form);
        const productName = form.closest('.product-info')?.querySelector('h1')?.textContent || 'Product';
        const button = form.querySelector('button[type="submit"]');

        this.showNotification('Adding to Cart...', 'Please wait...', 'info', false);
        
        this.sendAjaxRequest(url, formData, 'POST', response => {
            if (response.success) {
                // Add animation to the add to cart button
                if (button) {
                    button.classList.add('add-to-cart-animation');
                    setTimeout(() => {
                        button.classList.remove('add-to-cart-animation');
                    }, 1500);
                }
                
                // Update cart count
                if (this.cartCount) {
                    this.cartCount.textContent = response.cart_count;
                    this.cartCount.classList.add('cart-count-updated');
                    setTimeout(() => {
                        this.cartCount.classList.remove('cart-count-updated');
                    }, 500);
                }
                
                // Update cart badge in navbar if it exists
                if (this.cartCountBadge) {
                    this.cartCountBadge.textContent = response.cart_count;
                    this.cartCountBadge.classList.remove('d-none');
                }
                
                this.showNotification('Added to Cart!', `${productName} has been added to your cart.`, 'success', true, {
                    showDenyButton: true,
                    denyButtonText: 'View Cart',
                    denyButtonColor: '#198754',
                    confirmButtonText: 'Continue Shopping'
                }).then((result) => {
                    if (result.isDenied) {
                        window.location.href = '/shop/cart/';
                    }
                });
            }
        });
    }

    /**
     * Handle cart item quantity update
     * @param {Event} event - The form submit event
     */
    handleUpdateSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const url = form.action;
        const formData = new FormData(form);

        this.sendAjaxRequest(url, formData, 'POST', response => {
            if (response.success) {
                // Update the item subtotal
                const row = form.closest('tr');
                const subtotalCell = row.querySelector('.item-subtotal');
                if (subtotalCell) {
                    subtotalCell.textContent = `$${response.item_subtotal}`;
                    subtotalCell.classList.add('highlight-update');
                    setTimeout(() => {
                        subtotalCell.classList.remove('highlight-update');
                    }, 1000);
                }
                
                // Update cart total
                if (this.cartTotal) {
                    this.cartTotal.textContent = `$${response.cart_total}`;
                    this.cartTotal.classList.add('highlight-update');
                    setTimeout(() => {
                        this.cartTotal.classList.remove('highlight-update');
                    }, 1000);
                }
                
                // Update cart count badge if it exists
                if (this.cartCountBadge) {
                    this.cartCountBadge.textContent = response.cart_count;
                }
                
                this.showNotification('Cart Updated', 'Your cart has been updated successfully.', 'success', true, {
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false
                });
            }
        });
    }

    /**
     * Handle removing an item from the cart
     * @param {Event} event - The click event
     */
    handleRemoveItem(event) {
        event.preventDefault();
        const link = event.currentTarget;
        const url = link.href;
        const productName = link.dataset.productName || 'this item';
        
        this.showConfirmation('Remove Item?', `Are you sure you want to remove ${productName} from your cart?`, () => {
            this.sendAjaxRequest(url, null, 'GET', response => {
                if (response.success) {
                    // Add fade-out animation to the row
                    const row = link.closest('tr');
                    row.classList.add('fade-out');
                    
                    setTimeout(() => {
                        // Remove the row from the table
                        row.remove();
                        
                        // Update cart total
                        if (this.cartTotal) {
                            this.cartTotal.textContent = `$${response.cart_total}`;
                        }
                        
                        // Update cart count badge in navbar if it exists
                        if (this.cartCountBadge) {
                            if (response.cart_count > 0) {
                                this.cartCountBadge.textContent = response.cart_count;
                            } else {
                                this.cartCountBadge.classList.add('d-none');
                            }
                        }
                        
                        // If cart is empty, refresh the page to show empty state
                        if (response.cart_count === 0) {
                            window.location.reload();
                        }
                    }, 300);
                    
                    this.showNotification('Item Removed', `${productName} has been removed from your cart.`, 'success');
                }
            });
        });
    }
    
    /**
     * Show a confirmation dialog before removing item
     * @param {string} title - The dialog title
     * @param {string} message - The dialog message
     * @param {Function} confirmCallback - Function to call when confirmed
     */
    showConfirmation(title, message, confirmCallback) {
        if (typeof Swal !== 'undefined') {
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
        } else if (confirm(message)) {
            confirmCallback();
        }
    }
    
    /**
     * Send an AJAX request for cart operations
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
                    throw new Error('Network response was not ok');
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
                this.showNotification('Error', 'There was a problem updating your cart.', 'error');
            });
    }
    
    /**
     * Show notifications using SweetAlert when available, fallback to alert
     * @param {string} title - The notification title
     * @param {string} message - The notification message
     * @param {string} type - The notification type (success, error, info)
     * @param {boolean} autoClose - Whether to auto-close the notification
     * @param {Object} options - Additional SweetAlert options
     * @returns {Promise} SweetAlert promise or resolved promise for alert fallback
     */
    showNotification(title, message, type, autoClose = true, options = {}) {
        if (typeof Swal !== 'undefined') {
            return Swal.fire({
                title: title,
                text: message,
                icon: type,
                confirmButtonColor: '#0d6efd',
                ...options
            });
        } else {
            alert(`${title}: ${message}`);
            return Promise.resolve();
        }
    }
}

// Initialize the cart manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.cartManager = new CartManager();
});
