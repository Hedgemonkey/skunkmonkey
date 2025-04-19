/**
 * product-manager.js - Dedicated module for product management
 *
 * Handles product CRUD operations, filtering, and event handling
 */
import { makeAjaxRequest } from '@common/js/ajax_helper.js';
import { ItemFilter } from './filters.js';
import { BaseManager } from '@products/utilities/js/base-manager.js';
import Swal from 'sweetalert2';
import $ from 'jquery';

/**
 * ProductManager class for handling product operations
 */
export class ProductManager extends BaseManager {
    /**
     * Create a new ProductManager instance
     * @param {Object} options - Configuration options
     * @param {Object} options.elements - DOM element references
     * @param {Object} options.urls - URL references
     * @param {Object} options.notifications - Notification handlers
     */
    constructor(options) {
        super({
            ...options,
            itemType: 'product'
        });
    }

    /**
     * Fetch product cards via AJAX
     * Implements abstract method from BaseManager
     */
    fetchItems() {
        // Get saved categories for filtering
        const savedCategories = localStorage.getItem('selectedCategories');
        const categoryParam = savedCategories ? JSON.parse(savedCategories).join(',') : '';

        // Prepare params with category filter if available
        const params = {};
        if (categoryParam) {
            params.category = categoryParam;
        }

        makeAjaxRequest(
            this.urls.getProductCards,
            'GET',
            params,
            (response) => {
                if (response.html) {
                    this.elements.productListContainer.html(response.html);
                } else {
                    this.elements.productListContainer.html(response);
                }

                this.attachDeleteListeners();
                this.initializeFilters();
            },
            (error) => {
                console.error('Error fetching products:', error);
                this.notifications.displayError("Failed to refresh product list.");
            }
        );
    }

    /**
     * Show product add/edit form
     * Override of BaseManager.showForm() with product-specific parameters
     * @param {string} url - URL to fetch the form
     * @param {boolean} isEdit - Whether this is an edit operation
     */
    showForm(url, isEdit = false) {
        super.showForm(url, isEdit, {
            title: isEdit ? 'Edit Product' : 'Add New Product',
            confirmText: isEdit ? 'Save' : 'Add Product',
            successMessage: isEdit ? 'Product updated successfully.' : 'Product added successfully.'
        });
    }

    /**
     * Delete a product
     * @param {string} productSlug - Slug of product to delete
     * @returns {Promise} - Promise resolving when delete is complete
     */
    delete(productSlug) {
        const deleteUrl = `${this.urls.productBase}${productSlug}/delete/`;
        try {
            const ajaxPromise = makeAjaxRequest(deleteUrl, 'POST');
            if (!ajaxPromise || typeof ajaxPromise.then !== 'function') {
                return Promise.reject("Invalid AJAX response");
            }
            return ajaxPromise;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * Handle product deletion with confirmation
     * @param {string} productSlug - Slug of product to delete
     * @param {string} productName - Name of product for display
     */
    handleDelete(productSlug, productName) {
        this.confirmAction({
            title: `Delete ${productName}?`,
            text: "Are you sure you want to delete this product? This action cannot be undone.",
            preConfirm: () => {
                Swal.showLoading();
                return this.delete(productSlug)
                    .then(response => {
                        this.notifications.displaySuccess(response?.message || "Product deleted successfully.");
                        this.fetchItems();
                        return Promise.resolve();
                    })
                    .catch(error => {
                        Swal.hideLoading();
                        if (error.responseJSON?.error) {
                            this.notifications.displaySwalError(error, error.responseJSON.error);
                        } else {
                            this.notifications.displaySwalError(error, 'Failed to delete product. Please try again.');
                        }
                        return Promise.reject(error);
                    });
            }
        });
    }

    /**
     * Initialize filters for product view
     * Implements abstract method from BaseManager
     */
    initializeFilters() {
        this.filter = new ItemFilter({
            containerId: 'product-cards-container',
            filterUrl: this.urls.getProductCards,
            filterOnCategorySelect: true,
            filterOnSearch: true,
            filterOnSort: true,
            filterOnSearchInput: true,
            filterOnSortSelect: true,
            onUpdate: () => {
                this.attachDeleteListeners();
            }
        });
    }

    /**
     * Attach delete event listeners to products
     */
    attachDeleteListeners() {
        $('.delete-product').off('click').on('click', (e) => {
            e.preventDefault();
            const button = $(e.currentTarget);
            this.handleDelete(button.data('product-slug'), button.data('product-name'));
        });
    }

    /**
     * Clean up resources
     * Override of BaseManager.destroy()
     */
    destroy() {
        // Clean up event listeners
        $('.delete-product').off('click');

        // Call base class destroy
        super.destroy();

        console.log("ProductManager destroyed");
    }
}

export default ProductManager;
