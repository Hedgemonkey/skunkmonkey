import 'select2';
import { makeAjaxRequest } from '../../../static/js/ajax_helper.js';
import Swal from 'sweetalert2'; // Import SweetAlert2 for notifications

export class ItemFilter {
    constructor(options) {
        this.containerId = options.containerId;
        this.filterUrl = options.filterUrl;
        this.onUpdate = options.onUpdate || function() {};
        this.searchDelay = options.searchDelay || 300;
        this.itemType = options.itemType || 'products';
        this.filterOnCategorySelect = options.filterOnCategorySelect !== undefined ? 
            options.filterOnCategorySelect : true;
        this.categoriesLoaded = false;
        
        this.container = $(`#${this.containerId}`);
        this.searchTimeout = null;
        this.pendingRequest = null;
        this.searchInputValue = '';
        this.selectedCategories = [];
        this.allCategories = [];
        
        // Initialize Select2 first
        this.initializeSelect2();
        
        // Then preload all categories
        this.preloadCategories();
        
        // Initialize listeners last
        this.initializeListeners();
    }

    preloadCategories() {
        // Skip if there's no category filter in the container
        if (this.container.find('.filter-category').length === 0) {
            return;
        }
        
        // Fetch all categories to ensure they're loaded
        makeAjaxRequest(
            '/products/api/categories/search/',
            'GET',
            { search: '', limit: 100 }, // Empty search to get all categories
            (data) => {
                this.allCategories = data.categories || [];
                this.categoriesLoaded = true;
                
                // Add all preloaded categories to the Select2 dropdown
                const selectElement = this.container.find('.filter-category');
                const currentSelection = selectElement.val() || [];
                
                // Add new options for each category
                this.allCategories.forEach(category => {
                    // Check if option already exists
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

    initializeSelect2() {
        // Skip Select2 initialization if there's no category filter in the container
        if (this.container.find('.filter-category').length === 0) {
            return;
        }
        
        // Add custom template for checkboxes in select2
        function formatCategoryOption(category) {
            if (!category.id) {
                return category.text;
            }
            
            // Create the checkbox template
            return $(`
                <div class="select2-result-category">
                    <input type="checkbox" class="form-check-input me-2" id="category-${category.id}" 
                           ${category.selected ? 'checked' : ''}>
                    <label for="category-${category.id}">${category.text}</label>
                </div>
            `);
        }

        // Initialize Select2 with enhanced options
        this.container.find('.filter-category').select2({
            theme: 'bootstrap-5',
            width: '100%',
            multiple: true,
            allowClear: true,
            closeOnSelect: false, // Keep dropdown open when selecting items
            placeholder: 'Select or search categories',
            minimumInputLength: 0, // Allow showing all options without typing
            minimumResultsForSearch: 0, // Always show the search box
            templateResult: formatCategoryOption,
            ajax: {
                delay: 250,
                url: '/products/api/categories/search/',
                data: function (params) {
                    return {
                        search: params.term || '', // Handle empty search
                        page: params.page || 1
                    };
                },
                processResults: function (data) {
                    return {
                        results: data.categories.map(category => ({
                            id: category.id,
                            text: category.name,
                            selected: false // Default to not selected
                        })),
                        pagination: {
                            more: data.has_more
                        }
                    };
                },
                cache: true // Enable caching for better performance
            }
        });

        // Handle checkbox clicks inside the dropdown
        $(document).on('click', '.select2-result-category input[type="checkbox"]', function(e) {
            e.stopPropagation(); // Prevent the event from closing the dropdown
            const checkbox = $(this);
            const option = checkbox.closest('.select2-result-category');
            const id = checkbox.attr('id').replace('category-', '');
            
            // Find the corresponding select option and toggle its selection
            const selectElement = $('.filter-category');
            const currentSelection = selectElement.val() || [];
            
            if (checkbox.is(':checked')) {
                if (!currentSelection.includes(id)) {
                    currentSelection.push(id);
                }
            } else {
                const index = currentSelection.indexOf(id);
                if (index > -1) {
                    currentSelection.splice(index, 1);
                }
            }
            
            // Update the select value
            selectElement.val(currentSelection).trigger('change');
        });
        
        // When Select2 opens, make sure checkboxes reflect current selection
        this.container.find('.filter-category').on('select2:open', function() {
            const selectedValues = $(this).val() || [];
            
            // Short timeout to ensure DOM is updated
            setTimeout(() => {
                $('.select2-result-category input[type="checkbox"]').each(function() {
                    const id = $(this).attr('id').replace('category-', '');
                    $(this).prop('checked', selectedValues.includes(id));
                });
            }, 50);
        });
    }

    initializeListeners() {
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
            // Store the initial selection
            this.selectedCategories = this.container.find('.filter-category').val() || [];
            
            this.container.find('.filter-category').on('change', function() {
                // Update the stored selection
                self.selectedCategories = $(this).val() || [];
                
                // Update category headers in cards to reflect selection state
                self.updateCategoryHeaderStyles();
                
                // Only filter if we're configured to filter on category selection
                if (self.filterOnCategorySelect) {
                    self.filterItems();
                }
            });
        }

        // Sort items
        this.container.on('change', '.filter-sort', function() {
            self.filterItems();
        });
        
        // Handle clicks on category headers in cards
        $(document).on('click', '.category-header', function(e) {
            if (self.itemType !== 'categories') return; // Only handle in categories view
        
            // Prevent clicks on buttons from triggering category selection
            if ($(e.target).closest('.btn-group').length || $(e.target).closest('.btn').length) {
                return;
            }
        
            const categoryId = $(this).data('category-id').toString();
            const selectElement = self.container.find('.filter-category');
            let currentSelection = selectElement.val() || [];
        
            // Toggle the selection status
            if (currentSelection.includes(categoryId)) {
                // Remove from selection
                const index = currentSelection.indexOf(categoryId);
                if (index > -1) {
                    currentSelection.splice(index, 1);
                }
                $(this).removeClass('selected bg-primary text-white').addClass('bg-light');
            } else {
                // Add to selection
                currentSelection.push(categoryId);
                $(this).addClass('selected bg-primary text-white').removeClass('bg-light');
            
                // Ensure the option exists in the dropdown
                if (selectElement.find(`option[value="${categoryId}"]`).length === 0) {
                    // Get category name from the header
                    const categoryName = $(this).find('.category-title').text();
                    // Create new option
                    const newOption = new Option(categoryName, categoryId, true, true);
                    selectElement.append(newOption);
                }
            }
        
            // Properly update Select2
            // First update the underlying select element
            selectElement.val(currentSelection);
        
            // Then properly trigger Select2 update
            try {
                // For Select2 version 4.x
                selectElement.trigger('change.select2');
            } catch (error) {
                console.error("Error triggering Select2 update:", error);
                // Fallback to standard change event
                selectElement.trigger('change');
            }
        
            // If the Select2 display doesn't match our selection, do a full refresh
            setTimeout(() => {
                if ($.fn.select2) {
                    const displayedSelection = selectElement.select2('data').map(item => item.id);
                    const sortedCurrent = [...currentSelection].sort();
                    const sortedDisplayed = [...displayedSelection].sort();
                
                    // Check if arrays are different
                    let needsRefresh = sortedCurrent.length !== sortedDisplayed.length;
                    if (!needsRefresh) {
                        for (let i = 0; i < sortedCurrent.length; i++) {
                            if (sortedCurrent[i] !== sortedDisplayed[i]) {
                                needsRefresh = true;
                                break;
                            }
                        }
                    }
                
                    if (needsRefresh) {
                        console.log("Select2 display not in sync, doing full refresh");
                        // Force refresh the control
                        selectElement.select2('destroy');
                        selectElement.select2({
                            theme: 'bootstrap-5',
                            width: '100%',
                            multiple: true,
                            allowClear: true,
                            closeOnSelect: false,
                            placeholder: 'Select or search categories'
                        });
                        // Reapply the selection
                        selectElement.val(currentSelection).trigger('change');
                    }
                }
            }, 50);
        
            // Update the selected-count display
            const countDisplay = self.container.find('.category-count');
            if (countDisplay.length) {
                countDisplay.text(currentSelection.length);
            }
        
            // Store the selection
            self.selectedCategories = currentSelection;
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
        const selectedCategories = this.container.find('.filter-category').val();
        
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

    displayError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
            confirmButtonText: 'OK'
        });
    }
}

// Export for use in other modules
export default ItemFilter;
