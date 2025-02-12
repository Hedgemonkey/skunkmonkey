$(document).ready(function() {
    $("#view-details, #change-email-link, #change-password-link, #social-connections-link").click(function(event) {
        event.preventDefault();
        const url = $(this).data("url");
        loadContent("#manage-details", url);
    });

    function loadContent(targetDiv, url) {
       if ($(targetDiv).is(":hidden")) {
           $(targetDiv + " .card-body").load(url, function(response, status, xhr) {
               if (status == "error") {
                   var msg = "Sorry but there was an error: ";
                   $("#manage-details .card-body").html(msg + xhr.status + " " + xhr.statusText);
                   $(targetDiv).show(); // always show div even if error
               }
                $(targetDiv).show();
           });
       } else {
           $(targetDiv).hide();
       }
    }
});