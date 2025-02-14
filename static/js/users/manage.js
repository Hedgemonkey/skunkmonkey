import $ from 'jquery'; // Import jQuery
// import { displayMessages } from '../messages'; // Import displayMessages function from main.js

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
        $(targetDiv + " form").on( 'submit', function (event) {
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
            $("#cancel-edit").on( 'click', function (event) {
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
});