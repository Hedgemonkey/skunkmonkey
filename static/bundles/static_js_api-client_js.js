"use strict";
(self["webpackChunkskunkmonkey"] = self["webpackChunkskunkmonkey"] || []).push([["static_js_api-client_js"],{

/***/ "./static/js/ajax_helper.js":
/*!**********************************!*\
  !*** ./static/js/ajax_helper.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getCookie: () => (/* binding */ getCookie),
/* harmony export */   makeAjaxRequest: () => (/* binding */ makeAjaxRequest)
/* harmony export */ });
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
function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + '=') {
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
function makeAjaxRequest(url, method, data, successCallback, errorCallback) {
  var abortable = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : true;
  var processData = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : true;
  var contentType = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 'application/x-www-form-urlencoded; charset=UTF-8';
  // Determine if data is FormData and set appropriate options
  var isFormData = data instanceof FormData;
  if (isFormData) {
    processData = false;
    contentType = false;
  }

  // Set up AJAX options
  var ajaxOptions = {
    url: url,
    method: method,
    data: data,
    processData: processData,
    contentType: contentType,
    headers: {
      'X-CSRFToken': getCookie('csrftoken'),
      'X-Requested-With': 'XMLHttpRequest'
    },
    success: function success(response) {
      if (typeof successCallback === "function") {
        // Handle both JSON and HTML responses
        if (typeof response === 'string' && response.trim().startsWith('<')) {
          // If it's HTML content
          successCallback({
            html: response
          });
        } else {
          // If it's JSON or other data
          successCallback(response);
        }
      }
    },
    error: function error(jqXHR, textStatus, errorThrown) {
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
  var ajaxRequest = $.ajax(ajaxOptions);

  // Return the jqXHR object if the request should be abortable
  if (abortable) {
    return ajaxRequest;
  }
}

/***/ }),

/***/ "./static/js/api-client.js":
/*!*********************************!*\
  !*** ./static/js/api-client.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ApiClient: () => (/* binding */ ApiClient),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ajax_helper_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ajax_helper.js */ "./static/js/ajax_helper.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * api-client.js - Standardized API client for consistent AJAX operations
 * 
 * Provides a higher-level wrapper around AJAX requests with standardized
 * error handling, response parsing, and consistent promise handling.
 */


/**
 * API Client for consistent handling of AJAX requests
 */
var ApiClient = /*#__PURE__*/function () {
  /**
   * Create a new ApiClient instance
   * @param {Object} options - Configuration options
   * @param {Function} options.errorHandler - Global error handler function
   * @param {string} options.baseUrl - Base URL for API requests
   */
  function ApiClient() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _classCallCheck(this, ApiClient);
    this.errorHandler = options.errorHandler || console.error;
    this.baseUrl = options.baseUrl || '';
    this.csrfToken = (0,_ajax_helper_js__WEBPACK_IMPORTED_MODULE_0__.getCookie)('csrftoken');
    this.pendingRequests = [];
  }

  /**
   * Builds a complete URL for the API request
   * @param {string} endpoint - API endpoint
   * @returns {string} - Complete URL
   */
  return _createClass(ApiClient, [{
    key: "buildUrl",
    value: function buildUrl(endpoint) {
      // If endpoint is already a full URL, return it as is
      if (endpoint.startsWith('http') || endpoint.startsWith('/')) {
        return endpoint;
      }

      // Otherwise, join baseUrl and endpoint
      return "".concat(this.baseUrl, "/").concat(endpoint).replace(/([^:]\/)\/+/g, '$1');
    }

    /**
     * Make a GET request to fetch data
     * @param {string} endpoint - API endpoint
     * @param {Object} params - Query parameters
     * @param {Object} options - Additional options
     * @returns {Promise} - Promise resolving with response
     */
  }, {
    key: "get",
    value: function get(endpoint) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return this.request('GET', endpoint, params, options);
    }

    /**
     * Make a POST request to create or update data
     * @param {string} endpoint - API endpoint
     * @param {Object|FormData} data - Data to send
     * @param {Object} options - Additional options
     * @returns {Promise} - Promise resolving with response
     */
  }, {
    key: "post",
    value: function post(endpoint) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return this.request('POST', endpoint, data, options);
    }

    /**
     * Make a DELETE request to remove data
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Data to send
     * @param {Object} options - Additional options
     * @returns {Promise} - Promise resolving with response
     */
  }, {
    key: "delete",
    value: function _delete(endpoint) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return this.request('DELETE', endpoint, data, options);
    }

    /**
     * Make a generic request with specified method
     * @param {string} method - HTTP method
     * @param {string} endpoint - API endpoint
     * @param {Object|FormData} data - Data to send
     * @param {Object} options - Additional options
     * @returns {Promise} - Promise resolving with response
     */
  }, {
    key: "request",
    value: function request(method, endpoint) {
      var _this = this;
      var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      var url = this.buildUrl(endpoint);
      var abortable = options.abortable !== false;

      // Determine if we should process the data (false for FormData)
      var processData = !(data instanceof FormData);
      var contentType = processData ? 'application/x-www-form-urlencoded; charset=UTF-8' : false;
      return new Promise(function (resolve, reject) {
        try {
          var ajaxRequest = (0,_ajax_helper_js__WEBPACK_IMPORTED_MODULE_0__.makeAjaxRequest)(url, method, data, function (response) {
            // Remove from pending requests
            _this.removePendingRequest(ajaxRequest);
            resolve(response);
          }, function (jqXHR, textStatus, errorThrown) {
            var _jqXHR$responseJSON;
            // Remove from pending requests
            _this.removePendingRequest(ajaxRequest);

            // Create standardized error object
            var error = {
              status: jqXHR.status,
              statusText: jqXHR.statusText,
              responseJSON: jqXHR.responseJSON,
              message: ((_jqXHR$responseJSON = jqXHR.responseJSON) === null || _jqXHR$responseJSON === void 0 ? void 0 : _jqXHR$responseJSON.error) || errorThrown || "Request failed"
            };

            // Call the global error handler if provided
            if (_this.errorHandler && !options.skipGlobalErrorHandler) {
              _this.errorHandler(error);
            }
            reject(error);
          }, abortable, processData, contentType);

          // Track the request if abortable
          if (abortable && ajaxRequest) {
            _this.pendingRequests.push(ajaxRequest);
          }

          // If there's a timeout option, handle it
          if (options.timeout) {
            setTimeout(function () {
              if (ajaxRequest && ajaxRequest.readyState < 4) {
                ajaxRequest.abort();
                reject({
                  message: 'Request timed out',
                  status: 0,
                  statusText: 'timeout'
                });
              }
            }, options.timeout);
          }
        } catch (error) {
          console.error("Error making request:", error);
          reject({
            message: error.message || "Failed to make request",
            error: error
          });
        }
      });
    }

    /**
     * Remove a request from the pending requests list
     * @param {Object} request - The request to remove
     */
  }, {
    key: "removePendingRequest",
    value: function removePendingRequest(request) {
      var index = this.pendingRequests.indexOf(request);
      if (index !== -1) {
        this.pendingRequests.splice(index, 1);
      }
    }

    /**
     * Abort all pending requests
     */
  }, {
    key: "abortAll",
    value: function abortAll() {
      this.pendingRequests.forEach(function (request) {
        if (request && typeof request.abort === 'function') {
          request.abort();
        }
      });
      this.pendingRequests = [];
    }
  }]);
}();

// Create a default instance
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (new ApiClient());

/***/ })

}]);
//# sourceMappingURL=static_js_api-client_js.js.map