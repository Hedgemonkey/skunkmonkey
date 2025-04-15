/**
 * products.js - Main application module
 *
 * Orchestrates product management functionality using modular components.
 */
import $ from 'jquery';
import 'bootstrap';
import { ProductManager } from '../../../static/js/product-manager.js';
import { CategoryManager } from '../../../static/js/category-manager.js';
import notifications from '../../../static/js/utilities/notifications.js';
import apiClient from '../../../../static/js/api-client.js';

$(function () {
    // Application initialization
    const app = {
        /**
         * URLs used throughout the application
         */
        urls: {
            addProductForm: $('#product-add-button').data('product-add-form-url'),
            addProduct: $('#product-add-button').data('product-add-url'),
            productManagement: $('#product-add-button').data('product-management-url'),
            getProductCards: $('#products-header .accordion-button').data('content-url'),
            getCategoryCards: $('#category-cards-container').data('category-cards-url'),
            addCategory: $('#category-add-button').data('category-add-url'),
            productBase: '/products/staff/product/',
            categoryBase: '/products/staff/category/'
        },

        /**
         * DOM element references
         */
        elements: {
            addProductButton: $('#product-add-button'),
            productListContainer: $('#product-cards-container'),
            addCategoryButton: $('#category-add-button'),
            categoryList: $('#category-list'),
            categoryListContainer: $('#category-cards-container'),
            productCardsContainer: $('#product-cards-container'),
            managementAccordion: $('#management-accordion')
        },

        /**
         * Initialize the application
         */
        init: function() {
            console.log("Initializing product management application");
            this.initializeManagers();
            this.initializeEventListeners();
            this.initializeAccordion();

            // Load initial content (Products tab is expanded by default)
            this.productManager.fetchItems();
        },

        /**
         * Initialize manager instances with shared configuration
         */
        initializeManagers: function() {
            console.log("Initializing managers with URLs:", this.urls);
            const managerOptions = {
                elements: this.elements,
                urls: this.urls,
                notifications: notifications
            };

            this.productManager = new ProductManager(managerOptions);
            this.categoryManager = new CategoryManager(managerOptions);
        },

        /**
         * Set up global event listeners
         */
        initializeEventListeners: function() {
            console.log("Setting up event listeners");

            // Global category event handlers
            this.elements.categoryList.on('click', '.delete-category',
                (e) => this.categoryManager.handleDelete(e));

            // Edit category
            $(document).on('click', '.edit-category', (e) => {
                e.preventDefault();
                this.categoryManager.showForm($(e.currentTarget).attr('href'), true);
            });

            // Edit product
            $(document).on('click', '.edit-product', (e) => {
                e.preventDefault();
                this.productManager.showForm($(e.currentTarget).data('url'), true);
            });

            // Add product button - direct binding to ensure it works
            this.elements.addProductButton.on('click', () => {
                console.log("Add Product button clicked");
                this.handleAddProduct();
            });

            // Add category button - direct binding to ensure it works
            this.elements.addCategoryButton.on('click', () => {
                console.log("Add Category button clicked");
                this.handleAddCategory();
            });
        },

        /**
         * Handle adding a new product
         */
        handleAddProduct: function() {
            console.log("Handling add product with URL:", this.urls.addProductForm);

            // Use API client to fetch the form
            apiClient.get(this.urls.addProductForm)
                .then(response => {
                    console.log("Product form fetched, showing modal");
                    // Show the form in a SweetAlert modal
                    return notifications.confirm({
                        title: 'Add New Product',
                        html: response.html || response,
                        showCancelButton: true,
                        confirmButtonText: 'Add Product',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        preConfirm: () => {
                            // Handle form submission when confirmed
                            const form = $('#product-form')[0];
                            const formData = new FormData(form);

                            return apiClient.post(this.urls.addProduct, formData, {
                                skipGlobalErrorHandler: true
                            })
                            .then(response => {
                                return response;
                            })
                            .catch(error => {
                                notifications.displaySwalError(error, "Failed to add product");
                                return Promise.reject(error);
                            });
                        }
                    });
                })
                .then(result => {
                    if (result.isConfirmed) {
                        console.log("Product added successfully, refreshing list");
                        notifications.displaySuccess(result.value?.message || "Product added successfully");
                        this.productManager.fetchItems();
                    }
                })
                .catch(error => {
                    console.error("Error handling add product:", error);
                    notifications.displayError("Failed to load product form: " + (error.message || "Unknown error"));
                });
        },

        /**
         * Handle adding a new category
         */
        handleAddCategory: function() {
            console.log("Handling add category");

            // Use the prompt function from notifications service
            notifications.prompt({
                title: 'Add New Category',
                inputPlaceholder: 'Enter category name',
                inputValidator: (value) => {
                    if (!value || value.trim() === '') {
                        return 'Please enter a category name';
                    }
                    return null;
                },
                preConfirm: (categoryName) => {
                    console.log("Adding category:", categoryName);

                    // Use API client to add the category
                    return apiClient.post(this.urls.addCategory, { name: categoryName }, {
                        skipGlobalErrorHandler: true
                    })
                    .then(response => {
                        return response;
                    })
                    .catch(error => {
                        notifications.displaySwalError(error, "Failed to add category");
                        return Promise.reject(error);
                    });
                }
            })
            .then(result => {
                if (result.isConfirmed) {
                    console.log("Category added successfully, refreshing list");
                    notifications.displaySuccess(result.value?.message || "Category added successfully");
                    this.categoryManager.fetchItems();
                }
            })
            .catch(error => {
                console.error("Error handling add category:", error);
            });
        },

        /**
         * Initialize the accordion behavior
         */
        initializeAccordion: function() {
            const accordion = this.elements.managementAccordion;

            // Reset previous handlers
            this.resetAccordion(accordion);

            // Custom accordion toggle behavior
            accordion.find('.accordion-button').on('click', (e) =>
                this.handleAccordionToggle(e));
        },

        /**
         * Reset accordion event handlers and data
         */
        resetAccordion: function(accordion) {
            accordion.find('.accordion-button, .accordion-collapse').off();
            accordion.off();
            accordion.find('.accordion-button, .accordion-collapse').removeData('bs.collapse');
            accordion.find('[data-bs-toggle="collapse"]').removeAttr('data-bs-toggle');
        },

        /**
         * Handle accordion section toggle
         */
        handleAccordionToggle: function(e) {
            e.preventDefault();
            e.stopPropagation();

            const button = $(e.currentTarget);
            const targetId = button.data('bs-target');
            const target = $(targetId);
            const isExpanded = button.attr('aria-expanded') === 'true';

            // Update button state
            button.attr('aria-expanded', !isExpanded);

            if (isExpanded) {
                // Collapse section
                button.addClass('collapsed');
                target.removeClass('show');
            } else {
                // Expand section (collapse others first)
                this.collapseOtherSections(button, targetId);

                button.removeClass('collapsed');
                target.addClass('show');

                // Load content
                const sectionId = targetId.substring(1);
                this.loadSectionContent(sectionId);
            }
        },

        /**
         * Collapse other accordion sections
         */
        collapseOtherSections: function(activeButton, activeTargetId) {
            const accordion = this.elements.managementAccordion;

            accordion.find('.accordion-button').not(activeButton)
                .attr('aria-expanded', 'false')
                .addClass('collapsed');

            accordion.find('.accordion-collapse').not(activeTargetId)
                .removeClass('show');
        },

        /**
         * Load content for an accordion section
         */
        loadSectionContent: function(sectionId) {
            const section = $(`#${sectionId}`);
            const contentContainer = section.find('.accordion-body > div');
            const contentId = contentContainer.attr('id');

            // Load appropriate content based on section
            if (contentId === 'product-cards-container') {
                this.productManager.fetchItems();
            } else if (contentId === 'category-cards-container') {
                this.categoryManager.fetchItems();
            }
        }
    };

    // Initialize the application
    app.init();
});
