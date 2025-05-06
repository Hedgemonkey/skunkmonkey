/**
 * Main staff management entry point
 * For use with django-vite integration
 */

// Import styles - this allows Vite to bundle the CSS with this JavaScript file
import '@staff/css/staff.css';

// Import FontAwesome
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import {
    faPlus, faTags, faBox, faCheckCircle,
    faExclamationTriangle, faExclamationCircle,
    faDollarSign, faSearch, faChevronDown,
    faEdit, faEye, faTrash, faArrowLeft,
    faSpinner, faUserCircle, faUsers, faGear,
    faBell, faCog, faPerson, faShoppingCart,
    faGauge, faList, faClipboard, faBars, faUser
} from '@fortawesome/free-solid-svg-icons';

// Import staff modules
import staffDashboard from './modules/staff-dashboard';
import staffCharts from './modules/staff-charts';

// Add all icons to the library
library.add(
    faPlus, faTags, faBox, faCheckCircle,
    faExclamationTriangle, faExclamationCircle,
    faDollarSign, faSearch, faChevronDown,
    faEdit, faEye, faTrash, faArrowLeft,
    faSpinner, faUserCircle, faUsers, faGear,
    faBell, faCog, faPerson, faShoppingCart,
    faGauge, faList, faClipboard, faBars, faUser
);

// Replace any existing <i> tags with SVG
dom.watch();

/**
 * StaffManager class for handling staff-related functionality
 */
class StaffManager {
    constructor() {
        this.initEventListeners();
        this.initBootstrapComponents();
        this.dashboard = staffDashboard;
        this.charts = staffCharts;
    }

    /**
     * Initialize event listeners
     */
    initEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            // Mobile sidebar toggle functionality
            const sidebarToggle = document.getElementById('sidebarToggle');
            const staffSidebar = document.getElementById('staffSidebar');

            if (sidebarToggle && staffSidebar) {
                sidebarToggle.addEventListener('click', () => {
                    staffSidebar.classList.toggle('show');
                });

                // Close sidebar when clicking outside on mobile
                document.addEventListener('click', (event) => {
                    const isClickInside = staffSidebar.contains(event.target) ||
                                          sidebarToggle.contains(event.target);

                    if (!isClickInside && staffSidebar.classList.contains('show')) {
                        staffSidebar.classList.remove('show');
                    }
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

            // Initialize staff delete modal if present
            this.initDeleteStaffModal();
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
            tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

            // Initialize all popovers
            const popoverTriggerList = [].slice.call(
                document.querySelectorAll('[data-bs-toggle="popover"]')
            );
            popoverTriggerList.map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
        });
    }

    /**
     * Initialize delete staff modal functionality
     */
    initDeleteStaffModal() {
        const deleteStaffModal = document.getElementById('deleteStaffModal');
        if (deleteStaffModal) {
            deleteStaffModal.addEventListener('show.bs.modal', function(event) {
                const button = event.relatedTarget;
                const staffId = button.getAttribute('data-staff-id');
                const staffName = button.getAttribute('data-staff-name');

                document.getElementById('staff-name-to-delete').textContent = staffName;
                document.getElementById('delete-staff-form').action = `/staff/staff/${staffId}/delete/`;
            });
        }
    }
}

// Create and export an instance
const staffManager = new StaffManager();
export default staffManager;
