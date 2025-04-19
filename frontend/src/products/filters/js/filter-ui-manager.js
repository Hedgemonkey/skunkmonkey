/**
 * filter-ui-manager.js - Handles filter UI interactions and updates
 */
import { toggleElement } from '@products/utilities/js/form-utils.js';
import apiClient from '@common/js/api-client.js';

/**
 * FilterUIManager - Handles filter UI interactions and updates
 */
export class FilterUIManager {
    constructor(filterInstance) {
        this.filter = filterInstance;
        this.container = filterInstance.container;
        this.itemType = filterInstance.itemType;
        this.productCountElement = this.container.find('.product-count');
    }

    /**
     * Initialize UI management
     */
    initialize() {
        this._setupToggleEvents();
        this._setupListProductsVisibility();

        // Get initial count from server instead of hardcoding to 0
        this._loadInitialItemCount();

        // Add the product count element to the filter summary if it doesn't exist
        if (this.itemType === 'categories' && !this.productCountElement.length) {
            const filterSummary = this.container.find('#filterSummary .results-count');
            if (filterSummary.length) {
                filterSummary.append('<span class="ms-2 text-muted product-count-display d-none">| <span class="product-count">0</span> products</span>');
                this.productCountElement = this.container.find('.product-count');
            }
        }
    }

    /**
     * Load the initial item count from the server
     * @private
     */
    _loadInitialItemCount() {
        // Create a simple request to get the count
        const requestParams = {
            items_only: true,
            count_only: true  // Optional param - server can optimize if it supports this
        };

        // Use the same URL as the filter component
        apiClient.get(this.filter.filterUrl, requestParams, {
            skipGlobalErrorHandler: true
        })
        .then(response => {
            // Extract count from response
            let count = 0;
            if (response.count !== undefined) {
                count = response.count;
            } else if (response.total_count !== undefined) {
                count = response.total_count;
            } else if (typeof response === 'string' && $(response).find('.card').length > 0) {
                // If HTML response, try to count cards
                count = $(response).find('.card').length;
            }

            // Update all count displays with the initial count
            this.updateItemCountDisplays(count);
        })
        .catch(error => {
            console.warn('Error loading initial item count:', error);
            // If error, initialize to 0 as fallback
            this.updateItemCountDisplays(0);
        });
    }

    /**
     * Set up filter toggle events
     */
    _setupToggleEvents() {
        const filterToggle = this.container.find('.filter-toggle');
        const filterOptions = this.container.find('#filterOptions');

        if (!filterToggle.length || !filterOptions.length) return;

        filterToggle.on('click', (e) => {
            e.preventDefault();

            toggleElement(filterOptions, {
                onShow: () => {
                    filterToggle.addClass('active');
                    filterToggle.find('.filter-toggle-text').text('Hide Filters');
                    filterToggle.find('i').removeClass('fa-sliders-h').addClass('fa-times');
                    filterToggle.removeClass('btn-outline-primary').addClass('btn-primary');
                    filterToggle.attr('aria-expanded', 'true');
                    this.container.find('.filter-summary-category-tags').hide();

                    // Hide the collapsed version of the List Products button
                    if (this.itemType === 'categories') {
                        this.container.find('.collapsed-list-products-btn-container').addClass('d-none');
                    }
                },
                onHide: () => {
                    filterToggle.removeClass('active');
                    filterToggle.find('.filter-toggle-text').text('Show Filters');
                    filterToggle.find('i').addClass('fa-sliders-h').removeClass('fa-times');
                    filterToggle.removeClass('btn-primary').addClass('btn-outline-primary');
                    filterToggle.attr('aria-expanded', 'false');
                    this.container.find('.filter-summary-category-tags').show();

                    // Show the collapsed version of the List Products button if we have selected categories
                    if (this.itemType === 'categories') {
                        const hasSelectedCategories = this.filter.categoryManager.getSelectedCategories().length > 0;
                        this.container.find('.collapsed-list-products-btn-container')
                            .toggleClass('d-none', !hasSelectedCategories);
                    }
                }
            });
        });

        // Set up filter summary badge close handlers
        this.container.find('#filterSummary .search-summary .btn-close').on('click', (e) => {
            e.stopPropagation();
            this.container.find('.clear-search').click();
        });

        this.container.find('#filterSummary .categories-summary .btn-close').on('click', (e) => {
            e.stopPropagation();
            this.container.find('.clear-categories-btn').click();
        });
    }

    /**
     * Setup the List Products button visibility when filters are collapsed
     */
    _setupListProductsVisibility() {
        if (this.itemType !== 'categories') return;

        // Make sure the List Products button click events are synchronized
        const collapsedBtn = this.container.find('.collapsed-list-products-btn-container .list-products-btn');
        const expandedBtn = this.container.find('#expanded-list-products-btn');

        // Remove previous click handlers to avoid duplicates
        collapsedBtn.off('click');

        // When the collapsed button is clicked, trigger the expanded button's click handler
        collapsedBtn.on('click', () => {
            expandedBtn.click();
        });

        // Initial visibility state based on selected categories
        const hasSelectedCategories = this.filter.categoryManager.getSelectedCategories().length > 0;
        const isFiltersExpanded = this.container.find('#filterOptions').hasClass('show');

        this.container.find('.collapsed-list-products-btn-container')
            .toggleClass('d-none', isFiltersExpanded || !hasSelectedCategories);
    }

    /**
     * Update all item count displays with the current count
     */
    updateItemCountDisplays(count) {
        // Update the main item count in the filter summary
        this.container.find('.item-count').text(count);

        // Update any other count displays that might exist
        const searchSummary = this.container.find('.search-summary .badge');
        if (searchSummary.length) {
            searchSummary.text(`${count} ${this.itemType}`);
        }

        // Update the results count display
        this.container.find('.results-count .item-count').text(count);

        // Update product count if we're in categories view
        if (this.itemType === 'categories') {
            this._updateProductCount();
        }
    }

    /**
     * Update the product count display by fetching the count from the server
     */
    _updateProductCount() {
        const selectedCategories = this.filter.categoryManager.getSelectedCategories();

        if (!selectedCategories.length) {
            // Hide product count if no categories are selected
            this.container.find('.selected-stats').addClass('d-none');
            return;
        }

        // Fetch the product count from the server
        apiClient.get('/products/api/products/count/', {
            category: selectedCategories.join(',')
        }, {
            skipGlobalErrorHandler: true
        })
        .then(response => {
            if (response.product_count !== undefined) {
                // Update the product count display
                this.container.find('.product-count').text(response.product_count);
                this.container.find('.selected-count').text(selectedCategories.length);
                this.container.find('.selected-stats').removeClass('d-none');
            }
        })
        .catch(error => {
            console.warn('Error fetching product count:', error);
            this.container.find('.selected-stats').addClass('d-none');
        });
    }

    /**
     * Update the filter summary display
     */
    updateFilterSummary() {
        const searchValue = this.container.find('.filter-search').val();
        const categorySelection = this.filter.categoryManager.getSelectedCategories();

        const filterSummary = this.container.find('#filterSummary');
        if (!filterSummary.length) return;

        // Update search summary
        const searchSummary = filterSummary.find('.search-summary');
        if (searchValue) {
            searchSummary.removeClass('d-none');
            searchSummary.find('.search-term-summary').text(searchValue);
        } else {
            searchSummary.addClass('d-none');
        }

        // Update categories summary
        const categoriesSummary = filterSummary.find('.categories-summary');
        if (categorySelection.length > 0) {
            categoriesSummary.removeClass('d-none');
            categoriesSummary.find('.category-count-summary').text(categorySelection.length);
        } else {
            categoriesSummary.addClass('d-none');
        }

        // Update the active filters display in expanded view
        const activeFiltersDisplay = this.container.find('.active-filters .active-filter-display');
        if (activeFiltersDisplay.length) {
            const searchDisplay = activeFiltersDisplay.find('.search-display');
            const categoriesDisplay = activeFiltersDisplay.find('.categories-display');

            if (searchValue) {
                searchDisplay.removeClass('d-none');
                searchDisplay.find('.search-term').text(searchValue);
            } else {
                searchDisplay.addClass('d-none');
            }

            if (categorySelection.length > 0) {
                categoriesDisplay.removeClass('d-none');
                categoriesDisplay.find('.category-count-display').text(categorySelection.length);
            } else {
                categoriesDisplay.addClass('d-none');
            }
        }

        // Show/hide the summary
        if (searchValue || categorySelection.length > 0) {
            filterSummary.addClass('d-flex').removeClass('d-none');
        } else if (!this.container.find('#filterOptions').hasClass('show')) {
            filterSummary.removeClass('d-flex').addClass('d-none');
        }

        // Update the List Products button visibility
        if (this.itemType === 'categories') {
            const isFiltersExpanded = this.container.find('#filterOptions').hasClass('show');
            const hasSelectedCategories = categorySelection.length > 0;

            this.container.find('.collapsed-list-products-btn-container')
                .toggleClass('d-none', isFiltersExpanded || !hasSelectedCategories);

            // Also update the product count when filter summary changes
            if (hasSelectedCategories) {
                this._updateProductCount();
            } else {
                this.container.find('.selected-stats').addClass('d-none');
            }
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        const filterToggle = this.container.find('.filter-toggle');

        // Remove event handlers
        if (filterToggle.length) {
            filterToggle.off('click');
        }

        this.container.find('#filterSummary .search-summary .btn-close').off('click');
        this.container.find('#filterSummary .categories-summary .btn-close').off('click');

        // Remove List Products button event handlers
        if (this.itemType === 'categories') {
            this.container.find('.collapsed-list-products-btn-container .list-products-btn').off('click');
        }
    }
}
