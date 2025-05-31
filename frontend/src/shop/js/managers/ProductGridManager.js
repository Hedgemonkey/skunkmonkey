/**
 * ProductGridManager - Handles product loading and grid display
 */
export class ProductGridManager {
    constructor(productListManager) {
        this.plm = productListManager; // Reference to main ProductListManager
        this.originalGridHtml = '';
    }

    /**
     * Fetch products via AJAX with enhanced error handling
     */
    fetchProducts() {
        // Show loading state if container exists
        if (this.plm.productGridContainer) {
            // Just add the loading class - the CSS will handle the spinner display
            this.plm.uiManager.showLoading();

            // Store the current HTML to restore in case of an error
            this.originalGridHtml = this.plm.productGridContainer.innerHTML;
        }

        try {
            // Get base URL with proper validation
            const baseUrl = this.getBaseUrl();

            // Create URL with validation
            const url = new URL(baseUrl);
            const filterState = this.plm.filterManager.getFilterState();

            // Add query parameters
            if (filterState.search) url.searchParams.set('search', filterState.search);
            if (filterState.category) url.searchParams.set('category', filterState.category);
            if (filterState.sort) url.searchParams.set('sort', filterState.sort);

            // Add timestamp to prevent caching issues
            url.searchParams.set('_', Date.now());

            console.log('Fetching products from:', url.toString());

            // Make the fetch request
            fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
                credentials: 'same-origin'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Update the product grid container with the HTML response
                if (this.plm.productGridContainer && data.html) {
                    this.plm.productGridContainer.innerHTML = data.html;

                    // Re-position wishlist buttons after loading new content
                    this.plm.uiManager.positionWishlistButtons();

                    // Update product count from the loaded grid
                    this.updateProductCountFromGrid();

                    // Dispatch custom event for other components
                    document.dispatchEvent(new CustomEvent('productsLoaded', {
                        detail: { container: this.plm.productGridContainer, html: data.html }
                    }));
                } else {
                    // Handle case where no HTML is returned
                    this.showErrorMessage('No products found');
                }
            })
            .catch(error => {
                console.error('Error fetching products:', error);

                // Restore original content if available
                if (this.plm.productGridContainer && this.originalGridHtml) {
                    this.plm.productGridContainer.innerHTML = this.originalGridHtml;
                }

                // Show error message
                this.showErrorMessage('Failed to load products. Please try again.');
            })
            .finally(() => {
                // Always hide loading state
                this.plm.uiManager.hideLoading();
            });

        } catch (err) {
            console.error('Error in fetchProducts:', err);
            this.plm.uiManager.hideLoading();
            this.showErrorMessage('An error occurred while loading products.');
        }
    }

    /**
     * Get the appropriate base URL for product fetching
     */
    getBaseUrl() {
        try {
            // Primary: Use the explicitly set productListUrl
            if (this.plm.productListUrl) {
                // If it's a relative URL, make it absolute
                if (this.plm.productListUrl.startsWith('/')) {
                    return `${window.location.protocol}//${window.location.host}${this.plm.productListUrl}`;
                }
                // If it's already an absolute URL, use as is
                if (this.isValidUrl(this.plm.productListUrl)) {
                    return this.plm.productListUrl;
                }
            }

            // Secondary: Use current page URL
            if (this.isValidUrl(window.location.href)) {
                return window.location.href;
            }

            // Fallback: construct a reasonable default
            return `${window.location.protocol}//${window.location.host}${window.location.pathname}`;

        } catch (err) {
            console.error('Error getting base URL:', err);
            // Last resort fallback
            return window.location.href;
        }
    }

    /**
     * Safely test if a string is a valid URL
     */
    isValidUrl(urlString) {
        try {
            new URL(urlString);
            return true;
        } catch (err) {
            return false;
        }
    }

    /**
     * Update product count from the loaded grid
     */
    updateProductCountFromGrid() {
        try {
            if (!this.plm.productGridContainer) return;

            // Count actual product cards/items
            const productCards = this.plm.productGridContainer.querySelectorAll('.product-card, .product-item');
            const count = productCards.length;

            // Update count displays
            this.plm.uiManager.updateProductCount(count);

            console.log(`Updated product count: ${count} products found`);
        } catch (err) {
            console.error('Error updating product count from grid:', err);
        }
    }

    /**
     * Show error message in the product grid
     */
    showErrorMessage(message) {
        try {
            if (!this.plm.productGridContainer) return;

            const errorHtml = `
                <div class="alert alert-danger text-center" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    ${this.escapeHtml(message)}
                    <button type="button" class="btn btn-outline-danger btn-sm ms-3" onclick="window.location.reload()">
                        <i class="fas fa-refresh me-1"></i> Retry
                    </button>
                </div>
            `;

            this.plm.productGridContainer.innerHTML = errorHtml;
        } catch (err) {
            console.error('Error showing error message:', err);
        }
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}
