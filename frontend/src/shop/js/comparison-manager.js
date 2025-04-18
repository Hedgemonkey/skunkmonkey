/**
 * Comparison Manager
 * Handles product comparison functionality
 *
 * This module provides functionality for managing product comparisons,
 * including adding and removing products from the comparison list,
 * updating the UI, and displaying notifications.
 */

// Use path alias instead of absolute path
import apiClient from '@core/api-client.js';

/**
 * ComparisonManager class for handling product comparison functionality
 */
class ComparisonManager {
    /**
     * Initialize the ComparisonManager
     */
    constructor() {
        this.initialize();
    }

    /**
     * Initialize the comparison manager with error handling
     */
    initialize() {
        try {
            this.bindEvents();
            this.updateComparisonCount();
        } catch (error) {
            console.error('Error initializing Comparison Manager:', error);
        }
    }

    /**
     * Bind event listeners to DOM elements
     */
    bindEvents() {
        // Add to comparison buttons
        document.addEventListener('click', (event) => {
            const compareBtn = event.target.closest('.add-to-comparison-btn');
            if (compareBtn) {
                event.preventDefault();
                this.handleAddToComparison(compareBtn);
            }
        });

        // Remove from comparison buttons
        document.addEventListener('click', (event) => {
            const removeBtn = event.target.closest('.remove-from-comparison');
            if (removeBtn) {
                event.preventDefault();
                this.handleRemoveFromComparison(removeBtn);
            }
        });
    }

    /**
     * Handle adding a product to the comparison list
     * @param {HTMLElement} button - The button that was clicked
     */
    handleAddToComparison(button) {
        const productId = button.dataset.productId;
        const productName = button.dataset.productName || 'Product';
        const url = button.href;
        const isCurrentlyCompared = button.classList.contains('btn-success');

        // Update button state immediately for better UX
        this.updateButtonState(button, !isCurrentlyCompared);

        // Make API request
        apiClient.get(url)
            .then(data => {
                if (data.success) {
                    // Show appropriate success message based on action
                    if (isCurrentlyCompared) {
                        // If removing from comparison
                        this.showToast('Removed from Comparison',
                            data.message || `${productName} removed from comparison list.`,
                            'info');
                    } else {
                        // If adding to comparison
                        this.showToast('Added to Comparison',
                            data.message || `${productName} added to comparison list.`,
                            'success');
                    }

                    this.updateComparisonCount(data.comparison_count);
                } else {
                    // Revert button state on failure
                    this.updateButtonState(button, isCurrentlyCompared);

                    // Show error message
                    this.showToast('Notice', data.message || 'Failed to update comparison list', 'warning');
                }
            })
            .catch(error => {
                // Revert button state on error
                this.updateButtonState(button, isCurrentlyCompared);

                // Show error message
                console.error('Error updating comparison:', error);
                this.showToast('Error', 'Failed to update comparison list', 'error');
            });
    }

    /**
     * Update the button state based on comparison status
     * @param {HTMLElement} button - The button to update
     * @param {boolean} isCompared - Whether the product is in the comparison list
     */
    updateButtonState(button, isCompared) {
        if (isCompared) {
            // Add to comparison list styling
            button.classList.remove('btn-outline-secondary');
            button.classList.add('btn-success');
            button.innerHTML = '<i class="fas fa-check me-1"></i> Compared';
            button.setAttribute('title', 'Remove from comparison');

            // Update href to remove action
            const newUrl = button.getAttribute('href').replace('add_to_comparison', 'remove_from_comparison');
            button.setAttribute('href', newUrl);
        } else {
            // Remove from comparison list styling
            button.classList.remove('btn-success');
            button.classList.add('btn-outline-secondary');
            button.innerHTML = '<i class="fas fa-balance-scale me-1"></i> Compare';
            button.setAttribute('title', 'Add to comparison');

            // Update href to add action
            const newUrl = button.getAttribute('href').replace('remove_from_comparison', 'add_to_comparison');
            button.setAttribute('href', newUrl);
        }
    }

    /**
     * Handle removing a product from the comparison list
     * @param {HTMLElement} button - The button that was clicked
     */
    handleRemoveFromComparison(button) {
        const url = button.href;
        const productName = button.dataset.productName || 'Product';

        // Make API request
        apiClient.get(url)
            .then(data => {
                if (data.success) {
                    // If we're on the comparison page, reload to update the UI
                    if (window.location.pathname.includes('/comparison/')) {
                        window.location.reload();
                    } else {
                        // Just update the count
                        this.updateComparisonCount(data.comparison_count);
                        this.showToast('Removed from Comparison',
                            data.message || `${productName} removed from comparison list.`,
                            'info');
                    }
                } else {
                    // Show error message
                    this.showToast('Error', data.message || 'Failed to remove product', 'error');
                }
            })
            .catch(error => {
                console.error('Error removing from comparison:', error);
                this.showToast('Error', 'Failed to remove product from comparison', 'error');
            });
    }

    /**
     * Update the comparison count in the UI
     * @param {number} count - The new comparison count
     */
    updateComparisonCount(count) {
        // Update comparison count in the UI
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
