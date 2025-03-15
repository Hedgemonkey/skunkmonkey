export function getCookie(name) {
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

/**
 * Makes an AJAX request and returns the jqXHR object to allow aborting the request if needed
 * @param {string} url - The URL to send the request to
 * @param {string} method - The HTTP method to use (GET, POST, etc.)
 * @param {Object} data - The data to send with the request
 * @param {Function} successCallback - Called when the request succeeds
 * @param {Function} errorCallback - Called when the request fails
 * @param {boolean} abortable - Whether to return the jqXHR object for aborting (default: true)
 * @returns {Object} The jqXHR object if abortable is true, otherwise undefined
 */
export function makeAjaxRequest(url, method, data, successCallback, errorCallback, abortable = true) {
    const ajaxRequest = $.ajax({
        url: url,
        method: method,
        data: data,
        dataType: 'json',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'X-Requested-With': 'XMLHttpRequest'
        },
        success: function (response) {
            if (typeof successCallback === "function") {
                successCallback(response);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // Don't log aborted requests as errors
            if (textStatus !== 'abort') {
                console.error("AJAX Request failed:", textStatus, errorThrown);
                if (typeof errorCallback === "function") {
                    errorCallback(jqXHR, textStatus, errorThrown);
                }
            }
        }
    });
    
    // Return the jqXHR object if the request should be abortable
    if (abortable) {
        return ajaxRequest;
    }
}
