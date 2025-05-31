/**
 * Staff Charts module
 * Handles chart initialization and data management for staff dashboard
 */

// Direct import of Chart.js with better error handling
import Chart from 'chart.js/auto';

/**
 * StaffCharts class for managing charts in the staff dashboard
 */
class StaffCharts {
    constructor() {
        this.charts = {};
        // Initialize charts after DOM is loaded
        this.initCharts();
    }

    /**
     * Initialize charts when DOM is loaded
     */
    initCharts() {
        // Use timeout to ensure DOM is fully loaded
        setTimeout(() => {
            this.initCategoryChart();
            this.initPriceChart();
            console.log('Charts initialization attempted');
        }, 100);
    }

    /**
     * Initialize category distribution chart
     */
    initCategoryChart() {
        const categoryChartEl = document.getElementById('categoryChart');
        if (!categoryChartEl) {
            console.log('Category chart element not found');
            return;
        }

        // Get data from the data attributes with better error handling
        let labels = [];
        let data = [];

        try {
            const labelsStr = categoryChartEl.getAttribute('data-labels') || '[]';
            const dataStr = categoryChartEl.getAttribute('data-values') || '[]';

            // Log for debugging
            console.log('Category chart labels data:', labelsStr);
            console.log('Category chart values data:', dataStr);

            labels = JSON.parse(labelsStr);
            data = JSON.parse(dataStr);
        } catch (error) {
            console.error('Error parsing category chart data:', error);
            // Provide fallback data
            labels = ['No Data Available'];
            data = [1];
        }

        try {
            const categoryCtx = categoryChartEl.getContext('2d');
            this.charts.category = new Chart(categoryCtx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Products by Category',
                        data: data,
                        backgroundColor: [
                            '#4e73df',
                            '#1cc88a',
                            '#36b9cc',
                            '#f6c23e',
                            '#e74a3b',
                            '#6f42c1',
                            '#fd7e14',
                            '#20c9a6',
                            '#5a5c69',
                            '#84a0c6'
                        ],
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'right',
                        },
                    }
                }
            });
            console.log('Category chart created successfully');
        } catch (err) {
            console.error('Failed to create category chart:', err);
        }
    }

    /**
     * Initialize price range chart
     */
    initPriceChart() {
        const priceChartEl = document.getElementById('priceChart');
        if (!priceChartEl) {
            console.log('Price chart element not found');
            return;
        }

        // Get data from the data attributes with better error handling
        let labels = [];
        let data = [];

        try {
            const labelsStr = priceChartEl.getAttribute('data-labels') || '[]';
            const dataStr = priceChartEl.getAttribute('data-values') || '[]';

            // Log for debugging
            console.log('Price chart labels data:', labelsStr);
            console.log('Price chart values data:', dataStr);

            labels = JSON.parse(labelsStr);
            data = JSON.parse(dataStr);
        } catch (error) {
            console.error('Error parsing price chart data:', error);
            // Provide fallback data
            labels = ['No Data Available'];
            data = [0];
        }

        try {
            const priceCtx = priceChartEl.getContext('2d');
            this.charts.price = new Chart(priceCtx, {
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
            console.log('Price chart created successfully');
        } catch (err) {
            console.error('Failed to create price chart:', err);
        }
    }
}

// Create and export an instance
const staffCharts = new StaffCharts();
export default staffCharts;
