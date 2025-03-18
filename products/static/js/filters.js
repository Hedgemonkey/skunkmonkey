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
        this.navToProductsUrl = options.navToProductsUrl || '/products/staff/';
        
        this.container = $(`#${this.containerId}`);
        this.searchTimeout = null;
        this.pendingRequest = null;
        this.searchInputValue = '';
        
        // Get stored categories from localStorage if available
        this.selectedCategories = this.getSavedCategories() || [];
        this.allCategories = [];
        
        // Initialize Select2 first
        this.initializeSelect2();
        
        // Then preload all categories
        this.preloadCategories();
        
        // Initialize listeners last
        this.initializeListeners();
    }

    // New method to save selected categories to localStorage
    saveCategories(categories) {
        this.selectedCategories = categories;
        localStorage.setItem('selectedCategories', JSON.stringify(categories));
    }

    // New method to get saved categories from localStorage
    getSavedCategories() {
        const savedCategories = localStorage.getItem('selectedCategories');
        return savedCategories ? JSON.parse(savedCategories) : [];
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
