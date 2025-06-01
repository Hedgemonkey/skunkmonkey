/**
 * Category List Management
 * Handles category list functionality including charts and item management
 */
import Chart from 'chart.js/auto';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize category chart if element exists
    initCategoryChart();

    // Initialize category status toggles
    initCategoryStatusToggles();

    // Initialize edit and delete buttons
    initCategoryActionButtons();
});

/**
 * Initialize the category distribution chart
 */
function initCategoryChart() {
    const categoryChartEl = document.getElementById('categoryChart');

    if (categoryChartEl) {
        try {
            // Get data from data attributes
            const labels = JSON.parse(categoryChartEl.dataset.labels || '[]');
            const data = JSON.parse(categoryChartEl.dataset.values || '[]');

            const ctx = categoryChartEl.getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.7)',
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(153, 102, 255, 0.7)',
                            'rgba(255, 159, 64, 0.7)',
                            'rgba(99, 255, 132, 0.7)',
                            'rgba(235, 162, 54, 0.7)',
                            'rgba(86, 255, 206, 0.7)',
                            'rgba(192, 75, 192, 0.7)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                boxWidth: 12
                            }
                        }
                    }
                }
            });
            console.log('Category chart initialized successfully');
        } catch (err) {
            console.error('Failed to initialize category chart', err);
        }
    }
}

/**
 * Initialize category status toggle switches
 */
function initCategoryStatusToggles() {
    const statusToggles = document.querySelectorAll('.category-status-toggle');

    statusToggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const categoryId = this.dataset.categoryId;
            const field = this.dataset.field;
            const value = this.checked;

            // Update category status via API
            updateCategoryStatus(categoryId, field, value);
        });
    });
}

/**
 * Initialize category action buttons (edit/delete)
 */
function initCategoryActionButtons() {
    // Edit category buttons
    document.querySelectorAll('.edit-category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const categoryName = this.dataset.categoryName;

            // Populate edit form
            document.getElementById('edit-category-name').value = categoryName;
        });
    });

    // Delete category buttons
    document.querySelectorAll('.delete-category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const categoryId = this.dataset.categoryId;
            const categoryName = this.dataset.categoryName;
            const hasProducts = parseInt(this.dataset.products, 10) > 0;

            // Set delete modal content
            document.getElementById('delete-category-name').textContent = categoryName;

            // Show warning if category has products
            const warningEl = document.getElementById('delete-category-warning');
            if (hasProducts) {
                warningEl.classList.remove('d-none');
            } else {
                warningEl.classList.add('d-none');

                // Setup confirm button action
                document.getElementById('confirm-delete-btn').onclick = function() {
                    deleteCategoryById(categoryId);
                };

                // Show delete modal
                const deleteModal = new bootstrap.Modal(document.getElementById('deleteCategoryModal'));
                deleteModal.show();
            }
        });
    });
}

/**
 * Update category status via API
 */
function updateCategoryStatus(categoryId, field, value) {
    fetch(`/staff/api/categories/${categoryId}/update/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({
            [field]: value
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Category updated:', data);
    })
    .catch(error => {
        console.error('Error updating category:', error);
        // Reset toggle to previous state on error
        document.querySelector(`#status-${categoryId}`).checked = !value;
    });
}

/**
 * Delete category by ID
 */
function deleteCategoryById(categoryId) {
    fetch(`/staff/api/categories/${categoryId}/delete/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCsrfToken()
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Category deleted:', data);
        // Reload page to reflect changes
        window.location.reload();
    })
    .catch(error => {
        console.error('Error deleting category:', error);
    });
}

/**
 * Get CSRF token from cookies
 */
function getCsrfToken() {
    const name = 'csrftoken';
    let cookieValue = null;

    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }

    return cookieValue;
}
