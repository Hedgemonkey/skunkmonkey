/**
 * FilterManager - Handles all filtering logic and state management
 */
export class FilterManager {
    constructor(productListManager) {
        this.plm = productListManager; // Reference to main ProductListManager
        this.filterState = {
            search: '',
            category: '',
            sort: 'name-asc'
        };
        this.searchTimer = null;
    }

    /**
     * Initialize filter state from URL parameters and fallback to data attributes
     */
    initializeFilterStateFromUrl() {
        try {
            const urlParams = new URLSearchParams(window.location.search);

            // Get values from URL first, then fallback to data attributes
            this.filterState = {
                search: urlParams.get('search') || (this.plm.filterContainer?.dataset.searchQuery || '').trim(),
                category: urlParams.get('category') || (this.plm.filterContainer?.dataset.currentCategory || '').trim(),
                sort: urlParams.get('sort') || 'name-asc'
            };

            console.log('Initialized filter state from URL:', this.filterState);
        } catch (err) {
            console.error('Error initializing filter state from URL:', err);
            // Fallback to data attributes
            this.filterState = {
                search: (this.plm.filterContainer?.dataset.searchQuery || '').trim(),
                category: (this.plm.filterContainer?.dataset.currentCategory || '').trim(),
                sort: 'name-asc'
            };
        }
    }

    /**
     * Handle search input changes
     */
    handleSearchInput(event) {
        try {
            this.filterState.search = event.target.value;
            this.plm.uiManager.updateFilterUI();

            // Debounce for performance
            clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => {
                this.plm.urlManager.updateUrl();
                this.plm.productGridManager.fetchProducts();
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
            this.plm.uiManager.updateFilterUI();
            this.plm.urlManager.updateUrl();
            this.plm.productGridManager.fetchProducts();
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
            this.plm.uiManager.updateFilterUI();
            this.plm.urlManager.updateUrl();
            this.plm.productGridManager.fetchProducts();
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
            if (this.plm.searchInput) this.plm.searchInput.value = '';
            this.plm.uiManager.updateFilterUI();
            this.plm.urlManager.updateUrl();
            this.plm.productGridManager.fetchProducts();
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

            if (this.plm.categorySelect) {
                if (typeof $ !== 'undefined' && $.fn && typeof $.fn.select2 !== 'undefined') {
                    try {
                        $(this.plm.categorySelect).val(null).trigger('change');
                    } catch (selectError) {
                        console.warn('Error with Select2 clearing:', selectError);
                        // Fallback to standard DOM operation if Select2 fails
                        Array.from(this.plm.categorySelect.options).forEach(opt => opt.selected = false);
                    }
                } else {
                    Array.from(this.plm.categorySelect.options).forEach(opt => opt.selected = false);
                }
            }

            this.plm.uiManager.updateFilterUI();
            this.plm.urlManager.updateUrl();
            this.plm.productGridManager.fetchProducts();
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

            if (this.plm.searchInput) this.plm.searchInput.value = '';

            if (this.plm.sortSelect) {
                this.plm.sortSelect.value = 'name-asc';
            }

            if (this.plm.categorySelect) {
                if (typeof $ !== 'undefined' && $.fn && typeof $.fn.select2 !== 'undefined') {
                    try {
                        $(this.plm.categorySelect).val(null).trigger('change');
                    } catch (selectError) {
                        console.warn('Error with Select2 resetting:', selectError);
                        // Fallback
                        Array.from(this.plm.categorySelect.options).forEach(opt => opt.selected = false);
                    }
                } else {
                    Array.from(this.plm.categorySelect.options).forEach(opt => opt.selected = false);
                }
            }

            this.plm.uiManager.updateFilterUI();
            this.plm.urlManager.updateUrl();
            this.plm.productGridManager.fetchProducts();
        } catch (err) {
            console.error('Error resetting filters:', err);
        }
    }

    /**
     * Remove a specific category by ID
     */
    removeCategoryById(categoryId) {
        try {
            const categoryIds = this.filterState.category ? this.filterState.category.split(',').filter(c => c) : [];
            const updatedCategories = categoryIds.filter(id => id !== categoryId);
            this.filterState.category = updatedCategories.join(',');

            // Update the select element if present
            if (this.plm.categorySelect) {
                const option = this.plm.categorySelect.querySelector(`option[value="${categoryId}"]`);
                if (option) {
                    option.selected = false;
                }

                // Update Select2 if available
                if (typeof $ !== 'undefined' && $.fn && typeof $.fn.select2 !== 'undefined') {
                    try {
                        $(this.plm.categorySelect).trigger('change');
                    } catch (selectError) {
                        console.warn('Error triggering Select2 change:', selectError);
                    }
                }
            }

            this.plm.uiManager.updateFilterUI();
            this.plm.urlManager.updateUrl();
            this.plm.productGridManager.fetchProducts();
        } catch (err) {
            console.error('Error removing category:', err);
        }
    }

    /**
     * Get current filter state
     */
    getFilterState() {
        return { ...this.filterState };
    }

    /**
     * Set filter state (useful for URL navigation)
     */
    setFilterState(newState) {
        this.filterState = { ...this.filterState, ...newState };
    }

    /**
     * Initialize filter controls
     */
    initializeFilterControls() {
        try {
            // Initialize sorting
            const urlParams = new URLSearchParams(window.location.search);
            const sortParam = urlParams.get('sort');

            if (this.plm.sortSelect && sortParam) {
                this.plm.sortSelect.value = sortParam;
                this.filterState.sort = sortParam;
            }

            // Initialize category select if using a multi-select plugin
            if (this.plm.categorySelect) {
                if (typeof $ !== 'undefined' && $.fn && typeof $.fn.select2 !== 'undefined') {
                    try {
                        $(this.plm.categorySelect).select2({
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
            if (this.plm.searchInput) {
                this.plm.searchInput.addEventListener('input', this.handleSearchInput.bind(this));
            }

            if (this.plm.sortSelect) {
                this.plm.sortSelect.addEventListener('change', this.handleSortChange.bind(this));
            }

            if (this.plm.categorySelect) {
                this.plm.categorySelect.addEventListener('change', this.handleCategoryChange.bind(this));
            }

            if (this.plm.clearSearchBtn) {
                this.plm.clearSearchBtn.addEventListener('click', this.handleClearSearch.bind(this));
            }

            if (this.plm.clearCategoriesBtn) {
                this.plm.clearCategoriesBtn.addEventListener('click', this.handleClearCategories.bind(this));
            }

            if (this.plm.resetAllBtn) {
                this.plm.resetAllBtn.addEventListener('click', this.handleResetAll.bind(this));
            }

            if (this.plm.filterToggleBtn) {
                this.plm.filterToggleBtn.addEventListener('click', this.handleFilterToggle.bind(this));
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
     * Toggle filter visibility
     */
    handleFilterToggle() {
        try {
            if (this.plm.filterContainer) {
                this.plm.filterContainer.classList.toggle('show');
            }
        } catch (err) {
            console.error('Error toggling filter:', err);
        }
    }
}
