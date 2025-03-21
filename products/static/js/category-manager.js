/**
 * category-manager.js - Dedicated module for category management
 * 
 * Handles category CRUD operations, filtering, and event handling
 */
import apiClient from '../../../static/js/api-client.js';
import { ItemFilter } from './filters.js';
import { BaseManager } from './utilities/base-manager.js';
import Swal from 'sweetalert2';

/**
 * CategoryManager class for handling category operations
 * Extends BaseManager to leverage common functionality
 */
export class CategoryManager extends BaseManager {
    /**
     * Create a new CategoryManager instance
     * @param {Object} options - Configuration options
     * @param {Object} options.elements - DOM element references
     * @param {Object} options.urls - URL references
     * @param {Object} options.notifications - Notification handlers
     */
    constructor(options) {
        super({
            ...options,
            itemType: 'category'
        });
        
        // Store reference to filter
        this.filter = null;
    }

    /**
     * Fetch category cards via AJAX
     * Implements abstract method from BaseManager
     */
    fetchItems() {
        apiClient.get(this.urls.getCategoryCards, {}, {
            skipGlobalErrorHandler: true
        })
        .then((response) => {
            if (response.html) {
                this.elements.categoryListContainer.html(response.html);
            } else {
                this.elements.categoryListContainer.html(response);
            }
            
            this.initializeFilters();
            this.attachCategoryEventListeners();
        })
        .catch((error) => {
            console.error('Error fetching categories:', error);
            this.notifications.displayError("Failed to load category cards.");
        });
    }

    /**
     * Delete a category
     * @param {string} categorySlug - Slug of category to delete
     * @returns {Promise} - Promise resolving when delete is complete
     */
    delete(categorySlug) {
        const deleteUrl = `${this.urls.categoryBase}${categorySlug}/delete/`;
        return apiClient.post(deleteUrl, {}, {
            skipGlobalErrorHandler: true
        });
    }

    /**
     * Show category add/edit form
     * Override of BaseManager.showForm() with category-specific parameters
     * @param {string} url - URL to fetch the form
     * @param {boolean} isEdit - Whether this is an edit operation
     */
    showForm(url, isEdit = false) {
        super.showForm(url, isEdit, {
            title: isEdit ? 'Edit Category' : 'Add New Category',
            confirmText: isEdit ? 'Save' : 'Add Category',
            successMessage: isEdit ? 'Category updated successfully.' : 'Category added successfully.'
        });
    }

    /**
     * Add a new category using the simplified approach or form handling
     * @param {string|null} categoryName - Name of new category (if direct creation)
     * @param {Object} options - Additional options for form display
     */
    add(categoryName = null, options = {}) {
        // If a name is provided, use simplified direct creation
        if (categoryName) {
            this.notifications.prompt({
                title: 'Add New Category',
                inputPlaceholder: 'Enter category name',
                inputValue: categoryName,
                preConfirm: (name) => {
                    return apiClient.post(
                        this.urls.addCategory,
                        { name: name },
                        { skipGlobalErrorHandler: true }
                    )
                    .catch(error => {
                        this.notifications.displaySwalError(error, "Category creation failed.");
                        return Promise.reject(error);
                    });
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    this.fetchItems();
                    this.notifications.displaySuccess(
                        result.value?.message || "Category added successfully."
                    );
                }
            });
        } else {
            // Use standard form handling approach
            this.showForm(this.urls.addCategory, false, options);
        }
    }

    /**
     * Handle category deletion with confirmation
     * @param {Event} event - Click event
     */
    handleDelete(event) {
        event.preventDefault();
        const categoryName = $(event.currentTarget).data('category-name');
        const categorySlug = $(event.currentTarget).data('category-slug');

        apiClient.get(`/products/staff/category/${categorySlug}/products/`, {}, {
            skipGlobalErrorHandler: true
        })
        .then((response) => this.confirmCategoryDeletion(response, categorySlug, categoryName))
        .catch((error) => this.notifications.displaySwalError(error, "Failed to get products for category."));
    }
    
    /**
     * Show confirmation dialog for category deletion
     * @param {Object} response - Response containing products to delete
     * @param {string} categorySlug - Slug of category to delete
     * @param {string} categoryName - Name of category for display
     */
    confirmCategoryDeletion(response, categorySlug, categoryName) {
        const productCount = response.products.length;
        const productsToDelete = response.products;
        let productListHTML = productsToDelete.map(product => `${product}<br>`).join('');

        this.confirmAction({
            title: `Delete ${categoryName}?`,
            html: `Are you sure you want to delete this category? This action cannot be undone.<br>
                ${productCount} product(s) will also be deleted. ${productListHTML ? '<br>' + productListHTML : ''}`,
            input: 'checkbox',
            inputValue: 0,
            inputPlaceholder: 'I understand the consequences',
            inputValidator: (result) => !result && 'You need to confirm by checking the box.',
            preConfirm: () => {
                Swal.showLoading();
                return this.delete(categorySlug)
                    .then(response => {
                        this.notifications.displaySuccess(response?.message || `Deleted ${categoryName}`);
                        this.fetchItems();
                        return Promise.resolve();
                    })
                    .catch(error => {
                        Swal.hideLoading();
                        if (error.responseJSON?.error) {
                            this.notifications.displaySwalError(error, error.responseJSON.error);
                        } else {
                            this.notifications.displaySwalError(error, 'Failed to delete category. Please try again.');
                        }
                        return Promise.reject(error);
                    });
            }
        });
    }

    /**
     * Attach event listeners to category elements
     */
    attachCategoryEventListeners() {
        // Delete buttons
        $('#category-cards-grid').off('click', '.delete-category')
            .on('click', '.delete-category', (e) => this.handleDelete(e));
        
        // Edit buttons
        $('#category-cards-grid').off('click', '.edit-category')
            .on('click', '.edit-category', (e) => {
                e.preventDefault();
                this.showForm($(e.currentTarget).attr('href'), true);
            });
        
        // Category headers - connect with the filter's category manager
        $('#category-cards-grid').off('click', '.category-header')
            .on('click', '.category-header', (e) => {
                // Only handle if not clicking on a button or link inside the card
                if (!$(e.target).closest('button, a').length) {
                    const categoryId = $(e.currentTarget).data('category-id');
                    if (categoryId && this.filter && this.filter.categoryManager) {
                        // Use the filter's category manager to toggle the category
                        this.filter.categoryManager._toggleCategory(categoryId.toString());
                        // Update category styling after toggling
                        this.filter.categoryManager._updateCategoryCardStyling();
                        return false; // Prevent any parent handlers from triggering
                    }
                }
            });
        
        // Add cursor pointer to indicate clickable headers
        $('#category-cards-grid .category-header').css('cursor', 'pointer');
    }
    
    /**
     * Initialize filters for category view
     * Implements abstract method from BaseManager
     */
    initializeFilters() {
        try {
            console.log("Initializing category filters");
            
            // Clean up any existing filter instance
            if (this.filter) {
                this.filter.destroy();
            }
            
            this.filter = new ItemFilter({
                containerId: 'category-cards-container',
                filterUrl: this.urls.getCategoryCards,
                itemType: 'categories',
                filterOnCategorySelect: true,  // Changed from false to true to enable dynamic updating
                onUpdate: () => {
                    // Important: Re-attach category event listeners after filter updates the DOM
                    this.attachCategoryEventListeners();
                    
                    // Ensure category card styling is updated to match selected state
                    if (this.filter.categoryManager) {
                        this.filter.categoryManager._updateCategoryCardStyling();
                    }
                }
            });
            
            if (this.filter && typeof this.filter.preloadCategories === 'function') {
                this.filter.preloadCategories();
                
                // Important: Ensure the category cards are styled correctly initially
                if (this.filter.categoryManager) {
                    this.filter.categoryManager._updateCategoryCardStyling();
                }
            }
            
            console.log("Category filters initialized successfully");
        } catch (error) {
            console.error("Error initializing category filters:", error);
            this.notifications.displayError("Failed to initialize category filters.");
        }
    }
    
    /**
     * Clean up resources
     * Override of BaseManager.destroy()
     */
    destroy() {
        // Clean up event listeners
        $('#category-cards-grid').off('click', '.delete-category');
        $('#category-cards-grid').off('click', '.edit-category');
        $('#category-cards-grid').off('click', '.category-header');
        
        // Clean up filter if it exists
        if (this.filter) {
            this.filter.destroy();
            this.filter = null;
        }
        
        // Call base class destroy
        super.destroy();
        
        console.log("CategoryManager destroyed");
    }
}

export default CategoryManager;
