/**
 * notifications.js - Utility module for handling notifications
 * 
 * Provides consistent notification methods using SweetAlert2
 */
import Swal from 'sweetalert2';

/**
 * NotificationManager class for handling notifications
 */
export class NotificationManager {
    /**
     * Display success notification
     * @param {string} message - Success message to display
     */
    displaySuccess(message) {
        Swal.fire({
            title: 'Success!',
            text: message,
            icon: 'success',
            confirmButtonColor: '#0d6efd',
            timer: 3000,
            timerProgressBar: true
        });
    }
    
    /**
     * Display error notification
     * @param {string} message - Error message to display
     */
    displayError(message) {
        Swal.fire({
            title: 'Error!',
            text: message,
            icon: 'error',
            confirmButtonColor: '#0d6efd'
        });
    }
    
    /**
     * Display warning notification
     * @param {string} message - Warning message to display
     */
    displayWarning(message) {
        Swal.fire({
            title: 'Warning!',
            text: message,
            icon: 'warning',
            confirmButtonColor: '#0d6efd'
        });
    }
    
    /**
     * Display information notification
     * @param {string} message - Information message to display
     */
    displayInfo(message) {
        Swal.fire({
            title: 'Information',
            text: message,
            icon: 'info',
            confirmButtonColor: '#0d6efd'
        });
    }
    
    /**
     * Display error notification from AJAX response
     * @param {Object} error - Error object from AJAX response
     * @param {string} defaultMessage - Default message to display if error doesn't contain specific message
     */
    displayAjaxError(error, defaultMessage = 'An error occurred. Please try again.') {
        let errorMessage = defaultMessage;
        
        if (error.responseJSON && error.responseJSON.error) {
            errorMessage = error.responseJSON.error;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        this.displayError(errorMessage);
    }
    
    /**
     * Display confirmation dialog
     * @param {Object} options - Configuration options for the dialog
     * @returns {Promise} - Promise resolving when user makes a choice
     */
    confirm(options) {
        const defaults = {
            title: 'Are you sure?',
            text: 'This action cannot be undone.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0d6efd',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        };
        
        return Swal.fire({...defaults, ...options});
    }
    
    /**
     * Display prompt dialog
     * @param {Object} options - Configuration options for the dialog
     * @returns {Promise} - Promise resolving with user input
     */
    prompt(options) {
        const defaults = {
            title: 'Enter Information',
            input: 'text',
            showCancelButton: true,
            confirmButtonColor: '#0d6efd',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Submit',
            inputValidator: (value) => {
                if (!value) {
                    return 'Please enter a value!';
                }
            }
        };
        
        return Swal.fire({...defaults, ...options});
    }
    
    /**
     * Show loading indicator
     * @param {string} message - Message to display with the loading indicator
     */
    showLoading(message = 'Loading...') {
        Swal.fire({
            title: message,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }
    
    /**
     * Close any open notification
     */
    close() {
        Swal.close();
    }
}

export default NotificationManager;