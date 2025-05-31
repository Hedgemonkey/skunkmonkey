/**
 * Comparison Manager
 * Manages product comparison functionality for the shop
 * Updated to use unified toggle approach similar to wishlist system
 */
import '../css/components/product-images.css';
import apiClient from '@common/js/api-client.js';

/**
 * ComparisonManager class for handling product comparison functionality
 */
class ComparisonManager {
    /**
     * Initialize the ComparisonManager
     */
    constructor() {
        this.comparisonItems = new Set(); // Store comparison item IDs
        this.initialize();
    }

    /**
     * Initialize the comparison manager with error handling
     */
    initialize() {
        try {
            this.initializeComparisonItems();
            this.bindEvents();
        } catch (error) {
            console.error('Error initializing Comparison Manager:', error);
        }
    }

    /**
     * Initialize the comparison items set from the DOM
     */
    initializeComparisonItems() {
        // Try to get comparison count from the DOM
        const comparisonCountElements = document.querySelectorAll('.comparison-count');
        if (comparisonCountElements.length > 0) {
            const count = parseInt(comparisonCountElements[0].textContent, 10);
            console.log('Initial comparison count:', count);
        }

        // Try to collect comparison product IDs from data attributes or classes
        document.querySelectorAll('.btn-success.add-to-comparison-btn, .toggle-comparison-btn.btn-success').forEach(btn => {
            const productId = btn.dataset.productId;
            if (productId) {
                this.comparisonItems.add(productId);
                console.log('Added product to initial comparison set:', productId);
            }
        });

        // Look for comparison product IDs in a JSON script tag
        const comparisonDataElement = document.getElementById('comparison-data');
        if (comparisonDataElement && comparisonDataElement.textContent && comparisonDataElement.textContent.trim() !== '') {
            try {
                const comparisonData = JSON.parse(comparisonDataElement.textContent);
                if (Array.isArray(comparisonData)) {
                    comparisonData.forEach(id => this.comparisonItems.add(id.toString()));
                    console.log('Initialized comparison items from data element:', comparisonData);
                }
            } catch (e) {
                console.error('Error parsing comparison data:', e);
                // Initialize with empty array if parsing fails
                console.log('Falling back to empty comparison due to parsing error');
            }
        } else {
            console.log('No comparison data element found or data is empty');
        }

        console.log('Initialized comparison items:', [...this.comparisonItems]);
    }

    /**
     * Bind event listeners to DOM elements
     */
    bindEvents() {
        // Handle all comparison buttons with a single event listener
        document.addEventListener('click', (event) => {
            // Handle both old-style and new-style comparison buttons
            const compareBtn = event.target.closest('.add-to-comparison-btn, .remove-from-comparison, .comparison-btn, .toggle-comparison-btn');
            if (compareBtn) {
                event.preventDefault();
                this.handleComparisonButtonClick(compareBtn);
            }
        });
    }

    /**
     * Handle comparison button click with robust state management
     * @param {HTMLElement} button - The button that was clicked
     */
    handleComparisonButtonClick(button) {
        const productId = button.dataset.productId;
        const productName = button.dataset.productName || 'Product';

        if (!productId) {
            console.error('ComparisonManager: No product ID found on button');
            this.showToast('Error', 'Product information missing', 'error');
            return;
        }

        // Determine if this is currently in comparison based on URL or classes
        const isCurrentlyInComparison = this.isProductInComparison(button);

        // Store original state for rollback on error
        const originalState = this.captureButtonState(button);

        // Show loading state
        this.setLoadingState(button);

        // Make API request to toggle endpoint
        const toggleUrl = `/shop/comparison/toggle/${productId}/`;

        apiClient.post(toggleUrl, {}, {
            'X-Requested-With': 'XMLHttpRequest'
        })
        .then(data => {
            if (data.success) {
                // Update button state based on response
                this.updateButtonState(button, data.isInComparison, productId);

                // Update comparison counter
                this.updateComparisonCounter(data.comparison_count);

                // Show success message
                const action = data.added ? 'Added to' : 'Removed from';
                this.showToast(`${action} Comparison`, data.message, data.added ? 'success' : 'info');

                // If we're on the comparison page and removed an item, reload to update the UI
                if (data.removed && window.location.pathname.includes('/comparison/')) {
                    setTimeout(() => window.location.reload(), 1000);
                }
            } else {
                // Revert to original state on failure
                this.restoreButtonState(button, originalState);
                this.showToast('Notice', data.message || 'Failed to update comparison list', 'warning');
            }
        })
        .catch(error => {
            console.error('Error updating comparison:', error);
            // Revert to original state on error
            this.restoreButtonState(button, originalState);
            this.showToast('Error', 'Failed to update comparison list', 'error');
        });
    }

    /**
     * Determine if product is currently in comparison based on button state
     * @param {HTMLElement} button - The button element
     * @returns {boolean} Whether the product is in comparison
     */
    isProductInComparison(button) {
        // Check button classes for state
        if (button.classList.contains('btn-success') || button.classList.contains('active')) {
            return true;
        }

        // Check href for remove_from_comparison URL
        const href = button.getAttribute('href') || '';
        if (href.includes('remove_from_comparison')) {
            return true;
        }

        // Default to not in comparison
        return false;
    }

    /**
     * Capture current button state for potential rollback
     * @param {HTMLElement} button - The button element
     * @returns {Object} Button state object
     */
    captureButtonState(button) {
        return {
            innerHTML: button.innerHTML,
            className: button.className,
            href: button.getAttribute('href'),
            title: button.getAttribute('title')
        };
    }

    /**
     * Set button to loading state
     * @param {HTMLElement} button - The button element
     */
    setLoadingState(button) {
        const originalIcon = button.querySelector('i');
        const iconClasses = originalIcon ? originalIcon.className : 'fas fa-balance-scale';

        button.innerHTML = `<div class="spinner-border spinner-border-sm me-1" role="status"></div>`;
        button.disabled = true;

        // Store original icon classes for restoration
        button.dataset.originalIcon = iconClasses;
    }

    /**
     * Update button state based on comparison status
     * @param {HTMLElement} button - The button element
     * @param {boolean} isInComparison - Whether product is in comparison
     * @param {string} productId - The product ID
     */
    updateButtonState(button, isInComparison, productId) {
        // Remove loading and state classes
        button.disabled = false;
        button.classList.remove('btn-outline-secondary', 'btn-success', 'active');

        if (isInComparison) {
            // Product is in comparison list
            button.classList.add('btn-success');
            button.innerHTML = '<i class="fas fa-check me-1"></i> Compared';
            button.setAttribute('title', 'Remove from comparison');
            button.setAttribute('href', `/comparison/remove/${productId}/`);
        } else {
            // Product is not in comparison list
            button.classList.add('btn-outline-secondary');
            button.innerHTML = '<i class="fas fa-balance-scale me-1"></i> Compare';
            button.setAttribute('title', 'Add to comparison');
            button.setAttribute('href', `/comparison/add/${productId}/`);
        }
    }

    /**
     * Restore button to original state
     * @param {HTMLElement} button - The button element
     * @param {Object} originalState - The original button state
     */
    restoreButtonState(button, originalState) {
        button.disabled = false;
        button.innerHTML = originalState.innerHTML;
        button.className = originalState.className;
        if (originalState.href) {
            button.setAttribute('href', originalState.href);
        }
        if (originalState.title) {
            button.setAttribute('title', originalState.title);
        }
    }

    /**
     * Update the comparison counter in the navigation
     * @param {number} count - The new comparison count
     */
    updateComparisonCounter(count) {
        const countElements = document.querySelectorAll('.comparison-count');
        if (countElements.length > 0 && count !== undefined) {
            countElements.forEach(el => {
                el.textContent = count;
            });
        }
    }

    /**
     * Show a notification using SweetAlert2
     * @param {string} title - The notification title
     * @param {string} message - The notification message
     * @param {string} type - The notification type (success, error, warning, info)
     */
    showToast(title, message, type = 'info') {
        // Convert type to SweetAlert2 icon type
        const iconType = type === 'danger' ? 'error' : type;

        // Use the globally available Swal object from the npm package
        if (typeof window.Swal !== 'undefined') {
            console.log('Showing toast with SweetAlert2:', title, message, iconType);
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
                    toast.addEventListener('mouseenter', window.Swal.stopTimer);
                    toast.addEventListener('mouseleave', window.Swal.resumeTimer);
                }
            });
        } else {
            // Fallback to console if SweetAlert2 is not available
            console.warn('SweetAlert2 not available for toast:', title, message);
            alert(`${title}: ${message}`);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if SweetAlert2 is available
    if (typeof window.Swal === 'undefined') {
        console.warn('SweetAlert2 is not available. Toast notifications will fall back to alerts.');
    } else {
        console.log('SweetAlert2 is available for ComparisonManager.');
    }

    window.comparisonManager = new ComparisonManager();
});

export default ComparisonManager;
