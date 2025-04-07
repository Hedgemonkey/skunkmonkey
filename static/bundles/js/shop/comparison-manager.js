/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./shop/static/js/shop/comparison-manager.js":
/*!***************************************************!*\
  !*** ./shop/static/js/shop/comparison-manager.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

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
/******/ 			"js/shop/comparison-manager": 0
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
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["static_js_api-client_js"], () => (__webpack_require__("./shop/static/js/shop/comparison-manager.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=comparison-manager.js.map