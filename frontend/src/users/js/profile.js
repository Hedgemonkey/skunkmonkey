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

// Initialize common functionality
document.addEventListener('DOMContentLoaded', () => {
  // Add event listeners for any common profile elements
  initCommonProfileElements();
});

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
export { initCommonProfileElements };
