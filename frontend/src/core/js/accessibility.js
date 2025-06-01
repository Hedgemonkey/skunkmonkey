/**
 * Accessibility Enhancement Module
 * Provides live announcements, focus management, and keyboard navigation improvements
 */

class AccessibilityManager {
    constructor() {
        this.init();
    }

    init() {
        this.createLiveRegion();
        this.setupFormValidation();
        this.setupKeyboardNavigation();
        this.setupModalAccessibility();
        this.setupSkipLinks();
    }

    /**
     * Create a live region for screen reader announcements
     */
    createLiveRegion() {
        if (!document.getElementById('sr-live-region')) {
            const liveRegion = document.createElement('div');
            liveRegion.id = 'sr-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            document.body.appendChild(liveRegion);
        }
    }

    /**
     * Announce messages to screen readers
     */
    announce(message, priority = 'polite') {
        const liveRegion = document.getElementById('sr-live-region');
        if (liveRegion) {
            liveRegion.setAttribute('aria-live', priority);
            liveRegion.textContent = message;

            // Clear after announcement
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    /**
     * Enhanced form validation with accessibility features
     */
    setupFormValidation() {
        const forms = document.querySelectorAll('form');

        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                this.validateForm(form, e);
            });

            // Real-time validation feedback
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });

                input.addEventListener('input', () => {
                    this.clearFieldError(input);
                });
            });
        });
    }

    /**
     * Validate individual form field
     */
    validateField(field) {
        const isValid = field.checkValidity();
        const errorContainer = document.getElementById(`${field.id}_error`) ||
                             field.parentNode.querySelector('.invalid-feedback');

        if (!isValid) {
            field.classList.add('is-invalid');
            field.setAttribute('aria-invalid', 'true');

            if (errorContainer) {
                const message = field.validationMessage || 'This field is required.';
                errorContainer.textContent = message;
                this.announce(`Error in ${this.getFieldLabel(field)}: ${message}`, 'assertive');
            }
        } else {
            field.classList.remove('is-invalid');
            field.removeAttribute('aria-invalid');
        }
    }

    /**
     * Clear field error state
     */
    clearFieldError(field) {
        if (field.classList.contains('is-invalid') && field.checkValidity()) {
            field.classList.remove('is-invalid');
            field.removeAttribute('aria-invalid');
        }
    }

    /**
     * Validate entire form
     */
    validateForm(form, event) {
        const invalidFields = form.querySelectorAll(':invalid');

        if (invalidFields.length > 0) {
            event.preventDefault();

            // Focus first invalid field
            invalidFields[0].focus();

            // Announce error summary
            const errorCount = invalidFields.length;
            this.announce(
                `Form submission failed. ${errorCount} field${errorCount > 1 ? 's' : ''} require${errorCount === 1 ? 's' : ''} attention.`,
                'assertive'
            );

            // Validate all fields to show errors
            invalidFields.forEach(field => this.validateField(field));
        } else {
            this.announce('Form submitted successfully.', 'polite');
        }
    }

    /**
     * Get field label for announcements
     */
    getFieldLabel(field) {
        const label = document.querySelector(`label[for="${field.id}"]`);
        return label ? label.textContent.replace('*', '').trim() : field.name || 'field';
    }

    /**
     * Setup keyboard navigation improvements
     */
    setupKeyboardNavigation() {
        // Enhanced tab navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }

            // Escape key handling for modals and dropdowns
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        });

        // Focus visible outline for keyboard users
        document.addEventListener('mousedown', () => {
            document.body.classList.add('using-mouse');
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.remove('using-mouse');
            }
        });
    }

    /**
     * Handle tab navigation
     */
    handleTabNavigation(e) {
        const focusableElements = this.getFocusableElements();
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        // Trap focus in modals
        const activeModal = document.querySelector('.modal.show');
        if (activeModal) {
            const modalFocusable = this.getFocusableElements(activeModal);
            const firstModalFocusable = modalFocusable[0];
            const lastModalFocusable = modalFocusable[modalFocusable.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstModalFocusable) {
                    e.preventDefault();
                    lastModalFocusable.focus();
                }
            } else {
                if (document.activeElement === lastModalFocusable) {
                    e.preventDefault();
                    firstModalFocusable.focus();
                }
            }
        }
    }

    /**
     * Get all focusable elements
     */
    getFocusableElements(container = document) {
        return container.querySelectorAll(
            'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), ' +
            'input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), ' +
            'input[type="checkbox"]:not([disabled]), input[type="email"]:not([disabled]), ' +
            'input[type="password"]:not([disabled]), input[type="tel"]:not([disabled]), ' +
            'input[type="url"]:not([disabled]), input[type="search"]:not([disabled]), ' +
            'select:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
        );
    }

    /**
     * Handle escape key
     */
    handleEscapeKey() {
        // Close modals
        const activeModal = document.querySelector('.modal.show');
        if (activeModal) {
            const closeButton = activeModal.querySelector('[data-bs-dismiss="modal"]');
            if (closeButton) {
                closeButton.click();
            }
        }

        // Close dropdowns
        const openDropdowns = document.querySelectorAll('.dropdown-menu.show');
        openDropdowns.forEach(dropdown => {
            const toggle = document.querySelector(`[data-bs-toggle="dropdown"][aria-expanded="true"]`);
            if (toggle) {
                toggle.click();
            }
        });
    }

    /**
     * Setup modal accessibility
     */
    setupModalAccessibility() {
        const modals = document.querySelectorAll('.modal');

        modals.forEach(modal => {
            modal.addEventListener('shown.bs.modal', () => {
                const firstFocusable = this.getFocusableElements(modal)[0];
                if (firstFocusable) {
                    firstFocusable.focus();
                }
            });

            modal.addEventListener('hidden.bs.modal', () => {
                // Return focus to trigger element
                const trigger = document.querySelector(`[data-bs-target="#${modal.id}"]`);
                if (trigger) {
                    trigger.focus();
                }
            });
        });
    }

    /**
     * Setup skip links
     */
    setupSkipLinks() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link sr-only sr-only-focusable';
        skipLink.textContent = 'Skip to main content';

        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const mainContent = document.getElementById('main-content') ||
                              document.querySelector('main') ||
                              document.querySelector('[role="main"]');

            if (mainContent) {
                mainContent.focus();
                mainContent.scrollIntoView();
            }
        });

        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    /**
     * Announce page changes for SPA-like behavior
     */
    announcePageChange(title) {
        this.announce(`Page changed to ${title}`, 'polite');
    }

    /**
     * Announce loading states
     */
    announceLoading(isLoading, context = '') {
        if (isLoading) {
            this.announce(`Loading ${context}...`, 'polite');
        } else {
            this.announce(`Loading complete ${context}`, 'polite');
        }
    }
}

// Initialize accessibility manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityManager = new AccessibilityManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityManager;
}
