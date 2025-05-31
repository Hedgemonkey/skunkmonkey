/**
 * UIManager - Handles all UI updates and display logic
 */
export class UIManager {
    constructor(productListManager) {
        this.plm = productListManager; // Reference to main ProductListManager
    }

    /**
     * Initialize all DOM element references for filtering
     */
    initializeFilterDomReferences() {
        // Essential elements
        this.plm.productGridContainer = document.getElementById('product-grid-container');

        // Filter elements
        this.plm.searchInput = document.querySelector('.filter-search');
        this.plm.sortSelect = document.querySelector('.filter-sort');
        this.plm.categorySelect = document.querySelector('.filter-category');
        this.plm.clearSearchBtn = document.querySelector('.clear-search');
        this.plm.resetAllBtn = document.querySelector('.reset-all-filters');
        this.plm.filterToggleBtn = document.querySelector('.filter-toggle');
        this.plm.filterOptions = document.getElementById('filterOptions');

        // Display elements
        this.plm.searchDisplay = document.querySelector('.search-display');
        this.plm.searchTerm = document.querySelector('.search-term');
        this.plm.searchTermSummary = document.querySelector('.search-term-summary');
        this.plm.searchSummary = document.querySelector('.search-summary');
        this.plm.categoriesDisplay = document.querySelector('.categories-display');
        this.plm.categoryCountDisplay = document.querySelector('.category-count-display');
        this.plm.categoriesSummary = document.querySelector('.categories-summary');
        this.plm.categoryCountSummary = document.querySelector('.category-count-summary');
        this.plm.categoryTagsContainer = document.getElementById('selectedCategoriesTags');
        this.plm.clearCategoriesBtn = document.querySelector('.clear-categories-btn');
        this.plm.itemCountDisplay = document.querySelector('.item-count');
        this.plm.productCountDisplay = document.getElementById('product-count');
    }

    /**
     * Update UI elements based on current filter state
     */
    updateFilterUI() {
        try {
            const filterState = this.plm.filterManager.getFilterState();

            // Update search display
            if (this.plm.searchTerm) this.plm.searchTerm.textContent = filterState.search;
            if (this.plm.searchTermSummary) this.plm.searchTermSummary.textContent = filterState.search;
            if (this.plm.searchDisplay) this.plm.searchDisplay.classList.toggle('d-none', !filterState.search);
            if (this.plm.searchSummary) this.plm.searchSummary.classList.toggle('d-none', !filterState.search);

            // Update category display with validation
            const categoryIds = filterState.category ? filterState.category.split(',').filter(c => c) : [];
            const categoryCount = categoryIds.length;

            if (this.plm.categoryCountDisplay) this.plm.categoryCountDisplay.textContent = categoryCount;
            if (this.plm.categoryCountSummary) this.plm.categoryCountSummary.textContent = categoryCount;
            if (this.plm.categoriesDisplay) this.plm.categoriesDisplay.classList.toggle('d-none', categoryCount === 0);
            if (this.plm.categoriesSummary) this.plm.categoriesSummary.classList.toggle('d-none', categoryCount === 0);

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
            if (!this.plm.categoryTagsContainer) return;

            const filterState = this.plm.filterManager.getFilterState();
            const categoryIds = filterState.category ? filterState.category.split(',').filter(c => c) : [];

            // Clear existing tags
            this.plm.categoryTagsContainer.innerHTML = '';

            // Add tag for each selected category
            categoryIds.forEach(categoryId => {
                if (!categoryId) return;

                // Find category name from select options
                let categoryName = categoryId;
                if (this.plm.categorySelect) {
                    const option = this.plm.categorySelect.querySelector(`option[value="${categoryId}"]`);
                    if (option) {
                        categoryName = option.textContent.trim();
                    }
                }

                // Create tag element
                const tag = document.createElement('span');
                tag.className = 'badge bg-primary me-2 mb-2 category-tag';
                tag.innerHTML = `
                    ${this.escapeHtml(categoryName)}
                    <button type="button" class="btn-close btn-close-white ms-2 tag-remove"
                            data-category-id="${this.escapeHtml(categoryId)}"
                            aria-label="Remove category">
                    </button>
                `;

                this.plm.categoryTagsContainer.appendChild(tag);
            });
        } catch (err) {
            console.error('Error updating category tags:', err);
        }
    }

    /**
     * Toggle filter visibility
     */
    handleFilterToggle() {
        try {
            if (!this.plm.filterOptions) return;

            const isCollapsed = this.plm.filterOptions.classList.contains('show');
            this.plm.filterOptions.classList.toggle('show');

            if (this.plm.filterToggleBtn) {
                this.plm.filterToggleBtn.classList.toggle('collapsed', !isCollapsed);
                this.plm.filterToggleBtn.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');

                const toggleText = this.plm.filterToggleBtn.querySelector('.filter-toggle-text');
                if (toggleText) {
                    toggleText.textContent = isCollapsed ? 'Show Filters' : 'Hide Filters';
                }
            }
        } catch (err) {
            console.error('Error toggling filter visibility:', err);
        }
    }

    /**
     * Position wishlist buttons based on whether badges are present
     */
    positionWishlistButtons() {
        try {
            const productCards = document.querySelectorAll('.product-card');

            productCards.forEach(card => {
                const wishlistBtn = card.querySelector('.add-to-wishlist-btn, .remove-wishlist-btn');
                const badge = card.querySelector('.badge');

                if (wishlistBtn) {
                    // Remove any existing positioning classes
                    wishlistBtn.classList.remove('top-badge', 'top-no-badge');

                    if (badge && !badge.classList.contains('d-none')) {
                        // Badge is present and visible - position below badge
                        wishlistBtn.classList.add('top-badge');
                    } else {
                        // No badge or badge is hidden - position at top
                        wishlistBtn.classList.add('top-no-badge');
                    }
                }
            });
        } catch (err) {
            console.error('Error positioning wishlist buttons:', err);
        }
    }

    /**
     * Show loading state on product grid
     */
    showLoading() {
        if (this.plm.productGridContainer) {
            this.plm.productGridContainer.classList.add('loading');
        }
    }

    /**
     * Hide loading state on product grid
     */
    hideLoading() {
        if (this.plm.productGridContainer) {
            this.plm.productGridContainer.classList.remove('loading');
        }
    }

    /**
     * Update product count display
     */
    updateProductCount(count) {
        try {
            if (this.plm.itemCountDisplay) {
                this.plm.itemCountDisplay.textContent = count;
            }
            if (this.plm.productCountDisplay) {
                this.plm.productCountDisplay.textContent = count;
            }
        } catch (err) {
            console.error('Error updating product count:', err);
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

    /**
     * Check if essential filter elements are present
     */
    hasEssentialFilterElements() {
        if (!this.plm.productGridContainer) {
            console.warn('Product List Manager: product-grid-container not found in the DOM');
            return false;
        }
        return true;
    }
}
