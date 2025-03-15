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

export function makeAjaxRequest(url, method, data, successCallback, errorCallback) {
    $.ajax({
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
            console.error("AJAX Request failed:", textStatus, errorThrown);
            if (typeof errorCallback === "function") {
                errorCallback(jqXHR, textStatus, errorThrown);
            }
        }
    });
}
