// Test Assets - helps debug loading issues
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faCheck, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import * as bootstrap from 'bootstrap';
import Chart from 'chart.js/auto';

// Add FontAwesome icons
library.add(faCheck, faExclamationCircle);
dom.watch();

// Keep track of assets that successfully loaded
const loadedAssets = {
  fontawesome: false,
  bootstrap: false,
  chartjs: false
};

// Track any loading errors
const loadingErrors = [];

// Helper to log errors
window.addEventListener('error', function(event) {
  const error = event.error || new Error(event.message);
  const msg = `Error: ${error.message} in ${event.filename}:${event.lineno}`;
  loadingErrors.push(msg);
  updateErrorDisplay();
});

// Function to update the error display
function updateErrorDisplay() {
  const errorEl = document.getElementById('loading-errors');
  if (loadingErrors.length > 0) {
    errorEl.textContent = loadingErrors.join('\n');
    errorEl.className = 'text-danger';
  } else {
    errorEl.textContent = 'No errors detected';
    errorEl.className = 'text-success';
  }
}

// Test FontAwesome
document.getElementById('test-fontawesome').addEventListener('click', () => {
  try {
    const iconEl = document.getElementById('fa-icon');
    iconEl.className = 'fas fa-check';
    loadedAssets.fontawesome = true;
    updateResults();
  } catch (error) {
    loadingErrors.push(`FontAwesome error: ${error.message}`);
    updateErrorDisplay();
  }
});

// Test Bootstrap Tooltips
document.getElementById('test-bootstrap').addEventListener('click', () => {
  try {
    const btn = document.getElementById('test-bootstrap');

    // Initialize tooltip on the button
    const tooltip = new bootstrap.Tooltip(btn, {
      title: 'Bootstrap tooltip is working!',
      placement: 'top'
    });

    // Trigger the tooltip
    tooltip.show();

    loadedAssets.bootstrap = true;
    updateResults();

    // Hide tooltip after 2 seconds
    setTimeout(() => {
      tooltip.hide();
    }, 2000);
  } catch (error) {
    loadingErrors.push(`Bootstrap error: ${error.message}`);
    updateErrorDisplay();
  }
});

// Test Chart.js
document.getElementById('test-chartjs').addEventListener('click', () => {
  try {
    const ctx = document.getElementById('test-chart').getContext('2d');

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
          label: 'Chart.js Test',
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true
      }
    });

    loadedAssets.chartjs = true;
    updateResults();
  } catch (error) {
    loadingErrors.push(`Chart.js error: ${error.message}`);
    updateErrorDisplay();
  }
});

// Update test results
function updateResults() {
  const resultEl = document.getElementById('vendor-test-result');

  // Count successful loads
  const successCount = Object.values(loadedAssets).filter(Boolean).length;
  const totalAssets = Object.keys(loadedAssets).length;

  if (successCount === totalAssets) {
    resultEl.innerHTML = `
      <div class="alert alert-success">
        <i class="fas fa-check me-2"></i>
        All vendor chunks loaded successfully!
      </div>
    `;
  } else {
    resultEl.innerHTML = `
      <div class="alert alert-warning">
        <i class="fas fa-exclamation-circle me-2"></i>
        ${successCount} of ${totalAssets} vendor chunks loaded successfully.
        Click the test buttons to check each vendor library.
      </div>
    `;
  }
}

// Display environment info
function detectEnvironment() {
  const envEl = document.getElementById('environment-info');
  const isHeroku = window.location.hostname.includes('herokuapp.com');

  const info = {
    'Platform': isHeroku ? 'Heroku' : 'Local Development',
    'User Agent': navigator.userAgent,
    'Screen Size': `${window.innerWidth}x${window.innerHeight}`,
    'Vendor Scripts': isVendorScriptLoaded() ? 'Found' : 'Not Found'
  };

  envEl.textContent = Object.entries(info)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
}

// Check if vendor scripts are loaded
function isVendorScriptLoaded() {
  const scripts = document.querySelectorAll('script');
  for (const script of scripts) {
    if (script.src && (script.src.includes('vendor') || script.src.includes('chunk'))) {
      return true;
    }
  }
  return false;
}

// List loaded scripts
function listLoadedScripts() {
  const scriptsList = document.getElementById('loaded-scripts');
  const scripts = document.querySelectorAll('script');

  scripts.forEach(script => {
    if (script.src) {
      const li = document.createElement('li');
      li.className = 'list-group-item';

      // Highlight vendor scripts
      if (script.src.includes('vendor') || script.src.includes('chunk')) {
        li.className += ' list-group-item-success';
      }

      li.textContent = script.src;
      scriptsList.appendChild(li);
    }
  });
}

// Initialize when document loads
document.addEventListener('DOMContentLoaded', () => {
  detectEnvironment();
  listLoadedScripts();
  updateResults();

  // Initial message
  console.log('Asset testing initialized');
});
