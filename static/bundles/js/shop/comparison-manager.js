/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

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

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!***************************************************!*\
  !*** ./shop/static/js/shop/comparison-manager.js ***!
  \***************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _static_js_api_client_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../../../static/js/api-client.js */ "./static/js/api-client.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Comparison Manager
 * Handles product comparison functionality
 * 
 * This module provides functionality for managing product comparisons,
 * including adding and removing products from the comparison list,
 * updating the UI, and displaying notifications.
 */



/**
 * ComparisonManager class for handling product comparison functionality
 */
var ComparisonManager = /*#__PURE__*/function () {
  /**
   * Initialize the ComparisonManager
   */
  function ComparisonManager() {
    _classCallCheck(this, ComparisonManager);
    this.initialize();
  }

  /**
   * Initialize the comparison manager with error handling
   */
  return _createClass(ComparisonManager, [{
    key: "initialize",
    value: function initialize() {
      try {
        this.bindEvents();
        this.updateComparisonCount();
      } catch (error) {
        console.error('Error initializing Comparison Manager:', error);
      }
    }

    /**
     * Bind event listeners to DOM elements
     */
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var _this = this;
      // Add to comparison buttons
      document.addEventListener('click', function (event) {
        var compareBtn = event.target.closest('.add-to-comparison-btn');
        if (compareBtn) {
          event.preventDefault();
          _this.handleAddToComparison(compareBtn);
        }
      });

      // Remove from comparison buttons
      document.addEventListener('click', function (event) {
        var removeBtn = event.target.closest('.remove-from-comparison');
        if (removeBtn) {
          event.preventDefault();
          _this.handleRemoveFromComparison(removeBtn);
        }
      });
    }

    /**
     * Handle adding a product to the comparison list
     * @param {HTMLElement} button - The button that was clicked
     */
  }, {
    key: "handleAddToComparison",
    value: function handleAddToComparison(button) {
      var _this2 = this;
      var productId = button.dataset.productId;
      var productName = button.dataset.productName || 'Product';
      var url = button.href;
      var isCurrentlyCompared = button.classList.contains('btn-success');

      // Update button state immediately for better UX
      this.updateButtonState(button, !isCurrentlyCompared);

      // Make API request
      _static_js_api_client_js__WEBPACK_IMPORTED_MODULE_0__["default"].get(url).then(function (data) {
        if (data.success) {
          // Show appropriate success message based on action
          if (isCurrentlyCompared) {
            // If removing from comparison
            _this2.showToast('Removed from Comparison', data.message || "".concat(productName, " removed from comparison list."), 'info');
          } else {
            // If adding to comparison
            _this2.showToast('Added to Comparison', data.message || "".concat(productName, " added to comparison list."), 'success');
          }
          _this2.updateComparisonCount(data.comparison_count);
        } else {
          // Revert button state on failure
          _this2.updateButtonState(button, isCurrentlyCompared);

          // Show error message
          _this2.showToast('Notice', data.message || 'Failed to update comparison list', 'warning');
        }
      })["catch"](function (error) {
        // Revert button state on error
        _this2.updateButtonState(button, isCurrentlyCompared);

        // Show error message
        console.error('Error updating comparison:', error);
        _this2.showToast('Error', 'Failed to update comparison list', 'error');
      });
    }

    /**
     * Update the button state based on comparison status
     * @param {HTMLElement} button - The button to update
     * @param {boolean} isCompared - Whether the product is in the comparison list
     */
  }, {
    key: "updateButtonState",
    value: function updateButtonState(button, isCompared) {
      if (isCompared) {
        // Add to comparison list styling
        button.classList.remove('btn-outline-secondary');
        button.classList.add('btn-success');
        button.innerHTML = '<i class="fas fa-check me-1"></i> Compared';
        button.setAttribute('title', 'Remove from comparison');

        // Update href to remove action
        var newUrl = button.getAttribute('href').replace('add_to_comparison', 'remove_from_comparison');
        button.setAttribute('href', newUrl);
      } else {
        // Remove from comparison list styling
        button.classList.remove('btn-success');
        button.classList.add('btn-outline-secondary');
        button.innerHTML = '<i class="fas fa-balance-scale me-1"></i> Compare';
        button.setAttribute('title', 'Add to comparison');

        // Update href to add action
        var _newUrl = button.getAttribute('href').replace('remove_from_comparison', 'add_to_comparison');
        button.setAttribute('href', _newUrl);
      }
    }

    /**
     * Handle removing a product from the comparison list
     * @param {HTMLElement} button - The button that was clicked
     */
  }, {
    key: "handleRemoveFromComparison",
    value: function handleRemoveFromComparison(button) {
      var _this3 = this;
      var url = button.href;
      var productName = button.dataset.productName || 'Product';

      // Make API request
      _static_js_api_client_js__WEBPACK_IMPORTED_MODULE_0__["default"].get(url).then(function (data) {
        if (data.success) {
          // If we're on the comparison page, reload to update the UI
          if (window.location.pathname.includes('/comparison/')) {
            window.location.reload();
          } else {
            // Just update the count
            _this3.updateComparisonCount(data.comparison_count);
            _this3.showToast('Removed from Comparison', data.message || "".concat(productName, " removed from comparison list."), 'info');
          }
        } else {
          // Show error message
          _this3.showToast('Error', data.message || 'Failed to remove product', 'error');
        }
      })["catch"](function (error) {
        console.error('Error removing from comparison:', error);
        _this3.showToast('Error', 'Failed to remove product from comparison', 'error');
      });
    }

    /**
     * Update the comparison count in the UI
     * @param {number} count - The new comparison count
     */
  }, {
    key: "updateComparisonCount",
    value: function updateComparisonCount(count) {
      // Update comparison count in the UI
      var countElements = document.querySelectorAll('.comparison-count');
      if (countElements.length > 0 && count !== undefined) {
        countElements.forEach(function (el) {
          el.textContent = count;
        });
      }
    }

    /**
     * Show a notification using SweetAlert2
     * @param {string} title - The notification title
     * @param {string} message - The notification message
     * @param {string} type - The notification type (success, error, warning, info)
     */
  }, {
    key: "showToast",
    value: function showToast(title, message) {
      var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'info';
      // Convert type to SweetAlert2 icon type
      var iconType = type === 'danger' ? 'error' : type;

      // Use the globally available Swal object from the npm package
      if (typeof window.Swal !== 'undefined') {
        console.log('Showing toast with SweetAlert2:', title, message, iconType);
        window.Swal.fire({
          title: title,
          text: message,
          icon: iconType,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: function didOpen(toast) {
            toast.addEventListener('mouseenter', window.Swal.stopTimer);
            toast.addEventListener('mouseleave', window.Swal.resumeTimer);
          }
        });
      } else {
        // Fallback to console if SweetAlert2 is not available
        console.warn('SweetAlert2 not available for toast:', title, message);
        alert("".concat(title, ": ").concat(message));
      }
    }
  }]);
}(); // Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  // Check if SweetAlert2 is available
  if (typeof window.Swal === 'undefined') {
    console.warn('SweetAlert2 is not available. Toast notifications will fall back to alerts.');
  } else {
    console.log('SweetAlert2 is available for ComparisonManager.');
  }
  window.comparisonManager = new ComparisonManager();
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ComparisonManager);
})();

/******/ })()
;
//# sourceMappingURL=comparison-manager.js.map