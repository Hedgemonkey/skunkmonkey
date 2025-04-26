/**
 * Main staff management entry point
 * For use with django-vite integration
 */

// Import styles - this allows Vite to bundle the CSS with this JavaScript file
import '@staff/css/staff.css';

/**
 * StaffManager class for handling staff-related functionality
 */
class StaffManager {
    constructor() {
        this.initEventListeners();
        this.initBootstrapComponents();
    }

    /**
     * Initialize event listeners
     */
    initEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            // Toggle the sidebar on mobile
            const sidebarToggle = document.getElementById('sidebarToggle');
            if (sidebarToggle) {
                sidebarToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.body.classList.toggle('sb-sidenav-toggled');
                });
            }

            // Auto-hide success messages after 5 seconds
            const messageAlerts = document.querySelectorAll('.alert-success');
            messageAlerts.forEach(alert => {
                setTimeout(() => {
                    const bsAlert = new bootstrap.Alert(alert);
                    bsAlert.close();
                }, 5000);
            });
        });
    }

    /**
     * Initialize Bootstrap components
     */
    initBootstrapComponents() {
        document.addEventListener('DOMContentLoaded', () => {
            // Initialize all tooltips
            const tooltipTriggerList = [].slice.call(
                document.querySelectorAll('[data-bs-toggle="tooltip"]')
            );
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });

            // Initialize all popovers
            const popoverTriggerList = [].slice.call(
                document.querySelectorAll('[data-bs-toggle="popover"]')
            );
            popoverTriggerList.map(function (popoverTriggerEl) {
                return new bootstrap.Popover(popoverTriggerEl);
            });
        });
    }
}

// Create and export an instance
const staffManager = new StaffManager();
export default staffManager;
