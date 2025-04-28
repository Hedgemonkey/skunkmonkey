// Import required CSS
import '@staff/css/product-manager.css';

// Create a flag to check if this module should handle initialization
window.SKM = window.SKM || {};
window.SKM.productDashboardInitialized = window.SKM.productDashboardInitialized || false;

document.addEventListener('DOMContentLoaded', function() {
    // Skip initialization if already done to prevent conflicts with staff-charts.js
    if (window.SKM.productDashboardInitialized) {
        return;
    }
    window.SKM.productDashboardInitialized = true;

    // Initialize dashboard extras - this won't touch charts which are handled by staff-charts.js
    // Handle import/export button events
    setupExportImportButtons();
});

/**
 * Set up Export/Import buttons if they're not already handled
 */
function setupExportImportButtons() {
    const exportBtn = document.getElementById('export-products-btn');
    if (exportBtn && !exportBtn._hasHandler) {
        exportBtn._hasHandler = true;
        exportBtn.addEventListener('click', function(e) {
            e.preventDefault();
            exportProducts();
        });
    }

    const importBtn = document.getElementById('import-products-btn');
    if (importBtn && !importBtn._hasHandler) {
        importBtn._hasHandler = true;
        importBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Import requires bootstrap's Modal
            if (typeof bootstrap !== 'undefined') {
                const importModal = new bootstrap.Modal(document.getElementById('importProductsModal'));
                importModal.show();
            } else {
                console.warn('Bootstrap not available for modal');
            }
        });
    }

    const submitImportBtn = document.getElementById('submitImportBtn');
    if (submitImportBtn && !submitImportBtn._hasHandler) {
        submitImportBtn._hasHandler = true;
        submitImportBtn.addEventListener('click', function() {
            importProducts();
        });
    }

    const downloadTemplateBtn = document.getElementById('downloadTemplateBtn');
    if (downloadTemplateBtn && !downloadTemplateBtn._hasHandler) {
        downloadTemplateBtn._hasHandler = true;
        downloadTemplateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            downloadTemplate();
        });
    }
}

/**
 * Export products as CSV
 */
function exportProducts() {
    window.location.href = '/staff/products/export-csv/';
}

/**
 * Import products from CSV file
 */
function importProducts() {
    const fileInput = document.getElementById('importFile');
    if (!fileInput || !fileInput.files.length) {
        alert('Please select a file to import');
        return;
    }

    const formData = new FormData();
    formData.append('csv_file', fileInput.files[0]);

    // Get CSRF token from the form
    const form = document.getElementById('importProductsForm');
    const csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;

    fetch('/staff/products/import-csv/', {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': csrfToken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Products imported successfully: ' + data.imported_count + ' products');
            window.location.reload();
        } else {
            alert('Error: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error importing products:', error);
        alert('An error occurred while importing products. Please try again.');
    });
}

/**
 * Download template CSV file for product import
 */
function downloadTemplate() {
    window.location.href = '/staff/products/download-csv-template/';
}
