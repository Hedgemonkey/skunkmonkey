/**
 * Staff Product Manager Module
 * Handles advanced AJAX-based filtering, sorting, and batch operations
 * for the staff product management interface
 */

// Import FontAwesome icons
import '@staff/css/product-manager.css';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import {
    faPlus, faTags, faBox, faCheckCircle,
    faExclamationTriangle, faExclamationCircle,
    faDollarSign, faSearch, faChevronDown,
    faEdit, faEye, faTrash
} from '@fortawesome/free-solid-svg-icons';

// Add icons to the library
library.add(
    faPlus, faTags, faBox, faCheckCircle,
    faExclamationTriangle, faExclamationCircle,
    faDollarSign, faSearch, faChevronDown,
    faEdit, faEye, faTrash
);

// Replace any existing <i> tags with SVG
dom.watch();

class StaffProductManager {
    constructor() {
        this.filters = {
            search: '',
            category: '',
            stock_status: '',
            status: '',
            sort: 'name-asc',
            price_min: '',
            price_max: '',
            page: 1
        };
        this.productListContainerId = 'product-list-container';
        this.filterFormId = 'product-filter-form';
        this.batchActionFormId = 'product-batch-action-form';
        this.paginationContainerId = 'pagination-container';
        this.productsUrl = '/staff/api/products/list/';
        this.statsUrl = '/staff/api/products/stats/';
        this.debounceTimeout = null;
        this.filterChangeDelay = 500; // ms
        this.isLoading = false;

        // Batch selection state
        this.selectedProducts = new Set();
        this.allSelected = false;
    }

    init() {
        this.bindEvents();
        this.refreshProductList();
        this.refreshProductStats();

        // Initialize tooltips and popovers if using Bootstrap
        if (typeof bootstrap !== 'undefined') {
            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

            const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
            [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
        }
    }

    bindEvents() {
        const filterForm = document.getElementById(this.filterFormId);
        if (filterForm) {
            // Bind filter form inputs
            const formInputs = filterForm.querySelectorAll('input, select');
            formInputs.forEach(input => {
                if (input.type === 'text' || input.type === 'number' || input.type === 'search') {
                    input.addEventListener('input', () => this.handleFilterChange(input));
                } else {
                    input.addEventListener('change', () => this.handleFilterChange(input));
                }
            });

            // Prevent default form submission
            filterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.refreshProductList();
            });

            // Reset button
            const resetBtn = filterForm.querySelector('.reset-filters');
            if (resetBtn) {
                resetBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.resetFilters();
                });
            }
        }

        // Batch action handlers
        document.addEventListener('click', (e) => {
            // Select all checkbox
            if (e.target.matches('#select-all-products')) {
                this.handleSelectAllToggle(e.target.checked);
            }

            // Individual product checkbox
            if (e.target.matches('.product-select-checkbox')) {
                this.handleProductSelection(e.target);
            }

            // Batch action button
            if (e.target.matches('#apply-batch-action') || e.target.closest('#apply-batch-action')) {
                this.handleBatchAction();
            }

            // Quick edit links
            if (e.target.matches('.quick-edit-link') || e.target.closest('.quick-edit-link')) {
                e.preventDefault();
                const link = e.target.closest('.quick-edit-link');
                const productId = link.dataset.productId;
                const field = link.dataset.field;
                this.openQuickEdit(productId, field);
            }
        });

        // Pagination handler
        document.addEventListener('click', (e) => {
            if (e.target.matches('.page-link') && !e.target.parentElement.classList.contains('disabled')) {
                e.preventDefault();
                const pageUrl = e.target.getAttribute('href');
                if (pageUrl) {
                    const urlParams = new URLSearchParams(pageUrl.split('?')[1]);
                    this.filters.page = urlParams.get('page') || 1;
                    this.refreshProductList();
                }
            }
        });
    }

    handleFilterChange(input) {
        // Debounce to prevent too many requests
        clearTimeout(this.debounceTimeout);

        this.debounceTimeout = setTimeout(() => {
            // Update filters object based on input
            const name = input.name;
            const value = input.value;

            this.filters[name] = value;
            this.filters.page = 1; // Reset to first page on filter change
            this.refreshProductList();
        }, this.filterChangeDelay);
    }

    resetFilters() {
        // Reset all filters to default values
        this.filters = {
            search: '',
            category: '',
            stock_status: '',
            status: '',
            sort: 'name-asc',
            price_min: '',
            price_max: '',
            page: 1
        };

        // Reset form inputs
        const filterForm = document.getElementById(this.filterFormId);
        if (filterForm) {
            filterForm.reset();
        }

        // Refresh product list with reset filters
        this.refreshProductList();
    }

    handleSelectAllToggle(checked) {
        this.allSelected = checked;

        // Update all checkboxes
        const checkboxes = document.querySelectorAll('.product-select-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
            const productId = checkbox.dataset.productId;

            if (checked) {
                this.selectedProducts.add(productId);
            } else {
                this.selectedProducts.delete(productId);
            }
        });

        this.updateBatchActionUI();
    }

    handleProductSelection(checkbox) {
        const productId = checkbox.dataset.productId;

        if (checkbox.checked) {
            this.selectedProducts.add(productId);
        } else {
            this.selectedProducts.delete(productId);

            // Uncheck "select all" if any product is unchecked
            document.getElementById('select-all-products').checked = false;
            this.allSelected = false;
        }

        this.updateBatchActionUI();
    }

    updateBatchActionUI() {
        // Update selected count
        const selectedCount = this.selectedProducts.size;
        const countElement = document.getElementById('selected-count');
        if (countElement) {
            countElement.textContent = selectedCount;
        }

        // Enable/disable batch action buttons
        const batchActionBtn = document.getElementById('apply-batch-action');
        if (batchActionBtn) {
            batchActionBtn.disabled = selectedCount === 0;
        }

        // Update batch action dropdown visibility
        const batchActions = document.getElementById('batch-actions-container');
        if (batchActions) {
            batchActions.classList.toggle('d-none', selectedCount === 0);
        }
    }

    handleBatchAction() {
        const batchActionSelect = document.getElementById('batch-action');
        if (!batchActionSelect) return;

        const action = batchActionSelect.value;
        if (!action) return;

        const selectedIds = Array.from(this.selectedProducts);

        // Confirmation dialog for destructive actions
        if (['delete', 'deactivate'].includes(action)) {
            const confirmed = confirm(`Are you sure you want to ${action} the selected products?`);
            if (!confirmed) return;
        }

        // Send batch action request
        this.setLoadingState(true);

        fetch('/staff/api/products/batch-action/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCsrfToken()
            },
            body: JSON.stringify({
                action: action,
                product_ids: selectedIds
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show success message
                this.showNotification('success', data.message);

                // Reset selection
                this.selectedProducts = new Set();
                this.allSelected = false;

                // Refresh product list and stats
                this.refreshProductList();
                this.refreshProductStats();
            } else {
                this.showNotification('danger', data.error || 'An error occurred');
            }
            this.setLoadingState(false);
        })
        .catch(error => {
            console.error('Error applying batch action:', error);
            this.showNotification('danger', 'An error occurred while processing your request');
            this.setLoadingState(false);
        });
    }

    openQuickEdit(productId, field) {
        // Implement inline editing functionality
        const productRow = document.querySelector(`tr[data-product-id="${productId}"]`);
        if (!productRow) return;

        const cell = productRow.querySelector(`.${field}-cell`);
        if (!cell) return;

        const currentValue = cell.dataset.value || cell.textContent.trim();

        // Store original content to restore if canceled
        const originalContent = cell.innerHTML;

        // Create appropriate edit control based on field type
        let editControl;
        if (field === 'price') {
            editControl = `
                <div class="quick-edit-container">
                    <input type="number" class="form-control form-control-sm"
                           value="${currentValue}" step="0.01" min="0">
                    <div class="mt-2">
                        <button class="btn btn-primary btn-sm save-quick-edit"
                                data-field="${field}" data-product-id="${productId}">
                            Save
                        </button>
                        <button class="btn btn-secondary btn-sm cancel-quick-edit">
                            Cancel
                        </button>
                    </div>
                </div>
            `;
        } else if (field === 'stock_quantity') {
            editControl = `
                <div class="quick-edit-container">
                    <input type="number" class="form-control form-control-sm"
                           value="${currentValue}" min="0">
                    <div class="mt-2">
                        <button class="btn btn-primary btn-sm save-quick-edit"
                                data-field="${field}" data-product-id="${productId}">
                            Save
                        </button>
                        <button class="btn btn-secondary btn-sm cancel-quick-edit">
                            Cancel
                        </button>
                    </div>
                </div>
            `;
        } else if (field === 'is_active') {
            const isChecked = currentValue === 'true' ? 'checked' : '';
            editControl = `
                <div class="quick-edit-container">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" ${isChecked}>
                    </div>
                    <div class="mt-2">
                        <button class="btn btn-primary btn-sm save-quick-edit"
                                data-field="${field}" data-product-id="${productId}">
                            Save
                        </button>
                        <button class="btn btn-secondary btn-sm cancel-quick-edit">
                            Cancel
                        </button>
                    </div>
                </div>
            `;
        }

        // Insert edit control
        if (editControl) {
            cell.innerHTML = editControl;

            // Add event listeners for save and cancel
            const saveBtn = cell.querySelector('.save-quick-edit');
            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    let value;
                    if (field === 'is_active') {
                        value = cell.querySelector('.form-check-input').checked;
                    } else {
                        value = cell.querySelector('input').value;
                    }

                    this.saveQuickEdit(productId, field, value);
                });
            }

            const cancelBtn = cell.querySelector('.cancel-quick-edit');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    cell.innerHTML = originalContent;
                });
            }
        }
    }

    saveQuickEdit(productId, field, value) {
        this.setLoadingState(true);

        fetch(`/staff/products/${productId}/quick-edit/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': this.getCsrfToken()
            },
            body: new URLSearchParams({
                'field': field,
                'value': value
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show success notification
                this.showNotification('success', data.message || 'Updated successfully');

                // Refresh the product list to show updated values
                this.refreshProductList();

                // If it's a change that affects stats, refresh stats too
                if (['price', 'stock_quantity', 'is_active'].includes(field)) {
                    this.refreshProductStats();
                }
            } else {
                // Show error notification
                this.showNotification('danger', data.error || 'An error occurred');
                // Refresh the product list to revert to accurate state
                this.refreshProductList();
            }
            this.setLoadingState(false);
        })
        .catch(error => {
            console.error('Error saving quick edit:', error);
            this.showNotification('danger', 'An error occurred while saving changes');
            this.refreshProductList();
            this.setLoadingState(false);
        });
    }

    refreshProductList() {
        this.setLoadingState(true);

        // Build the URL with query parameters from the filters
        const url = new URL(this.productsUrl, window.location.origin);
        Object.keys(this.filters).forEach(key => {
            if (this.filters[key]) {
                url.searchParams.append(key, this.filters[key]);
            }
        });

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.renderProductList(data);
                } else {
                    this.showNotification('danger', data.error || 'An error occurred');
                }
                this.setLoadingState(false);
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                this.showNotification('danger', 'An error occurred while fetching products');
                this.setLoadingState(false);
            });
    }

    refreshProductStats() {
        fetch(this.statsUrl)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.updateStatCards(data.stats);
                }
            })
            .catch(error => {
                console.error('Error fetching product stats:', error);
            });
    }

    renderProductList(data) {
        const container = document.getElementById(this.productListContainerId);
        const paginationContainer = document.getElementById(this.paginationContainerId);

        if (!container) return;

        if (data.products && data.products.length > 0) {
            // Build product table HTML
            let html = `
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="select-all-products">
                                    <label class="form-check-label" for="select-all-products"></label>
                                </div>
                            </th>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>`;

            data.products.forEach(product => {
                const isActive = product.is_active;
                const imageUrl = product.image_url || '/static/assets/images/noimage.png';

                // Determine stock status class
                let stockClass = '';
                let stockIcon = '';
                if (product.stock_quantity === 0) {
                    stockClass = 'text-danger';
                    stockIcon = '<i class="fas fa-exclamation-circle text-danger me-1"></i>';
                } else if (product.stock_quantity <= 5) {
                    stockClass = 'text-warning';
                    stockIcon = '<i class="fas fa-exclamation-triangle text-warning me-1"></i>';
                }

                html += `
                    <tr data-product-id="${product.id}">
                        <td>
                            <div class="form-check">
                                <input class="form-check-input product-select-checkbox" type="checkbox"
                                       data-product-id="${product.id}">
                            </div>
                        </td>
                        <td>
                            <img src="${imageUrl}" alt="${product.name}"
                                 class="img-thumbnail product-thumbnail" width="50">
                        </td>
                        <td>
                            <a href="/staff/products/${product.id}/">
                                ${product.name}
                            </a>
                        </td>
                        <td>${product.category_name}</td>
                        <td class="price-cell" data-value="${product.price}">
                            $${product.price}
                            <a href="#" class="quick-edit-link ms-2"
                               data-product-id="${product.id}" data-field="price">
                                <i class="fas fa-edit"></i>
                            </a>
                        </td>
                        <td class="stock_quantity-cell ${stockClass}"
                            data-value="${product.stock_quantity}">
                            ${stockIcon}${product.stock_quantity}
                            <a href="#" class="quick-edit-link ms-2"
                               data-product-id="${product.id}" data-field="stock_quantity">
                                <i class="fas fa-edit"></i>
                            </a>
                        </td>
                        <td class="is_active-cell" data-value="${isActive}">
                            <span class="badge ${isActive ? 'bg-success' : 'bg-danger'}">
                                ${isActive ? 'Active' : 'Inactive'}
                            </span>
                            <a href="#" class="quick-edit-link ms-2"
                               data-product-id="${product.id}" data-field="is_active">
                                <i class="fas fa-edit"></i>
                            </a>
                        </td>
                        <td>
                            <div class="btn-group">
                                <a href="/staff/products/${product.id}/"
                                   class="btn btn-sm btn-info" title="View">
                                    <i class="fas fa-eye"></i>
                                </a>
                                <a href="/staff/products/${product.id}/update/"
                                   class="btn btn-sm btn-primary" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </a>
                            </div>
                        </td>
                    </tr>`;
            });

            html += `
                    </tbody>
                </table>`;

            container.innerHTML = html;

            // Render pagination
            if (paginationContainer && data.pagination) {
                this.renderPagination(data.pagination, paginationContainer);
            }

            // Show batch action controls if available
            const batchActionsContainer = document.getElementById('batch-actions-container');
            if (batchActionsContainer) {
                batchActionsContainer.classList.remove('d-none');
            }
        } else {
            // No products found
            container.innerHTML = `
                <div class="alert alert-info">
                    No products found matching your criteria.
                </div>`;

            // Clear pagination
            if (paginationContainer) {
                paginationContainer.innerHTML = '';
            }

            // Hide batch action controls
            const batchActionsContainer = document.getElementById('batch-actions-container');
            if (batchActionsContainer) {
                batchActionsContainer.classList.add('d-none');
            }
        }
    }

    renderPagination(pagination, container) {
        if (!pagination || !container) return;

        const { current_page, total_pages } = pagination;

        let html = `
            <nav aria-label="Product pagination">
                <ul class="pagination justify-content-center">`;

        // Previous page button
        html += `
                    <li class="page-item ${current_page <= 1 ? 'disabled' : ''}">
                        <a class="page-link" href="?page=${current_page - 1}" tabindex="-1">
                            Previous
                        </a>
                    </li>`;

        // Page numbers
        const startPage = Math.max(1, current_page - 2);
        const endPage = Math.min(total_pages, current_page + 2);

        // First page link if not in range
        if (startPage > 1) {
            html += `
                    <li class="page-item">
                        <a class="page-link" href="?page=1">1</a>
                    </li>`;
            if (startPage > 2) {
                html += `
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>`;
            }
        }

        // Page links
        for (let i = startPage; i <= endPage; i++) {
            html += `
                    <li class="page-item ${i === current_page ? 'active' : ''}">
                        <a class="page-link" href="?page=${i}">${i}</a>
                    </li>`;
        }

        // Last page link if not in range
        if (endPage < total_pages) {
            if (endPage < total_pages - 1) {
                html += `
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>`;
            }
            html += `
                    <li class="page-item">
                        <a class="page-link" href="?page=${total_pages}">${total_pages}</a>
                    </li>`;
        }

        // Next page button
        html += `
                    <li class="page-item ${current_page >= total_pages ? 'disabled' : ''}">
                        <a class="page-link" href="?page=${current_page + 1}">Next</a>
                    </li>
                </ul>
            </nav>`;

        container.innerHTML = html;
    }

    updateStatCards(stats) {
        // Update stat cards with new values
        if (!stats) return;

        // Total products
        const totalProductsEl = document.getElementById('total-products-stat');
        if (totalProductsEl && stats.total_products !== undefined) {
            totalProductsEl.textContent = stats.total_products;
        }

        // Active products
        const activeProductsEl = document.getElementById('active-products-stat');
        if (activeProductsEl && stats.active_products !== undefined) {
            activeProductsEl.textContent = stats.active_products;
        }

        // Out of stock
        const outOfStockEl = document.getElementById('out-of-stock-stat');
        if (outOfStockEl && stats.out_of_stock !== undefined) {
            outOfStockEl.textContent = stats.out_of_stock;
        }

        // Low stock
        const lowStockEl = document.getElementById('low-stock-stat');
        if (lowStockEl && stats.low_stock !== undefined) {
            lowStockEl.textContent = stats.low_stock;
        }

        // Total stock value
        const stockValueEl = document.getElementById('total-stock-value-stat');
        if (stockValueEl && stats.total_stock_value !== undefined) {
            stockValueEl.textContent = `$${stats.total_stock_value.toFixed(2)}`;
        }
    }

    setLoadingState(isLoading) {
        this.isLoading = isLoading;
        const loadingSpinner = document.getElementById('loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.style.display = isLoading ? 'block' : 'none';
        }

        // Add or remove loading overlay
        const productList = document.getElementById(this.productListContainerId);
        if (productList) {
            if (isLoading) {
                productList.classList.add('loading');
            } else {
                productList.classList.remove('loading');
            }
        }
    }

    showNotification(type, message) {
        // Create notification element
        const notificationElement = document.createElement('div');
        notificationElement.className = `alert alert-${type} alert-dismissible fade show staff-notification`;
        notificationElement.role = 'alert';

        notificationElement.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        // Add to container or body
        const notificationContainer = document.getElementById('notification-container') || document.body;
        notificationContainer.appendChild(notificationElement);

        // Auto dismiss after 5 seconds
        setTimeout(() => {
            notificationElement.classList.remove('show');
            setTimeout(() => {
                notificationElement.remove();
            }, 300);
        }, 5000);
    }

    getCsrfToken() {
        // Get CSRF token from cookie
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];

        return cookieValue || '';
    }
}

// Export for use in other modules
export { StaffProductManager };

// Initialize if document is ready and this script is loaded directly
document.addEventListener('DOMContentLoaded', () => {
    const productManager = new StaffProductManager();
    productManager.init();

    // Make available globally for debugging
    window.productManager = productManager;
});
