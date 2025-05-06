// main.js - Core site functionality
import '../css/main.css';

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
    // Initialize dropdowns
    const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
    
    // If Bootstrap 5 native is available
    if (typeof bootstrap !== 'undefined') {
        dropdownElementList.forEach(function(dropdownToggleEl) {
            new bootstrap.Dropdown(dropdownToggleEl);
        });
    } 
    // Fallback to jQuery if available
    else if (typeof $ !== 'undefined') {
        $(document).ready(function() {
            $('.dropdown-toggle').dropdown();
        });
    }
    
    // Initialize tooltips if Bootstrap is available
    if (typeof bootstrap !== 'undefined' && typeof bootstrap.Tooltip !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }
    
    // Initialize popovers if Bootstrap is available
    if (typeof bootstrap !== 'undefined' && typeof bootstrap.Popover !== 'undefined') {
        const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        popoverTriggerList.map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
    }
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initBootstrapComponents();
});

// Export any components that might be needed elsewhere
export { initBootstrapComponents };
