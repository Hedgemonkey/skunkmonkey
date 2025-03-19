/**
 * base-manager.js - Base class for item managers
 * 
 * Provides common functionality for different item type managers
 * (products, categories, etc.) to reduce code duplication.
 */
import { makeAjaxRequest } from '../../../../static/js/ajax_helper.js';
import Swal from 'sweetalert2';

/**
 * BaseManager - Abstract base class for item managers
 */
export class BaseManager {
    /**
     * Create a new BaseManager instance
     * @param {Object} options - Configuration options
     * @param {Object} options.elements - DOM element references
     * @param {Object} options.urls - URL references
     * @param {Object} options.notifications - Notification handlers
     * @param {string} options.itemType - Type of item being managed ('product', 'category', etc.)
     */
    constructor(options) {
        // Prevent direct instantiation of base class
        if (new.target === BaseManager) {
            throw new Error('Cannot instantiate BaseManager directly; please use a subclass');
        }
        
        this.elements = options.elements;
        this.urls = options.urls;
        this.notifications = options.notifications;
        this.itemType = options.itemType || 'item';
        this.filter = null;
    }

    /**
     * Fetch items via AJAX
     * Must be implemented by subclasses
     */
    fetchItems() {
        throw new Error('fetchItems() must be implemented by subclass');
    }

    /**
     * Initialize filters for view
     * Must be implemented by subclasses
     */
    initializeFilters() {
        throw new Error('initializeFilters() must be implemented by subclass');
    }

    /**
     * Show item add/edit form
     * @param {string} url - URL to fetch the form
     * @param {boolean} isEdit - Whether this is an edit operation
     * @param {Object} options - Additional options
     */
    showForm(url, isEdit = false, options = {}) {
        const itemTypeCapitalized = this.capitalizeFirstLetter(this.itemType);
        const formId = isEdit ? `#${this.itemType}-update-form` : `#${this.itemType}-form`;
        
        const title = options.title || (isEdit ? `Edit ${itemTypeCapitalized}` : `Add New ${itemTypeCapitalized}`);
        const confirmText = options.confirmText || (isEdit ? 'Save' : `Add ${itemTypeCapitalized}`);
        const successMessage = options.successMessage || 
            (isEdit ? `${itemTypeCapitalized} updated successfully.` : `${itemTypeCapitalized} added successfully.`);
        
        makeAjaxRequest(
            url,
            'GET',
            {},
            (response) => {
                Swal.fire({
                    title: title,
                    html: isEdit ? response.html : response,
                    showCancelButton: true,
                    confirmButtonText: confirmText,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    preConfirm: () => this.handleFormSubmit(isEdit, formId)
                }).then((result) => {
                    if (result.isConfirmed) {
                        this.fetchItems();
                        this.notifications.displaySuccess(result.value?.message || successMessage);
                    }
                    if (result.isDismissed && !isEdit) {
                        $(formId).remove();
                    }
                }).catch(error => {
                    console.error('Form submission failed:', error);
                    Swal.hideLoading();
                });
            },
            (error) => {
                this.notifications.displaySwalError(error, `Failed to ${isEdit ? 'edit' : 'add'} ${this.itemType}.`);
            }
        );
    }
    
    /**
     * Handle form submission for add/edit item
     * @param {boolean} isEdit - Whether this is an edit operation
     * @param {string} formSelector - Selector for the form
     * @returns {Promise} - Promise resolving with response data
     */
    handleFormSubmit(isEdit, formSelector) {
        Swal.showLoading();
        const form = $(formSelector)[0];
        const formData = new FormData(form);
        
        return makeAjaxRequest(
            form.action,
            'POST',
            formData,
            (response) => {
                if (!response.success) {
                    let errorMessage = this.formatErrorMessage(response.errors);
                    Swal.hideLoading();
                    Swal.showValidationMessage(errorMessage);
                    return Promise.reject(response.errors);
                }
                return response;
            },
            (error) => {
                console.error(`${this.capitalizeFirstLetter(this.itemType)} form submission error:`, error);
                let errorMessage = `An error occurred while saving the ${this.itemType}.`;

                if (error.responseJSON) {
                    errorMessage = this.formatErrorMessage(error.responseJSON.errors);
                }

                Swal.hideLoading();
                Swal.showValidationMessage(errorMessage);
                return Promise.reject(error);
            },
            false,
            false
        );
    }
    
    /**
     * Format error messages for display
     * @param {Object|string} errors - Error data
     * @returns {string} - Formatted error message
     */
    formatErrorMessage(errors) {
        if (!errors) return 'Unknown error occurred';
        
        if (typeof errors === 'object') {
            return Object.entries(errors)
                .map(([field, fieldErrors]) => {
                    if (Array.isArray(fieldErrors)) {
                        return `${field}: ${fieldErrors.join(', ')}`;
                    }
                    return `${field}: ${fieldErrors}`;
                })
                .join('\n');
        }
        
        return errors;
    }

    /**
     * Show a confirmation dialog
     * @param {Object} options - Configuration for the dialog
     * @returns {Promise} - Promise resolving when confirmed
     */
    confirmAction(options) {
        const defaults = {
            icon: 'warning',
            showCancelButton: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        };
        
        return Swal.fire({...defaults, ...options});
    }
    
    /**
     * Helper to capitalize first letter of a string
     * @param {string} string - String to capitalize
     * @returns {string} - Capitalized string
     */
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    /**
     * Clean up resources
     * Should be called when manager is no longer needed
     */
    destroy() {
        // Clean up filter if it exists
        if (this.filter && typeof this.filter.destroy === 'function') {
            this.filter.destroy();
        }
        
        // Subclasses should override this to clean up their specific resources
        console.log(`Base ${this.itemType} manager destroyed`);
    }
}

export default BaseManager;
