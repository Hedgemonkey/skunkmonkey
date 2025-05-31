/**
 * Product Dashboard Charts
 * Standalone script for initializing charts on the product dashboard page
 */

// Direct import of Chart.js
import Chart from 'chart.js/auto';

/**
 * Initialize charts on the product dashboard
 */
function initDashboardCharts() {
  console.log('Initializing dashboard charts');

  // Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing charts');
    initCategoryChart();
    initPriceChart();
  });
}

/**
 * Initialize the category distribution chart
 */
function initCategoryChart() {
  const categoryChartEl = document.getElementById('categoryChart');
  if (!categoryChartEl) {
    console.log('Category chart element not found');
    return;
  }

  try {
    // Get data from data attributes
    const labelsStr = categoryChartEl.getAttribute('data-labels') || '[]';
    const dataStr = categoryChartEl.getAttribute('data-values') || '[]';

    console.log('Category chart data:', { labels: labelsStr, values: dataStr });

    const labels = JSON.parse(labelsStr);
    const data = JSON.parse(dataStr);

    // Create the chart
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

    console.log('Category chart initialized successfully');
  } catch (err) {
    console.error('Failed to initialize category chart:', err);
  }
}

/**
 * Initialize the price range chart
 */
function initPriceChart() {
  const priceChartEl = document.getElementById('priceChart');
  if (!priceChartEl) {
    console.log('Price chart element not found');
    return;
  }

  try {
    // Get data from data attributes
    const labelsStr = priceChartEl.getAttribute('data-labels') || '[]';
    const dataStr = priceChartEl.getAttribute('data-values') || '[]';

    console.log('Price chart data:', { labels: labelsStr, values: dataStr });

    const labels = JSON.parse(labelsStr);
    const data = JSON.parse(dataStr);

    // Create the chart
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
    console.error('Failed to initialize price chart:', err);
  }
}

// Initialize the charts
initDashboardCharts();

export default { initDashboardCharts };
