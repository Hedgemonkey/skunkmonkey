$(document).ready(function () {

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
                    attachFormSubmitHandler(targetDiv); // Attach form handler
                    $(targetDiv).show();
                }
            });
        }
    }

    function attachFormSubmitHandler(targetDiv) {
        $(targetDiv + " form").submit(function (event) {
            event.preventDefault();
            const form = $(this);console.log("Submitted Form Element:", form);

            const url = form.attr("action");
            const formData = form.serialize();

            console.log("Form submitting to URL:", url);
            console.log("Form Data Before Serialization:", form.serializeArray());
            console.log("Serialized Form Data:", formData);

            $.ajax({
                type: "POST",
                url: url,
                data: formData,
                success: function (response) {
                    console.log("AJAX success - Response:", response);
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

    $("#view-details, #change-email-link, #change-password-link, #social-connections-link").click(function (event) {
        event.preventDefault();
        const url = $(this).data("url");
        loadContent("#manage-details", url);

    });



});