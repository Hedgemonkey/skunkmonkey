/**
 * Django Messages Handler - Standalone Version
 * Processes Django messages passed via data attributes and displays them using SweetAlert2
 * This version works without ES module imports for better compatibility
 */

/**
 * Initialize Django messages system
 */
function initDjangoMessages() {
    // Get messages from data attribute on body
    const messagesData = document.body.getAttribute('data-django-messages');

    if (!messagesData) {
        return;
    }

    try {
        const messages = JSON.parse(messagesData);

        // Process each message
        messages.forEach(function(msg, index) {
            // Map Django message tags to SweetAlert2 types
            let alertType = 'info';
            const tags = msg.tags || '';

            if (tags.includes('error') || tags.includes('danger')) {
                alertType = 'error';
            } else if (tags.includes('warning')) {
                alertType = 'warning';
            } else if (tags.includes('success')) {
                alertType = 'success';
            } else if (tags.includes('info')) {
                alertType = 'info';
            }

            // Show toast notification if SweetAlert2 is available
            if (window.Swal) {
                // Add slight delay between multiple messages
                setTimeout(function() {
                    window.Swal.fire({
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 4000,
                        timerProgressBar: true,
                        icon: alertType,
                        title: msg.message,
                        didOpen: function(toast) {
                            toast.addEventListener('mouseenter', window.Swal.stopTimer);
                            toast.addEventListener('mouseleave', window.Swal.resumeTimer);
                        }
                    });
                }, index * 300);
            } else {
                // Fallback to console log if SweetAlert2 is not available
                console.log(`Django Message [${alertType}]: ${msg.message}`);
            }
        });
    } catch (e) {
        console.error('Error parsing Django messages:', e);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initDjangoMessages);
