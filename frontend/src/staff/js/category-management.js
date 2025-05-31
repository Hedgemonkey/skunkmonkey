/**
 * Category Management JavaScript
 * Handles functionality for the Category Dashboard in the staff section
 */

// Import required CSS
import '@staff/css/product-manager.css';
import '@staff/css/category-management.css';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initCategoryFilters();
    initCategoryActions();
});

/**
 * Initialize category filter functionality
 */
function initCategoryFilters() {
    const filterInputs = document.querySelectorAll('.category-filters input, .category-filters select');

    filterInputs.forEach(input => {
        input.addEventListener('change', function() {
            filterCategories();
        });
    });
}

/**
 * Filter categories based on selected filters
 */
function filterCategories() {
    const filters = {
        status: document.getElementById('filter-status')?.value || 'all',
        hasProducts: document.getElementById('filter-has-products')?.checked,
        search: document.getElementById('search-category')?.value.toLowerCase()
    };

    const categoryItems = document.querySelectorAll('.category-list-item, .category-card');

    categoryItems.forEach(item => {
        const status = item.dataset.status;
        const productCount = parseInt(item.dataset.productCount || '0', 10);
        const title = item.querySelector('.category-title')?.textContent.toLowerCase() || '';
        const description = item.querySelector('.category-description')?.textContent.toLowerCase() || '';

        // Apply filters
        let show = true;

        // Status filter
        if (filters.status !== 'all' && status !== filters.status) {
            show = false;
        }

        // Has products filter
        if (filters.hasProducts && productCount === 0) {
            show = false;
        }

        // Search filter
        if (filters.search && !title.includes(filters.search) && !description.includes(filters.search)) {
            show = false;
        }

        // Show or hide item
        item.style.display = show ? '' : 'none';
    });
}

/**
 * Initialize category action buttons
 */
function initCategoryActions() {
    // Edit category buttons
    document.querySelectorAll('.category-edit-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const categoryId = btn.dataset.categoryId;
            window.location.href = `/staff/categories/${categoryId}/update/`;
        });
    });
}
