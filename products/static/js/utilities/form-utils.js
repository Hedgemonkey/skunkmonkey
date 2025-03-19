/**
 * form-utils.js - Reusable form utilities
 * 
 * Provides form handling, validation, and submission helpers
 */
import { makeAjaxRequest } from '../../../../static/js/ajax_helper.js';
import Swal from 'sweetalert2';

/**
 * Format error messages from form validation
 * @param {Object|string} errors - Error data
 * @returns {string} - Formatted error message
 */
export function formatErrorMessages(errors) {
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
 * Submit a form with AJAX
 * @param {HTMLElement} form - The form to submit
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @returns {Promise} - Promise resolving with the response
 */
export function submitFormAjax(form, onSuccess, onError) {
    Swal.showLoading();
    const formData = new FormData(form);
    
    return makeAjaxRequest(
        form.action,
        'POST',
        formData,
        (response) => {
            if (!response.success) {
                const errorMessage = formatErrorMessages(response.errors);
                Swal.hideLoading();
                Swal.showValidationMessage(errorMessage);
                return Promise.reject(response.errors);
            }
            
            if (onSuccess) {
                onSuccess(response);
            }
            
            return response;
        },
        (error) => {
            console.error('Form submission error:', error);
            Swal.hideLoading();
            
            let errorMessage = 'An error occurred while processing your request.';
            if (error.responseJSON) {
                errorMessage = formatErrorMessages(error.responseJSON.errors);
            }
            
            Swal.showValidationMessage(errorMessage);
            
            if (onError) {
                onError(error);
            }
            
            return Promise.reject(error);
        },
        false,
        false
    );
}

/**
 * Initialize Select2 on a form field
 * @param {jQuery} selectElement - The select element to initialize
 * @param {Object} options - Configuration options
 */
export function initializeSelect2(selectElement, options = {}) {
    const defaultOptions = {
        theme: 'bootstrap-5',
        width: '100%',
        placeholder: 'Select an option'
    };
    
    selectElement.select2({...defaultOptions, ...options});
}

/**
 * Disable a form while it's being submitted
 * @param {jQuery} form - The form to disable
 * @param {boolean} disabled - Whether to disable or enable the form
 */
export function setFormDisabled(form, disabled) {
    form.find('input, select, textarea, button').prop('disabled', disabled);
}

/**
 * Show a form in a modal dialog
 * @param {string} title - Dialog title
 * @param {string} html - Dialog content
 * @param {Function} onSubmit - Form submission handler
 * @param {boolean} isEdit - Whether this is an edit operation
 * @returns {Promise} - Promise resolving when dialog is closed
 */
export function showFormDialog(title, html, onSubmit, isEdit = false) {
    return Swal.fire({
        title: title,
        html: html,
        showCancelButton: true,
        confirmButtonText: isEdit ? 'Save' : 'Submit',
        allowOutsideClick: false,
        allowEscapeKey: false,
        preConfirm: onSubmit
    });
}

/**
 * Show a confirmation dialog
 * @param {string} title - Dialog title
 * @param {string} text - Dialog message
 * @param {Function} onConfirm - Confirmation handler
 * @returns {Promise} - Promise resolving when dialog is closed
 */
export function confirmAction(title, text, onConfirm) {
    return Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        preConfirm: onConfirm
    });
}

/**
 * Collect form data as an object
 * @param {HTMLElement} form - The form to collect data from
 * @returns {Object} - Object containing form data
 */
export function collectFormData(form) {
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    return data;
}

/**
 * Validate a form field
 * @param {HTMLElement} field - The field to validate
 * @param {Function} validator - Validation function returning error message or null
 * @returns {boolean} - Whether the field is valid
 */
export function validateField(field, validator) {
    const $field = $(field);
    const errorMessage = validator($field.val(), $field);
    
    if (errorMessage) {
        $field.addClass('is-invalid');
        
        // Create or update error message
        let $feedback = $field.next('.invalid-feedback');
        if (!$feedback.length) {
            $feedback = $('<div class="invalid-feedback"></div>');
            $field.after($feedback);
        }
        
        $feedback.text(errorMessage);
        return false;
    } else {
        $field.removeClass('is-invalid');
        $field.next('.invalid-feedback').remove();
        return true;
    }
}

/**
 * Set up form field validation
 * @param {jQuery} form - The form to set up validation for
 * @param {Object} validationRules - Mapping of field names to validation functions
 */
export function setupFormValidation(form, validationRules) {
    // Validate on submit
    form.on('submit', function(e) {
        let isValid = true;
        
        for (const [fieldName, validator] of Object.entries(validationRules)) {
            const field = form.find(`[name="${fieldName}"]`)[0];
            if (field && !validateField(field, validator)) {
                isValid = false;
            }
        }
        
        if (!isValid) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        return isValid;
    });
    
    // Validate fields on blur
    for (const fieldName of Object.keys(validationRules)) {
        form.on('blur', `[name="${fieldName}"]`, function() {
            validateField(this, validationRules[fieldName]);
        });
    }
}

export default {
    formatErrorMessages,
    submitFormAjax,
    initializeSelect2,
    setFormDisabled,
    showFormDialog,
    confirmAction,
    collectFormData,
    validateField,
    setupFormValidation
};