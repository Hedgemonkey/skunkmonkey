/**
 * filters.js - Reusable filtering component for product and category management
 * 
 * Provides filtering, category selection, and persistent selection features
 * with Select2 integration and responsive UI feedback.
 */
import 'select2';
import { makeAjaxRequest } from '../../../static/js/ajax_helper.js';
import Swal from 'sweetalert2';

/**
 * ItemFilter - A reusable class for handling item filtering and category selection
 */
export class ItemFilter {
    /**
     * Create a new ItemFilter instance
     * @param {Object} options - Configuration options
     * @param {string} options.containerId - The ID of the container element
     * @param {string} options.filterUrl - The URL to fetch filtered items
     * @param {Function} options.onUpdate - Callback function when items are updated
     * @param {number} options.searchDelay - Delay in ms before triggering search
     * @param {string} options.itemType - Type of items ('products' or 'categories')
     * @param {boolean} options.filterOnCategorySelect - Whether to filter when categories are selected
     * @param {string} options.navToProductsUrl - URL for navigating to products view
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
        this.navToProductsUrl = options.navToProductsUrl || '/products/staff/';
        
        // State management
        this.container = $(`#${this.containerId}`);
        this.searchTimeout = null;
        this.pendingRequest = null;
        this.searchInputValue = '';
        this.processingCategoryClick = false;
        this.categoriesLoaded = false;
        
        // Initialize category data
        this.selectedCategories = this.getSavedCategories() || [];
        this.allCategories = [];
        
        // Initialization sequence
        this.initializeSelect2();
        this.preloadCategories();
        this.initializeEventListeners();
    }

    /**
     * Save selected categories to localStorage
     * @param {Array} categories - Array of category IDs to save
     */
    saveCategories(categories) {
        // Normalize to strings for consistent storage
        const normalizedCategories = categories.map(id => id.toString());
        this.selectedCategories = normalizedCategories;
        localStorage.setItem('selectedCategories', JSON.stringify(normalizedCategories));
    }

    /**
     * Get saved categories from localStorage
     * @returns {Array} Array of category IDs
     */
    getSavedCategories() {
        const savedCategories = localStorage.getItem('selectedCategories');
        return savedCategories ? JSON.parse(savedCategories) : [];
    }

    /**
     * Clear all selected categories
     */
    clearCategories() {
        const selectElement = this.container.find('.filter-category');
        
        // Clear the selection in localStorage
        localStorage.removeItem('selectedCategories');
        this.selectedCategories = [];
        
        // Update the UI
        selectElement.val([]).trigger('change');
        this.container.find('.category-count').text('0');
        $('.category-header').removeClass('selected bg-primary text-white').addClass('bg-light');
        
        // Trigger filtering if needed
        if (this.filterOnCategorySelect) {
            this.filterItems();
        }
    }

    /**
     * Preload all categories for performance
     */
    preloadCategories() {
        // Skip if there's no category filter
        if (this.container.find('.filter-category').length === 0) {
            return;
        }
        
        makeAjaxRequest(
            '/products/api/categories/search/',
            'GET',
            { search: '', limit: 100 },
            (data) => {
                this.allCategories = data.categories || [];
                this.categoriesLoaded = true;
                
                const selectElement = this.container.find('.filter-category');
                const currentSelection = selectElement.val() || [];
                
                // Add options for each category
                this.allCategories.forEach(category => {
                    if (selectElement.find(`option[value="${category.id}"]`).length === 0) {
                        const newOption = new Option(category.name, category.id, false, false);
                        selectElement.append(newOption);
                    }
                });
                
                // Restore selection
                selectElement.val(currentSelection).trigger('change');
                
                console.log('Categories preloaded successfully:', this.allCategories.length);
            },
            (error) => {
                console.error('Failed to preload categories:', error);
            }
        );
    }

    /**
     * Initialize Select2 with custom templates and event handlers
     */
    initializeSelect2() {
        // Skip if there's no category filter
        if (this.container.find('.filter-category').length === 0) {
            return;
        }
        
        const selectElement = this.container.find('.filter-category');
        
        // Configure Select2
        selectElement.select2({
            theme: 'bootstrap-5',
            width: '100%',
            multiple: true,
            allowClear: true,
            closeOnSelect: false,
            placeholder: 'Select or search categories',
            minimumInputLength: 0,
            minimumResultsForSearch: 0,
            templateResult: this.formatCategoryOption,
            ajax: {
                delay: 250,
                url: '/products/api/categories/search/',
                data: function (params) {
                    return {
                        search: params.term || '',
                        page: params.page || 1
                    };
                },
                processResults: function (data) {
                    return {
                        results: data.categories.map(category => ({
                            id: category.id,
                            text: category.name,
                            selected: false
                        })),
                        pagination: {
                            more: data.has_more
                        }
                    };
                },
                cache: true
            }
        });

        // Handle checkbox clicks in dropdown
        this.setupCheckboxHandlers();
        
        // Update checkboxes when dropdown opens
        this.setupDropdownOpenHandler(selectElement);
    }
    
    /**
     * Format category options with checkboxes for Select2
     */
    formatCategoryOption(category) {
        if (!category.id) {
            return category.text;
        }
        
        return $(`
            <div class="select2-result-category">
                <input type="checkbox" class="form-check-input me-2" id="category-${category.id}" 
                       ${category.selected ? 'checked' : ''}>
                <label for="category-${category.id}">${category.text}</label>
            </div>
        `);
    }
    
    /**
     * Set up handlers for checkbox clicks in Select2 dropdown
     */
    setupCheckboxHandlers() {
        $(document).off('click', '.select2-result-category input[type="checkbox"]')
            .on('click', '.select2-result-category input[type="checkbox"]', (e) => {
                e.stopPropagation();
                
                const checkbox = $(e.currentTarget);
                const id = checkbox.attr('id').replace('category-', '');
                const selectElement = $('.filter-category');
                const currentSelection = selectElement.val() || [];
                
                let newSelection = [...currentSelection];
                
                if (checkbox.is(':checked') && !newSelection.includes(id)) {
                    newSelection.push(id);
                } else if (!checkbox.is(':checked')) {
                    newSelection = newSelection.filter(value => value !== id);
                }
                
                selectElement.val(newSelection).trigger('change');
            });
    }
    
    /**
     * Set up handler for Select2 dropdown open event
     */
    setupDropdownOpenHandler(selectElement) {
        selectElement.on('select2:open', function() {
            const selectedValues = $(this).val() || [];
            
            setTimeout(() => {
                $('.select2-result-category input[type="checkbox"]').each(function() {
                    const id = $(this).attr('id').replace('category-', '');
                    $(this).prop('checked', selectedValues.includes(id));
                });
            }, 50);
        });
    }

    /**
     * Initialize all event listeners for filtering and interaction
     */
    initializeEventListeners() {
        const self = this;

        // Search with debounce - track every input change immediately
        this.container.on('input', '.filter-search', function() {
            // Store the current value immediately after each keystroke
            self.searchInputValue = $(this).val();
            
            // Reset the timer for each keystroke
            clearTimeout(self.searchTimeout);
            self.searchTimeout = setTimeout(() => {
                self.filterItems();
            }, self.searchDelay);
        });

        // Clear search
        this.container.on('click', '.clear-search', function() {
            self.container.find('.filter-search').val('');
            self.searchInputValue = '';
            self.filterItems();
        });

        // Category filter changes (when using the dropdown)
        if (this.container.find('.filter-category').length > 0) {
            // Get stored selection from localStorage
            const savedCategories = this.getSavedCategories();
            const selectElement = this.container.find('.filter-category');
            
            // Apply saved categories if we have any
            if (savedCategories && savedCategories.length > 0) {
                // Set values and update UI
                selectElement.val(savedCategories);
                
                // Trigger change to update display
                try {
                    selectElement.trigger('change.select2');
                } catch (e) {
                    selectElement.trigger('change');
                }
                
                // Update the count display
                this.container.find('.category-count').text(savedCategories.length);
                
                // Update category headers to reflect selection state
                this.updateCategoryHeaderStyles();
            }
            
            // Register change listener
            selectElement.on('change', function() {
                // Update the stored selection
                const newSelection = $(this).val() || [];
                self.selectedCategories = newSelection;
                
                // Save to localStorage for persistence
                self.saveCategories(newSelection);
                
                // Update category headers in cards to reflect selection state
                self.updateCategoryHeaderStyles();
                
                // Update the count display
                self.container.find('.category-count').text(newSelection.length);
                
                // Only filter if we're configured to filter on category selection
                if (self.filterOnCategorySelect) {
                    self.filterItems();
                }
            });
            
            // New: Clear categories button
            this.container.on('click', '.clear-categories-btn', function() {
                selectElement.val([]).trigger('change');
                self.saveCategories([]);
                self.container.find('.category-count').text('0');
                self.updateCategoryHeaderStyles();
                
                if (self.filterOnCategorySelect) {
                    self.filterItems();
                }
            });
            
            // New: List products button
            this.container.on('click', '.list-products-btn', function() {
                const selectedCategories = self.selectedCategories;
                
                if (!selectedCategories || selectedCategories.length === 0) {
                    Swal.fire({
                        icon: 'info',
                        title: 'No Categories Selected',
                        text: 'Please select at least one category to list its products.',
                        confirmButtonText: 'OK'
                    });
                    return;
                }
                
                // Navigate to products tab with the categories pre-selected
                // First, ensure the selection is saved
                self.saveCategories(selectedCategories);
                
                // Switch to the products tab
                // Find and click the Products accordion button
                $('#products-header .accordion-button').click();
            });
        }

        // Sort items
        this.container.on('change', '.filter-sort', function() {
            self.filterItems();
        });
        
        // Handle clicks on category headers in cards
        $(document).off('click', '.category-header').on('click', '.category-header', function(e) {
            if (self.itemType !== 'categories') return; // Only handle in categories view
        
            // Prevent clicks on buttons from triggering category selection
            if ($(e.target).closest('.btn-group').length || $(e.target).closest('.btn').length) {
                return;
            }
        
            e.preventDefault();
            e.stopPropagation();
        
            // Prevent rapid double-clicks
            if ($(this).data('processing') === true) {
                return;
            }
            $(this).data('processing', true);
        
            const categoryId = $(this).data('category-id').toString();
            const categoryName = $(this).find('.category-title').text();
            const categoryCard = $(this);
            const selectElement = self.container.find('.filter-category');
            
            // Get current selection - make sure to map to strings
            let currentSelection = (self.selectedCategories || []).map(id => id.toString());
            
            // Determine if we're adding or removing
            const isSelected = currentSelection.includes(categoryId);
            
            // Clone the selection array so we're not modifying the original directly
            let newSelection = [...currentSelection];
            
            if (isSelected) {
                // Remove from selection
                newSelection = newSelection.filter(id => id !== categoryId);
                
                // Update visual state immediately for responsive feel
                categoryCard.removeClass('selected bg-primary text-white').addClass('bg-light');
            } else {
                // Add to selection
                newSelection.push(categoryId);
                
                // Update visual state immediately for responsive feel
                categoryCard.addClass('selected bg-primary text-white').removeClass('bg-light');
                
                // Ensure the option exists in the dropdown
                if (selectElement.find(`option[value="${categoryId}"]`).length === 0) {
                    const newOption = new Option(categoryName, categoryId, false, false);
                    selectElement.append(newOption);
                }
            }
            
            // Update internal state
            self.selectedCategories = newSelection;
            
            // Save to localStorage
            self.saveCategories(newSelection);
            
            // Update the DOM select element first
            selectElement.val(newSelection);
            
            // Update the count display
            const countDisplay = self.container.find('.category-count');
            if (countDisplay.length) {
                countDisplay.text(newSelection.length);
            }
            
            // Use a promise to make the Select2 update more reliable
            const updateSelect2 = function() {
                return new Promise((resolve) => {
                    if ($.fn.select2) {
                        try {
                            selectElement.trigger('change.select2');
                            resolve();
                        } catch (error) {
                            console.warn("Error with change.select2, falling back to standard change", error);
                            selectElement.trigger('change');
                            resolve();
                        }
                    } else {
                        selectElement.trigger('change');
                        resolve();
                    }
                });
            };
            
            // Execute the update and handle completion
            updateSelect2().then(() => {
                // Release processing lock after a short delay
                setTimeout(() => {
                    $(categoryCard).data('processing', false);
                    
                    // Verify that the visual state matches the selection state
                    if (newSelection.includes(categoryId)) {
                        categoryCard.addClass('selected bg-primary text-white').removeClass('bg-light');
                    } else {
                        categoryCard.removeClass('selected bg-primary text-white').addClass('bg-light');
                    }
                }, 300);
            });
        });
    }
    
    // Method to update category headers based on selection state
    updateCategoryHeaderStyles() {
        const selectedCategories = this.selectedCategories;
        
        // Update all category headers
        $('.category-header').each(function() {
            const categoryId = $(this).data('category-id').toString();
            
            if (selectedCategories.includes(categoryId)) {
                $(this).addClass('selected bg-primary text-white').removeClass('bg-light');
            } else {
                $(this).removeClass('selected bg-primary text-white').addClass('bg-light');
            }
        });
    }

    filterItems() {
        // If there's a pending request, abort it
        if (this.pendingRequest && typeof this.pendingRequest.abort === 'function') {
            this.pendingRequest.abort();
        }
        
        // Use the most up-to-date search value
        // First check the actual input field (most current)
        const currentInputValue = this.container.find('.filter-search').val();
        // If there's a discrepancy, use the most recent value
        const searchValue = currentInputValue || this.searchInputValue;

        // Get the selected categories
        const selectedCategories = this.selectedCategories;
        
        // Build the params object with proper handling for arrays
        const params = {
            search: searchValue,
            sort: this.container.find('.filter-sort').val(),
            items_only: true, // Add a flag to request only the items, not the filter controls
            highlightSelected: true // Flag to indicate we want to highlight selected categories
        };
        
        // Special handling for categories array - convert to comma-separated string
        if (selectedCategories && selectedCategories.length > 0) {
            params.category = selectedCategories.join(',');
            
            // For category view, we want to show all categories but highlight selected ones
            // We don't filter by category unless specifically configured to do so
            if (this.itemType === 'categories' && !this.filterOnCategorySelect) {
                params.selected_categories = selectedCategories.join(',');
                // Don't filter by category, just pass the selection for highlighting
                delete params.category;
            }
        }

        // Debug logging
        console.log(`Filtering ${this.itemType} with parameters:`, {
            search: searchValue,
            category: selectedCategories,
            categoryParam: params.category,
            sort: params.sort,
            filterOnCategorySelect: this.filterOnCategorySelect
        });

        // Determine the target grid selector based on the item type
        let gridSelector;
        if (this.itemType === 'categories') {
            gridSelector = '#category-cards-grid';
        } else {
            gridSelector = '#product-cards-grid';
        }

        // Store the jqXHR object returned by makeAjaxRequest to be able to abort it
        this.pendingRequest = makeAjaxRequest(
            this.filterUrl,
            'GET',
            params,
            (response) => {
                const cardsContainer = $(gridSelector);
                
                if (!cardsContainer.length) {
                    console.error(`Couldn't find ${gridSelector} element`);
                    return;
                }
                
                if (response.html) {
                    // Direct replacement with the response HTML
                    cardsContainer.html(response.html);
                    console.log(`${this.itemType} filter results updated`);
                    
                    // Update the styling for category headers after content is updated
                    this.updateCategoryHeaderStyles();
                } else {
                    console.error("Response did not contain HTML property");
                }
                
                // Get the current value again after the response
                const finalInputValue = this.container.find('.filter-search').val();
                
                // If the input value changed during the request, make sure we preserve it
                if (finalInputValue !== searchValue) {
                    console.log(`Input value changed during request: "${searchValue}" -> "${finalInputValue}"`);
                    this.container.find('.filter-search').val(finalInputValue);
                    this.searchInputValue = finalInputValue;
                }
                
                // Call the update callback
                this.onUpdate();
                
                this.pendingRequest = null;
            },
            (jqXHR, textStatus, errorThrown) => {
                console.error('Filter request failed:', textStatus, errorThrown);
                this.displayError(`Failed to filter ${this.itemType}. Please try again.`);
                this.pendingRequest = null;
            },
            true // Pass true to make it abortable (default value)
        );
    }

    /**
     * Display an error message using SweetAlert
     * @param {string} message - Error message to display
     */
    displayError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
            confirmButtonText: 'OK'
        });
    }
    
    /**
     * Clean up event listeners and resources
     * Prevents memory leaks when filter instances are no longer needed
     */
    destroy() {
        // Clear timeouts
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Abort any pending requests
        if (this.pendingRequest && typeof this.pendingRequest.abort === 'function') {
            this.pendingRequest.abort();
        }
        
        // Remove event listeners
        this.container.off('input', '.filter-search');
        this.container.off('click', '.clear-search');
        this.container.off('click', '.clear-categories-btn');
        this.container.off('click', '.list-products-btn');
        this.container.off('change', '.filter-sort');
        
        // Clean up Select2
        const selectElement = this.container.find('.filter-category');
        if (selectElement.length && $.fn.select2) {
            try {
                selectElement.off('change').off('select2:open');
                selectElement.select2('destroy');
            } catch (e) {
                console.warn('Error destroying Select2:', e);
            }
        }
        
        // Remove global document event handlers
        $(document).off('click', '.select2-result-category input[type="checkbox"]');
        $(document).off('click', '.category-header');
        
        console.log(`ItemFilter for ${this.itemType} destroyed.`);
    }
}

// Export for use in other modules
export default ItemFilter;
