/**
 * URLManager - Handles URL synchronization and browser navigation
 */
export class URLManager {
    constructor(productListManager) {
        this.plm = productListManager; // Reference to main ProductListManager
    }

    /**
     * Update the browser URL to reflect current filter state
     * @param {boolean} replace - Whether to replace current history entry or push new one
     */
    updateUrl(replace = false) {
        try {
            const url = new URL(window.location.href);
            const filterState = this.plm.filterManager.getFilterState();

            // Clear existing filter parameters
            url.searchParams.delete('search');
            url.searchParams.delete('category');
            url.searchParams.delete('sort');
            url.searchParams.delete('page'); // Reset page when filters change

            // Add current filter parameters if they have values
            if (filterState.search) {
                url.searchParams.set('search', filterState.search);
            }
            if (filterState.category) {
                url.searchParams.set('category', filterState.category);
            }
            if (filterState.sort && filterState.sort !== 'name-asc') {
                url.searchParams.set('sort', filterState.sort);
            }

            // Update browser URL without reloading the page
            if (replace) {
                window.history.replaceState({}, '', url.toString());
            } else {
                window.history.pushState({}, '', url.toString());
            }

            console.log('Updated URL to:', url.toString());
        } catch (err) {
            console.error('Error updating URL:', err);
        }
    }

    /**
     * Bind browser navigation events for URL handling
     */
    bindNavigationEvents() {
        try {
            // Handle browser back/forward navigation
            window.addEventListener('popstate', () => {
                console.log('Browser navigation detected, updating filters from URL');
                this.plm.filterManager.initializeFilterStateFromUrl();
                this.plm.uiManager.updateFilterUI();
                this.plm.productGridManager.fetchProducts();
            });
        } catch (err) {
            console.error('Error binding navigation events:', err);
        }
    }

    /**
     * Initialize from URL parameters (used for browser navigation)
     */
    initializeFromUrl() {
        this.plm.filterManager.initializeFilterStateFromUrl();
        this.syncUIWithFilters();
    }

    /**
     * Sync UI elements with current filter state
     */
    syncUIWithFilters() {
        try {
            const filterState = this.plm.filterManager.getFilterState();

            // Sync search input
            if (this.plm.searchInput) {
                this.plm.searchInput.value = filterState.search || '';
            }

            // Sync sort select
            if (this.plm.sortSelect) {
                this.plm.sortSelect.value = filterState.sort || 'name-asc';
            }

            // Sync category select
            if (this.plm.categorySelect && filterState.category) {
                const categoryIds = filterState.category.split(',').filter(c => c);

                // Clear existing selections
                Array.from(this.plm.categorySelect.options).forEach(opt => opt.selected = false);

                // Set new selections
                categoryIds.forEach(categoryId => {
                    const option = this.plm.categorySelect.querySelector(`option[value="${categoryId}"]`);
                    if (option) {
                        option.selected = true;
                    }
                });

                // Update Select2 if available
                if (typeof $ !== 'undefined' && $.fn && typeof $.fn.select2 !== 'undefined') {
                    try {
                        $(this.plm.categorySelect).trigger('change');
                    } catch (selectError) {
                        console.warn('Error syncing Select2:', selectError);
                    }
                }
            }
        } catch (err) {
            console.error('Error syncing UI with filters:', err);
        }
    }
}
