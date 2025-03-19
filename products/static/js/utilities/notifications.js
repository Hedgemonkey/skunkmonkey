/**
 * notifications.js - Reusable notification utilities
 * 
 * Provides standardized message displays using SweetAlert2
 */
import Swal from 'sweetalert2';

/**
 * NotificationService class for handling user notifications
 */
export class NotificationService {
    /**
     * Display a success message
     * @param {string} message - Success message to display
     * @param {Object} options - Additional options
     */
    displaySuccess(message, options = {}) {
        const defaults = {
            icon: 'success',
            title: message,
            showConfirmButton: true,
            timer: 2000,
            timerProgressBar: true
        };
        
        Swal.fire({...defaults, ...options});
    }

    /**
     * Display an error message
     * @param {string} message - Error message to display
     * @param {Object} options - Additional options
     */
    displayError(message, options = {}) {
        const defaults = {
            icon: 'error',
            title: 'Error',
            text: message,
            showConfirmButton: true
        };
        
        Swal.fire({...defaults, ...options});
    }

    /**
     * Display validation error in SweetAlert context
     * @param {Object} error - Error object
     * @param {string} defaultMessage - Default message if error details not available
     * @returns {Promise} - Rejected promise for promise chain
     */
    displaySwalError(error, defaultMessage) {
        Swal.showValidationMessage(error.responseJSON?.error || defaultMessage);
        return Promise.reject();
    }
    
    /**
     * Display a confirmation dialog
     * @param {Object} options - Configuration options
     * @returns {Promise} - Promise resolving with user's choice
     */
    confirm(options) {
        const defaults = {
            icon: 'warning',
            showCancelButton: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6'
        };
        
        return Swal.fire({...defaults, ...options});
    }
    
    /**
     * Display a prompt for user input
     * @param {Object} options - Configuration options
     * @returns {Promise} - Promise resolving with user's input
     */
    prompt(options) {
        const defaults = {
            input: 'text',
            showCancelButton: true,
            inputValidator: (value) => !value && 'Please enter a value.'
        };
        
        return Swal.fire({...defaults, ...options});
    }
}

export default new NotificationService();