/**
 * ProductDetailManager - handles product detail page functionality
 * Manages quantity selectors and integrates with cart and wishlist
 */
class ProductDetailManager {
    constructor() {
        this.initQuantityControls();
    }
    
    /**
     * Initialize quantity controls for the product detail page
     * Sets up increment/decrement buttons with validation
     */
    initQuantityControls() {
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
                    // Use SweetAlert2 directly
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            title: 'Maximum Quantity',
                            text: `Sorry, only ${maxValue} units available.`,
                            icon: 'info',
                            confirmButtonColor: '#0d6efd'
                        });
                    } else {
                        alert(`Maximum Quantity: Sorry, only ${maxValue} units available.`);
                    }
                }
            });
        }
    }
}

// Initialize the product detail manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // No need to create new instances of cart and wishlist managers
    // They've already been initialized by their respective scripts
    // and are available as global variables
    
    // Create our product detail manager
    window.productDetailManager = new ProductDetailManager();
});
