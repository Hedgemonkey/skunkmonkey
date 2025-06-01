/**
 * Account Actions Module
 *
 * This module handles user account actions like deactivation and deletion.
 */

import $ from 'jquery';
import 'bootstrap';

console.log('Account actions module loaded');

class AccountManager {
    constructor() {
        this.actionButton = document.querySelector('[data-account-action="manage"]');
        this.modal = document.getElementById('accountActionModal');
        this.deactivateBtn = document.getElementById('deactivateAccount');
        this.deleteBtn = document.getElementById('deleteAccount');

        // Confirmation modals
        this.deactivateConfirmModal = document.getElementById('deactivateConfirmModal');
        this.deleteConfirmModal = document.getElementById('deleteConfirmModal');
        this.confirmDeactivateBtn = document.getElementById('confirmDeactivate');
        this.confirmDeleteBtn = document.getElementById('confirmDelete');
        this.deleteConfirmationInput = document.getElementById('deleteConfirmationInput');

        this.modalInstance = null;
        this.deactivateConfirmModalInstance = null;
        this.deleteConfirmModalInstance = null;

        // Initialize the manager
        this.init();
    }

    init() {
        if (!this.actionButton || !this.modal) {
            console.error('Required elements for account actions not found');
            return;
        }

        // Initialize Bootstrap modals
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            this.modalInstance = new bootstrap.Modal(this.modal);
            if (this.deactivateConfirmModal) {
                this.deactivateConfirmModalInstance = new bootstrap.Modal(this.deactivateConfirmModal);
            }
            if (this.deleteConfirmModal) {
                this.deleteConfirmModalInstance = new bootstrap.Modal(this.deleteConfirmModal);
            }
        }

        // Bind events
        this.bindEvents();

        console.log('Account manager initialized');
    }

    bindEvents() {
        // Open account action modal when clicking the manage button
        this.actionButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.openModal();
        });

        // Handle deactivation action - show confirmation modal
        if (this.deactivateBtn) {
            this.deactivateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDeactivateConfirmation();
            });
        }

        // Handle deletion action - show confirmation modal
        if (this.deleteBtn) {
            this.deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDeleteConfirmation();
            });
        }

        // Handle final deactivation confirmation
        if (this.confirmDeactivateBtn) {
            this.confirmDeactivateBtn.addEventListener('click', () => {
                this.deactivateAccount();
            });
        }

        // Handle final deletion confirmation
        if (this.confirmDeleteBtn) {
            this.confirmDeleteBtn.addEventListener('click', () => {
                this.deleteAccount();
            });
        }

        // Handle delete confirmation input
        if (this.deleteConfirmationInput) {
            this.deleteConfirmationInput.addEventListener('input', () => {
                this.validateDeleteConfirmation();
            });

            // Clear input when modal is hidden
            if (this.deleteConfirmModal) {
                this.deleteConfirmModal.addEventListener('hidden.bs.modal', () => {
                    this.deleteConfirmationInput.value = '';
                    this.validateDeleteConfirmation();
                });
            }
        }
    }

    openModal() {
        if (this.modalInstance) {
            this.modalInstance.show();
        } else if (typeof $ !== 'undefined') {
            $(this.modal).modal('show');
        } else {
            this.modal.style.display = 'block';
            this.modal.classList.add('show');
        }
    }

    showDeactivateConfirmation() {
        // Hide the main modal first
        if (this.modalInstance) {
            this.modalInstance.hide();
        }

        // Show deactivate confirmation modal
        if (this.deactivateConfirmModalInstance) {
            this.deactivateConfirmModalInstance.show();
        } else if (typeof $ !== 'undefined') {
            $(this.deactivateConfirmModal).modal('show');
        } else {
            this.deactivateConfirmModal.style.display = 'block';
            this.deactivateConfirmModal.classList.add('show');
        }
    }

    showDeleteConfirmation() {
        // Hide the main modal first
        if (this.modalInstance) {
            this.modalInstance.hide();
        }

        // Show delete confirmation modal
        if (this.deleteConfirmModalInstance) {
            this.deleteConfirmModalInstance.show();
        } else if (typeof $ !== 'undefined') {
            $(this.deleteConfirmModal).modal('show');
        } else {
            this.deleteConfirmModal.style.display = 'block';
            this.deleteConfirmModal.classList.add('show');
        }
    }

    validateDeleteConfirmation() {
        if (!this.deleteConfirmationInput || !this.confirmDeleteBtn) return;

        const inputValue = this.deleteConfirmationInput.value.trim();
        const isValid = inputValue === 'DELETE';

        this.confirmDeleteBtn.disabled = !isValid;

        // Update button appearance based on validation
        if (isValid) {
            this.confirmDeleteBtn.classList.remove('disabled');
            this.confirmDeleteBtn.setAttribute('aria-describedby', 'delete-button-enabled-help');
        } else {
            this.confirmDeleteBtn.classList.add('disabled');
            this.confirmDeleteBtn.setAttribute('aria-describedby', 'delete-button-help');
        }
    }

    deactivateAccount() {
        const url = this.actionButton.dataset.deactivateUrl;
        const redirectUrl = this.actionButton.dataset.deactivateRedirectUrl;

        if (!url) {
            console.error('Deactivation URL not provided');
            return;
        }

        // Hide the confirmation modal
        if (this.deactivateConfirmModalInstance) {
            this.deactivateConfirmModalInstance.hide();
        }

        // Send POST request to deactivate account
        this.sendAccountAction(url, redirectUrl);
    }

    deleteAccount() {
        const url = this.actionButton.dataset.deleteUrl;
        const redirectUrl = this.actionButton.dataset.deleteRedirectUrl;

        if (!url) {
            console.error('Deletion URL not provided');
            return;
        }

        // Validate that the user typed DELETE
        const inputValue = this.deleteConfirmationInput ? this.deleteConfirmationInput.value.trim() : '';
        if (inputValue !== 'DELETE') {
            console.error('Delete confirmation not properly entered');
            return;
        }

        // Hide the confirmation modal
        if (this.deleteConfirmModalInstance) {
            this.deleteConfirmModalInstance.hide();
        }

        // Send DELETE request to delete account
        this.sendAccountAction(url, redirectUrl, 'DELETE');
    }

    sendAccountAction(url, redirectUrl, method = 'POST') {
        // Get CSRF token
        const csrfToken = this.getCsrfToken();

        if (!csrfToken) {
            console.error('CSRF token not found');
            return;
        }

        // Send request
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            credentials: 'same-origin'
        })
        .then(response => {
            if (response.ok) {
                // Redirect to the success page if provided, otherwise reload
                if (redirectUrl) {
                    window.location.href = redirectUrl;
                } else {
                    window.location.reload();
                }
            } else {
                throw new Error('Error processing account action');
            }
        })
        .catch(error => {
            console.error('Account action error:', error);
            alert('An error occurred while processing your request. Please try again later.');
        });
    }

    getCsrfToken() {
        // Get CSRF token from cookie
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith('csrftoken=')) {
                return cookie.substring('csrftoken='.length);
            }
        }

        // As a fallback, check for the CSRF token in the DOM
        const csrfInput = document.querySelector('[name="csrfmiddlewaretoken"]');
        if (csrfInput) {
            return csrfInput.value;
        }

        return null;
    }
}

// Initialize the account manager on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded in account_actions.js');
    new AccountManager();
});

// Also initialize with jQuery ready for backup
$(function() {
    console.log('jQuery ready in account_actions.js');
    // Only initialize if not already initialized
    if (!window.accountManager) {
        window.accountManager = new AccountManager();
    }
});

// Export for ES modules
export { AccountManager };

// Make it available in the global scope
window.AccountManager = AccountManager;

// Default export
export default { AccountManager };
