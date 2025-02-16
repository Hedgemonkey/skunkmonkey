// /static/js/messages.js
import Swal from 'sweetalert2';  // Import SweetAlert2

export function displayMessages(messages) { // updated to accept parameter
    messages.forEach(message => {
        Swal.fire({
            title: message.tags === "error" ? "Error" : message.tags === "success" ? "Success" : "Message",
            text: message.message,
            icon: message.tags === "error" ? "error" : message.tags === "success" ? "success" : "info",
            confirmButtonText: 'OK'
        });
    });
}
