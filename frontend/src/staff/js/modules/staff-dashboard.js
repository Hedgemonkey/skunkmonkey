/**
 * Staff Dashboard module
 * Handles specific functionality for the staff product dashboard
 */
// Import bootstrap for modal functionality
import * as bootstrap from 'bootstrap';

/**
 * StaffDashboard class for managing dashboard-specific functionality
 */
class StaffDashboard {
    constructor() {
        this.init();
    }

    /**
     * Initialize dashboard functionality
     */
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.loadLowStockProducts();
            this.initImportExport();
        });
    }

    /**
     * Load low stock products via AJAX
     */
    loadLowStockProducts() {
        const container = document.getElementById('low-stock-container');
        if (!container) return;

        const spinner = container.querySelector('.spinner-container');
        const tableBody = document.getElementById('low-stock-table-body');

        spinner.classList.remove('d-none');

        fetch('/staff/api/products/low-stock/')
            .then(response => response.json())
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
                                        <a href="/staff/products/${product.id}/update/" class="btn btn-sm btn-primary">
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
                            <td colspan="5" class="text-center py-3">No low stock products found</td>
                        </tr>
                    `;
                }
            })
            .catch(error => {
                console.error('Error loading low stock products:', error);
                spinner.classList.add('d-none');
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center py-3 text-danger">
                            Error loading low stock products
                        </td>
                    </tr>
                `;
            });
    }

    /**
     * Initialize import/export functionality
     */
    initImportExport() {
        const importBtn = document.getElementById('import-products-btn');
        const exportBtn = document.getElementById('export-products-btn');
        const importModalEl = document.getElementById('importProductsModal');

        if (!importBtn || !exportBtn || !importModalEl) return;

        const importModal = new bootstrap.Modal(importModalEl);

        importBtn.addEventListener('click', (e) => {
            e.preventDefault();
            importModal.show();
        });

        exportBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/staff/api/products/export/';
        });

        const submitImportBtn = document.getElementById('submitImportBtn');
        if (submitImportBtn) {
            submitImportBtn.addEventListener('click', () => {
                const form = document.getElementById('importProductsForm');
                const formData = new FormData(form);

                // Submit the form
                form.submit();
            });
        }
    }
}

// Create and export an instance
const staffDashboard = new StaffDashboard();
export default staffDashboard;
