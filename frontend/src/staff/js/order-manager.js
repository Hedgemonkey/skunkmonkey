/**
 * Staff Order Management functionality
 * For use with django-vite integration
 */

// Import common styles to ensure they're bundled
import '../css/staff.css';

/**
 * OrderManager class for handling staff order-related functionality
 */
class OrderManager {
    constructor() {
        this.initEventListeners();
    }

    /**
     * Initialize event listeners for order management actions
     */
    initEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            // Quick View functionality for order list
            this.initQuickViewButtons();

            // Order tab functionality
            this.initOrderTabs();

            // Handle order status form submission with confirmation
            this.initOrderStatusForm();
        });
    }

    /**
     * Initialize quick view modal functionality
     */
    initQuickViewButtons() {
        const quickViewButtons = document.querySelectorAll('.quick-view-btn');

        quickViewButtons.forEach(button => {
            button.addEventListener('click', () => {
                const orderId = button.dataset.orderId;
                this.loadOrderQuickView(orderId);
            });
        });
    }

    /**
     * Load order data into quick view modal
     * @param {string} orderId - ID of the order to load
     */
    loadOrderQuickView(orderId) {
        // Reset the modal state
        const loader = document.getElementById('quickViewLoader');
        const content = document.getElementById('quickViewContent');
        const error = document.getElementById('quickViewError');

        if (loader && content && error) {
            loader.classList.remove('d-none');
            content.classList.add('d-none');
            error.classList.add('d-none');

            // Update the "View Full Order" button URL
            const viewFullBtn = document.getElementById('viewFullOrderBtn');
            if (viewFullBtn && viewFullBtn.dataset.urlTemplate) {
                viewFullBtn.href = viewFullBtn.dataset.urlTemplate.replace('0', orderId);
            }

            // Fetch the order data
            const apiUrl = document.getElementById('quickViewApiUrl');
            if (apiUrl && apiUrl.value) {
                fetch(apiUrl.value.replace('0', orderId))
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        this.populateQuickView(data);
                        loader.classList.add('d-none');
                        content.classList.remove('d-none');
                    })
                    .catch(error => {
                        console.error('Error fetching order data:', error);
                        loader.classList.add('d-none');
                        error.classList.remove('d-none');
                    });
            }
        }
    }

    /**
     * Populate quick view modal with order data
     * @param {Object} data - Order data from API
     */
    populateQuickView(data) {
        // Order information
        const elements = {
            orderNumber: document.getElementById('qv-order-number'),
            date: document.getElementById('qv-date'),
            status: document.getElementById('qv-status'),
            paymentStatus: document.getElementById('qv-payment-status'),
            customer: document.getElementById('qv-customer'),
            email: document.getElementById('qv-email'),
            total: document.getElementById('qv-total'),
            items: document.getElementById('qv-items')
        };

        // Update text content for each element
        if (elements.orderNumber) elements.orderNumber.textContent = data.order_number;
        if (elements.date) elements.date.textContent = data.date;
        if (elements.status) elements.status.textContent = data.status;
        if (elements.paymentStatus) elements.paymentStatus.textContent = data.payment_status;
        if (elements.customer) elements.customer.textContent = data.customer;
        if (elements.email) elements.email.textContent = data.email;
        if (elements.total) elements.total.textContent = `£${data.total.toFixed(2)}`;

        // Populate items table
        if (elements.items) {
            elements.items.innerHTML = '';

            data.items.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.product}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-end">£${item.price.toFixed(2)}</td>
                    <td class="text-end">£${item.total.toFixed(2)}</td>
                `;
                elements.items.appendChild(row);
            });
        }
    }

    /**
     * Initialize order detail tabs
     */
    initOrderTabs() {
        const orderTabs = document.getElementById('orderTabs');
        if (orderTabs) {
            // Set the active tab based on URL hash
            const hash = window.location.hash;
            if (hash) {
                const tab = orderTabs.querySelector(`button[data-bs-target="${hash}"]`);
                if (tab) {
                    new bootstrap.Tab(tab).show();
                }
            }

            // Update URL hash when tab is changed
            orderTabs.querySelectorAll('button[data-bs-toggle="tab"]').forEach(tab => {
                tab.addEventListener('shown.bs.tab', (event) => {
                    window.location.hash = event.target.dataset.bsTarget;
                });
            });
        }
    }

    /**
     * Initialize order status form with confirmation
     */
    initOrderStatusForm() {
        const statusForm = document.querySelector('form[action*="order_update"]');
        if (statusForm) {
            statusForm.addEventListener('submit', (event) => {
                const statusSelect = statusForm.querySelector('#id_status');
                if (statusSelect && statusSelect.value === 'cancelled') {
                    if (!confirm('Are you sure you want to cancel this order? ' +
                        'This action cannot be undone.')) {
                        event.preventDefault();
                    }
                }
            });
        }
    }
}

// Create and export an instance
const orderManager = new OrderManager();
export default orderManager;
