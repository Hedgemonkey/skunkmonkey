/**
 * ProductListManager - handles product list page functionality
 * Manages sorting, filtering, and other product list interactions
 */
class ProductListManager {
    constructor() {
        this.initSortingControls();
    }
    
    /**
     * Initialize sorting controls
     * Sets up the sort dropdown functionality
     */
    initSortingControls() {
        // Sort select change
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                const url = new URL(window.location.href);
                url.searchParams.set('sort', e.target.value);
                window.location.href = url.toString();
            });
            
            // Set the selected option based on the current URL
            const urlParams = new URLSearchParams(window.location.search);
            const sortParam = urlParams.get('sort');
            if (sortParam) {
                sortSelect.value = sortParam;
            }
        }
    }
}

// Initialize the product list manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.productListManager = new ProductListManager();
});
