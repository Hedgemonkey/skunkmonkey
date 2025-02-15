import $ from 'jquery'; // Import jQuery
import Swal from 'sweetalert2';  // Import SweetAlert2
// import { displayMessages } from '../messages'; // Import displayMessages function from main.js

function displayMessage(title, text, icon) {
    Swal.fire({
        title: title,
        text: text,
        icon: icon,
        confirmButtonText: 'OK'
    });
}

$(function () {

    let currentUrl = null;

    function loadContent(targetDiv, url) {
        console.log("loadContent called with url:", url);
        if (url === currentUrl) {  // If same URL clicked, hide the div
            $(targetDiv).hide();
            currentUrl = null;
        } else {                    // Otherwise (different URL), load content
            $(targetDiv + " .card-body").load(url, function (response, status, xhr) {
                if (status == "error") {
                    const errorMessage = "Sorry, but there was an error loading the content. "; //error handling added
                    $(targetDiv + " .card-body").html(errorMessage + xhr.status + " " + xhr.statusText);
                    $(targetDiv).show(); // Show the div even on error to display the message
                } else {
                    console.log("Content loaded successfully from:", url);
                    currentUrl = url; // Update currentUrl after successful load
                    // displayMessages(window.messages); // Display new messages
                    attachFormSubmitHandler(targetDiv); // Attach form handler
                    $(targetDiv).show();
                }
            });
        }
    }

    function attachFormSubmitHandler(targetDiv) {
        $(targetDiv + " form").on('submit', function (event) {
            event.preventDefault();
            const form = $(this);

            const url = form.attr("action");
            const formData = form.serialize();

            console.log("Form submitting to URL:", url);

            $.ajax({
                type: "POST",
                url: url,
                data: formData,
                success: function (response) {
                    $(targetDiv + " .card-body").html(response);
                    attachFormSubmitHandler(targetDiv); // Reattach the handler after content update

                },
                error: function (xhr, status, error) {
                    console.error("AJAX error:", error, xhr.status, xhr.statusText);
                    var msg = "Sorry, but there was an error: ";
                    $(targetDiv + " .card-body").html(msg + xhr.status + " " + error); // Update on error
                    attachFormSubmitHandler(targetDiv); // Reattach the handler

                }
            });
        });
    }

    $(document).on('click', '#cancel-edit, #view-details, #change-email-link, #change-password-link, #social-connections-link', function (event) {
        event.preventDefault();
        const url = $(this).data("url");
        loadContent("#manage-details", url);

    });

    $(document).on('click', '#edit-user-link', function (event) {  // "Edit" click handler
        event.preventDefault();
        console.log("Edit User link clicked");
        const url = $(this).data("url");
        currentUrl = url;
        $("#user-details").load(url, function (response, status, xhr) { //Simplified logic
            if (status == "error") {
                var msg = "Sorry but there was an error: ";
                $("#user-details").html(msg + xhr.status + " " + xhr.statusText);
            }
            //After initial content load:
            attachFormSubmitHandler("#user-details");
            $("#edit-user-link").hide();

            $("#save-user-link").show(); // Add Save button
            $("#cancel-edit").show(); // Add Cancel button
            $(document).on("click", "#save-user-link", function (event) {
                event.preventDefault();

                $("#user-details-form").submit();

            });
            //Click handler for cancel button
            $("#cancel-edit").on('click', function (event) {
                event.preventDefault();
                const url = $(this).data("url");
                $("#user-details").load(url, function (response, status, xhr) {
                    if (status === "error") {
                        // ... (Handle errors if necessary) ...
                    }

                    attachFormSubmitHandler("#user-details"); // Reattach event handlers
                    currentUrl = url;

                });
                $("#user-details").show();
            });

        });
        $(document).on("submit", "#user-details form", function (event) {
            event.preventDefault();
            const form = $(this);
            const url = form.attr("action");
            const formData = form.serialize();

            $.ajax({
                type: "POST",
                url: url,
                data: formData,
                success: function (response) {
                    $("#manage-details .card-body").html(response);  // Replace content of #user-details
                    attachFormSubmitHandler("#manage-details .card-body"); // Reattach

                },
                error: function (xhr, status, error) {
                    if (xhr.status === 400) { //Handle form errors
                        const errors = JSON.parse(xhr.responseText);
                        $("#user-details").html(errors.form);  // Update the form with errors
                        console.log(errors.errors)
                        attachFormSubmitHandler("#user-details"); // Reattach event listeners
                    } else {
                        var msg = "Sorry but there was an error: ";
                        $("#user-details .card-body").html(msg + xhr.status + " " + error);

                    }

                }
            });
        });
    });

    $(document).on('click', '#deactivate-delete-link', function (event) {
        event.preventDefault();

        Swal.fire({
            title: 'Manage Account',
            html: `
                <p>Choose an action:</p>
                <p><strong>Deactivate:</strong> To temporarily deactivate your account.</p>
                <p><strong>OR</strong></p>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="permanent-delete-checkbox">
                    <label class="form-check-label" for="permanent-delete-checkbox">
                        <p><strong>Delete:</strong> Select this box to permanently delete your account.</p>
                    </label>
                    <p style="color:red; display: none;" id="permanent-warning">WARNING: THIS CANNOT BE UNDONE!</p>

                </div>

            `,
            icon: 'info',
            showCancelButton: true,
            showDenyButton: true, // Add deny button
            confirmButtonColor: '#ffc107', // Yellow for Deactivate
            cancelButtonColor: '#6c757d',  // Gray for Cancel
            denyButtonColor: '#d33',     // Red for Delete
            confirmButtonText: 'Deactivate',
            denyButtonText: `Delete`, // Text for delete button
            
            // Function to disable/enable delete button based on checkbox
            didOpen: () => {
                const deleteCheckbox = document.getElementById('permanent-delete-checkbox');
                const denyButton = Swal.getDenyButton(); // Get deny button element
                const warning = document.getElementById("permanent-warning");

                denyButton.disabled = !deleteCheckbox.checked;  // Disable initially

                deleteCheckbox.addEventListener('change', () => {
                    denyButton.disabled = !deleteCheckbox.checked; // Disable/enable delete button.
                    warning.style.display = deleteCheckbox.checked ? "block" : "none"; // Show/hide warning on checkbox change.
                });


            },// didOpen function ends here
        }).then((result) => {
            if (result.isConfirmed) {  // Deactivate
                // ... your deactivate logic ...
                const deactivateUrl = $(this).data('deactivate-url');
                const actionText = 'deactivate';
                const successMessage = 'Deactivated';
                const method = 'POST';
                sendAccountActionRequest(deactivateUrl, method, actionText, successMessage);
            } else if (result.isDenied) { // Delete (only if checkbox is checked)

                const deleteUrl = $(this).data('delete-url');
                const actionText = 'delete permanently';
                const successMessage = 'Deleted';
                const method = 'POST';
                Swal.fire({ //Second Swal Alert to make sure!
                    title: 'Are you sure you want to permanently delete your account?',
                    text: "This action cannot be undone!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: `Yes, ${actionText}!`
                }).then((result) => {
                    if (result.isConfirmed) {
                        sendAccountActionRequest(deleteUrl, method, actionText, successMessage)

                    }
                });

            }
        });
    });





    function sendAccountActionRequest(actionUrl, method, actionText, successMessage) {

        fetch(actionUrl, {
            method: method,
            credentials: "same-origin",
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
            .then(response => {
                if (response.ok) {
                    Swal.fire(
                        `${successMessage}!`,
                        `Your account has been ${actionText}d.`,
                        'success'
                    ).then(() => {
                        window.location.href = '/'; // Redirect
                    });

                } else {
                    response.json().then(data => {
                        displayMessages(data.messages || []);  // Display error messages
                    }).catch(() => {
                        displayMessage("Error", `There was a problem ${actionText}ing your account. Please try again.`, "error");

                    });
                }
            });
    }

    $("#permanent-delete-checkbox").on('change', function (event) {
        $("#perminant-warning").toggle($(this).prop("checked"))

    });


    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});