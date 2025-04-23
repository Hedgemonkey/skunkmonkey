/**
 * Main profile.js - Legacy entry point for backward compatibility
 * This file can be used as a general entry point that imports the base CSS
 * and initializes basic functionality needed across all profile pages.
 * For page-specific functionality, use the dedicated entry points in /js/entry/
 */

// Import base profile styles
import '../css/profile.css';
// Import profile image manager styling
import '../css/profile-image-manager.css';

// Import Bootstrap components
import 'bootstrap/js/dist/collapse';
import 'bootstrap/js/dist/dropdown';
import 'bootstrap/js/dist/tab';
import 'bootstrap/js/dist/modal';

// Initialize common functionality
document.addEventListener('DOMContentLoaded', () => {
  // Add event listeners for any common profile elements
  initCommonProfileElements();

  // Format date fields for better user display
  formatDateFields();
});

/**
 * Format date inputs to display in DD/MM/YYYY format
 * while maintaining the HTML5 date input functionality
 */
function formatDateFields() {
  const dateInputs = document.querySelectorAll('input[type="date"].date-input');

  dateInputs.forEach(input => {
    // Create a visible display element
    const displayEl = document.createElement('div');
    displayEl.className = 'date-display form-control';
    displayEl.style.cursor = 'pointer';
    displayEl.style.backgroundColor = '#fff';

    // Position the real input over the display but make it transparent
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';

    // Clone the input's classes to the wrapper
    input.classList.forEach(cls => {
      if (cls !== 'form-control' && cls !== 'date-input') {
        wrapper.classList.add(cls);
      }
    });

    // Style the actual date input
    input.style.position = 'absolute';
    input.style.top = '0';
    input.style.left = '0';
    input.style.width = '100%';
    input.style.height = '100%';
    input.style.opacity = '0';
    input.style.cursor = 'pointer';

    // Replace the input with our wrapper
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(displayEl);
    wrapper.appendChild(input);

    // Function to format date as DD/MM/YYYY
    const formatDate = (dateStr) => {
      if (!dateStr) return '';

      try {
        const date = new Date(dateStr);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
      } catch (e) {
        return dateStr;
      }
    };

    // Initialize with current value
    displayEl.textContent = input.value ? formatDate(input.value) : 'DD/MM/YYYY';

    // Update the display when the date changes
    input.addEventListener('change', () => {
      displayEl.textContent = input.value ? formatDate(input.value) : 'DD/MM/YYYY';
    });

    // Make clicking the display activate the date input
    displayEl.addEventListener('click', () => {
      input.focus();
    });
  });
}

/**
 * Initialize common elements that might be present across all profile pages
 */
function initCommonProfileElements() {
  // Sidebar active link highlighting
  const sidebarLinks = document.querySelectorAll('.profile-sidebar .list-group-item');
  const currentPath = window.location.pathname;

  sidebarLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && currentPath.includes(href) && href !== '/') {
      link.classList.add('active');
    }
  });

  // Initialize Bootstrap tooltips if present
  if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(tooltip => {
      new bootstrap.Tooltip(tooltip);
    });
  }

  // Initialize dismissible messages
  const dismissButtons = document.querySelectorAll('.alert .btn-close');
  dismissButtons.forEach(button => {
    button.addEventListener('click', function() {
      const alert = this.closest('.alert');
      if (alert) {
        alert.classList.add('fade');
        setTimeout(() => {
          alert.remove();
        }, 150);
      }
    });
  });
}

// Export common functionality for use in other modules if needed
export { initCommonProfileElements, formatDateFields };
