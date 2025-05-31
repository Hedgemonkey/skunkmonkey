/**
 * Quantity Modal Manager
 * Handles the quantity selection modal for adding products to cart
 */

import { ApiClient } from '@common/js/api-client.js';

export class QuantityModalManager {
    constructor() {
        this.api = new ApiClient();
        this.modal = document.getElementById('quantityModal');
        this.modalInstance = null;
        this.currentProduct = null;

        if (this.modal) {
            this.initModal();
            this.initEventListeners();
        }
    }

    initModal() {
        // Initialize Bootstrap modal
        if (typeof bootstrap !== 'undefined') {
            this.modalInstance = new bootstrap.Modal(this.modal);
        }
    }

    initEventListeners() {
        // Handle add to cart button clicks
        document.addEventListener('click', (event) => {
            if (event.target.matches('.add-to-cart-modal-btn:not([disabled])')) {
                event.preventDefault();
                this.showQuantityModal(event.target);
            }
        });

        // Handle quantity controls in modal
        const decreaseBtn = document.getElementById('modal-decrease-quantity');
        const increaseBtn = document.getElementById('modal-increase-quantity');
        const quantityInput = document.getElementById('modal-quantity');
        const confirmBtn = document.getElementById('confirm-add-to-cart');

        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', () => this.adjustQuantity(-1));
        }

        if (increaseBtn) {
            increaseBtn.addEventListener('click', () => this.adjustQuantity(1));
        }

        if (quantityInput) {
            quantityInput.addEventListener('change', () => this.validateQuantity());
        }

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.confirmAddToCart());
        }
    }

    showQuantityModal(button) {
        // Extract product data from button attributes
        this.currentProduct = {
            id: button.dataset.productId,
            name: button.dataset.productName,
            price: button.dataset.productPrice,
            image: button.dataset.productImage,
            stockQuantity: parseInt(button.dataset.stockQuantity),
            cartAddUrl: button.dataset.cartAddUrl
        };

        // Populate modal with product data
        this.populateModal();

        // Show modal
        if (this.modalInstance) {
            this.modalInstance.show();
        }
    }

    populateModal() {
        if (!this.currentProduct) return;

        // Update modal content
        document.getElementById('modal-product-image').src = this.currentProduct.image;
        document.getElementById('modal-product-image').alt = this.currentProduct.name;
        document.getElementById('modal-product-name').textContent = this.currentProduct.name;
        document.getElementById('modal-product-price').textContent = `£${this.currentProduct.price}`;
        document.getElementById('modal-product-id').value = this.currentProduct.id;

        // Update stock info
        const stockInfo = document.getElementById('modal-stock-info');
        if (this.currentProduct.stockQuantity > 10) {
            stockInfo.innerHTML = `<span class="badge bg-success">${this.currentProduct.stockQuantity} available</span>`;
        } else if (this.currentProduct.stockQuantity > 0) {
            stockInfo.innerHTML = `<span class="badge bg-warning text-dark">Only ${this.currentProduct.stockQuantity} left!</span>`;
        } else {
            stockInfo.innerHTML = `<span class="badge bg-danger">Out of stock</span>`;
        }

        // Reset and configure quantity input
        const quantityInput = document.getElementById('modal-quantity');
        quantityInput.value = 1;
        quantityInput.max = this.currentProduct.stockQuantity;
        quantityInput.min = 1;
    }

    adjustQuantity(delta) {
        const quantityInput = document.getElementById('modal-quantity');
        const currentValue = parseInt(quantityInput.value) || 1;
        const newValue = currentValue + delta;

        if (newValue >= 1 && newValue <= this.currentProduct.stockQuantity) {
            quantityInput.value = newValue;
        }
    }

    validateQuantity() {
        const quantityInput = document.getElementById('modal-quantity');
        let value = parseInt(quantityInput.value) || 1;

        if (value < 1) {
            value = 1;
        } else if (value > this.currentProduct.stockQuantity) {
            value = this.currentProduct.stockQuantity;
            this.showMessage('Maximum quantity available: ' + this.currentProduct.stockQuantity, 'warning');
        }

        quantityInput.value = value;
    }

    async confirmAddToCart() {
        if (!this.currentProduct) return;

        const quantity = parseInt(document.getElementById('modal-quantity').value);
        const confirmBtn = document.getElementById('confirm-add-to-cart');

        // Disable button and show loading state
        confirmBtn.disabled = true;
        const originalText = confirmBtn.innerHTML;
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Adding...';

        try {
            // Prepare form data
            const formData = new FormData();
            formData.append('quantity', quantity);
            formData.append('update', 'False');

            // Get CSRF token
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            formData.append('csrfmiddlewaretoken', csrfToken);

            // Make AJAX request
            const response = await this.api.post(this.currentProduct.cartAddUrl, formData);

            if (response.success) {
                // Hide modal
                if (this.modalInstance) {
                    this.modalInstance.hide();
                }

                // Update cart count in navbar
                this.updateCartCount(response.item_count);

                // Show enhanced toast notification
                this.showCartSummaryToast(response);
            } else {
                this.showMessage(response.errors || 'Failed to add product to cart', 'error');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showMessage('An error occurred. Please try again.', 'error');
        } finally {
            // Restore button state
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = originalText;
        }
    }

    updateCartCount(count) {
        const cartCountElements = document.querySelectorAll('.cart-count-badge, #cart-count');
        cartCountElements.forEach(element => {
            element.textContent = count;
            if (count > 0) {
                element.classList.remove('d-none');
                element.classList.add('cart-count-updated');
                setTimeout(() => {
                    element.classList.remove('cart-count-updated');
                }, 500);
            }
        });
    }

    showCartSummaryToast(response) {
        // Create a comprehensive cart summary toast
        let cartItemsHtml = '';
        if (response.cart_items && response.cart_items.length > 0) {
            cartItemsHtml = response.cart_items.map(item =>
                `<div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="text-truncate me-2">${item.name} × ${item.quantity}</span>
                    <span class="text-muted">£${item.total_price}</span>
                </div>`
            ).join('');

            if (response.total_unique_items > response.cart_items.length) {
                cartItemsHtml += `<div class="text-muted small">... and ${response.total_unique_items - response.cart_items.length} more items</div>`;
            }
        }

        // Use SweetAlert2 if available, otherwise fallback to basic notification
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: '🛒 Added to Cart!',
                html: `
                    <div class="text-start">
                        <p class="mb-3"><strong>${response.quantity_added} × ${response.product_name}</strong> added to your cart</p>
                        <hr>
                        <h6>Cart Summary (${response.item_count} items)</h6>
                        <div class="mb-3">${cartItemsHtml}</div>
                        <div class="d-flex justify-content-between fw-bold">
                            <span>Total:</span>
                            <span>£${response.cart_total}</span>
                        </div>
                    </div>
                `,
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: '<i class="fas fa-credit-card me-1"></i> Go to Checkout',
                cancelButtonText: '<i class="fas fa-shopping-bag me-1"></i> Continue Shopping',
                reverseButtons: true,
                customClass: {
                    confirmButton: 'btn btn-primary me-2',
                    cancelButton: 'btn btn-outline-secondary'
                },
                buttonsStyling: false
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/shop/cart/';
                }
            });
        } else {
            // Fallback notification
            this.showMessage(
                `${response.product_name} added to cart! Total: £${response.cart_total} (${response.item_count} items)`,
                'success'
            );
        }
    }

    showMessage(message, type = 'info') {
        // Basic message display (can be enhanced with toast library)
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                text: message,
                icon: type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'info',
                timer: 3000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
            alert(message);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quantityModalManager = new QuantityModalManager();
});

export default QuantityModalManager;
