/*!
* Start Bootstrap - Full Width Pics v5.0.6 (https://startbootstrap.com/template/full-width-pics)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-full-width-pics/blob/master/LICENSE)
*/
import $ from 'jquery'; // Import jQuery
import 'bootstrap'; // Import Bootstrap JS Bundle (automatically finds proper entry point)
import { displayMessages } from './messages'; // Assuming messages.js contains displayMessages
import Swal from 'sweetalert2'; // Import SweetAlert2

// Make SweetAlert2 globally available
window.Swal = Swal;

// Main application object
const main = {
    init: function() {
        console.log('Main module initialized');
        this.initSweetAlert();
        this.initBootstrapComponents();

        // Display initial messages on page load if any exist
        displayMessages(window.messages || []);
    },

    initSweetAlert: function() {
        console.log('Initializing SweetAlert2');

        // Initialize SweetAlert2 with default options
        const swalDefaults = Swal.mixin({
            confirmButtonColor: '#0d6efd',
            cancelButtonColor: '#6c757d'
        });

        // Make the mixin available globally
        window.SwalDefault = swalDefaults;

        // Test SweetAlert2 is working
        console.log('SweetAlert2 version:', Swal.version);

        // Global function to show toast notifications
        window.showToast = function(title, message, type = 'info') {
            console.log('Global showToast called:', title, message, type);
            const iconType = type === 'danger' ? 'error' : type;

            // Ensure the toast is visible by setting important z-index and opacity
            const toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    // Apply additional styling to ensure visibility
                    toast.style.zIndex = '9999';
                    toast.style.opacity = '1';
                    toast.style.visibility = 'visible';

                    // Add event listeners
                    toast.addEventListener('mouseenter', Swal.stopTimer);
                    toast.addEventListener('mouseleave', Swal.resumeTimer);

                    // Log that toast was opened
                    console.log('Toast opened successfully');
                }
            });

            // Fire the toast with a small delay to ensure DOM is ready
            setTimeout(() => {
                toast.fire({
                    title: title,
                    text: message,
                    icon: iconType
                }).then(() => {
                    console.log('Toast closed');
                }).catch(err => {
                    console.error('Error showing toast:', err);
                });
            }, 100);
        };

        // Dispatch an event to notify other scripts that SweetAlert2 is initialized
        document.dispatchEvent(new Event('swal2-initialized'));
    },

    initBootstrapComponents: function() {
        console.log('Initializing Bootstrap components');

        // Function to initialize Bootstrap dropdowns
        const initDropdowns = () => {
            try {
                // For Bootstrap 5's native JS
                if (typeof bootstrap !== 'undefined' && bootstrap.Dropdown) {
                    const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
                    const dropdownList = dropdownElementList.map(function(dropdownToggleEl) {
                        return new bootstrap.Dropdown(dropdownToggleEl);
                    });
                    console.log('Bootstrap dropdowns initialized with native API');
                    return true;
                }

                // For jQuery-based Bootstrap (fallback)
                else if (typeof $ !== 'undefined' && typeof $.fn !== 'undefined' && typeof $.fn.dropdown === 'function') {
                    $('.dropdown-toggle').dropdown();
                    console.log('Bootstrap dropdowns initialized with jQuery');
                    return true;
                }

                return false;
            } catch (error) {
                console.error('Error initializing Bootstrap dropdowns:', error);
                return false;
            }
        };

        // Attempt to initialize immediately
        if (!initDropdowns()) {
            // If initial attempt fails, try again after window load event
            window.addEventListener('load', () => {
                // Wait a short delay to ensure everything is fully loaded
                setTimeout(() => {
                    if (!initDropdowns()) {
                        console.warn('Could not initialize Bootstrap dropdowns - bootstrap library not properly loaded');
                    }
                }, 300);
            });
        }
    }
};

// Initialize when DOM is loaded
$(function() {
    console.log('Initializing main.js');
    main.init();
});

// Export the main object as default
export default main;
