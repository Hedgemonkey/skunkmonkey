/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./shop/static/js/shop/cart-manager.js":
/*!*********************************************!*\
  !*** ./shop/static/js/shop/cart-manager.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

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
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
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
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"js/shop/cart": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkskunkmonkey"] = self["webpackChunkskunkmonkey"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["static_js_api-client_js"], () => (__webpack_require__("./shop/static/js/shop/cart-manager.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=cart.js.map