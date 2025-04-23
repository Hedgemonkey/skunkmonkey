/**
 * Entry point for order history pages
 * For use with django-vite
 */

// Import styles
import '../../css/profile.css';
import '../../css/modules/order_history.css';

// Create a class to ensure this file has exportable content
class OrderHistoryManager {
  constructor() {
    this.initialized = false;

    // Initialize on DOM content loaded
    document.addEventListener('DOMContentLoaded', () => {
      console.log('Order history page initialized');
      this.init();
    });
  }

  init() {
    this.initialized = true;

    // Setup filter and sorting functionality
    this.initOrderFilters();

    // Initialize order detail collapse/expand functionality
    this.initOrderDetailToggles();
  }

  /**
   * Initialize order filters and sorting functionality
   */
  initOrderFilters() {
    const filterForm = document.getElementById('order-filter-form');
    const sortSelect = document.getElementById('order-sort');

    if (filterForm) {
      filterForm.addEventListener('change', function() {
        this.submit(); // Auto-submit on filter change
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', function() {
        const form = this.closest('form');
        if (form) {
          form.submit();
        }
      });
    }
  }

  /**
   * Initialize order detail toggle functionality for mobile view
   */
  initOrderDetailToggles() {
    const detailToggles = document.querySelectorAll('.order-detail-toggle');

    detailToggles.forEach(toggle => {
      toggle.addEventListener('click', function() {
        const orderId = this.dataset.orderId;
        const detailRow = document.getElementById(`order-details-${orderId}`);

        if (detailRow) {
          detailRow.classList.toggle('d-none');

          // Toggle icon if present
          const icon = this.querySelector('i.fas');
          if (icon) {
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
          }
        }
      });
    });
  }
}

// Create and export an instance
const orderHistoryManager = new OrderHistoryManager();
export default orderHistoryManager;
