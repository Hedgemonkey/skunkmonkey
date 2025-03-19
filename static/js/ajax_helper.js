/**
 * ajax_helper.js - Utility functions for AJAX requests
 * 
 * Provides standardized AJAX request functionality with CSRF protection
 * and consistent error handling.
 */

/**
 * Get the CSRF token from cookies
 * @param {string} name - Cookie name
 * @returns {string} - CSRF token value
 */
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
 * @param {Object|FormData} data - The data to send with the request
 * @param {Function} successCallback - Called when the request succeeds
 * @param {Function} errorCallback - Called when the request fails
 * @param {boolean} abortable - Whether to return the jqXHR object for aborting (default: true)
 * @param {boolean} processData - Whether to process the data (set to false for FormData)
 * @param {string|boolean} contentType - Content type header or false to let jQuery set it
 * @returns {Object} The jqXHR object if abortable is true, otherwise undefined
 */
export function makeAjaxRequest(
    url, 
    method, 
    data, 
    successCallback, 
    errorCallback, 
    abortable = true,
    processData = true,
    contentType = 'application/x-www-form-urlencoded; charset=UTF-8'
) {
    // Determine if data is FormData and set appropriate options
    const isFormData = data instanceof FormData;
    if (isFormData) {
        processData = false;
        contentType = false;
    }
    
    // Set up AJAX options
    const ajaxOptions = {
        url: url,
        method: method,
        data: data,
        processData: processData,
        contentType: contentType,
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'X-Requested-With': 'XMLHttpRequest'
        },
        success: function (response) {
            if (typeof successCallback === "function") {
                // Handle both JSON and HTML responses
                if (typeof response === 'string' && response.trim().startsWith('<')) {
                    // If it's HTML content
                    successCallback({ html: response });
                } else {
                    // If it's JSON or other data
                    successCallback(response);
                }
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
    };
    
    // Try to auto-detect the response type
    if (url.includes('/api/') || url.endsWith('.json')) {
        ajaxOptions.dataType = 'json';
    }
    
    // Make the request
    const ajaxRequest = $.ajax(ajaxOptions);
    
    // Return the jqXHR object if the request should be abortable
    if (abortable) {
        return ajaxRequest;
    }
}
