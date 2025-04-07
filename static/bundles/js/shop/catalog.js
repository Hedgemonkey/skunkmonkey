/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./shop/static/js/shop/catalog-manager.js":
/*!************************************************!*\
  !*** ./shop/static/js/shop/catalog-manager.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CatalogManager: () => (/* binding */ CatalogManager),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _static_js_api_client_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../static/js/api-client.js */ "./static/js/api-client.js");
/* harmony import */ var _products_static_js_utilities_base_manager_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../products/static/js/utilities/base-manager.js */ "./products/static/js/utilities/base-manager.js");
/* harmony import */ var sweetalert2__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! sweetalert2 */ "./node_modules/sweetalert2/dist/sweetalert2.all.js");
/* harmony import */ var sweetalert2__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(sweetalert2__WEBPACK_IMPORTED_MODULE_2__);
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
/**
 * Catalog Manager - handles product catalog browsing
 * Leverages existing api-client.js for API interactions
 */




/**
 * CatalogManager class for handling shop catalog browsing
 * Extends BaseManager to leverage common functionality
 */
var CatalogManager = /*#__PURE__*/function (_BaseManager) {
  /**
   * Create a new CatalogManager instance
   * @param {Object} options - Configuration options
   */
  function CatalogManager() {
    var _this;
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _classCallCheck(this, CatalogManager);
    // Initialize with default options
    _this = _callSuper(this, CatalogManager, [_objectSpread(_objectSpread({}, options), {}, {
      itemType: 'product',
      notifications: options.notifications || {
        displaySuccess: function displaySuccess(message) {
          sweetalert2__WEBPACK_IMPORTED_MODULE_2___default().fire({
            title: 'Success',
            text: message,
            icon: 'success',
            confirmButtonColor: '#0d6efd'
          });
        },
        displayError: function displayError(message) {
          sweetalert2__WEBPACK_IMPORTED_MODULE_2___default().fire({
            title: 'Error',
            text: message,
            icon: 'error',
            confirmButtonColor: '#0d6efd'
          });
        }
      }
    })]);

    // Additional options specific to CatalogManager
    _this.options = _objectSpread({
      productGridSelector: '#product-grid',
      categoryFilterSelector: '.category-filter',
      searchFormSelector: '#product-search-form',
      sortSelectSelector: '#sort-select',
      paginationSelector: '.pagination'
    }, options);
    _this.initSortingControls();
    _this.initProductCardAnimations();
    return _this;
  }

  /**
   * Fetch catalog items - placeholder implementation
   * Required by BaseManager but handled through page navigation for catalog
   */
  _inherits(CatalogManager, _BaseManager);
  return _createClass(CatalogManager, [{
    key: "fetchItems",
    value: function fetchItems() {
      // Not needed as we use page navigation instead of AJAX loading for catalog
      console.log('Catalog navigation handled through URL changes');
    }

    /**
     * Initialize sorting controls for the catalog view
     * Sets up sort dropdown and retrieves current sort parameter from URL
     */
  }, {
    key: "initSortingControls",
    value: function initSortingControls() {
      var _this2 = this;
      // Sort select change
      var sortSelect = document.querySelector(this.options.sortSelectSelector);
      if (sortSelect) {
        sortSelect.addEventListener('change', function (e) {
          _this2.sortProducts(e.target.value);
        });

        // Set the selected option based on the current URL
        var urlParams = new URLSearchParams(window.location.search);
        var sortParam = urlParams.get('sort');
        if (sortParam) {
          sortSelect.value = sortParam;
        }
      }
    }

    /**
     * Initialize filters - placeholder implementation
     * Required by BaseManager but handled differently for catalog
     */
  }, {
    key: "initializeFilters",
    value: function initializeFilters() {
      // Not needed for catalog as we use URL parameters instead of AJAX filtering
    }

    /**
     * Sort products by changing URL parameters
     * @param {string} sortOption - Sort option value
     */
  }, {
    key: "sortProducts",
    value: function sortProducts(sortOption) {
      var url = new URL(window.location.href);
      url.searchParams.set('sort', sortOption);
      window.location.href = url.toString();
    }

    /**
     * Initialize animations for product cards
     * Uses IntersectionObserver for scroll-based animations with fallback
     */
  }, {
    key: "initProductCardAnimations",
    value: function initProductCardAnimations() {
      var productGrid = document.querySelector(this.options.productGridSelector);
      if (!productGrid) return;
      var productCards = productGrid.querySelectorAll('.product-card');

      // If IntersectionObserver is available, use it for scroll animations
      if ('IntersectionObserver' in window) {
        var appearOptions = {
          threshold: 0.1,
          rootMargin: "0px 0px -100px 0px"
        };
        var appearOnScroll = new IntersectionObserver(function (entries, observer) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('appear');
            observer.unobserve(entry.target);
          });
        }, appearOptions);
        productCards.forEach(function (card) {
          card.classList.add('fade-in');
          appearOnScroll.observe(card);
        });
      } else {
        // Fallback for browsers that don't support IntersectionObserver
        productCards.forEach(function (card) {
          card.classList.add('appear');
        });
      }
    }

    /**
     * Add a product to the wishlist
     * @param {number} productId - The product ID
     * @param {HTMLElement} button - The wishlist button element
     */
  }, {
    key: "addToWishlist",
    value: function addToWishlist(productId, button) {
      var _this3 = this;
      var url = "/shop/wishlist/add/".concat(productId, "/");
      _static_js_api_client_js__WEBPACK_IMPORTED_MODULE_0__["default"].get(url).then(function (response) {
        if (response.success) {
          button.classList.add('added');
          button.innerHTML = '<i class="fas fa-heart"></i>';
          _this3.options.notifications.displaySuccess('Product has been added to your wishlist.');
        }
      })["catch"](function (error) {
        console.error('Error:', error);
        _this3.options.notifications.displayError('There was a problem adding to your wishlist.');
      });
    }
  }]);
}(_products_static_js_utilities_base_manager_js__WEBPACK_IMPORTED_MODULE_1__.BaseManager);

// Initialize catalog manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  window.catalogManager = new CatalogManager();
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CatalogManager);

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
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
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
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
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
/******/ 			"js/shop/catalog": 0
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
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors","static_js_api-client_js","products_static_js_utilities_base-manager_js"], () => (__webpack_require__("./shop/static/js/shop/catalog-manager.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=catalog.js.map