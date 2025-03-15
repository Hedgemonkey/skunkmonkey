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
        
        this.container = $(`#${this.containerId}`);
        this.searchTimeout = null;
        this.pendingRequest = null;
        this.searchInputValue = '';
        
        this.initializeSelect2();
        this.initializeListeners();
    }

    initializeSelect2() {
        this.container.find('.filter-category').select2({
            theme: 'bootstrap-5',
            width: '100%',
            multiple: true,
            allowClear: true,
            placeholder: 'Select categories',
            minimumInputLength: 1,
            ajax: {
                delay: 250,
                url: '/products/api/categories/search/',
                data: function (params) {
                    return {
                        search: params.term,
                        page: params.page || 1
                    };
                },
                processResults: function (data) {
                    return {
                        results: data.categories.map(category => ({
                            id: category.id,
                            text: category.name
                        })),
                        pagination: {
                            more: data.has_more
                        }
                    };
                }
            }
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

        // Category filter
        this.container.find('.filter-category').on('change', function() {
            self.filterItems();
        });

        // Sort items
        this.container.on('change', '.filter-sort', function() {
            self.filterItems();
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

        const params = {
            search: searchValue,
            category: this.container.find('.filter-category').val(),
            sort: this.container.find('.filter-sort').val(),
            items_only: true // Add a flag to request only the items, not the filter controls
        };

        console.log(`Making filter request with search: "${searchValue}"`);

        // Store the jqXHR object returned by makeAjaxRequest to be able to abort it
        this.pendingRequest = makeAjaxRequest(
            this.filterUrl,
            'GET',
            params,
            (response) => {
                // Get the specific container for product cards
                const cardsContainer = $('#product-cards-grid');
                
                if (!cardsContainer.length) {
                    console.error("Couldn't find #product-cards-grid element");
                    return;
                }
                
                if (response.html) {
                    // Direct replacement with the response HTML
                    cardsContainer.html(response.html);
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
