/**
 * Entry point for address management pages
 * For use with django-vite
 */

// Import styles
import '../../css/profile.css';
import '../../css/modules/address_management.css';

// Create a class to ensure this file has exportable content
class AddressManager {
  constructor() {
    this.initialized = false;

    // Initialize on DOM content loaded
    document.addEventListener('DOMContentLoaded', () => {
      console.log('Address management page initialized');
      this.init();
    });
  }

  init() {
    this.initialized = true;

    // Initialize delete confirmation functionality
    this.initDeleteAddressConfirmation();

    // Initialize default address selection
    this.initDefaultAddressSelection();
  }

  /**
   * Initialize delete address confirmation functionality
   */
  initDeleteAddressConfirmation() {
    const deleteButtons = document.querySelectorAll('.delete-address-btn');

    deleteButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const addressId = this.dataset.addressId;
        const addressInfo = this.dataset.addressInfo || 'this address';

        if (confirm(`Are you sure you want to delete ${addressInfo}?`)) {
          // If confirmed, submit the delete form or make AJAX request
          const form = document.getElementById(`delete-address-form-${addressId}`);
          if (form) {
            form.submit();
          }
        }
      });
    });
  }

  /**
   * Initialize default address selection functionality
   */
  initDefaultAddressSelection() {
    const defaultButtons = document.querySelectorAll('.set-default-address-btn');

    defaultButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();

        const addressId = this.dataset.addressId;
        const form = document.getElementById(`default-address-form-${addressId}`);

        if (form) {
          form.submit();
        }
      });
    });
  }
}

// Create and export an instance
const addressManager = new AddressManager();
export default addressManager;
