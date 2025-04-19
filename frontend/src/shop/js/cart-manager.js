/**
 * CartManager - handles all cart functionality
 * Manages adding, removing, and updating items in the shopping cart
 */
import '../css/cart.css';
import { ApiClient } from '@core/api-client.js';

class CartManager {
    constructor() {
        this.api = new ApiClient({
            errorHandler: this.handleApiError.bind(this)
        });
        this.cartContainer = document.getElementById('cart-container');
        this.cartTotal = document.getElementById('cart-total');
        this.cartCount = document.getElementById('cart-count');
        this.cartCountBadge = document.querySelector('.cart-count-badge');

        this.initEventListeners();
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

        // Handle cart quantity buttons
        this.initCartQuantityButtons();
    }

    /**
     * Initialize quantity buttons in the cart page
     * Sets up custom quantity controls with AJAX updates
     */
    initCartQuantityButtons() {
        // Support both class naming conventions for backward compatibility
        const decreaseButtons = document.querySelectorAll('.quantity-decrease, .btn-decrease');
        const increaseButtons = document.querySelectorAll('.quantity-increase, .btn-increase');

        // Set up decrease buttons
        decreaseButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                console.log('Decrease button clicked');
                const form = button.closest('.update-cart-form');
                if (!form) {
                    console.error('Could not find parent form for decrease button:', button);
                    return;
                }

                const input = form.querySelector('.quantity-input');
                const currentValue = parseInt(input.value);

                if (currentValue > 1) {
                    // Decrease the value and update
                    input.value = currentValue - 1;
                    this.updateCartItemQuantity(form);
                }
            });
        });

        // Set up increase buttons
        increaseButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                console.log('Increase button clicked');
                const form = button.closest('.update-cart-form');
                if (!form) {
                    console.error('Could not find parent form for increase button:', button);
                    return;
                }

                const input = form.querySelector('.quantity-input');
                const currentValue = parseInt(input.value);
                const maxStock = parseInt(input.dataset.maxStock || Number.MAX_SAFE_INTEGER);

                if (currentValue < maxStock) {
                    // Increase the value and update
                    input.value = currentValue + 1;
                    this.updateCartItemQuantity(form);
                } else {
                    this.showNotification('Maximum Quantity', `Sorry, only ${maxStock} units available.`, 'info');
                }
            });
        });

        // Handle direct input changes
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                console.log('Quantity input changed');
                const form = input.closest('.update-cart-form');
                if (!form) {
                    console.error('Could not find parent form for quantity input:', input);
                    return;
                }

                const maxStock = parseInt(input.dataset.maxStock || Number.MAX_SAFE_INTEGER);
                let newValue = parseInt(input.value);

                // Validate input value
                if (isNaN(newValue) || newValue < 1) {
                    newValue = 1;
                    input.value = newValue;
                } else if (newValue > maxStock) {
                    newValue = maxStock;
                    input.value = newValue;
                    this.showNotification('Maximum Quantity', `Sorry, only ${maxStock} units available.`, 'info');
                }

                // Trigger the update
                this.updateCartItemQuantity(form);
            });
        });
    }

    /**
     * Update cart item quantity via AJAX
     * @param {HTMLFormElement} form - The quantity update form
     */
    updateCartItemQuantity(form) {
        if (!form || !form.action) {
            console.error('Invalid form or form action:', form);
            return;
        }

        // Show loading indicator on the quantity controls
        const quantityControl = form.querySelector('.quantity-control');
        if (quantityControl) {
            quantityControl.classList.add('updating');
        }

        // Get form data
        const formData = new FormData(form);

        console.log('Making AJAX request to:', form.action);
        this.api.post(form.action, formData)
            .then(response => {
                console.log('AJAX response:', response);
                if (response.success) {
                    // Remove loading indicator
                    if (quantityControl) {
                        quantityControl.classList.remove('updating');
                    }

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

                    // Update item quantity (in case the server modified it)
                    const quantityInput = form.querySelector('.quantity-input');
                    if (quantityInput && response.item_quantity) {
                        quantityInput.value = response.item_quantity;
                    }

                    // Show a brief notification
                    this.showNotification('Cart Updated', 'Your cart has been updated successfully.', 'success', true, {
                        timer: 2000,
                        timerProgressBar: true,
                        showConfirmButton: false
                    });
                }
            })
            .catch(error => {
                console.error('Update cart error:', error);
                // Remove loading indicator
                if (quantityControl) {
                    quantityControl.classList.remove('updating');
                }

                this.handleApiError(error);
            });
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

        this.api.post(url, formData)
            .then(response => {
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

        // Get the form and ensure it exists
        const form = event.target;
        if (!form || !form.action) {
            console.error('Invalid form or form action in handleUpdateSubmit:', form);
            return;
        }

        // Use the updateCartItemQuantity method to handle the update
        this.updateCartItemQuantity(form);
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
            this.api.get(url)
                .then(response => {
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
     * Handle API errors
     * @param {Error} error - Error object
     */
    handleApiError(error) {
        console.error('API Error:', error);
        this.showNotification('Error', error.message || 'There was a problem with your request.', 'error');
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

export default CartManager;
