"use strict";
(self["webpackChunkskunkmonkey"] = self["webpackChunkskunkmonkey"] || []).push([["shop_static_js_shop_wishlist-initializer_js"],{

/***/ "./shop/static/js/shop/wishlist-initializer.js":
/*!*****************************************************!*\
  !*** ./shop/static/js/shop/wishlist-initializer.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initWishlist: () => (/* binding */ initWishlist)
/* harmony export */ });
/* harmony import */ var _wishlist_manager_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./wishlist-manager.js */ "./shop/static/js/shop/wishlist-manager.js");
/**
 * Wishlist Initializer
 * Bootstraps the wishlist functionality when the page loads
 */



/**
 * Initialize wishlist functionality
 */
function initWishlist() {
  // The wishlist manager is automatically initialized on import,
  // but we can perform additional initialization here if needed

  // Check if we're on the wishlist page
  var isWishlistPage = window.location.pathname.includes('/wishlist/');
  if (isWishlistPage) {
    // Initialize special wishlist page functionality
    initWishlistPage();
  }
  console.log('[WishlistInitializer] Wishlist functionality initialized');
}

/**
 * Initialize wishlist page specific functionality
 */
function initWishlistPage() {
  // Add any wishlist page specific functionality here
  console.log('[WishlistInitializer] Wishlist page specific functionality initialized');

  // Example: Add empty wishlist check
  var wishlistItems = document.querySelectorAll('.wishlist-item, .product-card');
  if (wishlistItems.length === 0) {
    var container = document.querySelector('.container main, .wishlist-container');
    if (container) {
      container.innerHTML = "\n                <div class=\"empty-wishlist alert alert-info text-center my-5\">\n                    <i class=\"fas fa-heart-broken mb-3\" style=\"font-size: 3rem;\"></i>\n                    <h3>Your wishlist is empty</h3>\n                    <p class=\"mb-3\">You haven't added any products to your wishlist yet.</p>\n                    <a href=\"/shop/\" class=\"btn btn-primary\">\n                        <i class=\"fas fa-shopping-bag me-2\"></i>Browse Products\n                    </a>\n                </div>\n            ";
    }
  }
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initWishlist);

// Also export the init function to allow manual initialization


/***/ }),

/***/ "./shop/static/js/shop/wishlist-manager.js":
/*!*************************************************!*\
  !*** ./shop/static/js/shop/wishlist-manager.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _static_js_api_client_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../../../static/js/api-client.js */ "./static/js/api-client.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Wishlist Manager
 * Handles wishlist functionality for the shop
 */



/**
 * WishlistManager class for handling wishlist functionality
 */
var WishlistManager = /*#__PURE__*/function () {
  /**
   * Initialize the WishlistManager
   */
  function WishlistManager() {
    _classCallCheck(this, WishlistManager);
    // Initialize properties BEFORE calling methods that use them
    this.toastQueue = []; // Queue for storing toast notifications
    this.processingToast = false; // Flag to track if a toast is currently being processed
    this.debug = true; // Enable debug logging
    this.wishlistItems = new Set(); // Store wishlist item IDs <-- Initialize this FIRST

    this.initialize(); // Now call initialize, which uses this.wishlistItems
  }

  /**
   * Initialize the wishlist manager with error handling
   */
  return _createClass(WishlistManager, [{
    key: "initialize",
    value: function initialize() {
      var _this = this;
      try {
        // Initialize the wishlist items set from any data available
        this.initializeWishlistItems();
        this.initEventListeners();
        this.checkSweetAlert2Availability();

        // Process any queued toasts once SweetAlert2 is available
        document.addEventListener('swal2-initialized', function () {
          _this.log('SweetAlert2 initialized event received, processing queued toasts');
          _this.processToastQueue();
        });
      } catch (error) {
        console.error('Error initializing Wishlist Manager:', error);
      }
    }

    /**
     * Initialize the wishlist items set from the DOM
     */
  }, {
    key: "initializeWishlistItems",
    value: function initializeWishlistItems() {
      var _this2 = this;
      // Try to get wishlist count from the DOM
      var wishlistCountElements = document.querySelectorAll('.wishlist-count');
      if (wishlistCountElements.length > 0) {
        var count = parseInt(wishlistCountElements[0].textContent, 10);
        this.log('Initial wishlist count:', count);
      }

      // Try to collect wishlist product IDs from data attributes or classes
      document.querySelectorAll('.remove-wishlist-btn, .wishlist-btn.active').forEach(function (btn) {
        var productId = btn.dataset.productId;
        if (productId) {
          _this2.wishlistItems.add(productId);
          _this2.log('Added product to initial wishlist set:', productId);
        }
      });

      // Look for wishlist product IDs in a data attribute on the body or a hidden input
      var wishlistDataElement = document.getElementById('wishlist-data');
      if (wishlistDataElement) {
        try {
          var wishlistData = JSON.parse(wishlistDataElement.value);
          if (Array.isArray(wishlistData)) {
            wishlistData.forEach(function (id) {
              return _this2.wishlistItems.add(id.toString());
            });
            this.log('Initialized wishlist items from data element:', wishlistData);
          }
        } catch (e) {
          console.error('Error parsing wishlist data:', e);
        }
      }
      this.log('Initialized wishlist items:', _toConsumableArray(this.wishlistItems));
    }

    /**
     * Log debug messages if debug mode is enabled
     * @param {...any} args - Arguments to log
     */
  }, {
    key: "log",
    value: function log() {
      if (this.debug) {
        var _console;
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        (_console = console).log.apply(_console, ['[WishlistManager]'].concat(args));
      }
    }

    /**
     * Check if SweetAlert2 is available and log the result
     */
  }, {
    key: "checkSweetAlert2Availability",
    value: function checkSweetAlert2Availability() {
      var _this3 = this;
      if (typeof window.Swal !== 'undefined') {
        this.log('SweetAlert2 is available for WishlistManager.');
        // Dispatch an event to signal SweetAlert2 is available
        document.dispatchEvent(new Event('swal2-initialized'));
      } else {
        console.warn('SweetAlert2 is not available for WishlistManager. Toast notifications will fall back to alerts.');
        // Set up a listener to check again when main.js might have loaded SweetAlert2
        window.addEventListener('load', function () {
          setTimeout(function () {
            if (typeof window.Swal !== 'undefined') {
              _this3.log('SweetAlert2 became available after window load');
              document.dispatchEvent(new Event('swal2-initialized'));
            } else {
              // Try to load SweetAlert2 dynamically as a last resort
              _this3.loadSweetAlert2Dynamically();
            }
          }, 500);
        });
      }
    }

    /**
     * Try to load SweetAlert2 dynamically if it's not available
     */
  }, {
    key: "loadSweetAlert2Dynamically",
    value: function loadSweetAlert2Dynamically() {
      var _this4 = this;
      if (typeof window.Swal === 'undefined') {
        this.log('Attempting to load SweetAlert2 dynamically');
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
        script.onload = function () {
          _this4.log('SweetAlert2 loaded dynamically');
          document.dispatchEvent(new Event('swal2-initialized'));
        };
        script.onerror = function (e) {
          console.error('Failed to load SweetAlert2 dynamically:', e);
        };
        document.head.appendChild(script);
      }
    }

    /**
     * Initialize event listeners for wishlist buttons
     */
  }, {
    key: "initEventListeners",
    value: function initEventListeners() {
      var _this5 = this;
      // Use a single unified selector for all wishlist buttons
      var wishlistBtnSelector = '.wishlist-btn, .add-to-wishlist-btn, .remove-wishlist-btn';

      // Handle existing buttons
      document.querySelectorAll(wishlistBtnSelector).forEach(function (btn) {
        if (!btn.hasAttribute('data-event-bound')) {
          btn.setAttribute('data-event-bound', 'true');
          btn.addEventListener('click', function (e) {
            e.preventDefault();
            _this5.handleWishlistToggle(e);
          });
        }
      });

      // Use delegation for future buttons
      document.addEventListener('click', function (event) {
        var toggleBtn = event.target.closest(wishlistBtnSelector);
        if (toggleBtn && !toggleBtn.hasAttribute('data-event-bound')) {
          // Check if this specific button already has a direct listener to avoid double handling
          if (!toggleBtn.getAttribute('data-event-bound')) {
            toggleBtn.setAttribute('data-event-bound', 'true'); // Mark for delegation handling
            // Add the listener directly here as well, ensures it works even if mutation observer misses it
            toggleBtn.addEventListener('click', function (e) {
              e.preventDefault();
              _this5.handleWishlistToggle(e);
            });
            // Trigger the handler immediately for this click
            _this5.handleWishlistToggle(event);
            event.preventDefault();
          }
        }
      });

      // Add a mutation observer to handle dynamically added buttons
      this.setupMutationObserver();
      this.log('Wishlist event listeners initialized');
    }

    /**
     * Setup mutation observer to watch for dynamically added buttons
     */
  }, {
    key: "setupMutationObserver",
    value: function setupMutationObserver() {
      var _this6 = this;
      var wishlistBtnSelector = '.wishlist-btn:not([data-event-bound]), .add-to-wishlist-btn:not([data-event-bound]), .remove-wishlist-btn:not([data-event-bound])';
      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(function (node) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                // Check if the added node itself is a button
                if (node.matches(wishlistBtnSelector)) {
                  _this6.bindWishlistButtonListener(node);
                }
                // Check for buttons within the added node
                var wishlistBtns = node.querySelectorAll(wishlistBtnSelector);
                wishlistBtns.forEach(function (btn) {
                  _this6.bindWishlistButtonListener(btn);
                });
              }
            });
          }
        });
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      this.log('Mutation observer set up for wishlist buttons.');
    }

    /**
    * Binds the click listener to a wishlist button if not already bound.
    * @param {HTMLElement} btn - The button element.
    */
  }, {
    key: "bindWishlistButtonListener",
    value: function bindWishlistButtonListener(btn) {
      var _this7 = this;
      if (!btn.hasAttribute('data-event-bound')) {
        btn.setAttribute('data-event-bound', 'true');
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          _this7.handleWishlistToggle(e);
        });
        this.log('Bound listener to dynamically added button:', btn);
      }
    }

    /**
     * Handle toggling an item in the wishlist
     * Handle toggling an item in the wishlist.
     * REVISED: Stores original content, restores in finally.
     * @param {Event} event - The click event
     */
  }, {
    key: "handleWishlistToggle",
    value: function handleWishlistToggle(event) {
      var _this8 = this;
      var button = event.currentTarget || event.target.closest('.wishlist-btn, .add-to-wishlist-btn, .remove-wishlist-btn');
      if (!button) {
        this.log('Wishlist toggle handler called but no button found.');
        return;
      }

      // Prevent multiple rapid clicks
      if (button.classList.contains('disabled')) {
        this.log('Button already processing, ignoring click.');
        return;
      }
      var productId = button.dataset.productId;
      if (!productId) {
        console.error("Wishlist button missing data-product-id:", button);
        this.showToast('Error', 'Product ID missing.', 'error');
        return; // Stop if no product ID
      }
      var productName = button.dataset.productName || 'Product';
      var isCurrentlyInWishlist = this.wishlistItems.has(productId);
      this.log("Toggling product ".concat(productId, ": Currently in Wishlist? ").concat(isCurrentlyInWishlist));

      // --- Store original content BEFORE showing spinner ---
      var originalContent = button.innerHTML;
      var originalDisabledState = button.disabled; // Store original disabled state

      // Show spinner and disable
      button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
      button.disabled = true; // Use disabled attribute
      button.classList.add('disabled'); // Keep class for styling

      var url = "/shop/wishlist/toggle/".concat(productId, "/");
      this.log('POSTing to:', url);
      _static_js_api_client_js__WEBPACK_IMPORTED_MODULE_0__["default"].post(url, {
        product_id: productId
      }).then(function (response) {
        // ... (Keep the .then() logic for parsing, determining final state, updating Set, showing toast, removing item) ...
        _this8.log('Raw response:', response);
        var data;
        try {
          if (_typeof(response) === 'object' && response !== null) data = response;else if (typeof response === 'string' && response.trim() !== '') data = JSON.parse(response);else throw new Error('Invalid or empty response');
        } catch (error) {
          console.error('Parse error:', error, 'Raw:', response);
          _this8.showToast('Error', 'Received invalid data.', 'error');
          // Return an object indicating error for finally block
          return {
            finalState: isCurrentlyInWishlist,
            errorOccurred: true
          };
        }
        var finalIsInWishlist = isCurrentlyInWishlist;
        var actionSucceeded = false;
        if (typeof data.success === 'boolean' && data.success) {
          actionSucceeded = true;
          // Determine final state based on server response
          if (data.isInWishlist !== undefined) {
            finalIsInWishlist = data.isInWishlist;
          } else if (data.added !== undefined) {
            finalIsInWishlist = data.added;
          } else if (data.removed !== undefined) {
            finalIsInWishlist = !data.removed;
          } else {
            // Fallback if server doesn't provide state (less ideal)
            finalIsInWishlist = !isCurrentlyInWishlist;
            _this8.log('Warning: Server response did not explicitly state added/removed/isInWishlist status. Inferring state.');
          }
          _this8.log('API Success. Final state:', finalIsInWishlist);
          // Update local set
          if (finalIsInWishlist) _this8.wishlistItems.add(productId);else _this8.wishlistItems["delete"](productId);
          _this8.log('Updated local Set:', _toConsumableArray(_this8.wishlistItems));

          // Show toast
          var actionType = finalIsInWishlist ? 'Added to' : 'Removed from';
          _this8.showToast("".concat(actionType, " Wishlist"), data.message || "".concat(productName, " ").concat(actionType.toLowerCase(), " wishlist."), finalIsInWishlist ? 'success' : 'info');

          // Update global count if provided
          if (data.wishlist_count !== undefined) {
            _this8.updateWishlistCount(data.wishlist_count);
          }

          // Handle removal from wishlist page
          if (!finalIsInWishlist && window.location.pathname.includes('/wishlist/')) {
            _this8.removeItemFromWishlistPage(button);
          }
        } else {
          actionSucceeded = false;
          _this8.log('API Failure:', data.message || data.error || 'Unknown error.');
          _this8.showToast('Error', data.message || data.error || 'Failed to update.', 'error');
        }
        // Return state for finally block
        return {
          finalState: finalIsInWishlist,
          errorOccurred: !actionSucceeded
        };
      })["catch"](function (error) {
        // ... (Keep the .catch() logic for logging, showing error toast) ...
        console.error('API Call Error:', error);
        var errorMessage = 'Update failed. Check connection.';
        if (error && _typeof(error) === 'object') {
          errorMessage = error.message || error.response && error.response.data && (error.response.data.detail || error.response.data.error) || errorMessage;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        _this8.showToast('Error', errorMessage, 'error');
        // Return state for finally block
        return {
          finalState: isCurrentlyInWishlist,
          errorOccurred: true
        };
      })["finally"](function () {
        // Removed the result parameter as it's not reliably passed from catch/then in all scenarios
        // --- RELIABLE SPINNER REMOVAL ---
        // Always get the definitive state from the Set *inside* finally
        var finalState = _this8.wishlistItems.has(productId);
        _this8.log("Finally block. Definitive final state from Set: ".concat(finalState, ". Restoring button ").concat(productId, "."));
        var buttonsToRestore = document.querySelectorAll(".wishlist-btn[data-product-id=\"".concat(productId, "\"], .add-to-wishlist-btn[data-product-id=\"").concat(productId, "\"], .remove-wishlist-btn[data-product-id=\"").concat(productId, "\"]"));
        buttonsToRestore.forEach(function (btn) {
          // 1. Restore original content if it's currently showing ONLY the spinner
          var spinner = btn.querySelector('span.spinner-border');
          if (spinner && btn.children.length === 1 && btn.firstChild === spinner) {
            btn.innerHTML = originalContent;
            _this8.log("Restored original content for button:", btn);
          } else {
            _this8.log("Button content not just spinner, skipping content restore for:", btn);
          }

          // 2. Remove disabled state/class
          btn.disabled = originalDisabledState; // Restore original disabled property
          btn.classList.remove('disabled', 'wishlist-btn-active'); // Remove active class too

          // 3. Update visual state (icon, classes) AFTER restoring content/enabled state
          _this8.updateWishlistButtonVisualState(btn, finalState); // Use definitive finalState from Set
        });

        // Update global count based on final Set size
        _this8.updateWishlistCount(_this8.wishlistItems.size);
        _this8.log("Finished processing toggle for product ".concat(productId, "."));
      });
    }

    /**
     * Update all buttons for a specific product ID to reflect the current wishlist state.
     * @param {string} productId - The product ID.
     * @param {boolean} isInWishlist - The definitive state whether the product IS in the wishlist.
     */
  }, {
    key: "updateAllButtonsForProduct",
    value: function updateAllButtonsForProduct(productId, isInWishlist) {
      var _this9 = this;
      if (!productId) return;
      this.log("Updating all buttons for product ".concat(productId, " to state: ").concat(isInWishlist ? 'IN wishlist' : 'NOT in wishlist'));
      var buttons = document.querySelectorAll(".wishlist-btn[data-product-id=\"".concat(productId, "\"], ") + ".add-to-wishlist-btn[data-product-id=\"".concat(productId, "\"], ") + ".remove-wishlist-btn[data-product-id=\"".concat(productId, "\"]"));
      if (buttons.length === 0) {
        this.log("No buttons found for product ".concat(productId, " to update."));
        return;
      }
      buttons.forEach(function (button) {
        _this9.updateWishlistButtonVisualState(button, isInWishlist);
        // Ensure button is enabled after update (might have been disabled during API call)
        button.classList.remove('disabled', 'wishlist-btn-active');
        // Restore original content if spinner was present (safer check)
        var spinner = button.querySelector('.spinner-border');
        if (spinner) {
          // Need to know what the original content *should* be based on state
          // Assuming simple icon or text change happens in updateWishlistButtonVisualState
          // If original content varies wildly, this needs more complex state management
        }
      });
    }

    /**
     * Updates the visual appearance (classes, icon, title, aria-label, href) of a single wishlist button.
     * SIMPLIFIED: Only sets state based on isInWishlist, does NOT handle spinner removal or content restoration.
     * @param {HTMLElement} button - The button element to update.
     * @param {boolean} isInWishlist - Whether the product IS currently in the wishlist.
     */
  }, {
    key: "updateWishlistButtonVisualState",
    value: function updateWishlistButtonVisualState(button, isInWishlist) {
      if (!button) return;
      var productName = button.dataset.productName || 'this product';
      var productId = button.dataset.productId;
      var icon = button.querySelector('i');

      // --- Update Button Classes ---
      if (isInWishlist) {
        button.classList.remove('add-to-wishlist-btn');
        button.classList.add('remove-wishlist-btn', 'active');
      } else {
        button.classList.remove('remove-wishlist-btn', 'active');
        button.classList.add('add-to-wishlist-btn');
      }

      // --- Update Icon Classes ---
      if (icon) {
        // Ensure correct icon state based on isInWishlist
        if (isInWishlist) {
          // ** CHANGE: Set SOLID heart as the default for "Remove" state **
          icon.classList.remove('far', 'fa-heart-broken', 'fa-heart-o'); // Remove others
          icon.classList.add('fas', 'fa-heart'); // Add SOLID heart
        } else {
          // For "Add" state: Use regular outline heart (FA5 Free)
          icon.classList.remove('fas', 'fa-heart-broken', 'fa-heart', 'fa-heart-o'); // Remove others
          icon.classList.add('far', 'fa-heart'); // Add outline heart
        }
      }

      // --- Update Title and Aria-label ---
      if (isInWishlist) {
        button.setAttribute('title', "Remove ".concat(productName, " from wishlist"));
        button.setAttribute('aria-label', "Remove ".concat(productName, " from wishlist"));
      } else {
        button.setAttribute('title', "Add ".concat(productName, " to wishlist"));
        button.setAttribute('aria-label', "Add ".concat(productName, " to wishlist"));
      }

      // --- Always update href ---
      if (productId) {
        button.setAttribute('href', "/shop/wishlist/toggle/".concat(productId, "/"));
      }

      // --- Mark state as set (for observer/debugging) ---
      button.setAttribute('data-visual-state-set', isInWishlist ? 'in' : 'out');

      // --- DO NOT handle spinner/disabled here - handled in finally block ---
      // --- DO NOT handle innerHTML restoration here - handled in finally block ---
    }

    /**
     * Remove an item visually from the wishlist page after successful removal via API.
     * @param {HTMLElement} button - The 'remove' button that was clicked.
     */
  }, {
    key: "removeItemFromWishlistPage",
    value: function removeItemFromWishlistPage(button) {
      var _this10 = this;
      var card = button.closest('.product-card, .wishlist-item');
      if (!card) {
        this.log('Could not find product card/item to remove from wishlist page.');
        return;
      }

      // Find the most appropriate container to remove (e.g., the grid column or list item)
      var container = card.closest('.col, .wishlist-item-container, li, div.product-entry'); // Add more selectors if needed
      var elementToRemove = container || card; // Fallback to removing the card itself

      this.log('Removing wishlist item element:', elementToRemove);

      // Animate removal
      elementToRemove.style.transition = 'opacity 0.5s ease, transform 0.5s ease, height 0.5s ease, margin 0.5s ease, padding 0.5s ease';
      elementToRemove.style.opacity = '0';
      elementToRemove.style.transform = 'scale(0.8)';
      elementToRemove.style.height = '0'; // Collapse height
      elementToRemove.style.marginTop = '0';
      elementToRemove.style.marginBottom = '0';
      elementToRemove.style.paddingTop = '0';
      elementToRemove.style.paddingBottom = '0';
      elementToRemove.style.borderWidth = '0'; // Collapse border

      setTimeout(function () {
        elementToRemove.remove();
        _this10.log('Wishlist item removed from DOM.');

        // Check if wishlist is now empty
        var remainingItems = document.querySelectorAll('.product-card, .wishlist-item');
        _this10.log('Remaining wishlist items on page:', remainingItems.length);
        if (remainingItems.length === 0) {
          _this10.displayEmptyWishlistMessage();
        } else {
          // Update count just in case it wasn't updated by API response
          _this10.updateWishlistCount(remainingItems.length);
        }
      }, 500); // Match animation duration
    }

    /**
     * Displays a message indicating the wishlist is empty.
     */
  }, {
    key: "displayEmptyWishlistMessage",
    value: function displayEmptyWishlistMessage() {
      this.log('Displaying empty wishlist message.');
      var mainContent = document.querySelector('.container main, .wishlist-container, .content-section, #main-content'); // More robust selector
      if (mainContent) {
        // Clear existing content within the main area *carefully*
        // Avoid wiping out headers/footers if they are inside the selected container
        var wishlistGrid = mainContent.querySelector('.row.wishlist-items, #wishlist-items-container'); // Target specific container if possible
        var containerToEmpty = wishlistGrid || mainContent;
        containerToEmpty.innerHTML = "\n                <div class=\"empty-wishlist alert alert-info text-center my-5 col-12\">\n                    <i class=\"fas fa-heart-broken fa-3x mb-3\"></i>\n                    <h3 class=\"alert-heading\">Your Wishlist is Empty</h3>\n                    <p class=\"lead mb-4\">You haven't added any products yet. Start exploring!</p>\n                    <a href=\"/shop/\" class=\"btn btn-primary btn-lg\">\n                        <i class=\"fas fa-shopping-bag me-2\"></i>Browse Products\n                    </a>\n                </div>\n            ";
        // Ensure count is zero
        this.updateWishlistCount(0);
      } else {
        this.log('Could not find main content area to display empty wishlist message.');
      }
    }

    /**
     * Update the wishlist count in the UI
     * @param {number} count - The new wishlist count
     */
  }, {
    key: "updateWishlistCount",
    value: function updateWishlistCount(count) {
      if (count !== undefined && !isNaN(count)) {
        this.log('Updating wishlist count UI elements to:', count);
        document.querySelectorAll('.wishlist-count').forEach(function (element) {
          element.textContent = count;
          // Optional: Add animation or visual feedback on change
          element.classList.add('animate__animated', 'animate__bounceIn');
          element.onanimationend = function () {
            return element.classList.remove('animate__animated', 'animate__bounceIn');
          };

          // Hide/show container based on count
          var counterContainer = element.closest('.wishlist-count-container') || element; // Use element itself if no specific container
          if (counterContainer) {
            counterContainer.style.display = count === 0 ? 'none' : ''; // Use style.display for better control
          }
        });
      } else {
        this.log('Invalid count received for UI update:', count);
      }
    }

    /**
     * Add a toast to the queue and process it
     * @param {string} title - The notification title
     * @param {string} message - The notification message (can be HTML).
     * @param {string} type - Notification type ('success', 'error', 'warning', 'info', 'question').
     */
  }, {
    key: "showToast",
    value: function showToast(title, message) {
      var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'info';
      this.log('Queueing toast:', {
        title: title,
        message: message,
        type: type
      });
      this.toastQueue.push({
        title: title,
        message: message,
        type: type
      });
      if (!this.processingToast) {
        this.processToastQueue();
      }
    }

    /**
     * Process the next toast notification in the queue.
     */
  }, {
    key: "processToastQueue",
    value: function processToastQueue() {
      var _this11 = this;
      if (this.toastQueue.length === 0) {
        this.processingToast = false;
        this.log('Toast queue empty.');
        return;
      }
      this.processingToast = true;
      var toastToShow = this.toastQueue.shift();
      this.log('Processing toast from queue:', toastToShow);
      this.displayToast(toastToShow.title, toastToShow.message, toastToShow.type)["finally"](function () {
        // Process next toast after a short delay to prevent rapid-fire toasts
        setTimeout(function () {
          _this11.processToastQueue();
        }, 300); // Adjust delay as needed
      });
    }

    /**
     * Display a toast notification using SweetAlert2 or fallback
     * @param {string} title - The notification title
     * @param {string} message - The notification message
     * @param {string} message - The notification message (can be HTML).
     * @param {string} type - Notification type ('success', 'error', 'warning', 'info', 'question').
     * @returns {Promise} Resolves when the toast is displayed or fallback is shown.
     */
  }, {
    key: "displayToast",
    value: function displayToast(title, message, type) {
      var _this12 = this;
      return new Promise(function (resolve) {
        _this12.log('Attempting to display toast:', {
          title: title,
          type: type
        });

        // Use global showToast if specifically defined elsewhere (e.g., in main.js)
        if (typeof window.showToast === 'function' && window.showToast !== _this12.showToast) {
          // Avoid recursion
          _this12.log('Using global window.showToast function.');
          try {
            window.showToast(title, message, type);
          } catch (e) {
            console.error("Error calling global showToast:", e);
            _this12.fallbackToast(title, message); // Fallback if global fails
          }
          resolve(); // Assume global function handles itself
        }
        // Use SweetAlert2 if available
        else if (typeof window.Swal !== 'undefined') {
          _this12.log('Using SweetAlert2 for toast.');
          var iconType = type === 'danger' ? 'error' : type; // Map 'danger' to 'error' if needed

          window.Swal.fire({
            title: title,
            html: message,
            // Allow HTML content
            icon: iconType,
            toast: true,
            position: 'top-end',
            // Common position for toasts
            showConfirmButton: false,
            timer: 3500,
            // Slightly longer timer
            timerProgressBar: true,
            customClass: {
              popup: 'custom-swal-toast' // Add custom class for styling
            },
            showCloseButton: true,
            // Allow users to close manually
            didOpen: function didOpen(toast) {
              toast.style.zIndex = '9999'; // Ensure visibility
              toast.addEventListener('mouseenter', window.Swal.stopTimer);
              toast.addEventListener('mouseleave', window.Swal.resumeTimer);
            }
          }).then(resolve, resolve); // Resolve whether confirmed or timed out
        }
        // Fallback to standard alert
        else {
          _this12.log('SweetAlert2 not available, using fallback alert.');
          _this12.fallbackToast(title, message);
          resolve(); // Resolve after showing alert
        }
      });
    }

    /**
     * Simple fallback alert mechanism.
     */
  }, {
    key: "fallbackToast",
    value: function fallbackToast(title, message) {
      // Basic alert, strip HTML for safety if message might contain it
      var cleanMessage = message.replace(/<[^>]*>/g, ''); // Basic HTML strip
      alert("[".concat(title, "] ").concat(cleanMessage));
    }
  }]);
}(); // --- Initialization ---
// Ensure DOM is ready before initializing
function initializeWishlistManager() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      window.wishlistManager = new WishlistManager();
    });
  } else {
    // DOM is already ready
    window.wishlistManager = new WishlistManager();
  }
}
initializeWishlistManager();

// Export the singleton instance *after* ensuring it's created
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (window.wishlistManager);

/***/ })

}]);
//# sourceMappingURL=shop_static_js_shop_wishlist-initializer_js.js.map