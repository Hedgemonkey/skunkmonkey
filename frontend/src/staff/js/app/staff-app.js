/**
 * Staff Dashboard Application
 * Created: May 8, 2025
 *
 * This is a completely fresh implementation to replace the problematic staff.js
 * and avoid the 404 error for vendor-CQZYIS0i.js
 */

// Import styles directly
import '@staff/css/staff.css';

// Direct imports that avoid chunking issues
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

// Debug marker to verify this file is being used
console.log('🔍 STAFF APP VERIFICATION - New staff-app.js file loaded - May 8, 2025');

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
 * StaffApplication class
 */
class StaffApplication {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupApplication());
        } else {
            this.setupApplication();
        }
    }

    setupApplication() {
        // Initialize all components
        this.initSidebar();
        this.initMessageAlerts();
        this.initBootstrapComponents();
        this.initDeleteStaffModal();
        this.loadLowStockProducts();
        this.initImportExport();

        // Load charts module dynamically to avoid chunking issues
        import('../modules/staff-dashboard-charts')
            .then(() => console.log('Charts module loaded successfully'))
            .catch(err => console.error('Failed to load charts module:', err));
    }

    initSidebar() {
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
    }

    initMessageAlerts() {
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
    }

    initBootstrapComponents() {
        // Check if bootstrap is available
        if (typeof bootstrap === 'undefined') {
            console.warn('Bootstrap is not available');
            return;
        }

        // Initialize tooltips
        try {
            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            if (tooltipTriggerList.length > 0) {
                [...tooltipTriggerList].map(tooltipTriggerEl =>
                    new bootstrap.Tooltip(tooltipTriggerEl)
                );
            }
        } catch (err) {
            console.warn('Failed to initialize tooltips:', err);
        }

        // Initialize popovers
        try {
            const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
            if (popoverTriggerList.length > 0) {
                [...popoverTriggerList].map(popoverTriggerEl =>
                    new bootstrap.Popover(popoverTriggerEl)
                );
            }
        } catch (err) {
            console.warn('Failed to initialize popovers:', err);
        }
    }

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

    loadLowStockProducts() {
        const container = document.getElementById('low-stock-container');
        if (!container) return;

        const spinner = container.querySelector('.spinner-container');
        const tableBody = document.getElementById('low-stock-table-body');
        if (!spinner || !tableBody) return;

        spinner.classList.remove('d-none');

        fetch('/staff/api/products/low-stock/')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                spinner.classList.add('d-none');

                if (data.products && data.products.length > 0) {
                    let html = '';
                    data.products.forEach(product => {
                        html += `
                            <tr>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <img src="${product.image_url || '/static/assets/images/noimage.png'}"
                                            alt="${product.name}" class="me-2 product-thumbnail">
                                        <span>${product.name}</span>
                                    </div>
                                </td>
                                <td>${product.category_name}</td>
                                <td>$${product.price}</td>
                                <td class="${product.stock_quantity === 0 ? 'text-danger' : 'text-warning'}">
                                    ${product.stock_quantity === 0 ?
                                      '<i class="fas fa-exclamation-circle text-danger me-1"></i>' :
                                      '<i class="fas fa-exclamation-triangle text-warning me-1"></i>'}
                                    ${product.stock_quantity}
                                </td>
                                <td>
                                    <div class="btn-group">
                                        <a href="/staff/products/${product.id}/" class="btn btn-sm btn-info">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                        <a href="/staff/products/${product.id}/edit/" class="btn btn-sm btn-warning">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        `;
                    });

                    tableBody.innerHTML = html;
                } else {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="5" class="text-center">
                                <div class="alert alert-success">
                                    No low stock products found. All inventory levels are healthy!
                                </div>
                            </td>
                        </tr>
                    `;
                }
            })
            .catch(error => {
                console.error('Error fetching low stock products:', error);
                spinner.classList.add('d-none');
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center">
                            <div class="alert alert-danger">
                                Error loading low stock products. Please try again.
                            </div>
                        </td>
                    </tr>
                `;
            });
    }

    initImportExport() {
        const importForm = document.getElementById('import-form');
        const exportForm = document.getElementById('export-form');
        const importBtn = document.getElementById('import-btn');
        const exportBtn = document.getElementById('export-btn');

        if (importForm && importBtn) {
            importBtn.addEventListener('click', () => {
                importForm.submit();
            });
        }

        if (exportForm && exportBtn) {
            exportBtn.addEventListener('click', () => {
                exportForm.submit();
            });
        }
    }
}

// Initialize application
const staffApp = new StaffApplication();
export default staffApp;
