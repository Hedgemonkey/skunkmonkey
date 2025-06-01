/**
 * Accessibility Enhancement Module
 * Provides core accessibility features for the SkunkMonkey application
 * including ARIA live regions, focus management, and keyboard navigation
 */

// Import accessibility CSS
import './css/accessibility.css';

class AccessibilityManager {
    constructor() {
        this.liveRegion = null;
        this.statusRegion = null;
        this.focusedBeforeModal = null;
        this.trapFocus = false;
    }

    init() {
        this.createLiveRegions();
        this.setupKeyboardNavigation();
        this.enhanceFormValidation();
        this.setupFocusManagement();
        this.announcePageChanges();
    }

    createLiveRegions() {
        // Create assertive live region for important announcements
        if (!this.liveRegion) {
            this.liveRegion = document.createElement('div');
            this.liveRegion.setAttribute('aria-live', 'assertive');
            this.liveRegion.setAttribute('aria-atomic', 'true');
            this.liveRegion.setAttribute('aria-relevant', 'text');
            this.liveRegion.className = 'visually-hidden';
            this.liveRegion.id = 'accessibility-live-region';
            document.body.appendChild(this.liveRegion);
        }

        // Create polite live region for status updates
        if (!this.statusRegion) {
            this.statusRegion = document.createElement('div');
            this.statusRegion.setAttribute('aria-live', 'polite');
            this.statusRegion.setAttribute('aria-atomic', 'true');
            this.statusRegion.className = 'visually-hidden';
            this.statusRegion.id = 'accessibility-status-region';
            document.body.appendChild(this.statusRegion);
        }
    }

    announceToScreenReader(message, priority = 'polite') {
        const region = priority === 'assertive' ? this.liveRegion : this.statusRegion;
        if (region && message) {
            // Clear and set to ensure the message is announced
            region.textContent = '';
            setTimeout(() => {
                region.textContent = message;
            }, 100);
        }
    }

    setupKeyboardNavigation() {
        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Skip to main content with Alt+1
            if (e.altKey && e.key === '1') {
                e.preventDefault();
                const mainContent = document.getElementById('main-content');
                if (mainContent) {
                    mainContent.focus();
                    mainContent.scrollIntoView();
                }
            }

            // Skip to navigation with Alt+2
            if (e.altKey && e.key === '2') {
                e.preventDefault();
                const navbar = document.getElementById('navbar');
                if (navbar) {
                    const firstLink = navbar.querySelector('a, button');
                    if (firstLink) {
                        firstLink.focus();
                    }
                }
            }

            // Escape key to close modals/dropdowns
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        });

        // Enhance focus visibility for keyboard users
        document.addEventListener('keydown', () => {
            document.body.classList.add('keyboard-focus');
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-focus');
        });
    }

    handleEscapeKey() {
        // Close Bootstrap modals
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
            const modal = bootstrap.Modal.getInstance(openModal);
            if (modal) {
                modal.hide();
            }
        }

        // Close Bootstrap dropdowns
        const openDropdown = document.querySelector('.dropdown-menu.show');
        if (openDropdown) {
            const dropdown = bootstrap.Dropdown.getInstance(openDropdown.previousElementSibling);
            if (dropdown) {
                dropdown.hide();
            }
        }

        // Close custom elements with data-dismiss="escape"
        const dismissibleElements = document.querySelectorAll('[data-dismiss="escape"].show, [data-dismiss="escape"].active');
        dismissibleElements.forEach(element => {
            element.classList.remove('show', 'active');
        });
    }

    enhanceFormValidation() {
        // Enhance form validation with better accessibility
        document.addEventListener('submit', (e) => {
            if (e.target.tagName === 'FORM') {
                this.validateForm(e.target);
            }
        });

        // Real-time validation feedback
        document.addEventListener('blur', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.validateField(e.target);
            }
        }, true);
    }

    validateForm(form) {
        const errors = [];
        const invalidFields = form.querySelectorAll(':invalid');

        invalidFields.forEach(field => {
            const label = this.getFieldLabel(field);
            const errorMessage = field.validationMessage || 'This field is invalid';
            errors.push(`${label}: ${errorMessage}`);

            // Add ARIA attributes for accessibility
            field.setAttribute('aria-invalid', 'true');

            // Create or update error message
            this.showFieldError(field, errorMessage);
        });

        if (errors.length > 0) {
            const errorSummary = `Form has ${errors.length} error${errors.length > 1 ? 's' : ''}: ${errors.join(', ')}`;
            this.announceToScreenReader(errorSummary, 'assertive');

            // Focus first invalid field
            invalidFields[0].focus();
        }
    }

    validateField(field) {
        if (field.checkValidity()) {
            field.setAttribute('aria-invalid', 'false');
            this.hideFieldError(field);
        } else {
            field.setAttribute('aria-invalid', 'true');
            const errorMessage = field.validationMessage || 'This field is invalid';
            this.showFieldError(field, errorMessage);
        }
    }

    getFieldLabel(field) {
        // Try to find associated label
        let label = document.querySelector(`label[for="${field.id}"]`);
        if (!label && field.parentElement) {
            label = field.parentElement.querySelector('label');
        }
        return label ? label.textContent.trim() : field.name || field.type || 'Field';
    }

    showFieldError(field, message) {
        let errorElement = document.getElementById(`${field.id}-error`);

        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = `${field.id}-error`;
            errorElement.className = 'invalid-feedback d-block';
            errorElement.setAttribute('role', 'alert');
            errorElement.setAttribute('aria-live', 'polite');

            // Insert after field or field container
            const container = field.parentElement;
            container.appendChild(errorElement);
        }

        errorElement.textContent = message;
        field.setAttribute('aria-describedby', errorElement.id);
    }

    hideFieldError(field) {
        const errorElement = document.getElementById(`${field.id}-error`);
        if (errorElement) {
            errorElement.remove();
        }
        field.removeAttribute('aria-describedby');
    }

    setupFocusManagement() {
        // Manage focus for modals
        document.addEventListener('shown.bs.modal', (e) => {
            this.focusedBeforeModal = document.activeElement;
            const modal = e.target;
            const focusableElement = modal.querySelector('[autofocus], input, select, textarea, button, [tabindex]:not([tabindex="-1"])');
            if (focusableElement) {
                focusableElement.focus();
            }
        });

        document.addEventListener('hidden.bs.modal', () => {
            if (this.focusedBeforeModal) {
                this.focusedBeforeModal.focus();
                this.focusedBeforeModal = null;
            }
        });
    }

    announcePageChanges() {
        // Announce dynamic content changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Announce new content with aria-live regions
                            const liveRegions = node.querySelectorAll('[aria-live]');
                            liveRegions.forEach((region) => {
                                if (region.textContent.trim()) {
                                    this.announceToScreenReader(region.textContent.trim(),
                                        region.getAttribute('aria-live') === 'assertive' ? 'assertive' : 'polite');
                                }
                            });
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Utility method for external use
    static announce(message, priority = 'polite') {
        if (window.accessibilityManager) {
            window.accessibilityManager.announceToScreenReader(message, priority);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityManager = new AccessibilityManager();
    window.accessibilityManager.init();

    // Make announcement method globally available
    window.announceToScreenReader = AccessibilityManager.announce;
});

// Export for module use
export { AccessibilityManager };
