/**
 * Staff Dashboard Charts Module
 * Initializes Chart.js charts for the staff dashboard
 * Version 1.1.0 - Fixed chunk loading error
 */

/**
 * Initialize charts on the staff dashboard
 * This function is called when Chart.js is loaded
 */
function initCharts() {
    console.log('Chart.js loaded, initializing charts');

    // Initialize category chart if present
    const categoryChartEl = document.getElementById('categoryChart');
    if (categoryChartEl) {
        try {
            const labelsStr = categoryChartEl.getAttribute('data-labels') || '[]';
            const dataStr = categoryChartEl.getAttribute('data-values') || '[]';

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
                            position: 'right'
                        }
                    }
                }
            });
            console.log('Category chart initialized successfully');
        } catch (err) {
            console.error('Failed to initialize category chart', err);
        }
    }

    // Initialize price chart if present
    const priceChartEl = document.getElementById('priceChart');
    if (priceChartEl) {
        try {
            const labelsStr = priceChartEl.getAttribute('data-labels') || '[]';
            const dataStr = priceChartEl.getAttribute('data-values') || '[]';

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
            console.log('Price chart initialized successfully');
        } catch (err) {
            console.error('Failed to initialize price chart', err);
        }
    }
}

/**
 * Loads Chart.js from CDN and initializes charts when DOM is loaded
 */
function loadChartsIfNeeded() {
    document.addEventListener('DOMContentLoaded', function() {
        // Only load Chart.js if charts are present on the page
        if (document.getElementById('categoryChart') || document.getElementById('priceChart')) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.9/dist/chart.umd.min.js';
            script.onload = initCharts;
            document.head.appendChild(script);
            console.log('Loading Chart.js from CDN');
        }
    });
}

// Initialize the charts module
loadChartsIfNeeded();

export { loadChartsIfNeeded, initCharts };
