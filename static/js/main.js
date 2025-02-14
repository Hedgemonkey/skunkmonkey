/*!
* Start Bootstrap - Full Width Pics v5.0.6 (https://startbootstrap.com/template/full-width-pics)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-full-width-pics/blob/master/LICENSE)
*/
import $ from 'jquery'; // Import jQuery
import 'bootstrap/dist/js/bootstrap.bundle.js';   // Import Bootstrap JS Bundle
import Swal from 'sweetalert2';  // Import SweetAlert2

function displayMessages(messages) { // updated to accept parameter
    messages.forEach(message => {
        Swal.fire({
            title: message.tags === "error" ? "Error" : message.tags === "success" ? "Success" : "Message",
            text: message.message,
            icon: message.tags === "error" ? "error" : message.tags === "success" ? "success" : "info",
            confirmButtonText: 'OK'
        });
    });
}


$(function() {

    // Add any JavaScript code here that requires SweetAlert2
    // For example, you can put the message toast code here:
    // ... any message code from earlier examples
    // ... rest of your JavaScript code for the page

    //Example:
    displayMessages(messages); // Call the function to display messages on page load
});