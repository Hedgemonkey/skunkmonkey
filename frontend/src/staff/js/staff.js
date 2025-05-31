/**
 * Main staff management entry point
 * For use with django-vite integration
 */

// Import styles - this allows Vite to bundle the CSS with this JavaScript file
import '@staff/css/staff.css';

// Import FontAwesome icons directly to avoid chunking issues
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

// Import staff dashboard
import staffDashboard from './modules/staff-dashboard';

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

        // Fix for 404 error - intercept network requests for missing vendor chunks
        this.fixVendorChunkErrors();

        // Set up chart initialization
        this.initCharts();
    }

    /**
     * Fix for 404 errors related to vendor chunks
     */
    fixVendorChunkErrors() {
        // Fix vendor chunk 404 errors - listen for script load errors
        window.addEventListener('error', (event) => {
            // Check if error is for a script tag
            if (event.target && event.target.tagName === 'SCRIPT') {
                // Check if error is for the problematic vendor chunk
                if (event.target.src && event.target.src.includes('vendor-CQZYIS0i.js')) {
                    console.log('Fixed vendor chunk error for:', event.target.src);

                    // Make sure we only load charts once the error is handled
                    this.loadChartsOnDemand();

                    // Prevent error from showing in console
                    event.preventDefault();
                    return true;
                }
            }
        }, true);
    }

    /**
     * Chart initialization with direct loading instead of using chunks
     */
    initCharts() {
        document.addEventListener('DOMContentLoaded', () => {
            // Attempt to load charts after DOM is loaded
            this.loadChartsOnDemand();
        });
    }

    /**
     * Load Chart.js and initialize charts without using vendor chunks
     */
    async loadChartsOnDemand() {
        // Check if we have chart elements on the page
        const categoryChartEl = document.getElementById('categoryChart');
        const priceChartEl = document.getElementById('priceChart');

        if (!categoryChartEl && !priceChartEl) {
            return; // No charts on this page
        }

        // Load Chart.js directly from CDN if necessary
        if (typeof Chart === 'undefined') {
            console.log('Loading Chart.js from CDN');
            try {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.9/dist/chart.umd.min.js';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
                console.log('Chart.js loaded successfully');
            } catch (err) {
                console.error('Failed to load Chart.js:', err);
                return;
            }
        }

        // Now initialize charts
        this.renderCharts();
    }

    /**
     * Render charts directly without using the vendor chunks
     */
    renderCharts() {
        // Check for Chart global
        if (typeof Chart === 'undefined') {
            console.error('Chart.js not available');
            return;
        }

        // Initialize category chart
        const categoryChartEl = document.getElementById('categoryChart');
        if (categoryChartEl) {
            try {
                const labelsStr = categoryChartEl.getAttribute('data-labels') || '[]';
                const dataStr = categoryChartEl.getAttribute('data-values') || '[]';

                console.log('Category chart data:', { labels: labelsStr, values: dataStr });

                const labels = JSON.parse(labelsStr);
                const data = JSON.parse(dataStr);

                const ctx = categoryChartEl.getContext('2d');
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: data,
                            backgroundColor: [
                                '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b',
                                '#6f42c1', '#fd7e14', '#20c9a6', '#5a5c69', '#84a0c6'
                            ],
                            hoverOffset: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'right',
                            }
                        }
                    }
                });
                console.log('Category chart rendered successfully');
            } catch (err) {
                console.error('Failed to render category chart:', err);
            }
        }

        // Initialize price chart
        const priceChartEl = document.getElementById('priceChart');
        if (priceChartEl) {
            try {
                const labelsStr = priceChartEl.getAttribute('data-labels') || '[]';
                const dataStr = priceChartEl.getAttribute('data-values') || '[]';

                console.log('Price chart data:', { labels: labelsStr, values: dataStr });

                const labels = JSON.parse(labelsStr);
                const data = JSON.parse(dataStr);

                const ctx = priceChartEl.getContext('2d');
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Products by Price Range',
                            data: data,
                            backgroundColor: '#4e73df'
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Number of Products'
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Price Range'
                                }
                            }
                        }
                    }
                });
                console.log('Price chart rendered successfully');
            } catch (err) {
                console.error('Failed to render price chart:', err);
            }
        }
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
                    if (typeof bootstrap !== 'undefined' && bootstrap.Alert) {
                        const bsAlert = new bootstrap.Alert(alert);
                        bsAlert.close();
                    } else {
                        // Fallback if bootstrap is not available
                        alert.style.display = 'none';
                    }
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
            // Check if bootstrap is available
            if (typeof bootstrap === 'undefined') {
                console.warn('Bootstrap is not available');
                return;
            }

            // Initialize all tooltips
            try {
                const tooltipTriggerList = [].slice.call(
                    document.querySelectorAll('[data-bs-toggle="tooltip"]')
                );
                tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
            } catch (err) {
                console.warn('Failed to initialize tooltips:', err);
            }

            // Initialize all popovers
            try {
                const popoverTriggerList = [].slice.call(
                    document.querySelectorAll('[data-bs-toggle="popover"]')
                );
                popoverTriggerList.map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
            } catch (err) {
                console.warn('Failed to initialize popovers:', err);
            }
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
