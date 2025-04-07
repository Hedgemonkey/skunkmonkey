"use strict";
(self["webpackChunkskunkmonkey"] = self["webpackChunkskunkmonkey"] || []).push([["products_static_js_utilities_base-manager_js"],{

/***/ "./products/static/js/utilities/base-manager.js":
/*!******************************************************!*\
  !*** ./products/static/js/utilities/base-manager.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BaseManager: () => (/* binding */ BaseManager),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _static_js_ajax_helper_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../static/js/ajax_helper.js */ "./static/js/ajax_helper.js");
/* harmony import */ var sweetalert2__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! sweetalert2 */ "./node_modules/sweetalert2/dist/sweetalert2.all.js");
/* harmony import */ var sweetalert2__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(sweetalert2__WEBPACK_IMPORTED_MODULE_1__);
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * base-manager.js - Base class for item managers
 * 
 * Provides common functionality for different item type managers
 * (products, categories, etc.) to reduce code duplication.
 */



/**
 * BaseManager - Abstract base class for item managers
 */
var BaseManager = /*#__PURE__*/function () {
  /**
   * Create a new BaseManager instance
   * @param {Object} options - Configuration options
   * @param {Object} options.elements - DOM element references
   * @param {Object} options.urls - URL references
   * @param {Object} options.notifications - Notification handlers
   * @param {string} options.itemType - Type of item being managed ('product', 'category', etc.)
   */
  function BaseManager(options) {
    _classCallCheck(this, BaseManager);
    // Prevent direct instantiation of base class
    if ((this instanceof BaseManager ? this.constructor : void 0) === BaseManager) {
      throw new Error('Cannot instantiate BaseManager directly; please use a subclass');
    }
    this.elements = options.elements;
    this.urls = options.urls;
    this.notifications = options.notifications;
    this.itemType = options.itemType || 'item';
    this.filter = null;
  }

  /**
   * Fetch items via AJAX
   * Must be implemented by subclasses
   */
  return _createClass(BaseManager, [{
    key: "fetchItems",
    value: function fetchItems() {
      throw new Error('fetchItems() must be implemented by subclass');
    }

    /**
     * Initialize filters for view
     * Must be implemented by subclasses
     */
  }, {
    key: "initializeFilters",
    value: function initializeFilters() {
      throw new Error('initializeFilters() must be implemented by subclass');
    }

    /**
     * Show item add/edit form
     * @param {string} url - URL to fetch the form
     * @param {boolean} isEdit - Whether this is an edit operation
     * @param {Object} options - Additional options
     */
  }, {
    key: "showForm",
    value: function showForm(url) {
      var _this = this;
      var isEdit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var itemTypeCapitalized = this.capitalizeFirstLetter(this.itemType);
      var formId = isEdit ? "#".concat(this.itemType, "-update-form") : "#".concat(this.itemType, "-form");
      var title = options.title || (isEdit ? "Edit ".concat(itemTypeCapitalized) : "Add New ".concat(itemTypeCapitalized));
      var confirmText = options.confirmText || (isEdit ? 'Save' : "Add ".concat(itemTypeCapitalized));
      var successMessage = options.successMessage || (isEdit ? "".concat(itemTypeCapitalized, " updated successfully.") : "".concat(itemTypeCapitalized, " added successfully."));
      (0,_static_js_ajax_helper_js__WEBPACK_IMPORTED_MODULE_0__.makeAjaxRequest)(url, 'GET', {}, function (response) {
        sweetalert2__WEBPACK_IMPORTED_MODULE_1___default().fire({
          title: title,
          html: isEdit ? response.html : response,
          showCancelButton: true,
          confirmButtonText: confirmText,
          allowOutsideClick: false,
          allowEscapeKey: false,
          preConfirm: function preConfirm() {
            return _this.handleFormSubmit(isEdit, formId);
          }
        }).then(function (result) {
          if (result.isConfirmed) {
            var _result$value;
            _this.fetchItems();
            _this.notifications.displaySuccess(((_result$value = result.value) === null || _result$value === void 0 ? void 0 : _result$value.message) || successMessage);
          }
          if (result.isDismissed && !isEdit) {
            $(formId).remove();
          }
        })["catch"](function (error) {
          console.error('Form submission failed:', error);
          sweetalert2__WEBPACK_IMPORTED_MODULE_1___default().hideLoading();
        });
      }, function (error) {
        _this.notifications.displaySwalError(error, "Failed to ".concat(isEdit ? 'edit' : 'add', " ").concat(_this.itemType, "."));
      });
    }

    /**
     * Handle form submission for add/edit item
     * @param {boolean} isEdit - Whether this is an edit operation
     * @param {string} formSelector - Selector for the form
     * @returns {Promise} - Promise resolving with response data
     */
  }, {
    key: "handleFormSubmit",
    value: function handleFormSubmit(isEdit, formSelector) {
      var _this2 = this;
      sweetalert2__WEBPACK_IMPORTED_MODULE_1___default().showLoading();
      var form = $(formSelector)[0];
      var formData = new FormData(form);
      return (0,_static_js_ajax_helper_js__WEBPACK_IMPORTED_MODULE_0__.makeAjaxRequest)(form.action, 'POST', formData, function (response) {
        if (!response.success) {
          var errorMessage = _this2.formatErrorMessage(response.errors);
          sweetalert2__WEBPACK_IMPORTED_MODULE_1___default().hideLoading();
          sweetalert2__WEBPACK_IMPORTED_MODULE_1___default().showValidationMessage(errorMessage);
          return Promise.reject(response.errors);
        }
        return response;
      }, function (error) {
        console.error("".concat(_this2.capitalizeFirstLetter(_this2.itemType), " form submission error:"), error);
        var errorMessage = "An error occurred while saving the ".concat(_this2.itemType, ".");
        if (error.responseJSON) {
          errorMessage = _this2.formatErrorMessage(error.responseJSON.errors);
        }
        sweetalert2__WEBPACK_IMPORTED_MODULE_1___default().hideLoading();
        sweetalert2__WEBPACK_IMPORTED_MODULE_1___default().showValidationMessage(errorMessage);
        return Promise.reject(error);
      }, false, false);
    }

    /**
     * Format error messages for display
     * @param {Object|string} errors - Error data
     * @returns {string} - Formatted error message
     */
  }, {
    key: "formatErrorMessage",
    value: function formatErrorMessage(errors) {
      if (!errors) return 'Unknown error occurred';
      if (_typeof(errors) === 'object') {
        return Object.entries(errors).map(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
            field = _ref2[0],
            fieldErrors = _ref2[1];
          if (Array.isArray(fieldErrors)) {
            return "".concat(field, ": ").concat(fieldErrors.join(', '));
          }
          return "".concat(field, ": ").concat(fieldErrors);
        }).join('\n');
      }
      return errors;
    }

    /**
     * Show a confirmation dialog
     * @param {Object} options - Configuration for the dialog
     * @returns {Promise} - Promise resolving when confirmed
     */
  }, {
    key: "confirmAction",
    value: function confirmAction(options) {
      var defaults = {
        icon: 'warning',
        showCancelButton: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      };
      return sweetalert2__WEBPACK_IMPORTED_MODULE_1___default().fire(_objectSpread(_objectSpread({}, defaults), options));
    }

    /**
     * Helper to capitalize first letter of a string
     * @param {string} string - String to capitalize
     * @returns {string} - Capitalized string
     */
  }, {
    key: "capitalizeFirstLetter",
    value: function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /**
     * Clean up resources
     * Should be called when manager is no longer needed
     */
  }, {
    key: "destroy",
    value: function destroy() {
      // Clean up filter if it exists
      if (this.filter && typeof this.filter.destroy === 'function') {
        this.filter.destroy();
      }

      // Subclasses should override this to clean up their specific resources
      console.log("Base ".concat(this.itemType, " manager destroyed"));
    }
  }]);
}();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (BaseManager);

/***/ })

}]);
//# sourceMappingURL=products_static_js_utilities_base-manager_js.js.map