/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./products/static/js/category-manager.js":
/*!************************************************!*\
  !*** ./products/static/js/category-manager.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CategoryManager: () => (/* binding */ CategoryManager),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _static_js_api_client_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../static/js/api-client.js */ "./static/js/api-client.js");
/* harmony import */ var _filters_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./filters.js */ "./products/static/js/filters.js");
/* harmony import */ var _utilities_base_manager_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utilities/base-manager.js */ "./products/static/js/utilities/base-manager.js");
/* harmony import */ var sweetalert2__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! sweetalert2 */ "./node_modules/sweetalert2/dist/sweetalert2.all.js");
/* harmony import */ var sweetalert2__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(sweetalert2__WEBPACK_IMPORTED_MODULE_3__);
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
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
/**
 * category-manager.js - Dedicated module for category management
 * 
 * Handles category CRUD operations, filtering, and event handling
 */





/**
 * CategoryManager class for handling category operations
 * Extends BaseManager to leverage common functionality
 */
var CategoryManager = /*#__PURE__*/function (_BaseManager) {
  /**
   * Create a new CategoryManager instance
   * @param {Object} options - Configuration options
   * @param {Object} options.elements - DOM element references
   * @param {Object} options.urls - URL references
   * @param {Object} options.notifications - Notification handlers
   */
  function CategoryManager(options) {
    var _this;
    _classCallCheck(this, CategoryManager);
    _this = _callSuper(this, CategoryManager, [_objectSpread(_objectSpread({}, options), {}, {
      itemType: 'category'
    })]);

    // Store reference to filter
    _this.filter = null;
    return _this;
  }

  /**
   * Fetch category cards via AJAX
   * Implements abstract method from BaseManager
   */
  _inherits(CategoryManager, _BaseManager);
  return _createClass(CategoryManager, [{
    key: "fetchItems",
    value: function fetchItems() {
      var _this2 = this;
      _static_js_api_client_js__WEBPACK_IMPORTED_MODULE_0__["default"].get(this.urls.getCategoryCards, {}, {
        skipGlobalErrorHandler: true
      }).then(function (response) {
        if (response.html) {
          _this2.elements.categoryListContainer.html(response.html);
        } else {
          _this2.elements.categoryListContainer.html(response);
        }
        _this2.initializeFilters();
        _this2.attachCategoryEventListeners();
      })["catch"](function (error) {
        console.error('Error fetching categories:', error);
        _this2.notifications.displayError("Failed to load category cards.");
      });
    }

    /**
     * Delete a category
     * @param {string} categorySlug - Slug of category to delete
     * @returns {Promise} - Promise resolving when delete is complete
     */
  }, {
    key: "delete",
    value: function _delete(categorySlug) {
      var deleteUrl = "".concat(this.urls.categoryBase).concat(categorySlug, "/delete/");
      return _static_js_api_client_js__WEBPACK_IMPORTED_MODULE_0__["default"].post(deleteUrl, {}, {
        skipGlobalErrorHandler: true
      });
    }

    /**
     * Show category add/edit form
     * Override of BaseManager.showForm() with category-specific parameters
     * @param {string} url - URL to fetch the form
     * @param {boolean} isEdit - Whether this is an edit operation
     */
  }, {
    key: "showForm",
    value: function showForm(url) {
      var isEdit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      _superPropGet(CategoryManager, "showForm", this, 3)([url, isEdit, {
        title: isEdit ? 'Edit Category' : 'Add New Category',
        confirmText: isEdit ? 'Save' : 'Add Category',
        successMessage: isEdit ? 'Category updated successfully.' : 'Category added successfully.'
      }]);
    }

    /**
     * Add a new category using the simplified approach or form handling
     * @param {string|null} categoryName - Name of new category (if direct creation)
     * @param {Object} options - Additional options for form display
     */
  }, {
    key: "add",
    value: function add() {
      var _this3 = this;
      var categoryName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      // If a name is provided, use simplified direct creation
      if (categoryName) {
        this.notifications.prompt({
          title: 'Add New Category',
          inputPlaceholder: 'Enter category name',
          inputValue: categoryName,
          preConfirm: function preConfirm(name) {
            return _static_js_api_client_js__WEBPACK_IMPORTED_MODULE_0__["default"].post(_this3.urls.addCategory, {
              name: name
            }, {
              skipGlobalErrorHandler: true
            })["catch"](function (error) {
              _this3.notifications.displaySwalError(error, "Category creation failed.");
              return Promise.reject(error);
            });
          }
        }).then(function (result) {
          if (result.isConfirmed) {
            var _result$value;
            _this3.fetchItems();
            _this3.notifications.displaySuccess(((_result$value = result.value) === null || _result$value === void 0 ? void 0 : _result$value.message) || "Category added successfully.");
          }
        });
      } else {
        // Use standard form handling approach
        this.showForm(this.urls.addCategory, false, options);
      }
    }

    /**
     * Handle category deletion with confirmation
     * @param {Event} event - Click event
     */
  }, {
    key: "handleDelete",
    value: function handleDelete(event) {
      var _this4 = this;
      event.preventDefault();
      var categoryName = $(event.currentTarget).data('category-name');
      var categorySlug = $(event.currentTarget).data('category-slug');
      _static_js_api_client_js__WEBPACK_IMPORTED_MODULE_0__["default"].get("/products/staff/category/".concat(categorySlug, "/products/"), {}, {
        skipGlobalErrorHandler: true
      }).then(function (response) {
        return _this4.confirmCategoryDeletion(response, categorySlug, categoryName);
      })["catch"](function (error) {
        return _this4.notifications.displaySwalError(error, "Failed to get products for category.");
      });
    }

    /**
     * Show confirmation dialog for category deletion
     * @param {Object} response - Response containing products to delete
     * @param {string} categorySlug - Slug of category to delete
     * @param {string} categoryName - Name of category for display
     */
  }, {
    key: "confirmCategoryDeletion",
    value: function confirmCategoryDeletion(response, categorySlug, categoryName) {
      var _this5 = this;
      var productCount = response.products.length;
      var productsToDelete = response.products;
      var productListHTML = productsToDelete.map(function (product) {
        return "".concat(product, "<br>");
      }).join('');
      this.confirmAction({
        title: "Delete ".concat(categoryName, "?"),
        html: "Are you sure you want to delete this category? This action cannot be undone.<br>\n                ".concat(productCount, " product(s) will also be deleted. ").concat(productListHTML ? '<br>' + productListHTML : ''),
        input: 'checkbox',
        inputValue: 0,
        inputPlaceholder: 'I understand the consequences',
        inputValidator: function inputValidator(result) {
          return !result && 'You need to confirm by checking the box.';
        },
        preConfirm: function preConfirm() {
          sweetalert2__WEBPACK_IMPORTED_MODULE_3___default().showLoading();
          return _this5["delete"](categorySlug).then(function (response) {
            _this5.notifications.displaySuccess((response === null || response === void 0 ? void 0 : response.message) || "Deleted ".concat(categoryName));
            _this5.fetchItems();
            return Promise.resolve();
          })["catch"](function (error) {
            var _error$responseJSON;
            sweetalert2__WEBPACK_IMPORTED_MODULE_3___default().hideLoading();
            if ((_error$responseJSON = error.responseJSON) !== null && _error$responseJSON !== void 0 && _error$responseJSON.error) {
              _this5.notifications.displaySwalError(error, error.responseJSON.error);
            } else {
              _this5.notifications.displaySwalError(error, 'Failed to delete category. Please try again.');
            }
            return Promise.reject(error);
          });
        }
      });
    }

    /**
     * Attach event listeners to category elements
     */
  }, {
    key: "attachCategoryEventListeners",
    value: function attachCategoryEventListeners() {
      var _this6 = this;
      // Delete buttons
      $('#category-cards-grid').off('click', '.delete-category').on('click', '.delete-category', function (e) {
        return _this6.handleDelete(e);
      });

      // Edit buttons
      $('#category-cards-grid').off('click', '.edit-category').on('click', '.edit-category', function (e) {
        e.preventDefault();
        _this6.showForm($(e.currentTarget).attr('href'), true);
      });

      // Category headers - connect with the filter's category manager
      $('#category-cards-grid').off('click', '.category-header').on('click', '.category-header', function (e) {
        // Only handle if not clicking on a button or link inside the card
        if (!$(e.target).closest('button, a').length) {
          var categoryId = $(e.currentTarget).data('category-id');
          if (categoryId && _this6.filter && _this6.filter.categoryManager) {
            // Use the filter's category manager to toggle the category
            _this6.filter.categoryManager._toggleCategory(categoryId.toString());
            // Update category styling after toggling
            _this6.filter.categoryManager._updateCategoryCardStyling();
            return false; // Prevent any parent handlers from triggering
          }
        }
      });

      // Add cursor pointer to indicate clickable headers
      $('#category-cards-grid .category-header').css('cursor', 'pointer');
    }

    /**
     * Initialize filters for category view
     * Implements abstract method from BaseManager
     */
  }, {
    key: "initializeFilters",
    value: function initializeFilters() {
      var _this7 = this;
      try {
        console.log("Initializing category filters");

        // Clean up any existing filter instance
        if (this.filter) {
          this.filter.destroy();
        }
        this.filter = new _filters_js__WEBPACK_IMPORTED_MODULE_1__.ItemFilter({
          containerId: 'category-cards-container',
          filterUrl: this.urls.getCategoryCards,
          itemType: 'categories',
          filterOnCategorySelect: true,
          // Changed from false to true to enable dynamic updating
          onUpdate: function onUpdate() {
            // Important: Re-attach category event listeners after filter updates the DOM
            _this7.attachCategoryEventListeners();

            // Ensure category card styling is updated to match selected state
            if (_this7.filter.categoryManager) {
              _this7.filter.categoryManager._updateCategoryCardStyling();
            }
          }
        });
        if (this.filter && typeof this.filter.preloadCategories === 'function') {
          this.filter.preloadCategories();

          // Important: Ensure the category cards are styled correctly initially
          if (this.filter.categoryManager) {
            this.filter.categoryManager._updateCategoryCardStyling();
          }
        }
        console.log("Category filters initialized successfully");
      } catch (error) {
        console.error("Error initializing category filters:", error);
        this.notifications.displayError("Failed to initialize category filters.");
      }
    }

    /**
     * Clean up resources
     * Override of BaseManager.destroy()
     */
  }, {
    key: "destroy",
    value: function destroy() {
      // Clean up event listeners
      $('#category-cards-grid').off('click', '.delete-category');
      $('#category-cards-grid').off('click', '.edit-category');
      $('#category-cards-grid').off('click', '.category-header');

      // Clean up filter if it exists
      if (this.filter) {
        this.filter.destroy();
        this.filter = null;
      }

      // Call base class destroy
      _superPropGet(CategoryManager, "destroy", this, 3)([]);
      console.log("CategoryManager destroyed");
    }
  }]);
}(_utilities_base_manager_js__WEBPACK_IMPORTED_MODULE_2__.BaseManager);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CategoryManager);

/***/ }),

/***/ "./products/static/js/product-manager.js":
/*!***********************************************!*\
  !*** ./products/static/js/product-manager.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ProductManager: () => (/* binding */ ProductManager),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _static_js_ajax_helper_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../static/js/ajax_helper.js */ "./static/js/ajax_helper.js");
/* harmony import */ var _filters_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./filters.js */ "./products/static/js/filters.js");
/* harmony import */ var _utilities_base_manager_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utilities/base-manager.js */ "./products/static/js/utilities/base-manager.js");
/* harmony import */ var sweetalert2__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! sweetalert2 */ "./node_modules/sweetalert2/dist/sweetalert2.all.js");
/* harmony import */ var sweetalert2__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(sweetalert2__WEBPACK_IMPORTED_MODULE_3__);
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
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
/**
 * product-manager.js - Dedicated module for product management
 * 
 * Handles product CRUD operations, filtering, and event handling
 */





/**
 * ProductManager class for handling product operations
 */
var ProductManager = /*#__PURE__*/function (_BaseManager) {
  /**
   * Create a new ProductManager instance
   * @param {Object} options - Configuration options
   * @param {Object} options.elements - DOM element references
   * @param {Object} options.urls - URL references
   * @param {Object} options.notifications - Notification handlers
   */
  function ProductManager(options) {
    _classCallCheck(this, ProductManager);
    return _callSuper(this, ProductManager, [_objectSpread(_objectSpread({}, options), {}, {
      itemType: 'product'
    })]);
  }

  /**
   * Fetch product cards via AJAX
   * Implements abstract method from BaseManager
   */
  _inherits(ProductManager, _BaseManager);
  return _createClass(ProductManager, [{
    key: "fetchItems",
    value: function fetchItems() {
      var _this = this;
      // Get saved categories for filtering
      var savedCategories = localStorage.getItem('selectedCategories');
      var categoryParam = savedCategories ? JSON.parse(savedCategories).join(',') : '';

      // Prepare params with category filter if available
      var params = {};
      if (categoryParam) {
        params.category = categoryParam;
      }
      (0,_static_js_ajax_helper_js__WEBPACK_IMPORTED_MODULE_0__.makeAjaxRequest)(this.urls.getProductCards, 'GET', params, function (response) {
        if (response.html) {
          _this.elements.productListContainer.html(response.html);
        } else {
          _this.elements.productListContainer.html(response);
        }
        _this.attachDeleteListeners();
        _this.initializeFilters();
      }, function (error) {
        console.error('Error fetching products:', error);
        _this.notifications.displayError("Failed to refresh product list.");
      });
    }

    /**
     * Show product add/edit form
     * Override of BaseManager.showForm() with product-specific parameters
     * @param {string} url - URL to fetch the form
     * @param {boolean} isEdit - Whether this is an edit operation
     */
  }, {
    key: "showForm",
    value: function showForm(url) {
      var isEdit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      _superPropGet(ProductManager, "showForm", this, 3)([url, isEdit, {
        title: isEdit ? 'Edit Product' : 'Add New Product',
        confirmText: isEdit ? 'Save' : 'Add Product',
        successMessage: isEdit ? 'Product updated successfully.' : 'Product added successfully.'
      }]);
    }

    /**
     * Delete a product
     * @param {string} productSlug - Slug of product to delete
     * @returns {Promise} - Promise resolving when delete is complete
     */
  }, {
    key: "delete",
    value: function _delete(productSlug) {
      var deleteUrl = "".concat(this.urls.productBase).concat(productSlug, "/delete/");
      try {
        var ajaxPromise = (0,_static_js_ajax_helper_js__WEBPACK_IMPORTED_MODULE_0__.makeAjaxRequest)(deleteUrl, 'POST');
        if (!ajaxPromise || typeof ajaxPromise.then !== 'function') {
          return Promise.reject("Invalid AJAX response");
        }
        return ajaxPromise;
      } catch (error) {
        return Promise.reject(error);
      }
    }

    /**
     * Handle product deletion with confirmation
     * @param {string} productSlug - Slug of product to delete
     * @param {string} productName - Name of product for display
     */
  }, {
    key: "handleDelete",
    value: function handleDelete(productSlug, productName) {
      var _this2 = this;
      this.confirmAction({
        title: "Delete ".concat(productName, "?"),
        text: "Are you sure you want to delete this product? This action cannot be undone.",
        preConfirm: function preConfirm() {
          sweetalert2__WEBPACK_IMPORTED_MODULE_3___default().showLoading();
          return _this2["delete"](productSlug).then(function (response) {
            _this2.notifications.displaySuccess((response === null || response === void 0 ? void 0 : response.message) || "Product deleted successfully.");
            _this2.fetchItems();
            return Promise.resolve();
          })["catch"](function (error) {
            var _error$responseJSON;
            sweetalert2__WEBPACK_IMPORTED_MODULE_3___default().hideLoading();
            if ((_error$responseJSON = error.responseJSON) !== null && _error$responseJSON !== void 0 && _error$responseJSON.error) {
              _this2.notifications.displaySwalError(error, error.responseJSON.error);
            } else {
              _this2.notifications.displaySwalError(error, 'Failed to delete product. Please try again.');
            }
            return Promise.reject(error);
          });
        }
      });
    }

    /**
     * Initialize filters for product view
     * Implements abstract method from BaseManager
     */
  }, {
    key: "initializeFilters",
    value: function initializeFilters() {
      var _this3 = this;
      this.filter = new _filters_js__WEBPACK_IMPORTED_MODULE_1__.ItemFilter({
        containerId: 'product-cards-container',
        filterUrl: this.urls.getProductCards,
        filterOnCategorySelect: true,
        filterOnSearch: true,
        filterOnSort: true,
        filterOnSearchInput: true,
        filterOnSortSelect: true,
        onUpdate: function onUpdate() {
          _this3.attachDeleteListeners();
        }
      });
    }

    /**
     * Attach delete event listeners to products
     */
  }, {
    key: "attachDeleteListeners",
    value: function attachDeleteListeners() {
      var _this4 = this;
      $('.delete-product').off('click').on('click', function (e) {
        e.preventDefault();
        var button = $(e.currentTarget);
        _this4.handleDelete(button.data('product-slug'), button.data('product-name'));
      });
    }

    /**
     * Clean up resources
     * Override of BaseManager.destroy()
     */
  }, {
    key: "destroy",
    value: function destroy() {
      // Clean up event listeners
      $('.delete-product').off('click');

      // Call base class destroy
      _superPropGet(ProductManager, "destroy", this, 3)([]);
      console.log("ProductManager destroyed");
    }
  }]);
}(_utilities_base_manager_js__WEBPACK_IMPORTED_MODULE_2__.BaseManager);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProductManager);

/***/ }),

/***/ "./products/static/products/js/products.js":
/*!*************************************************!*\
  !*** ./products/static/products/js/products.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/src/jquery.js");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var bootstrap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! bootstrap */ "./node_modules/bootstrap/dist/js/bootstrap.esm.js");
/* harmony import */ var _static_js_product_manager_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../static/js/product-manager.js */ "./products/static/js/product-manager.js");
/* harmony import */ var _static_js_category_manager_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../static/js/category-manager.js */ "./products/static/js/category-manager.js");
/* harmony import */ var _static_js_utilities_notifications_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../static/js/utilities/notifications.js */ "./products/static/js/utilities/notifications.js");
/* harmony import */ var _static_js_api_client_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../static/js/api-client.js */ "./static/js/api-client.js");
/**
 * products.js - Main application module
 * 
 * Orchestrates product management functionality using modular components.
 */






jquery__WEBPACK_IMPORTED_MODULE_0___default()(function () {
  // Application initialization
  var app = {
    /**
     * URLs used throughout the application
     */
    urls: {
      addProductForm: jquery__WEBPACK_IMPORTED_MODULE_0___default()('#product-add-button').data('product-add-form-url'),
      addProduct: jquery__WEBPACK_IMPORTED_MODULE_0___default()('#product-add-button').data('product-add-url'),
      productManagement: jquery__WEBPACK_IMPORTED_MODULE_0___default()('#product-add-button').data('product-management-url'),
      getProductCards: jquery__WEBPACK_IMPORTED_MODULE_0___default()('#products-header .accordion-button').data('content-url'),
      getCategoryCards: jquery__WEBPACK_IMPORTED_MODULE_0___default()('#category-cards-container').data('category-cards-url'),
      addCategory: jquery__WEBPACK_IMPORTED_MODULE_0___default()('#category-add-button').data('category-add-url'),
      productBase: '/products/staff/product/',
      categoryBase: '/products/staff/category/'
    },
    /**
     * DOM element references
     */
    elements: {
      addProductButton: jquery__WEBPACK_IMPORTED_MODULE_0___default()('#product-add-button'),
      productListContainer: jquery__WEBPACK_IMPORTED_MODULE_0___default()('#product-cards-container'),
      addCategoryButton: jquery__WEBPACK_IMPORTED_MODULE_0___default()('#category-add-button'),
      categoryList: jquery__WEBPACK_IMPORTED_MODULE_0___default()('#category-list'),
      categoryListContainer: jquery__WEBPACK_IMPORTED_MODULE_0___default()('#category-cards-container'),
      productCardsContainer: jquery__WEBPACK_IMPORTED_MODULE_0___default()('#product-cards-container'),
      managementAccordion: jquery__WEBPACK_IMPORTED_MODULE_0___default()('#management-accordion')
    },
    /**
     * Initialize the application
     */
    init: function init() {
      console.log("Initializing product management application");
      this.initializeManagers();
      this.initializeEventListeners();
      this.initializeAccordion();

      // Load initial content (Products tab is expanded by default)
      this.productManager.fetchItems();
    },
    /**
     * Initialize manager instances with shared configuration
     */
    initializeManagers: function initializeManagers() {
      console.log("Initializing managers with URLs:", this.urls);
      var managerOptions = {
        elements: this.elements,
        urls: this.urls,
        notifications: _static_js_utilities_notifications_js__WEBPACK_IMPORTED_MODULE_4__["default"]
      };
      this.productManager = new _static_js_product_manager_js__WEBPACK_IMPORTED_MODULE_2__.ProductManager(managerOptions);
      this.categoryManager = new _static_js_category_manager_js__WEBPACK_IMPORTED_MODULE_3__.CategoryManager(managerOptions);
    },
    /**
     * Set up global event listeners
     */
    initializeEventListeners: function initializeEventListeners() {
      var _this = this;
      console.log("Setting up event listeners");

      // Global category event handlers
      this.elements.categoryList.on('click', '.delete-category', function (e) {
        return _this.categoryManager.handleDelete(e);
      });

      // Edit category
      jquery__WEBPACK_IMPORTED_MODULE_0___default()(document).on('click', '.edit-category', function (e) {
        e.preventDefault();
        _this.categoryManager.showForm(jquery__WEBPACK_IMPORTED_MODULE_0___default()(e.currentTarget).attr('href'), true);
      });

      // Edit product
      jquery__WEBPACK_IMPORTED_MODULE_0___default()(document).on('click', '.edit-product', function (e) {
        e.preventDefault();
        _this.productManager.showForm(jquery__WEBPACK_IMPORTED_MODULE_0___default()(e.currentTarget).data('url'), true);
      });

      // Add product button - direct binding to ensure it works
      this.elements.addProductButton.on('click', function () {
        console.log("Add Product button clicked");
        _this.handleAddProduct();
      });

      // Add category button - direct binding to ensure it works
      this.elements.addCategoryButton.on('click', function () {
        console.log("Add Category button clicked");
        _this.handleAddCategory();
      });
    },
    /**
     * Handle adding a new product
     */
    handleAddProduct: function handleAddProduct() {
      var _this2 = this;
      console.log("Handling add product with URL:", this.urls.addProductForm);

      // Use API client to fetch the form
      _static_js_api_client_js__WEBPACK_IMPORTED_MODULE_5__["default"].get(this.urls.addProductForm).then(function (response) {
        console.log("Product form fetched, showing modal");
        // Show the form in a SweetAlert modal
        return _static_js_utilities_notifications_js__WEBPACK_IMPORTED_MODULE_4__["default"].confirm({
          title: 'Add New Product',
          html: response.html || response,
          showCancelButton: true,
          confirmButtonText: 'Add Product',
          allowOutsideClick: false,
          allowEscapeKey: false,
          preConfirm: function preConfirm() {
            // Handle form submission when confirmed
            var form = jquery__WEBPACK_IMPORTED_MODULE_0___default()('#product-form')[0];
            var formData = new FormData(form);
            return _static_js_api_client_js__WEBPACK_IMPORTED_MODULE_5__["default"].post(_this2.urls.addProduct, formData, {
              skipGlobalErrorHandler: true
            }).then(function (response) {
              return response;
            })["catch"](function (error) {
              _static_js_utilities_notifications_js__WEBPACK_IMPORTED_MODULE_4__["default"].displaySwalError(error, "Failed to add product");
              return Promise.reject(error);
            });
          }
        });
      }).then(function (result) {
        if (result.isConfirmed) {
          var _result$value;
          console.log("Product added successfully, refreshing list");
          _static_js_utilities_notifications_js__WEBPACK_IMPORTED_MODULE_4__["default"].displaySuccess(((_result$value = result.value) === null || _result$value === void 0 ? void 0 : _result$value.message) || "Product added successfully");
          _this2.productManager.fetchItems();
        }
      })["catch"](function (error) {
        console.error("Error handling add product:", error);
        _static_js_utilities_notifications_js__WEBPACK_IMPORTED_MODULE_4__["default"].displayError("Failed to load product form: " + (error.message || "Unknown error"));
      });
    },
    /**
     * Handle adding a new category
     */
    handleAddCategory: function handleAddCategory() {
      var _this3 = this;
      console.log("Handling add category");

      // Use the prompt function from notifications service
      _static_js_utilities_notifications_js__WEBPACK_IMPORTED_MODULE_4__["default"].prompt({
        title: 'Add New Category',
        inputPlaceholder: 'Enter category name',
        inputValidator: function inputValidator(value) {
          if (!value || value.trim() === '') {
            return 'Please enter a category name';
          }
          return null;
        },
        preConfirm: function preConfirm(categoryName) {
          console.log("Adding category:", categoryName);

          // Use API client to add the category
          return _static_js_api_client_js__WEBPACK_IMPORTED_MODULE_5__["default"].post(_this3.urls.addCategory, {
            name: categoryName
          }, {
            skipGlobalErrorHandler: true
          }).then(function (response) {
            return response;
          })["catch"](function (error) {
            _static_js_utilities_notifications_js__WEBPACK_IMPORTED_MODULE_4__["default"].displaySwalError(error, "Failed to add category");
            return Promise.reject(error);
          });
        }
      }).then(function (result) {
        if (result.isConfirmed) {
          var _result$value2;
          console.log("Category added successfully, refreshing list");
          _static_js_utilities_notifications_js__WEBPACK_IMPORTED_MODULE_4__["default"].displaySuccess(((_result$value2 = result.value) === null || _result$value2 === void 0 ? void 0 : _result$value2.message) || "Category added successfully");
          _this3.categoryManager.fetchItems();
        }
      })["catch"](function (error) {
        console.error("Error handling add category:", error);
      });
    },
    /**
     * Initialize the accordion behavior
     */
    initializeAccordion: function initializeAccordion() {
      var _this4 = this;
      var accordion = this.elements.managementAccordion;

      // Reset previous handlers
      this.resetAccordion(accordion);

      // Custom accordion toggle behavior
      accordion.find('.accordion-button').on('click', function (e) {
        return _this4.handleAccordionToggle(e);
      });
    },
    /**
     * Reset accordion event handlers and data
     */
    resetAccordion: function resetAccordion(accordion) {
      accordion.find('.accordion-button, .accordion-collapse').off();
      accordion.off();
      accordion.find('.accordion-button, .accordion-collapse').removeData('bs.collapse');
      accordion.find('[data-bs-toggle="collapse"]').removeAttr('data-bs-toggle');
    },
    /**
     * Handle accordion section toggle
     */
    handleAccordionToggle: function handleAccordionToggle(e) {
      e.preventDefault();
      e.stopPropagation();
      var button = jquery__WEBPACK_IMPORTED_MODULE_0___default()(e.currentTarget);
      var targetId = button.data('bs-target');
      var target = jquery__WEBPACK_IMPORTED_MODULE_0___default()(targetId);
      var isExpanded = button.attr('aria-expanded') === 'true';

      // Update button state
      button.attr('aria-expanded', !isExpanded);
      if (isExpanded) {
        // Collapse section
        button.addClass('collapsed');
        target.removeClass('show');
      } else {
        // Expand section (collapse others first)
        this.collapseOtherSections(button, targetId);
        button.removeClass('collapsed');
        target.addClass('show');

        // Load content
        var sectionId = targetId.substring(1);
        this.loadSectionContent(sectionId);
      }
    },
    /**
     * Collapse other accordion sections
     */
    collapseOtherSections: function collapseOtherSections(activeButton, activeTargetId) {
      var accordion = this.elements.managementAccordion;
      accordion.find('.accordion-button').not(activeButton).attr('aria-expanded', 'false').addClass('collapsed');
      accordion.find('.accordion-collapse').not(activeTargetId).removeClass('show');
    },
    /**
     * Load content for an accordion section
     */
    loadSectionContent: function loadSectionContent(sectionId) {
      var section = jquery__WEBPACK_IMPORTED_MODULE_0___default()("#".concat(sectionId));
      var contentContainer = section.find('.accordion-body > div');
      var contentId = contentContainer.attr('id');

      // Load appropriate content based on section
      if (contentId === 'product-cards-container') {
        this.productManager.fetchItems();
      } else if (contentId === 'category-cards-container') {
        this.categoryManager.fetchItems();
      }
    }
  };

  // Initialize the application
  app.init();
});

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
/******/ 			"js/products/products": 0
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
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors","static_js_api-client_js","products_static_js_filters_js","products_static_js_utilities_base-manager_js"], () => (__webpack_require__("./products/static/products/js/products.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=products.js.map