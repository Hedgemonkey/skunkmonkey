// messages.js - SweetAlert2 toast integration for Django messages
import Swal from 'sweetalert2';

/**
 * Display Django messages as SweetAlert2 toasts
 * @param {Array} messages - Array of message objects from Django
 */
export function displayMessages(messages) {
    if (!messages || !messages.length) {
        return;
    }

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    // Process messages with a slight delay between each
    messages.forEach((message, index) => {
        setTimeout(() => {
            // Map Django message tags to SweetAlert2 icon types
            let iconType = 'info';
            if (message.tags) {
                const tags = message.tags.split(' ');
                if (tags.includes('error') || tags.includes('danger')) {
                    iconType = 'error';
                } else if (tags.includes('success')) {
                    iconType = 'success';
                } else if (tags.includes('warning')) {
                    iconType = 'warning';
                }
            }

            Toast.fire({
                icon: iconType,
                title: message.message
            });
        }, index * 300); // Stagger display by 300ms
    });
}
