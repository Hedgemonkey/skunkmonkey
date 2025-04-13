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
        this.modalInstance = null;
        
        // Initialize the manager
        this.init();
    }
    
    init() {
        if (!this.actionButton || !this.modal) {
            console.error('Required elements for account actions not found');
            return;
        }
        
        // Initialize Bootstrap modal
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            this.modalInstance = new bootstrap.Modal(this.modal);
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
        
        // Handle deactivation action
        if (this.deactivateBtn) {
            this.deactivateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.deactivateAccount();
            });
        }
        
        // Handle deletion action
        if (this.deleteBtn) {
            this.deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.deleteAccount();
            });
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
    
    deactivateAccount() {
        const url = this.actionButton.dataset.deactivateUrl;
        const redirectUrl = this.actionButton.dataset.deactivateRedirectUrl;
        
        if (!url) {
            console.error('Deactivation URL not provided');
            return;
        }
        
        if (confirm('Are you sure you want to deactivate your account? You can reactivate it later by logging in.')) {
            // Send POST request to deactivate account
            this.sendAccountAction(url, redirectUrl);
        }
    }
    
    deleteAccount() {
        const url = this.actionButton.dataset.deleteUrl;
        const redirectUrl = this.actionButton.dataset.deleteRedirectUrl;
        
        if (!url) {
            console.error('Deletion URL not provided');
            return;
        }
        
        if (confirm('WARNING: This will permanently delete all your account data. This action cannot be undone. Are you absolutely sure?')) {
            // Send second confirmation
            if (confirm('Please confirm once more that you want to delete your account permanently.')) {
                // Send POST request to delete account
                this.sendAccountAction(url, redirectUrl);
            }
        }
    }
    
    sendAccountAction(url, redirectUrl) {
        // Get CSRF token
        const csrfToken = this.getCsrfToken();
        
        if (!csrfToken) {
            console.error('CSRF token not found');
            return;
        }
        
        // Send POST request
        fetch(url, {
            method: 'POST',
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