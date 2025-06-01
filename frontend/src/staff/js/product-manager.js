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

        // Accessibility state management
        this.activeEditElement = null;
        this.previousFocus = null;
        this.liveRegion = null;
        this.statusRegion = null;
    }

    init() {
        this.setupAccessibility();
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

    setupAccessibility() {
        // Create ARIA live regions for announcements
        this.createLiveRegions();

        // Setup keyboard navigation
        this.setupKeyboardNavigation();

        // Add skip links if not present
        this.ensureSkipLinks();
    }

    createLiveRegions() {
        // Create assertive live region for important announcements (errors, confirmations)
        if (!this.liveRegion) {
            this.liveRegion = document.createElement('div');
            this.liveRegion.setAttribute('aria-live', 'assertive');
            this.liveRegion.setAttribute('aria-atomic', 'true');
            this.liveRegion.setAttribute('aria-relevant', 'text');
            this.liveRegion.className = 'visually-hidden';
            this.liveRegion.id = 'product-manager-live-region';
            document.body.appendChild(this.liveRegion);
        }

        // Create polite live region for status updates
        if (!this.statusRegion) {
            this.statusRegion = document.createElement('div');
            this.statusRegion.setAttribute('aria-live', 'polite');
            this.statusRegion.setAttribute('aria-atomic', 'true');
            this.statusRegion.className = 'visually-hidden';
            this.statusRegion.id = 'product-manager-status-region';
            document.body.appendChild(this.statusRegion);
        }
    }

    setupKeyboardNavigation() {
        // Add keyboard support for interactive elements
        document.addEventListener('keydown', (e) => {
            // Escape key to cancel quick edit
            if (e.key === 'Escape' && this.activeEditElement) {
                this.cancelQuickEdit();
            }

            // Enter/Space for button-like elements
            if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.quick-edit-btn')) {
                e.preventDefault();
                e.target.click();
            }

            // Tab navigation improvement for edit forms
            if (e.key === 'Tab' && this.activeEditElement) {
                this.handleTabNavigation(e);
            }

            // Arrow key navigation for table rows (optional enhancement)
            if (['ArrowUp', 'ArrowDown'].includes(e.key) && e.target.closest('tbody')) {
                this.handleArrowNavigation(e);
            }

            // Enter key on checkboxes
            if (e.key === 'Enter' && e.target.matches('.product-select-checkbox')) {
                e.target.checked = !e.target.checked;
                e.target.dispatchEvent(new Event('change'));
            }
        });
    }

    ensureSkipLinks() {
        // Add skip link to main content if not present
        const existingSkipLink = document.querySelector('a[href="#main-content"]');
        if (!existingSkipLink) {
            const skipLink = document.createElement('a');
            skipLink.href = '#main-content';
            skipLink.className = 'visually-hidden-focusable';
            skipLink.textContent = 'Skip to main content';
            skipLink.style.cssText = `
                position: absolute;
                top: -40px;
                left: 6px;
                background: #000;
                color: #fff;
                padding: 8px;
                text-decoration: none;
                z-index: 100000;
            `;
            skipLink.addEventListener('focus', () => {
                skipLink.style.top = '6px';
            });
            skipLink.addEventListener('blur', () => {
                skipLink.style.top = '-40px';
            });
            document.body.insertBefore(skipLink, document.body.firstChild);
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

             // Quick edit buttons - updated to work with buttons instead of links
            if (e.target.matches('.quick-edit-btn') || e.target.closest('.quick-edit-btn')) {
                e.preventDefault();
                const button = e.target.closest('.quick-edit-btn');
                const productId = button.dataset.productId;
                const field = button.dataset.field;
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
        const count = document.querySelectorAll('.product-select-checkbox').length;

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

        // Announce selection change to screen readers
        const message = checked
            ? `All ${count} products selected`
            : `All products deselected`;
        this.announceToScreenReader(message, 'polite');
    }

    handleProductSelection(checkbox) {
        const productId = checkbox.dataset.productId;
        const productName = checkbox.closest('tr').querySelector('a').textContent.trim();

        if (checkbox.checked) {
            this.selectedProducts.add(productId);
            this.announceToScreenReader(`${productName} selected`, 'polite');
        } else {
            this.selectedProducts.delete(productId);
            this.announceToScreenReader(`${productName} deselected`, 'polite');

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
            batchActionBtn.setAttribute('aria-label',
                selectedCount === 0
                    ? 'No products selected for batch action'
                    : `Apply batch action to ${selectedCount} selected products`
            );
        }

        // Update batch action dropdown visibility
        const batchActions = document.getElementById('batch-actions-container');
        if (batchActions) {
            batchActions.classList.toggle('d-none', selectedCount === 0);
            batchActions.setAttribute('aria-hidden', selectedCount === 0 ? 'true' : 'false');
        }

        // Update select all checkbox state
        const selectAllCheckbox = document.getElementById('select-all-products');
        const totalCheckboxes = document.querySelectorAll('.product-select-checkbox').length;
        if (selectAllCheckbox && totalCheckboxes > 0) {
            selectAllCheckbox.indeterminate = selectedCount > 0 && selectedCount < totalCheckboxes;
            selectAllCheckbox.checked = selectedCount === totalCheckboxes;
        }
    }

    handleBatchAction() {
        const batchActionSelect = document.getElementById('batch-action');
        if (!batchActionSelect) return;

        const action = batchActionSelect.value;
        if (!action) {
            this.announceToScreenReader('Please select an action to perform', 'assertive');
            batchActionSelect.focus();
            return;
        }

        const selectedIds = Array.from(this.selectedProducts);
        const selectedCount = selectedIds.length;

        // Confirmation dialog for destructive actions
        if (['delete', 'deactivate'].includes(action)) {
            const actionText = action === 'delete' ? 'permanently delete' : 'deactivate';
            const confirmed = confirm(
                `Are you sure you want to ${actionText} ${selectedCount} selected product${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`
            );
            if (!confirmed) {
                this.announceToScreenReader('Batch action cancelled', 'polite');
                return;
            }
        }

        // Announce action start
        this.announceToScreenReader(`Applying ${action} to ${selectedCount} products...`, 'assertive');

        // Send batch action request
        this.setLoadingState(true, `Processing ${action} for ${selectedCount} products...`);

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
                this.announceToScreenReader(`Successfully applied ${action} to ${selectedCount} products`, 'assertive');

                // Reset selection
                this.selectedProducts = new Set();
                this.allSelected = false;

                // Refresh product list and stats
                this.refreshProductList();
                this.refreshProductStats();
            } else {
                const errorMessage = data.error || 'An error occurred';
                this.showNotification('danger', errorMessage);
                this.announceToScreenReader(`Error: ${errorMessage}`, 'assertive');
            }
            this.setLoadingState(false);
        })
        .catch(error => {
            console.error('Error applying batch action:', error);
            const errorMessage = 'An error occurred while processing your request';
            this.showNotification('danger', errorMessage);
            this.announceToScreenReader(`Error: ${errorMessage}`, 'assertive');
            this.setLoadingState(false);
        });
    }

    openQuickEdit(productId, field) {
        // Close any existing quick edit first
        if (this.activeEditElement) {
            this.cancelQuickEdit();
        }

        // Implement inline editing functionality
        const productRow = document.querySelector(`tr[data-product-id="${productId}"]`);
        if (!productRow) return;

        const cell = productRow.querySelector(`.${field}-cell`);
        if (!cell) return;

        const currentValue = cell.dataset.value || cell.textContent.trim();
        const productName = productRow.querySelector('a').textContent.trim();

        // Store original content and focus for restoration
        const originalContent = cell.innerHTML;
        const triggerButton = cell.querySelector('.quick-edit-btn');
        this.previousFocus = triggerButton;

        // Create appropriate edit control based on field type
        let editControl;
        if (field === 'price') {
            editControl = `
                <div class="quick-edit-container" role="form" aria-label="Edit price for ${productName}">
                    <label for="quick-edit-${productId}-${field}" class="visually-hidden">
                        Price for ${productName}
                    </label>
                    <input type="number"
                           id="quick-edit-${productId}-${field}"
                           class="form-control form-control-sm quick-edit-input"
                           value="${currentValue}"
                           step="0.01"
                           min="0"
                           aria-describedby="quick-edit-${productId}-${field}-help">
                    <div id="quick-edit-${productId}-${field}-help" class="visually-hidden">
                        Enter new price and press Save or press Escape to cancel
                    </div>
                    <div class="mt-2">
                        <button class="btn btn-primary btn-sm save-quick-edit"
                                data-field="${field}" data-product-id="${productId}"
                                aria-describedby="quick-edit-${productId}-${field}-save-help">
                            Save
                        </button>
                        <button class="btn btn-secondary btn-sm cancel-quick-edit"
                                aria-describedby="quick-edit-${productId}-${field}-cancel-help">
                            Cancel
                        </button>
                        <div id="quick-edit-${productId}-${field}-save-help" class="visually-hidden">
                            Save the new price
                        </div>
                        <div id="quick-edit-${productId}-${field}-cancel-help" class="visually-hidden">
                            Cancel editing and restore original value
                        </div>
                    </div>
                </div>
            `;
        } else if (field === 'stock_quantity') {
            editControl = `
                <div class="quick-edit-container" role="form" aria-label="Edit stock quantity for ${productName}">
                    <label for="quick-edit-${productId}-${field}" class="visually-hidden">
                        Stock quantity for ${productName}
                    </label>
                    <input type="number"
                           id="quick-edit-${productId}-${field}"
                           class="form-control form-control-sm quick-edit-input"
                           value="${currentValue}"
                           min="0"
                           aria-describedby="quick-edit-${productId}-${field}-help">
                    <div id="quick-edit-${productId}-${field}-help" class="visually-hidden">
                        Enter new stock quantity and press Save or press Escape to cancel
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
        } else if (field === 'is_active') {
            const isChecked = currentValue === 'true' ? 'checked' : '';
            editControl = `
                <div class="quick-edit-container" role="form" aria-label="Edit active status for ${productName}">
                    <div class="form-check">
                        <input class="form-check-input quick-edit-input"
                               type="checkbox"
                               id="quick-edit-${productId}-${field}"
                               ${isChecked}
                               aria-describedby="quick-edit-${productId}-${field}-help">
                        <label class="form-check-label" for="quick-edit-${productId}-${field}">
                            Active
                        </label>
                    </div>
                    <div id="quick-edit-${productId}-${field}-help" class="visually-hidden">
                        Toggle active status and press Save or press Escape to cancel
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
            this.activeEditElement = cell;

            // Focus management
            const input = cell.querySelector('.quick-edit-input');
            if (input) {
                input.focus();
                if (input.type === 'text' || input.type === 'number') {
                    input.select();
                }
            }

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

                    this.saveQuickEdit(productId, field, value, productName);
                });
            }

            const cancelBtn = cell.querySelector('.cancel-quick-edit');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.cancelQuickEdit(originalContent);
                });
            }

            // Announce edit mode to screen readers
            this.announceToScreenReader(`Editing ${field} for ${productName}. Use Tab to navigate, Enter to save, Escape to cancel.`, 'assertive');
        }
    }

    cancelQuickEdit(originalContent = null) {
        if (this.activeEditElement) {
            if (originalContent) {
                this.activeEditElement.innerHTML = originalContent;
            }

            // Restore focus to the original trigger button
            if (this.previousFocus && this.previousFocus.isConnected) {
                this.previousFocus.focus();
            }

            this.activeEditElement = null;
            this.previousFocus = null;

            this.announceToScreenReader('Edit cancelled', 'polite');
        }
    }

    handleTabNavigation(e) {
        // Enhanced tab navigation within quick edit forms
        if (!this.activeEditElement) return;

        const focusableElements = this.activeEditElement.querySelectorAll(
            'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }

    handleArrowNavigation(e) {
        // Optional: Arrow key navigation between table rows
        const currentRow = e.target.closest('tr');
        if (!currentRow) return;

        let targetRow = null;

        if (e.key === 'ArrowUp') {
            targetRow = currentRow.previousElementSibling;
        } else if (e.key === 'ArrowDown') {
            targetRow = currentRow.nextElementSibling;
        }

        if (targetRow) {
            e.preventDefault();
            // Focus the first interactive element in the target row
            const firstInteractive = targetRow.querySelector('input, button, a');
            if (firstInteractive) {
                firstInteractive.focus();
            }
        }
    }

    // Enhanced error handling for form validation
    validateQuickEditInput(field, value) {
        const errors = [];

        switch (field) {
            case 'price':
                if (isNaN(value) || value === '') {
                    errors.push('Price must be a valid number');
                } else if (Number(value) < 0) {
                    errors.push('Price cannot be negative');
                } else if (Number(value) > 999999.99) {
                    errors.push('Price cannot exceed $999,999.99');
                }
                break;

            case 'stock_quantity':
                if (isNaN(value) || value === '') {
                    errors.push('Stock quantity must be a valid number');
                } else if (!Number.isInteger(Number(value))) {
                    errors.push('Stock quantity must be a whole number');
                } else if (Number(value) < 0) {
                    errors.push('Stock quantity cannot be negative');
                } else if (Number(value) > 999999) {
                    errors.push('Stock quantity cannot exceed 999,999');
                }
                break;
        }

        return errors;
    }

    // Focus management utilities
    manageFocus() {
        // Store and restore focus for dynamic content updates
        return {
            store: () => {
                this.storedFocus = document.activeElement;
            },
            restore: () => {
                if (this.storedFocus && this.storedFocus.isConnected) {
                    this.storedFocus.focus();
                    this.storedFocus = null;
                }
            }
        };
    }

    saveQuickEdit(productId, field, value, productName) {
        // Validate input using the new validation function
        const validationErrors = this.validateQuickEditInput(field, value);

        if (validationErrors.length > 0) {
            const errorMessage = validationErrors.join('. ');
            this.announceToScreenReader(`Error: ${errorMessage}`, 'assertive');

            const input = this.activeEditElement.querySelector('input');
            if (input) {
                input.focus();
                input.setAttribute('aria-invalid', 'true');
                input.setAttribute('aria-describedby', input.id + '-error');

                // Add error message element if not present
                let errorElement = this.activeEditElement.querySelector('.error-message');
                if (!errorElement) {
                    errorElement = document.createElement('div');
                    errorElement.className = 'error-message text-danger small mt-1';
                    errorElement.id = input.id + '-error';
                    errorElement.setAttribute('role', 'alert');
                    input.parentNode.insertBefore(errorElement, input.nextSibling);
                }
                errorElement.textContent = errorMessage;
            }
            return;
        }

        // Clear any existing error state
        const input = this.activeEditElement?.querySelector('input');
        if (input) {
            input.removeAttribute('aria-invalid');
            input.removeAttribute('aria-describedby');
            const errorElement = this.activeEditElement.querySelector('.error-message');
            if (errorElement) {
                errorElement.remove();
            }
        }

        this.setLoadingState(true, `Saving ${field} for ${productName}...`);

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
                this.announceToScreenReader(`Successfully updated ${field} for ${productName}`, 'assertive');

                // Clear active edit state
                this.activeEditElement = null;
                this.previousFocus = null;

                // Refresh the product list to show updated values
                this.refreshProductList();

                // If it's a change that affects stats, refresh stats too
                if (['price', 'stock_quantity', 'is_active'].includes(field)) {
                    this.refreshProductStats();
                }
            } else {
                // Show error notification
                const errorMessage = data.error || 'An error occurred';
                this.showNotification('danger', errorMessage);
                this.announceToScreenReader(`Error updating ${field}: ${errorMessage}`, 'assertive');

                // Keep focus in the edit form for correction
                const input = this.activeEditElement?.querySelector('input');
                if (input) {
                    input.focus();
                    input.setAttribute('aria-invalid', 'true');
                }
            }
            this.setLoadingState(false);
        })
        .catch(error => {
            console.error('Error saving quick edit:', error);
            const errorMessage = 'An error occurred while saving changes';
            this.showNotification('danger', errorMessage);
            this.announceToScreenReader(`Error: ${errorMessage}`, 'assertive');

            // Keep focus in the edit form
            const input = this.activeEditElement?.querySelector('input');
            if (input) {
                input.focus();
            }

            this.setLoadingState(false);
        });
    }

    refreshProductList() {
        this.setLoadingState(true, 'Loading product list...');

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

                    // Announce results to screen readers
                    const productCount = data.products ? data.products.length : 0;
                    const totalCount = data.pagination ? data.pagination.total_count : productCount;
                    const pageInfo = data.pagination
                        ? ` (page ${data.pagination.current_page} of ${data.pagination.total_pages})`
                        : '';

                    this.announceToScreenReader(
                        `Product list updated. Showing ${productCount} of ${totalCount} products${pageInfo}`,
                        'polite'
                    );
                } else {
                    this.showNotification('danger', data.error || 'An error occurred');
                    this.announceToScreenReader('Error loading product list', 'assertive');
                }
                this.setLoadingState(false);
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                this.showNotification('danger', 'An error occurred while fetching products');
                this.announceToScreenReader('Error loading product list', 'assertive');
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
            // Build product table HTML with enhanced accessibility
            let html = `
                <table class="table table-hover" role="table"
                       aria-label="Product list with ${data.products.length} products">
                    <thead>
                        <tr role="row">
                            <th scope="col" role="columnheader">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox"
                                           id="select-all-products"
                                           aria-label="Select all products on this page">
                                    <label class="form-check-label visually-hidden" for="select-all-products">
                                        Select all products
                                    </label>
                                </div>
                            </th>
                            <th scope="col" role="columnheader">Image</th>
                            <th scope="col" role="columnheader">Name</th>
                            <th scope="col" role="columnheader">Category</th>
                            <th scope="col" role="columnheader">Price</th>
                            <th scope="col" role="columnheader">Stock</th>
                            <th scope="col" role="columnheader">Status</th>
                            <th scope="col" role="columnheader">Actions</th>
                        </tr>
                    </thead>
                    <tbody>`;

            data.products.forEach(product => {
                const isActive = product.is_active;
                const imageUrl = product.image_url || '/static/assets/images/noimage.png';

                // Determine stock status class and accessibility attributes
                let stockClass = '';
                let stockIcon = '';
                let stockAriaLabel = '';
                if (product.stock_quantity === 0) {
                    stockClass = 'text-danger';
                    stockIcon = '<i class="fas fa-exclamation-circle text-danger me-1" aria-hidden="true"></i>';
                    stockAriaLabel = `Out of stock - ${product.stock_quantity} items`;
                } else if (product.stock_quantity <= 5) {
                    stockClass = 'text-warning';
                    stockIcon = '<i class="fas fa-exclamation-triangle text-warning me-1" aria-hidden="true"></i>';
                    stockAriaLabel = `Low stock - ${product.stock_quantity} items`;
                } else {
                    stockAriaLabel = `In stock - ${product.stock_quantity} items`;
                }

                html += `
                    <tr data-product-id="${product.id}" role="row">
                        <td role="gridcell">
                            <div class="form-check">
                                <input class="form-check-input product-select-checkbox"
                                       type="checkbox"
                                       data-product-id="${product.id}"
                                       aria-label="Select ${product.name}">
                                <label class="form-check-label visually-hidden" for="product-${product.id}">
                                    Select ${product.name}
                                </label>
                            </div>
                        </td>
                        <td role="gridcell">
                            <img src="${imageUrl}" alt="Product image for ${product.name}"
                                 class="img-thumbnail product-thumbnail" width="50" height="50">
                        </td>
                        <td role="gridcell">
                            <a href="/staff/products/${product.id}/"
                               aria-label="View details for ${product.name}">
                                ${product.name}
                            </a>
                        </td>
                        <td role="gridcell">${product.category_name || 'Uncategorized'}</td>
                        <td class="price-cell" data-value="${product.price}" role="gridcell">
                            <span aria-label="Price: $${product.price}">$${product.price}</span>
                            <button type="button" class="btn btn-link p-0 ms-2 quick-edit-btn"
                                    data-product-id="${product.id}" data-field="price"
                                    aria-label="Quick edit price for ${product.name}"
                                    title="Edit price">
                                <i class="fas fa-edit" aria-hidden="true"></i>
                                <span class="visually-hidden">Edit price</span>
                            </button>
                        </td>
                        <td class="stock_quantity-cell ${stockClass}"
                            data-value="${product.stock_quantity}" role="gridcell">
                            <span aria-label="${stockAriaLabel}">
                                ${stockIcon}${product.stock_quantity}
                            </span>
                            <button type="button" class="btn btn-link p-0 ms-2 quick-edit-btn"
                                    data-product-id="${product.id}" data-field="stock_quantity"
                                    aria-label="Quick edit stock quantity for ${product.name}"
                                    title="Edit stock quantity">
                                <i class="fas fa-edit" aria-hidden="true"></i>
                                <span class="visually-hidden">Edit stock</span>
                            </button>
                        </td>
                        <td class="is_active-cell" data-value="${isActive}" role="gridcell">
                            <span class="badge ${isActive ? 'bg-success' : 'bg-danger'}"
                                  aria-label="Product status: ${isActive ? 'Active' : 'Inactive'}">
                                ${isActive ? 'Active' : 'Inactive'}
                            </span>
                            <button type="button" class="btn btn-link p-0 ms-2 quick-edit-btn"
                                    data-product-id="${product.id}" data-field="is_active"
                                    aria-label="Quick edit active status for ${product.name}"
                                    title="Edit status">
                                <i class="fas fa-edit" aria-hidden="true"></i>
                                <span class="visually-hidden">Edit status</span>
                            </button>
                        </td>
                        <td role="gridcell">
                            <div class="btn-group" role="group"
                                 aria-label="Actions for ${product.name}">
                                <a href="/staff/products/${product.id}/"
                                   class="btn btn-sm btn-info"
                                   aria-label="View details for ${product.name}"
                                   title="View product details">
                                    <i class="fas fa-eye" aria-hidden="true"></i>
                                    <span class="visually-hidden">View</span>
                                </a>
                                <a href="/staff/products/${product.id}/update/"
                                   class="btn btn-sm btn-primary"
                                   aria-label="Edit ${product.name}"
                                   title="Edit product">
                                    <i class="fas fa-edit" aria-hidden="true"></i>
                                    <span class="visually-hidden">Edit</span>
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
                <div class="alert alert-info" role="alert" aria-live="polite">
                    <i class="fas fa-info-circle me-2" aria-hidden="true"></i>
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

        const { current_page, total_pages, total_count } = pagination;

        let html = `
            <nav aria-label="Product list pagination" role="navigation">
                <ul class="pagination justify-content-center" role="list">`;

        // Previous page button
        if (current_page <= 1) {
            html += `
                    <li class="page-item disabled" role="listitem">
                        <span class="page-link" aria-disabled="true" aria-label="Previous page (unavailable)">
                            Previous
                        </span>
                    </li>`;
        } else {
            html += `
                    <li class="page-item" role="listitem">
                        <a class="page-link" href="?page=${current_page - 1}"
                           aria-label="Go to previous page, page ${current_page - 1}">
                            Previous
                        </a>
                    </li>`;
        }

        // Page numbers
        const startPage = Math.max(1, current_page - 2);
        const endPage = Math.min(total_pages, current_page + 2);

        // First page link if not in range
        if (startPage > 1) {
            html += `
                    <li class="page-item" role="listitem">
                        <a class="page-link" href="?page=1" aria-label="Go to first page">1</a>
                    </li>`;
            if (startPage > 2) {
                html += `
                    <li class="page-item disabled" role="listitem">
                        <span class="page-link" aria-hidden="true">...</span>
                    </li>`;
            }
        }

        // Page links
        for (let i = startPage; i <= endPage; i++) {
            if (i === current_page) {
                html += `
                    <li class="page-item active" role="listitem">
                        <span class="page-link" aria-current="page" aria-label="Current page, page ${i}">
                            ${i}
                        </span>
                    </li>`;
            } else {
                html += `
                    <li class="page-item" role="listitem">
                        <a class="page-link" href="?page=${i}" aria-label="Go to page ${i}">${i}</a>
                    </li>`;
            }
        }

        // Last page link if not in range
        if (endPage < total_pages) {
            if (endPage < total_pages - 1) {
                html += `
                    <li class="page-item disabled" role="listitem">
                        <span class="page-link" aria-hidden="true">...</span>
                    </li>`;
            }
            html += `
                    <li class="page-item" role="listitem">
                        <a class="page-link" href="?page=${total_pages}"
                           aria-label="Go to last page, page ${total_pages}">
                            ${total_pages}
                        </a>
                    </li>`;
        }

        // Next page button
        if (current_page >= total_pages) {
            html += `
                    <li class="page-item disabled" role="listitem">
                        <span class="page-link" aria-disabled="true" aria-label="Next page (unavailable)">
                            Next
                        </span>
                    </li>`;
        } else {
            html += `
                    <li class="page-item" role="listitem">
                        <a class="page-link" href="?page=${current_page + 1}"
                           aria-label="Go to next page, page ${current_page + 1}">
                            Next
                        </a>
                    </li>`;
        }

        html += `
                </ul>
            </nav>`;

        // Add pagination summary for screen readers
        if (total_count) {
            const startItem = ((current_page - 1) * 10) + 1; // Assuming 10 items per page
            const endItem = Math.min(current_page * 10, total_count);

            html += `
                <div class="visually-hidden" aria-live="polite">
                    Showing ${startItem} to ${endItem} of ${total_count} products,
                    page ${current_page} of ${total_pages}
                </div>`;
        }

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

    setLoadingState(isLoading, message = null) {
        this.isLoading = isLoading;
        const loadingSpinner = document.getElementById('loading-spinner');

        if (loadingSpinner) {
            loadingSpinner.style.display = isLoading ? 'block' : 'none';
            loadingSpinner.setAttribute('aria-hidden', isLoading ? 'false' : 'true');
        }

        // Add or remove loading overlay
        const productList = document.getElementById(this.productListContainerId);
        if (productList) {
            if (isLoading) {
                productList.classList.add('loading');
                productList.setAttribute('aria-busy', 'true');

                // Add loading indicator to table if not present
                let loadingIndicator = productList.querySelector('.loading-indicator');
                if (!loadingIndicator) {
                    loadingIndicator = document.createElement('div');
                    loadingIndicator.className = 'loading-indicator visually-hidden';
                    loadingIndicator.setAttribute('aria-live', 'polite');
                    loadingIndicator.setAttribute('aria-atomic', 'true');
                    productList.appendChild(loadingIndicator);
                }

                loadingIndicator.textContent = message || 'Loading...';
            } else {
                productList.classList.remove('loading');
                productList.setAttribute('aria-busy', 'false');

                const loadingIndicator = productList.querySelector('.loading-indicator');
                if (loadingIndicator) {
                    loadingIndicator.textContent = '';
                }
            }
        }

        // Announce loading state changes to screen readers
        if (message) {
            this.announceToScreenReader(message, 'polite');
        } else if (isLoading) {
            this.announceToScreenReader('Loading...', 'polite');
        }
    }

    showNotification(type, message) {
        // Create notification element
        const notificationElement = document.createElement('div');
        const notificationId = `notification-${Date.now()}`;
        notificationElement.id = notificationId;
        notificationElement.className = `alert alert-${type} alert-dismissible fade show staff-notification`;
        notificationElement.setAttribute('role', type === 'danger' ? 'alert' : 'status');
        notificationElement.setAttribute('aria-live', type === 'danger' ? 'assertive' : 'polite');
        notificationElement.setAttribute('aria-atomic', 'true');

        // Add appropriate icon for visual context
        let icon = '';
        switch (type) {
            case 'success':
                icon = '<i class="fas fa-check-circle me-2" aria-hidden="true"></i>';
                break;
            case 'danger':
                icon = '<i class="fas fa-exclamation-circle me-2" aria-hidden="true"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle me-2" aria-hidden="true"></i>';
                break;
            case 'info':
                icon = '<i class="fas fa-info-circle me-2" aria-hidden="true"></i>';
                break;
        }

        notificationElement.innerHTML = `
            ${icon}
            <span class="notification-message">${message}</span>
            <button type="button" class="btn-close" data-bs-dismiss="alert"
                    aria-label="Close notification: ${message.replace(/<[^>]*>/g, '')}"></button>
        `;

        // Add to container or body
        const notificationContainer = document.getElementById('notification-container') || document.body;
        notificationContainer.appendChild(notificationElement);

        // Focus management for important notifications
        if (type === 'danger') {
            // For error notifications, ensure they're announced immediately
            notificationElement.focus();
            notificationElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Auto dismiss after appropriate time based on type
        const dismissTime = type === 'danger' ? 8000 : 5000; // Errors stay longer
        setTimeout(() => {
            if (notificationElement.parentNode) {
                notificationElement.classList.remove('show');
                setTimeout(() => {
                    if (notificationElement.parentNode) {
                        notificationElement.remove();
                    }
                }, 300);
            }
        }, dismissTime);

        // Also announce through our live region system
        this.announceToScreenReader(message.replace(/<[^>]*>/g, ''), type === 'danger' ? 'assertive' : 'polite');
    }

    announceToScreenReader(message, priority = 'polite') {
        const region = priority === 'assertive' ? this.liveRegion : this.statusRegion;
        if (region) {
            // Clear and set to ensure the message is announced
            region.textContent = '';
            setTimeout(() => {
                region.textContent = message;
            }, 100);
        }
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
