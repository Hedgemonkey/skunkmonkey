/**
 * Product Manage URLs
 * Handles URL configuration for product management interface
 */

/**
 * Initialize product manage URLs from data attributes
 */
function initProductManageUrls() {
    // Get URLs from data attributes on container
    const container = document.querySelector('[data-category-cards-url]');

    if (!container) {
        return;
    }

    // Make URLs globally available for other scripts
    window.getCategoryCardsUrl = container.getAttribute('data-category-cards-url');
    window.getProductCardsUrl = container.getAttribute('data-product-cards-url');

    // Dispatch custom event to notify other scripts that URLs are ready
    document.dispatchEvent(new CustomEvent('productManageUrlsReady', {
        detail: {
            getCategoryCardsUrl: window.getCategoryCardsUrl,
            getProductCardsUrl: window.getProductCardsUrl
        }
    }));
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initProductManageUrls);
