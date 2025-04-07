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
/*!*********************************************!*\
  !*** ./shop/static/js/shop/cart-manager.js ***!
  \*********************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _static_js_api_client_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../static/js/api-client.js */ "./static/js/api-client.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * CartManager - handles all cart functionality
 * Manages adding, removing, and updating items in the shopping cart
 */

var CartManager = /*#__PURE__*/function () {
  function CartManager() {
    _classCallCheck(this, CartManager);
    this.api = new _static_js_api_client_js__WEBPACK_IMPORTED_MODULE_0__.ApiClient({
      errorHandler: this.handleApiError.bind(this)
    });
    this.cartContainer = document.getElementById('cart-container');
    this.cartTotal = document.getElementById('cart-total');
    this.cartCount = document.getElementById('cart-count');
    this.cartCountBadge = document.querySelector('.cart-count-badge');
    this.initEventListeners();
  }

  /**
   * Initialize all event listeners
   * Sets up event handlers for adding, updating and removing cart items
   */
  return _createClass(CartManager, [{
    key: "initEventListeners",
    value: function initEventListeners() {
      var _this = this;
      // Handle add to cart form submissions
      document.querySelectorAll('.add-to-cart-form').forEach(function (form) {
        form.addEventListener('submit', _this.handleAddToCart.bind(_this));
      });

      // Handle quantity update form submissions
      document.querySelectorAll('.update-cart-form').forEach(function (form) {
        form.addEventListener('submit', _this.handleUpdateSubmit.bind(_this));
      });

      // Handle remove item links
      document.querySelectorAll('.remove-cart-item').forEach(function (link) {
        link.addEventListener('click', _this.handleRemoveItem.bind(_this));
      });

      // Handle quantity buttons on product detail page
      this.initQuantityButtons();

      // Handle cart quantity buttons
      this.initCartQuantityButtons();
    }

    /**
     * Initialize quantity buttons in the cart page
     * Sets up custom quantity controls with AJAX updates
     */
  }, {
    key: "initCartQuantityButtons",
    value: function initCartQuantityButtons() {
      var _this2 = this;
      // Support both class naming conventions for backward compatibility
      var decreaseButtons = document.querySelectorAll('.quantity-decrease, .btn-decrease');
      var increaseButtons = document.querySelectorAll('.quantity-increase, .btn-increase');

      // Set up decrease buttons
      decreaseButtons.forEach(function (button) {
        button.addEventListener('click', function (e) {
          console.log('Decrease button clicked');
          var form = button.closest('.update-cart-form');
          if (!form) {
            console.error('Could not find parent form for decrease button:', button);
            return;
          }
          var input = form.querySelector('.quantity-input');
          var currentValue = parseInt(input.value);
          if (currentValue > 1) {
            // Decrease the value and update
            input.value = currentValue - 1;
            _this2.updateCartItemQuantity(form);
          }
        });
      });

      // Set up increase buttons
      increaseButtons.forEach(function (button) {
        button.addEventListener('click', function (e) {
          console.log('Increase button clicked');
          var form = button.closest('.update-cart-form');
          if (!form) {
            console.error('Could not find parent form for increase button:', button);
            return;
          }
          var input = form.querySelector('.quantity-input');
          var currentValue = parseInt(input.value);
          var maxStock = parseInt(input.dataset.maxStock || Number.MAX_SAFE_INTEGER);
          if (currentValue < maxStock) {
            // Increase the value and update
            input.value = currentValue + 1;
            _this2.updateCartItemQuantity(form);
          } else {
            _this2.showNotification('Maximum Quantity', "Sorry, only ".concat(maxStock, " units available."), 'info');
          }
        });
      });

      // Handle direct input changes
      document.querySelectorAll('.quantity-input').forEach(function (input) {
        input.addEventListener('change', function (e) {
          console.log('Quantity input changed');
          var form = input.closest('.update-cart-form');
          if (!form) {
            console.error('Could not find parent form for quantity input:', input);
            return;
          }
          var maxStock = parseInt(input.dataset.maxStock || Number.MAX_SAFE_INTEGER);
          var newValue = parseInt(input.value);

          // Validate input value
          if (isNaN(newValue) || newValue < 1) {
            newValue = 1;
            input.value = newValue;
          } else if (newValue > maxStock) {
            newValue = maxStock;
            input.value = newValue;
            _this2.showNotification('Maximum Quantity', "Sorry, only ".concat(maxStock, " units available."), 'info');
          }

          // Trigger the update
          _this2.updateCartItemQuantity(form);
        });
      });
    }

    /**
     * Update cart item quantity via AJAX
     * @param {HTMLFormElement} form - The quantity update form
     */
  }, {
    key: "updateCartItemQuantity",
    value: function updateCartItemQuantity(form) {
      var _this3 = this;
      if (!form || !form.action) {
        console.error('Invalid form or form action:', form);
        return;
      }

      // Show loading indicator on the quantity controls
      var quantityControl = form.querySelector('.quantity-control');
      if (quantityControl) {
        quantityControl.classList.add('updating');
      }

      // Get form data
      var formData = new FormData(form);
      console.log('Making AJAX request to:', form.action);
      this.api.post(form.action, formData).then(function (response) {
        console.log('AJAX response:', response);
        if (response.success) {
          // Remove loading indicator
          if (quantityControl) {
            quantityControl.classList.remove('updating');
          }

          // Update the item subtotal
          var row = form.closest('tr');
          var subtotalCell = row.querySelector('.item-subtotal');
          if (subtotalCell) {
            subtotalCell.textContent = "$".concat(response.item_subtotal);
            subtotalCell.classList.add('highlight-update');
            setTimeout(function () {
              subtotalCell.classList.remove('highlight-update');
            }, 1000);
          }

          // Update cart total
          if (_this3.cartTotal) {
            _this3.cartTotal.textContent = "$".concat(response.cart_total);
            _this3.cartTotal.classList.add('highlight-update');
            setTimeout(function () {
              _this3.cartTotal.classList.remove('highlight-update');
            }, 1000);
          }

          // Update cart count badge if it exists
          if (_this3.cartCountBadge) {
            _this3.cartCountBadge.textContent = response.cart_count;
          }

          // Update item quantity (in case the server modified it)
          var quantityInput = form.querySelector('.quantity-input');
          if (quantityInput && response.item_quantity) {
            quantityInput.value = response.item_quantity;
          }

          // Show a brief notification
          _this3.showNotification('Cart Updated', 'Your cart has been updated successfully.', 'success', true, {
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
          });
        }
      })["catch"](function (error) {
        console.error('Update cart error:', error);
        // Remove loading indicator
        if (quantityControl) {
          quantityControl.classList.remove('updating');
        }
        _this3.handleApiError(error);
      });
    }

    /**
     * Initialize quantity selector controls for product detail page
     * Sets up increment/decrement functionality with quantity limits
     */
  }, {
    key: "initQuantityButtons",
    value: function initQuantityButtons() {
      var _this4 = this;
      var quantityInput = document.getElementById('quantity');
      var decreaseBtn = document.getElementById('decrease-quantity');
      var increaseBtn = document.getElementById('increase-quantity');
      if (decreaseBtn && increaseBtn && quantityInput) {
        decreaseBtn.addEventListener('click', function () {
          var currentValue = parseInt(quantityInput.value);
          if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
          }
        });
        increaseBtn.addEventListener('click', function () {
          var currentValue = parseInt(quantityInput.value);
          var maxValue = parseInt(quantityInput.getAttribute('max'));
          if (currentValue < maxValue) {
            quantityInput.value = currentValue + 1;
          } else {
            _this4.showNotification('Maximum Quantity', "Sorry, only ".concat(maxValue, " units available."), 'info');
          }
        });
      }
    }

    /**
     * Handle adding a product to cart
     * @param {Event} event - The form submit event
     */
  }, {
    key: "handleAddToCart",
    value: function handleAddToCart(event) {
      var _form$closest,
        _this5 = this;
      event.preventDefault();
      var form = event.target;
      var url = form.action;
      var formData = new FormData(form);
      var productName = ((_form$closest = form.closest('.product-info')) === null || _form$closest === void 0 || (_form$closest = _form$closest.querySelector('h1')) === null || _form$closest === void 0 ? void 0 : _form$closest.textContent) || 'Product';
      var button = form.querySelector('button[type="submit"]');
      this.showNotification('Adding to Cart...', 'Please wait...', 'info', false);
      this.api.post(url, formData).then(function (response) {
        if (response.success) {
          // Add animation to the add to cart button
          if (button) {
            button.classList.add('add-to-cart-animation');
            setTimeout(function () {
              button.classList.remove('add-to-cart-animation');
            }, 1500);
          }

          // Update cart count
          if (_this5.cartCount) {
            _this5.cartCount.textContent = response.cart_count;
            _this5.cartCount.classList.add('cart-count-updated');
            setTimeout(function () {
              _this5.cartCount.classList.remove('cart-count-updated');
            }, 500);
          }

          // Update cart badge in navbar if it exists
          if (_this5.cartCountBadge) {
            _this5.cartCountBadge.textContent = response.cart_count;
            _this5.cartCountBadge.classList.remove('d-none');
          }
          _this5.showNotification('Added to Cart!', "".concat(productName, " has been added to your cart."), 'success', true, {
            showDenyButton: true,
            denyButtonText: 'View Cart',
            denyButtonColor: '#198754',
            confirmButtonText: 'Continue Shopping'
          }).then(function (result) {
            if (result.isDenied) {
              window.location.href = '/shop/cart/';
            }
          });
        }
      });
    }

    /**
     * Handle cart item quantity update
     * @param {Event} event - The form submit event
     */
  }, {
    key: "handleUpdateSubmit",
    value: function handleUpdateSubmit(event) {
      event.preventDefault();

      // Get the form and ensure it exists
      var form = event.target;
      if (!form || !form.action) {
        console.error('Invalid form or form action in handleUpdateSubmit:', form);
        return;
      }

      // Use the updateCartItemQuantity method to handle the update
      this.updateCartItemQuantity(form);
    }

    /**
     * Handle removing an item from the cart
     * @param {Event} event - The click event
     */
  }, {
    key: "handleRemoveItem",
    value: function handleRemoveItem(event) {
      var _this6 = this;
      event.preventDefault();
      var link = event.currentTarget;
      var url = link.href;
      var productName = link.dataset.productName || 'this item';
      this.showConfirmation('Remove Item?', "Are you sure you want to remove ".concat(productName, " from your cart?"), function () {
        _this6.api.get(url).then(function (response) {
          if (response.success) {
            // Add fade-out animation to the row
            var row = link.closest('tr');
            row.classList.add('fade-out');
            setTimeout(function () {
              // Remove the row from the table
              row.remove();

              // Update cart total
              if (_this6.cartTotal) {
                _this6.cartTotal.textContent = "$".concat(response.cart_total);
              }

              // Update cart count badge in navbar if it exists
              if (_this6.cartCountBadge) {
                if (response.cart_count > 0) {
                  _this6.cartCountBadge.textContent = response.cart_count;
                } else {
                  _this6.cartCountBadge.classList.add('d-none');
                }
              }

              // If cart is empty, refresh the page to show empty state
              if (response.cart_count === 0) {
                window.location.reload();
              }
            }, 300);
            _this6.showNotification('Item Removed', "".concat(productName, " has been removed from your cart."), 'success');
          }
        });
      });
    }

    /**
     * Show a confirmation dialog before removing item
     * @param {string} title - The dialog title
     * @param {string} message - The dialog message
     * @param {Function} confirmCallback - Function to call when confirmed
     */
  }, {
    key: "showConfirmation",
    value: function showConfirmation(title, message, confirmCallback) {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: title,
          text: message,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#dc3545',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'Yes, remove it',
          cancelButtonText: 'No, keep it'
        }).then(function (result) {
          if (result.isConfirmed) {
            confirmCallback();
          }
        });
      } else if (confirm(message)) {
        confirmCallback();
      }
    }

    /**
     * Handle API errors
     * @param {Error} error - Error object
     */
  }, {
    key: "handleApiError",
    value: function handleApiError(error) {
      console.error('API Error:', error);
      this.showNotification('Error', error.message || 'There was a problem with your request.', 'error');
    }

    /**
     * Show notifications using SweetAlert when available, fallback to alert
     * @param {string} title - The notification title
     * @param {string} message - The notification message
     * @param {string} type - The notification type (success, error, info)
     * @param {boolean} autoClose - Whether to auto-close the notification
     * @param {Object} options - Additional SweetAlert options
     * @returns {Promise} SweetAlert promise or resolved promise for alert fallback
     */
  }, {
    key: "showNotification",
    value: function showNotification(title, message, type) {
      var autoClose = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
      var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
      if (typeof Swal !== 'undefined') {
        return Swal.fire(_objectSpread({
          title: title,
          text: message,
          icon: type,
          confirmButtonColor: '#0d6efd'
        }, options));
      } else {
        alert("".concat(title, ": ").concat(message));
        return Promise.resolve();
      }
    }
  }]);
}(); // Initialize the cart manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  window.cartManager = new CartManager();
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CartManager);
})();

/******/ })()
;
//# sourceMappingURL=cart.js.map