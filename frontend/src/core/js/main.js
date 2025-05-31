// main.js - Core site functionality
import '../css/main.css';

// Import Bootstrap JS and CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import * as bootstrap from 'bootstrap';

// Import SweetAlert2
import Swal from 'sweetalert2';

// Expose Bootstrap and Swal to window
window.bootstrap = bootstrap;
window.Swal = Swal;

// Import FontAwesome with full icon sets
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

// Add all icons to the library
library.add(fas, far, fab);

// Replace any existing <i> tags with <svg> and watch for future changes
dom.watch();

/**
 * Global toast notification function
 * @param {string} title - Toast title
 * @param {string} message - Toast message content
 * @param {string} type - Toast type (success, error, warning, info)
 */
window.showToast = function(title, message, type = 'info') {
    // Check if Bootstrap is available
    if (typeof bootstrap !== 'undefined') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            return;
        }

        // Create toast element
        const toastElement = document.createElement('div');
        toastElement.className = 'toast';
        toastElement.setAttribute('role', 'alert');
        toastElement.setAttribute('aria-live', 'assertive');
        toastElement.setAttribute('aria-atomic', 'true');

        // Add appropriate color class based on type
        toastElement.classList.add(`toast-${type}`);

        // Set toast content
        toastElement.innerHTML = `
            <div class="toast-header">
                <strong class="me-auto">${title}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        `;

        // Add to container
        toastContainer.appendChild(toastElement);

        // Initialize and show toast
        const toast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: 5000
        });

        toast.show();

        // Clean up when toast is hidden
        toastElement.addEventListener('hidden.bs.toast', function() {
            toastElement.remove();
        });
    }
};

/**
 * Initialize Bootstrap components
 */
function initBootstrapComponents() {
    // Initialize all Bootstrap dropdowns using data-bs-toggle attribute
    // This is the recommended way to initialize Bootstrap components
    const dropdownElementList = [].slice.call(document.querySelectorAll('[data-bs-toggle="dropdown"]'));
    if (dropdownElementList.length > 0) {
        dropdownElementList.forEach(function(dropdownToggleEl) {
            new bootstrap.Dropdown(dropdownToggleEl);
        });
        console.log(`Initialized ${dropdownElementList.length} dropdown components via data-bs-toggle`);
    }

    // Also initialize all elements with dropdown-toggle class as a fallback
    const dropdownToggleList = [].slice.call(document.querySelectorAll('.dropdown-toggle:not([data-bs-toggle="dropdown"])'));
    if (dropdownToggleList.length > 0) {
        dropdownToggleList.forEach(function(dropdownToggleEl) {
            // Add the data attribute dynamically
            dropdownToggleEl.setAttribute('data-bs-toggle', 'dropdown');
            new bootstrap.Dropdown(dropdownToggleEl);
        });
        console.log(`Initialized ${dropdownToggleList.length} additional dropdown components via class`);
    }

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    if (tooltipTriggerList.length > 0) {
        tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
        console.log(`Initialized ${tooltipTriggerList.length} tooltip components`);
    }

    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    if (popoverTriggerList.length > 0) {
        popoverTriggerList.map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
        console.log(`Initialized ${popoverTriggerList.length} popover components`);
    }
}

/**
 * Initialize navbar dropdown functionality specifically
 */
function initNavbarDropdowns() {
    // Get all navbar dropdown elements
    const navbarDropdowns = document.querySelectorAll('.navbar .dropdown-toggle');

    // Ensure they have the proper attributes for Bootstrap 5
    navbarDropdowns.forEach(dropdown => {
        // Make sure these attributes are set correctly
        dropdown.setAttribute('data-bs-toggle', 'dropdown');
        dropdown.setAttribute('role', 'button');
        dropdown.setAttribute('aria-expanded', 'false');

        // Optional: Ensure the dropdown menu has the correct classes and attributes
        const menu = dropdown.nextElementSibling;
        if (menu && menu.classList.contains('dropdown-menu')) {
            menu.setAttribute('aria-labelledby', dropdown.id || 'navbarDropdown');
        }

        console.log('Navbar dropdown prepared for Bootstrap 5:', dropdown.textContent.trim());
    });
}

// Initialize when DOM is fully loaded, using the "DOMContentLoaded" event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all Bootstrap components
    initBootstrapComponents();

    // Special handling for navbar dropdowns (prep them properly)
    initNavbarDropdowns();

    console.log('All Bootstrap components initialized');
});

// Also listen for window load event as a fallback
window.addEventListener('load', function() {
    // Check if any dropdowns were missed
    const uninitializedDropdowns = document.querySelectorAll('.dropdown-toggle:not([data-bs-initialized])');
    if (uninitializedDropdowns.length > 0) {
        console.log(`Initializing ${uninitializedDropdowns.length} dropdowns that were missed`);
        uninitializedDropdowns.forEach(dropdown => {
            dropdown.setAttribute('data-bs-toggle', 'dropdown');
            dropdown.setAttribute('data-bs-initialized', 'true');
            new bootstrap.Dropdown(dropdown);
        });
    }
});

// Export any components that might be needed elsewhere
export { initBootstrapComponents };
