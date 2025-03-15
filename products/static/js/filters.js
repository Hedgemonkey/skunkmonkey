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

        // Search with debounce
        this.container.on('input', '.filter-search', function() {
            clearTimeout(self.searchTimeout);
            self.searchTimeout = setTimeout(() => {
                self.filterItems();
            }, self.searchDelay);
        });

        // Clear search
        this.container.on('click', '.clear-search', function() {
            self.container.find('.filter-search').val('');
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
        const params = {
            search: this.container.find('.filter-search').val(),
            category: this.container.find('.filter-category').val(),
            sort: this.container.find('.filter-sort').val(),
            items_only: true // Add a flag to request only the items, not the filter controls
        };

        // Store the search value for later use
        const searchValue = params.search;
        console.log("Filtering with search value:", searchValue);

        makeAjaxRequest(
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
                
                console.log("Found cards container, updating content");
                
                if (response.html) {
                    // Direct replacement with the response HTML
                    cardsContainer.html(response.html);
                } else {
                    console.error("Response did not contain HTML property");
                }
                
                // Make sure we preserve the input values
                if (searchValue) {
                    this.container.find('.filter-search').val(searchValue);
                }
                
                // Call the update callback
                this.onUpdate();
            },
            (error) => {
                this.displayError(`Failed to filter ${this.itemType}. Please try again.`);
                console.error('Filter error:', error);
            }
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
