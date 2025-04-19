
/**
 * Product List Manager
 * Manages product filtering, sorting and AJAX loading for the shop product list
 * Also handles product grid interactions like wishlist toggling
 */
import '../css/product-list.css';
class ProductListManager {
    constructor() {
        // Initialize with error handling
        try {
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

                // Initial filter state with safety checks
                this.filterState = {
                    search: (this.filterContainer.dataset.searchQuery || '').trim(),
                    category: (this.filterContainer.dataset.currentCategory || '').trim(),
                    sort: 'name-asc'
                };

                // Initialize DOM element references for filtering
                this.initializeFilterDomReferences();

                // Only proceed with filter setup if essential elements are present
                if (this.hasEssentialFilterElements()) {
                    this.initializeFilterControls();
                    this.bindFilterEvents();
                    this.updateFilterUI();

                    // Delay initial product fetch to ensure DOM is fully ready
                    setTimeout(() => {
                        this.fetchProducts();
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

            // Add event listeners for product grid interactions
            document.addEventListener('click', (event) => {
                const wishlistBtn = event.target.closest('.add-to-wishlist-btn');
                if (wishlistBtn) {
                    this.handleWishlistButtonClick(event, wishlistBtn);
                }
            });

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

    /**
     * Initialize all DOM element references for filtering
     */
    initializeFilterDomReferences() {
        // Essential elements
        this.productGridContainer = document.getElementById('product-grid-container');

        // Filter elements
        this.searchInput = document.querySelector('.filter-search');
        this.sortSelect = document.querySelector('.filter-sort');
        this.categorySelect = document.querySelector('.filter-category');
        this.clearSearchBtn = document.querySelector('.clear-search');
        this.resetAllBtn = document.querySelector('.reset-all-filters');
        this.filterToggleBtn = document.querySelector('.filter-toggle');
        this.filterOptions = document.getElementById('filterOptions');

        // Display elements
        this.searchDisplay = document.querySelector('.search-display');
        this.searchTerm = document.querySelector('.search-term');
        this.searchTermSummary = document.querySelector('.search-term-summary');
        this.searchSummary = document.querySelector('.search-summary');
        this.categoriesDisplay = document.querySelector('.categories-display');
        this.categoryCountDisplay = document.querySelector('.category-count-display');
        this.categoriesSummary = document.querySelector('.categories-summary');
        this.categoryCountSummary = document.querySelector('.category-count-summary');
        this.categoryTagsContainer = document.getElementById('selectedCategoriesTags');
        this.clearCategoriesBtn = document.querySelector('.clear-categories-btn');
        this.itemCountDisplay = document.querySelector('.item-count');
        this.productCountDisplay = document.getElementById('product-count');
    }

    /**
     * Check if essential filter elements are present
     */
    hasEssentialFilterElements() {
        if (!this.productGridContainer) {
            console.warn('Product List Manager: product-grid-container not found in the DOM');
            return false;
        }
        return true;
    }

    /**
     * Initialize filter controls including sorting and filtering
     */
    initializeFilterControls() {
        try {
            // Initialize sorting
            const urlParams = new URLSearchParams(window.location.search);
            const sortParam = urlParams.get('sort');

            if (this.sortSelect && sortParam) {
                this.sortSelect.value = sortParam;
                this.filterState.sort = sortParam;
            }

            // Initialize category select if using a multi-select plugin
            if (this.categorySelect) {
                if (typeof $ !== 'undefined' && $.fn && typeof $.fn.select2 !== 'undefined') {
                    try {
                        $(this.categorySelect).select2({
                            placeholder: "Select Categories",
                            allowClear: true,
                            width: '100%'
                        });
                    } catch (selectError) {
                        console.warn('Error initializing Select2:', selectError);
                    }
                }
            }
        } catch (err) {
            console.error('Error initializing controls:', err);
        }
    }

    /**
     * Bind event listeners to filter DOM elements with error handling
     */
    bindFilterEvents() {
        try {
            if (this.searchInput) {
                this.searchInput.addEventListener('input', this.handleSearchInput.bind(this));
            }

            if (this.sortSelect) {
                this.sortSelect.addEventListener('change', this.handleSortChange.bind(this));
            }

            if (this.categorySelect) {
                this.categorySelect.addEventListener('change', this.handleCategoryChange.bind(this));
            }

            if (this.clearSearchBtn) {
                this.clearSearchBtn.addEventListener('click', this.handleClearSearch.bind(this));
            }

            if (this.clearCategoriesBtn) {
                this.clearCategoriesBtn.addEventListener('click', this.handleClearCategories.bind(this));
            }

            if (this.resetAllBtn) {
                this.resetAllBtn.addEventListener('click', this.handleResetAll.bind(this));
            }

            if (this.filterToggleBtn) {
                this.filterToggleBtn.addEventListener('click', this.handleFilterToggle.bind(this));
            }

            // Document-level event delegation for dynamic elements with error handling
            document.addEventListener('click', (event) => {
                try {
                    // Handle click on search summary close button
                    if (event.target.closest('.search-summary .btn-close')) {
                        this.handleClearSearch();
                    }

                    // Handle click on categories summary close button
                    if (event.target.closest('.categories-summary .btn-close')) {
                        this.handleClearCategories();
                    }

                    // Handle tag remove button click
                    if (event.target.closest('.tag-remove')) {
                        const categoryId = event.target.closest('.tag-remove').dataset.categoryId;
                        if (categoryId) {
                            this.removeCategoryById(categoryId);
                        }
                    }
                } catch (eventError) {
                    console.error('Error handling click event:', eventError);
                }
            });
        } catch (err) {
            console.error('Error binding events:', err);
        }
    }

    /**
     * Handle search input changes
     */
    handleSearchInput(event) {
        try {
            this.filterState.search = event.target.value;
            this.updateFilterUI();

            // Debounce for performance
            clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => {
                this.fetchProducts();
            }, 300);
        } catch (err) {
            console.error('Error handling search input:', err);
        }
    }

    /**
     * Handle sort selection changes
     */
    handleSortChange(event) {
        try {
            this.filterState.sort = event.target.value;
            this.updateFilterUI();
            this.fetchProducts();
        } catch (err) {
            console.error('Error handling sort change:', err);
        }
    }

    /**
     * Handle category selection changes
     */
    handleCategoryChange(event) {
        try {
            let selectedCategories = [];

            // Handle different selection types
            if (event.target.selectedOptions) {
                selectedCategories = Array.from(event.target.selectedOptions).map(opt => opt.value);
            } else if (event.target.options && event.target.multiple) {
                selectedCategories = Array.from(event.target.options)
                    .filter(opt => opt.selected)
                    .map(opt => opt.value);
            } else if (event.target.value) {
                selectedCategories = [event.target.value];
            }

            this.filterState.category = selectedCategories.join(',');
            this.updateFilterUI();
            this.fetchProducts();
        } catch (err) {
            console.error('Error handling category change:', err);
        }
    }

    /**
     * Clear search term
     */
    handleClearSearch() {
        try {
            this.filterState.search = '';
            if (this.searchInput) this.searchInput.value = '';
            this.updateFilterUI();
            this.fetchProducts();
        } catch (err) {
            console.error('Error clearing search:', err);
        }
    }

    /**
     * Clear category selections
     */
    handleClearCategories() {
        try {
            this.filterState.category = '';

            if (this.categorySelect) {
                if (typeof $ !== 'undefined' && $.fn && typeof $.fn.select2 !== 'undefined') {
                    try {
                        $(this.categorySelect).val(null).trigger('change');
                    } catch (selectError) {
                        console.warn('Error with Select2 clearing:', selectError);
                        // Fallback to standard DOM operation if Select2 fails
                        Array.from(this.categorySelect.options).forEach(opt => opt.selected = false);
                    }
                } else {
                    Array.from(this.categorySelect.options).forEach(opt => opt.selected = false);
                }
            }

            this.updateFilterUI();
            this.fetchProducts();
        } catch (err) {
            console.error('Error clearing categories:', err);
        }
    }

    /**
     * Reset all filters to default values
     */
    handleResetAll() {
        try {
            this.filterState = {
                search: '',
                category: '',
                sort: 'name-asc'
            };

            if (this.searchInput) this.searchInput.value = '';

            if (this.sortSelect) {
                this.sortSelect.value = 'name-asc';
            }

            if (this.categorySelect) {
                if (typeof $ !== 'undefined' && $.fn && typeof $.fn.select2 !== 'undefined') {
                    try {
                        $(this.categorySelect).val(null).trigger('change');
                    } catch (selectError) {
                        console.warn('Error with Select2 resetting:', selectError);
                        // Fallback
                        Array.from(this.categorySelect.options).forEach(opt => opt.selected = false);
                    }
                } else {
                    Array.from(this.categorySelect.options).forEach(opt => opt.selected = false);
                }
            }

            this.updateFilterUI();
            this.fetchProducts();
        } catch (err) {
            console.error('Error resetting filters:', err);
        }
    }

    /**
     * Toggle filter visibility
     */
    handleFilterToggle() {
        try {
            if (!this.filterOptions) return;

            const isCollapsed = this.filterOptions.classList.contains('show');
            this.filterOptions.classList.toggle('show');

            if (this.filterToggleBtn) {
                this.filterToggleBtn.classList.toggle('collapsed', !isCollapsed);
                this.filterToggleBtn.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');

                const toggleText = this.filterToggleBtn.querySelector('.filter-toggle-text');
                if (toggleText) {
                    toggleText.textContent = isCollapsed ? 'Show Filters' : 'Hide Filters';
                }
            }
        } catch (err) {
            console.error('Error toggling filter visibility:', err);
        }
    }

    /**
     * Remove a specific category by ID
     */
    removeCategoryById(categoryId) {
        try {
            if (!categoryId) return;

            const categoryIds = this.filterState.category.split(',').filter(c => c);
            const updatedCategoryIds = categoryIds.filter(id => id !== categoryId);

            this.filterState.category = updatedCategoryIds.join(',');

            // Update select element
            if (this.categorySelect) {
                if (typeof $ !== 'undefined' && $.fn && typeof $.fn.select2 !== 'undefined') {
                    try {
                        $(this.categorySelect).val(updatedCategoryIds).trigger('change');
                    } catch (selectError) {
                        console.warn('Error with Select2 category removal:', selectError);
                        // Fallback
                        Array.from(this.categorySelect.options).forEach(opt => {
                            opt.selected = updatedCategoryIds.includes(opt.value);
                        });
                    }
                } else {
                    Array.from(this.categorySelect.options).forEach(opt => {
                        opt.selected = updatedCategoryIds.includes(opt.value);
                    });
                }
            }

            // Update UI and fetch new results
            this.updateUI();
            this.fetchProducts();
        } catch (err) {
            console.error('Error removing category:', err);
        }
    }

    /**
     * Update UI elements based on current filter state
     */
    updateFilterUI() {
        try {
            // Update search display
            if (this.searchTerm) this.searchTerm.textContent = this.filterState.search;
            if (this.searchTermSummary) this.searchTermSummary.textContent = this.filterState.search;
            if (this.searchDisplay) this.searchDisplay.classList.toggle('d-none', !this.filterState.search);
            if (this.searchSummary) this.searchSummary.classList.toggle('d-none', !this.filterState.search);

            // Update category display with validation
            const categoryIds = this.filterState.category ? this.filterState.category.split(',').filter(c => c) : [];
            const categoryCount = categoryIds.length;

            if (this.categoryCountDisplay) this.categoryCountDisplay.textContent = categoryCount;
            if (this.categoryCountSummary) this.categoryCountSummary.textContent = categoryCount;
            if (this.categoriesDisplay) this.categoriesDisplay.classList.toggle('d-none', categoryCount === 0);
            if (this.categoriesSummary) this.categoriesSummary.classList.toggle('d-none', categoryCount === 0);

            // Update category tags
            this.updateCategoryTags();
        } catch (err) {
            console.error('Error updating UI:', err);
        }
    }

    /**
     * Update category tags display
     */
    updateCategoryTags() {
        try {
            if (!this.categoryTagsContainer || !this.categorySelect) return;

            this.categoryTagsContainer.innerHTML = '';

            if (!this.filterState.category) return;

            const categoryIds = this.filterState.category.split(',').filter(c => c);
            if (categoryIds.length === 0) return;

            categoryIds.forEach(categoryId => {
                try {
                    const option = Array.from(this.categorySelect.options).find(opt => opt.value === categoryId);
                    if (!option) return;

                    const categoryName = option.textContent.trim();

                    const tagDiv = document.createElement('div');
                    tagDiv.className = 'category-tag';
                    tagDiv.innerHTML = `
                        <span class="tag-text">${categoryName}</span>
                        <button type="button" class="tag-remove" data-category-id="${categoryId}">
                            <i class="fas fa-times"></i>
                        </button>
                    `;

                    this.categoryTagsContainer.appendChild(tagDiv);
                } catch (tagError) {
                    console.warn(`Error creating tag for category ID ${categoryId}:`, tagError);
                }
            });
        } catch (err) {
            console.error('Error updating category tags:', err);
        }
    }

    /**
     * Safely test if a string is a valid URL
     */
    isValidUrl(urlString) {
        try {
            new URL(urlString);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get the appropriate base URL for product fetching
     */
    getBaseUrl() {
        // First try the explicitly provided URL
        if (this.productListUrl && this.isValidUrl(this.productListUrl)) {
            return this.productListUrl;
        }

        // If we have a relative URL, resolve it against the current page
        if (this.productListUrl && this.productListUrl.startsWith('/')) {
            return new URL(this.productListUrl, window.location.origin).href;
        }

        // Fallback to current URL as a last resort
        return window.location.href;
    }

    /**
     * Fetch products via AJAX with enhanced error handling
     */
    fetchProducts() {
        // Show loading state if container exists
        if (this.productGridContainer) {
            // Just add the loading class - the CSS will handle the spinner display
            this.productGridContainer.classList.add('loading');

            // Store the current HTML to restore in case of an error
            this.originalGridHtml = this.productGridContainer.innerHTML;
        }

        try {
            // Get base URL with proper validation
            const baseUrl = this.getBaseUrl();

            // Create URL with validation
            const url = new URL(baseUrl);

            // Add query parameters
            if (this.filterState.search) url.searchParams.set('search', this.filterState.search);
            if (this.filterState.category) url.searchParams.set('category', this.filterState.category);
            if (this.filterState.sort) url.searchParams.set('sort', this.filterState.sort);

            // Add timestamp to prevent caching issues
            url.searchParams.set('_', Date.now());

            // Fetch data with timeout for network issues
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

            fetch(url, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                },
                signal: controller.signal
            })
            .then(response => {
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                }

                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Response was not JSON. Received: ' + contentType);
                }

                return response.json();
            })
            .then(data => {
                // Update product grid if container exists
                if (this.productGridContainer) {
                    if (data.html) {
                        this.productGridContainer.innerHTML = data.html;
                    } else {
                        this.productGridContainer.innerHTML = '<div class="alert alert-info">No products found matching your criteria.</div>';
                    }
                }

                // Update counts if elements exist
                const count = data.count || 0;
                if (this.itemCountDisplay) this.itemCountDisplay.textContent = count;
                if (this.productCountDisplay) this.productCountDisplay.textContent = count;

                // Trigger event for other components that might need to initialize
                document.dispatchEvent(new CustomEvent('productsLoaded', { detail: data }));

                // Re-position wishlist buttons after products are loaded
                this.positionWishlistButtons();
            })
            .catch(error => {
                console.error('Error fetching products:', error);

                let errorMessage = 'Error loading products. ';

                if (error.name === 'AbortError') {
                    errorMessage += 'Request timed out. Please check your internet connection and try again.';
                } else if (error.message.includes('JSON')) {
                    errorMessage += 'Unexpected response format from server.';
                } else {
                    errorMessage += 'Please try again or contact support if the issue persists.';
                }

                if (this.productGridContainer) {
                    this.productGridContainer.innerHTML = `<div class="alert alert-danger">${errorMessage}</div>`;
                }
            })
            .finally(() => {
                // Ensure loading class is always removed, even if there are other issues
                if (this.productGridContainer) {
                    this.productGridContainer.classList.remove('loading');
                }
            });
        } catch (error) {
            console.error('Error constructing request:', error);

            // Remove loading class and show error
            if (this.productGridContainer) {
                this.productGridContainer.classList.remove('loading');
                this.productGridContainer.innerHTML = `<div class="alert alert-danger">Configuration error: ${error.message}</div>`;
            }
        }
    }

    /**
     * Handle wishlist button click
     * @param {Event} event - Click event
     * @param {HTMLElement} button - Wishlist button element
     */
    handleWishlistButtonClick(event, button) {
        // Prevent default to handle via AJAX instead of full page reload
        event.preventDefault();

        const productId = button.dataset.productId;
        const url = button.getAttribute('href');

        // Toggle wishlist heart icon
        const heartIcon = button.querySelector('i');
        const originalClass = heartIcon.className;
        heartIcon.className = 'fas fa-spinner fa-spin';

        // Send AJAX request to add/remove from wishlist
        fetch(url, {
            method: 'POST',
            headers: {
                'X-CSRFToken': this.getCookie('csrftoken'),
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // Update icon based on response
            if (data.success) {
                if (data.added) {
                    heartIcon.className = 'fas fa-heart';
                    button.classList.add('active');
                } else {
                    heartIcon.className = 'far fa-heart';
                    button.classList.remove('active');
                }
            } else {
                // If there was an error in the response
                heartIcon.className = originalClass;
                console.error('Error updating wishlist:', data.message || 'Unknown error');
            }
        })
        .catch(error => {
            console.error('Error updating wishlist:', error);
            heartIcon.className = originalClass;
        });
    }

    /**
     * Position wishlist buttons based on whether badges are present
     */
    positionWishlistButtons() {
        try {
            const productCards = document.querySelectorAll('.product-card');

            productCards.forEach(card => {
                const badges = card.querySelector('.product-badges');
                const wishlistBtn = card.querySelector('.add-to-wishlist-btn');

                if (badges && wishlistBtn) {
                    // Check if badges container has any badges
                    const hasBadges = badges.querySelectorAll('.badge').length > 0;

                    // Adjust wishlist button position based on badges presence
                    if (hasBadges) {
                        wishlistBtn.style.top = 'auto';
                        wishlistBtn.style.bottom = '10px';
                        wishlistBtn.style.right = '10px';
                    } else {
                        wishlistBtn.style.top = '10px';
                        wishlistBtn.style.bottom = 'auto';
                        wishlistBtn.style.right = '10px';
                    }
                }
            });
        } catch (err) {
            console.error('Error positioning wishlist buttons:', err);
        }
    }

    /**
     * Get CSRF cookie for AJAX requests
     * @param {string} name - Cookie name
     * @returns {string} - Cookie value
     */
    getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
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
