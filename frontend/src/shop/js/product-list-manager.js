/**
 * Product List Manager - Refactored
 * Main coordinator that manages product filtering, sorting and AJAX loading for the shop product list
 * Also handles product grid interactions like wishlist toggling
 *
 * This refactored version delegates responsibilities to specialized managers:
 * - FilterManager: Handles all filtering logic and state
 * - UIManager: Handles UI updates and display logic
 * - WishlistManager: Handles wishlist functionality
 * - URLManager: Handles URL synchronization and browser navigation
 * - ProductGridManager: Handles product loading and grid display
 */
import '../css/product-list.css';
import '../css/wishlist.css';

// Import the specialized managers
import { FilterManager } from './managers/FilterManager.js';
import { UIManager } from './managers/UIManager.js';
import { WishlistManager } from './managers/WishlistManager.js';
import { URLManager } from './managers/URLManager.js';
import { ProductGridManager } from './managers/ProductGridManager.js';

class ProductListManager {
    constructor() {
        // Initialize with error handling
        try {
            // Initialize managers
            this.filterManager = new FilterManager(this);
            this.uiManager = new UIManager(this);
            this.wishlistManager = new WishlistManager(this);
            this.urlManager = new URLManager(this);
            this.productGridManager = new ProductGridManager(this);

            // Initialize product grid interaction features
            this.initializeProductGridFeatures();

            this.filterContainer = document.getElementById('dynamic-filter-container');
            if (!this.filterContainer) {
                console.warn('Product List Manager: dynamic-filter-container not found in the DOM');
                // Continue anyway as we might just be on a page with product grid but no filters
            }

            // Get URLs from data attributes with validation
            if (this.filterContainer) {
                this.productListUrl = this.filterContainer.dataset.productListUrl;
                if (!this.productListUrl) {
                    console.warn('Product List Manager: No product list URL provided in data-product-list-url attribute');
                    this.productListUrl = window.location.href; // Fallback to current URL
                }

                // Initialize filter state from URL parameters first
                this.filterManager.initializeFilterStateFromUrl();

                // Initialize DOM element references for filtering
                this.uiManager.initializeFilterDomReferences();

                // Only proceed with filter setup if essential elements are present
                if (this.uiManager.hasEssentialFilterElements()) {
                    this.initializeFilterControls();
                    this.bindFilterEvents();

                    // Bind browser navigation events for URL handling
                    this.urlManager.bindNavigationEvents();

                    this.uiManager.updateFilterUI();

                    // Delay initial product fetch to ensure DOM is fully ready
                    setTimeout(() => {
                        this.productGridManager.fetchProducts();
                    }, 100);
                }
            }

        } catch (err) {
            console.error('Error initializing Product List Manager:', err);
        }
    }

    /**
     * Initialize product grid interaction features
     */
    initializeProductGridFeatures() {
        try {
            // Position wishlist buttons correctly
            this.positionWishlistButtons();

            // Check if WishlistInitializer is already handling wishlist events
            // to prevent duplicate event handlers
            const hasWishlistInitializer = window.wishlistManager ||
                document.querySelector('script[src*="wishlist-initializer"]') ||
                // Check if the global initWishlist function exists
                (typeof window.initWishlist === 'function');

            if (!hasWishlistInitializer) {
                // Only add event listeners if WishlistInitializer is not present
                document.addEventListener('click', (event) => {
                    const wishlistBtn = event.target.closest('.add-to-wishlist-btn, .remove-wishlist-btn');
                    if (wishlistBtn) {
                        this.handleWishlistButtonClick(event, wishlistBtn);
                    }
                });
                console.log('[ProductListManager] Added wishlist event handlers (no WishlistInitializer detected)');
            } else {
                console.log('[ProductListManager] Skipping wishlist event handlers (WishlistInitializer detected)');
            }

            // Re-position elements on window resize
            window.addEventListener('resize', () => {
                this.positionWishlistButtons();
            });

            // Re-position elements when products are loaded via AJAX
            document.addEventListener('productsLoaded', () => {
                this.positionWishlistButtons();
            });
        } catch (err) {
            console.error('Error initializing product grid features:', err);
        }
    }

    // Methods now delegated to UIManager - these are kept for backward compatibility
    initializeFilterDomReferences() {
        return this.uiManager.initializeFilterDomReferences();
    }

    hasEssentialFilterElements() {
        return this.uiManager.hasEssentialFilterElements();
    }

    // Methods now delegated to FilterManager - these are kept for backward compatibility
    initializeFilterControls() {
        return this.filterManager.initializeFilterControls();
    }

    bindFilterEvents() {
        return this.filterManager.bindFilterEvents();
    }

    // Filter event handlers - delegated to FilterManager
    handleSearchInput(event) {
        return this.filterManager.handleSearchInput(event);
    }

    handleSortChange(event) {
        return this.filterManager.handleSortChange(event);
    }

    handleCategoryChange(event) {
        return this.filterManager.handleCategoryChange(event);
    }

    handleClearSearch() {
        return this.filterManager.handleClearSearch();
    }

    handleClearCategories() {
        return this.filterManager.handleClearCategories();
    }

    handleResetAll() {
        return this.filterManager.handleResetAll();
    }

    handleFilterToggle() {
        return this.uiManager.handleFilterToggle();
    }

    removeCategoryById(categoryId) {
        return this.filterManager.removeCategoryById(categoryId);
    }

    // UI methods - delegated to UIManager
    updateFilterUI() {
        return this.uiManager.updateFilterUI();
    }

    updateCategoryTags() {
        return this.uiManager.updateCategoryTags();
    }

    // Product loading methods - delegated to ProductGridManager
    isValidUrl(urlString) {
        return this.productGridManager.isValidUrl(urlString);
    }

    getBaseUrl() {
        return this.productGridManager.getBaseUrl();
    }

    fetchProducts() {
        return this.productGridManager.fetchProducts();
    }

    // Wishlist methods - delegated to WishlistManager
    handleWishlistButtonClick(event, button) {
        return this.wishlistManager.handleWishlistButtonClick(event, button);
    }

    findHeartIcon(button) {
        return this.wishlistManager.findHeartIcon(button);
    }

    getIconClasses(icon) {
        return this.wishlistManager.getIconClasses(icon);
    }

    setIconClasses(icon, classes) {
        return this.wishlistManager.setIconClasses(icon, classes);
    }

    replaceFontAwesomeIcon(svgIcon, classes) {
        return this.wishlistManager.replaceFontAwesomeIcon(svgIcon, classes);
    }

    positionWishlistButtons() {
        return this.wishlistManager.positionWishlistButtons();
    }

    updateWishlistCounter(count) {
        return this.wishlistManager.updateWishlistCounter(count);
    }

    getCookie(name) {
        return this.wishlistManager.getCookie(name);
    }

    showToast(title, message, type = 'info') {
        return this.wishlistManager.showToast(title, message, type);
    }

    // URL management methods - delegated to URLManager
    initializeFilterStateFromUrl() {
        return this.urlManager.initializeFilterStateFromUrl();
    }

    bindNavigationEvents() {
        return this.urlManager.bindNavigationEvents();
    }

    updateUrl(replace = false) {
        return this.urlManager.updateUrl(replace);
    }
}

/**
 * Initialize the product list manager when the DOM is loaded
 * with error handling to prevent crashes
 */
document.addEventListener('DOMContentLoaded', function() {
    try {
        window.productListManager = new ProductListManager();
    } catch (error) {
        console.error('Fatal error initializing Product List Manager:', error);
        // Try to show error on page
        const container = document.getElementById('product-grid-container');
        if (container) {
            container.innerHTML = '<div class="alert alert-danger">There was an error initializing the product list. Please refresh the page or contact support.</div>';
        }
    }
});
