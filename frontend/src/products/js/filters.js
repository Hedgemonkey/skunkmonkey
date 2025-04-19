/**
 * filters.js - Reusable filtering component for product and category management
 * Refactored to use a modular approach with utility modules and ApiClient
 */
import 'select2';
import $ from 'jquery';
import apiClient from '@common/js/api-client.js';
import notifications from '@products/utilities/js/notifications.js';
import { setDisabledState } from '@products/utilities/js/form-utils.js';
import { CategoryFilterManager } from '@products/filters/js/category-filter-manager.js';
import { FilterUIManager } from '@products/filters/js/filter-ui-manager.js';

/**
 * ItemFilter - Handles item filtering and category selection
 */
export class ItemFilter {
    /**
     * Initialize the filter component
     * @param {Object} options - Configuration options
     * @param {string} options.containerId - ID of the container element
     * @param {string} options.filterUrl - URL to fetch filtered items
     * @param {Function} [options.onUpdate] - Callback after filter update
     * @param {number} [options.searchDelay=300] - Debounce delay for search
     * @param {string} [options.itemType='products'] - Type of items being filtered
     * @param {boolean} [options.filterOnCategorySelect=true] - Whether to filter when categories change
     */
    constructor(options) {
        // Core settings
        this.containerId = options.containerId;
        this.filterUrl = options.filterUrl;
        this.onUpdate = options.onUpdate || function() {};
        this.searchDelay = options.searchDelay || 300;
        this.itemType = options.itemType || 'products';
        this.filterOnCategorySelect = options.filterOnCategorySelect !== undefined ?
            options.filterOnCategorySelect : true;

        // State management
        this.container = $(`#${this.containerId}`);
        this.searchTimeout = null;
        this.pendingRequest = null;
        this.lastFilteredValue = '';

        // Initialize specialized managers
        this.categoryManager = new CategoryFilterManager(this);
        this.uiManager = new FilterUIManager(this);

        // Initialize components
        this._initialize();
    }

    // -------------------------------------------------------------------------
    // Initialization Methods
    // -------------------------------------------------------------------------

    /**
     * Initialize all components
     * @private
     */
    _initialize() {
        this.categoryManager.initialize();
        this.uiManager.initialize();
        this._initializeEventListeners();

        // Initial filter to load data with applied filters
        // This ensures any pre-selected categories or search terms are applied
        this.filterItems();
    }

    /**
     * Initialize all event listeners
     * @private
     */
    _initializeEventListeners() {
        this._setupSearchEvents();
        this._setupSortEvents();
        this._setupResetEvents();
        this._setupListProductsEvent();
    }

    // -------------------------------------------------------------------------
    // Event Handling Methods
    // -------------------------------------------------------------------------

    /**
     * Set up search-related events
     * @private
     */
    _setupSearchEvents() {
        const searchSelector = '.filter-search';

        // Use event delegation for better performance
        this.container.on('input', searchSelector, this._handleSearchInput.bind(this));
        this.container.on('click', '.clear-search', this._handleClearSearch.bind(this));
    }

    /**
     * Handle search input events with debounce
     * @private
     * @param {Event} e - The input event
     */
    _handleSearchInput(e) {
        const searchInput = $(e.currentTarget);
        const currentValue = searchInput.val();

        // Only trigger search if value has changed
        if (currentValue !== this.lastFilteredValue) {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.lastFilteredValue = currentValue;
                this.filterItems();
            }, this.searchDelay);
        }
    }

    /**
     * Handle clear search button clicks
     * @private
     */
    _handleClearSearch() {
        this.container.find('.filter-search').val('');
        this.lastFilteredValue = '';
        this.filterItems();
    }

    /**
     * Set up sort-related events
     * @private
     */
    _setupSortEvents() {
        this.container.on('change', '.filter-sort', () => {
            this.filterItems();
        });
    }

    /**
     * Set up reset-related events
     * @private
     */
    _setupResetEvents() {
        this.container.on('click', '.reset-all-filters', () => {
            const clearSearchBtn = this.container.find('.clear-search');
            const clearCategoriesBtn = this.container.find('.clear-categories-btn');

            if (clearSearchBtn.length) clearSearchBtn.click();
            if (clearCategoriesBtn.length) clearCategoriesBtn.click();
        });
    }

    /**
     * Set up List Products button for category view
     * @private
     */
    _setupListProductsEvent() {
        this.container.on('click', '.list-products-btn', () => {
            const selectedCategories = this.categoryManager.getSelectedCategories();
            if (selectedCategories.length > 0) {
                // Redirect to products view with selected categories
                window.location.href = `/products/staff/management/?category=${selectedCategories.join(',')}`;

                // Ensure the Product accordion is open
                setTimeout(() => {
                    $('#product-list-section').addClass('show');
                    $('#products-header button').attr('aria-expanded', 'true').removeClass('collapsed');

                    // Scroll to the product section
                    $('html, body').animate({
                        scrollTop: $('#products-header').offset().top - 100
                    }, 500);
                }, 300);
            } else {
                notifications.displayWarning('Please select at least one category first.');
            }
        });
    }

    // -------------------------------------------------------------------------
    // Filtering Methods
    // -------------------------------------------------------------------------

    /**
     * Filter items based on current filter settings
     */
    filterItems() {
        // Cancel any pending request
        this._cancelPendingRequest();

        // Gather filter parameters
        const requestParams = this._buildRequestParams();

        // Update UI before sending request
        this.uiManager.updateFilterSummary();
        this._showLoading(true);

        // Save search field focus state
        const focusState = this._captureSearchFieldState();

        // Make the request using ApiClient
        this._makeFilterRequest(requestParams, focusState);
    }

    /**
     * Cancel any pending filter request
     * @private
     */
    _cancelPendingRequest() {
        // If there's a pending request reference, abort it
        if (this.pendingRequest) {
            // Try using ApiClient's abort method first
            if (apiClient.pendingRequests && apiClient.pendingRequests.includes(this.pendingRequest)) {
                apiClient.removePendingRequest(this.pendingRequest);
                if (typeof this.pendingRequest.abort === 'function') {
                    this.pendingRequest.abort();
                }
            }
            // Fallback to direct abort if needed
            else if (typeof this.pendingRequest.abort === 'function') {
                this.pendingRequest.abort();
            }

            this.pendingRequest = null;
        }
    }

    /**
     * Build request parameters for filtering
     * @private
     * @returns {Object} Request parameters
     */
    _buildRequestParams() {
        const currentInputValue = this.container.find('.filter-search').val();
        const selectedCategories = this.categoryManager.getSelectedCategories();
        const categoryParam = selectedCategories.join(',');

        const requestParams = {
            search: currentInputValue,
            sort: this.container.find('.filter-sort').val(),
            items_only: true
        };

        // Only include category parameter for product filtering, not for category filtering
        // This way, when on the categories page, we'll show all categories regardless of which ones are selected
        if (categoryParam && this.itemType !== 'categories') {
            requestParams.category = categoryParam;
        }

        // Debug logging to help track what parameters are being sent
        console.log(`Building filter params for ${this.itemType}:`, requestParams);

        return requestParams;
    }

    /**
     * Capture the current state of the search field for restoring later
     * @private
     * @returns {Object} The search field state
     */
    _captureSearchFieldState() {
        const searchField = this.container.find('.filter-search');
        const wasSearchFocused = document.activeElement === searchField[0];

        return {
            field: searchField,
            wasFocused: wasSearchFocused,
            selectionStart: wasSearchFocused ? searchField[0].selectionStart : null,
            selectionEnd: wasSearchFocused ? searchField[0].selectionEnd : null
        };
    }

    /**
     * Make the filter request to the server using ApiClient
     * @private
     * @param {Object} requestParams - The filter parameters
     * @param {Object} focusState - The search field focus state
     */
    _makeFilterRequest(requestParams, focusState) {
        // Use ApiClient.get with Promise handling
        this.pendingRequest = apiClient.get(this.filterUrl, requestParams, {
            // Skip global error handler as we'll handle errors here
            skipGlobalErrorHandler: true
        })
        .then(response => {
            this._handleFilterSuccess(response, focusState);
        })
        .catch(error => {
            this._handleFilterError(error, focusState);
        })
        .finally(() => {
            // This will execute regardless of success or failure
            this.pendingRequest = null;
        });
    }

    /**
     * Handle successful filter response
     * @private
     * @param {Object|string} response - The server response
     * @param {Object} focusState - The search field focus state
     */
    _handleFilterSuccess(response, focusState) {
        try {
            this._processSuccessfulResponse(response);
        } catch (error) {
            console.error('Error processing filter results:', error);
        } finally {
            this._finishFilterRequest(focusState);
        }
    }

    /**
     * Handle filter request error
     * @private
     * @param {Object} error - The error object
     * @param {Object} focusState - The search field focus state
     */
    _handleFilterError(error, focusState) {
        if (error.statusText !== 'abort') {
            console.error(`Error fetching ${this.itemType}:`, error);
            notifications.displayError(`Failed to filter ${this.itemType}. Please try again.`);
        }
        this._finishFilterRequest(focusState);
    }

    /**
     * Common cleanup after filter request completes
     * @private
     * @param {Object} focusState - The search field focus state
     */
    _finishFilterRequest(focusState) {
        this._showLoading(false);

        // Restore search field focus if it was focused before
        if (focusState.wasFocused) {
            focusState.field.focus();
            if (focusState.selectionStart !== null && focusState.selectionEnd !== null) {
                focusState.field[0].setSelectionRange(
                    focusState.selectionStart,
                    focusState.selectionEnd
                );
            }
        }
    }

    /**
     * Process a successful API response
     * @private
     * @param {Object|string} response - The server response
     */
    _processSuccessfulResponse(response) {
        // Find the proper container to update based on the item type
        let itemContainer;

        if (this.itemType === 'categories') {
            // Try to find the category cards grid first
            itemContainer = $('#category-cards-grid');

            // If not found, try to locate it within our container
            if (!itemContainer.length) {
                itemContainer = this.container.find('#category-cards-grid');
            }

            // Fallback to the filtered-items container if it exists
            if (!itemContainer.length) {
                itemContainer = this.container.find('.filtered-items');
            }
        } else {
            // Try to find the product cards grid first
            itemContainer = $('#product-cards-grid');

            // If not found, try to locate it within our container
            if (!itemContainer.length) {
                itemContainer = this.container.find('#product-cards-grid');
            }

            // Fallback to the filtered-items container if it exists
            if (!itemContainer.length) {
                itemContainer = this.container.find('.filtered-items');
            }
        }

        // If we still don't have a container, fall back to the main container
        if (!itemContainer.length) {
            console.warn(`Could not find specific container for ${this.itemType}, using main container`);
            itemContainer = this.container;
        }

        // Update the content with the new HTML
        if (response.html) {
            itemContainer.html(response.html);
            console.log(`Updated ${this.itemType} HTML content from response.html`);
        } else if (typeof response === 'string') {
            itemContainer.html(response);
            console.log(`Updated ${this.itemType} HTML content from string response`);
        } else {
            console.warn(`No HTML content found in response for ${this.itemType}`);
        }

        // Get item count using the most reliable method available
        const itemCount = this._extractItemCount(response, itemContainer);

        // Update count displays
        this.uiManager.updateItemCountDisplays(itemCount);

        // Call the onUpdate callback if provided
        if (typeof this.onUpdate === 'function') {
            this.onUpdate(response);
        }

        console.log(`Updated ${this.itemType} container with new content. Count: ${itemCount}`);
    }

    /**
     * Extract the item count from the response using multiple fallback strategies
     * @private
     * @param {Object|string} response - The server response
     * @param {jQuery} container - The items container
     * @returns {number} The item count
     */
    _extractItemCount(response, container) {
        // Try API response properties first
        if (response.count !== undefined) {
            return response.count;
        } else if (response.total_count !== undefined) {
            return response.total_count;
        }

        // Fallback to counting DOM elements
        return this._countItemsInContainer(container);
    }

    /**
     * Count items in the container as a fallback
     * @private
     * @param {jQuery} container - The items container
     * @returns {number} The item count
     */
    _countItemsInContainer(container) {
        // Try to count items based on common selectors
        const itemSelectors = ['.card', '.item', '.product-card', '.category-card'];

        for (const selector of itemSelectors) {
            const count = container.find(selector).length;
            if (count > 0) return count;
        }

        return 0;
    }

    /**
     * Show or hide loading state
     * @private
     * @param {boolean} show - Whether to show loading state
     */
    _showLoading(show) {
        setDisabledState(this.container, '.filter-sort', show);
        // Don't disable the search field to prevent focus issues
        this.container.find('.filter-loading').toggleClass('loading', show);
    }

    // -------------------------------------------------------------------------
    // Public API Methods
    // -------------------------------------------------------------------------

    /**
     * Public method to apply saved categories (used by CategoryManager)
     */
    preloadCategories() {
        this.categoryManager.applySavedCategories();
    }

    /**
     * Clean up resources to prevent memory leaks
     */
    destroy() {
        // Clear timeouts
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Abort any pending request
        if (this.pendingRequest) {
            this.pendingRequest.abort();
        }

        // Remove event handlers
        this.container.off('input', '.filter-search');
        this.container.off('click', '.clear-search');
        this.container.off('change', '.filter-sort');
        this.container.off('click', '.reset-all-filters');
        this.container.off('click', '.list-products-btn');

        // Destroy managers
        this.categoryManager.destroy();
        this.uiManager.destroy();
    }
}
