"use strict";
(self["webpackChunkskunkmonkey"] = self["webpackChunkskunkmonkey"] || []).push([["products_static_js_filters_js"],{

/***/ "./products/static/js/filters.js":
/*!***************************************!*\
  !*** ./products/static/js/filters.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ItemFilter: () => (/* binding */ ItemFilter)
/* harmony export */ });
/* harmony import */ var select2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! select2 */ "./node_modules/select2/dist/js/select2.js");
/* harmony import */ var select2__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(select2__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _static_js_api_client_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../static/js/api-client.js */ "./static/js/api-client.js");
/* harmony import */ var _utilities_notifications_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utilities/notifications.js */ "./products/static/js/utilities/notifications.js");
/* harmony import */ var _utilities_form_utils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utilities/form-utils.js */ "./products/static/js/utilities/form-utils.js");
/* harmony import */ var _filters_category_filter_manager_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./filters/category-filter-manager.js */ "./products/static/js/filters/category-filter-manager.js");
/* harmony import */ var _filters_filter_ui_manager_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./filters/filter-ui-manager.js */ "./products/static/js/filters/filter-ui-manager.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * filters.js - Reusable filtering component for product and category management
 * Refactored to use a modular approach with utility modules and ApiClient
 */







/**
 * ItemFilter - Handles item filtering and category selection
 */
var ItemFilter = /*#__PURE__*/function () {
  /**
   * Initialize the filter component
   * @param {Object} options - Configuration options
   * @param {string} options.containerId - ID of the container element
   * @param {string} options.filterUrl - URL to fetch filtered items
   * @param {Function} [options.onUpdate] - Callback after filter update
   * @param {number} [options.searchDelay=300] - Debounce delay for search
   * @param {string} [options.itemType='products'] - Type of items being filtered
   * @param {boolean} [options.filterOnCategorySelect=true] - Whether to filter when categories change
   */
  function ItemFilter(options) {
    _classCallCheck(this, ItemFilter);
    // Core settings
    this.containerId = options.containerId;
    this.filterUrl = options.filterUrl;
    this.onUpdate = options.onUpdate || function () {};
    this.searchDelay = options.searchDelay || 300;
    this.itemType = options.itemType || 'products';
    this.filterOnCategorySelect = options.filterOnCategorySelect !== undefined ? options.filterOnCategorySelect : true;

    // State management
    this.container = $("#".concat(this.containerId));
    this.searchTimeout = null;
    this.pendingRequest = null;
    this.lastFilteredValue = '';

    // Initialize specialized managers
    this.categoryManager = new _filters_category_filter_manager_js__WEBPACK_IMPORTED_MODULE_4__.CategoryFilterManager(this);
    this.uiManager = new _filters_filter_ui_manager_js__WEBPACK_IMPORTED_MODULE_5__.FilterUIManager(this);

    // Initialize components
    this._initialize();
  }

  // -------------------------------------------------------------------------
  // Initialization Methods
  // -------------------------------------------------------------------------

  /**
   * Initialize all components
   * @private
   */
  return _createClass(ItemFilter, [{
    key: "_initialize",
    value: function _initialize() {
      this.categoryManager.initialize();
      this.uiManager.initialize();
      this._initializeEventListeners();

      // Initial filter to load data with applied filters
      // This ensures any pre-selected categories or search terms are applied
      this.filterItems();
    }

    /**
     * Initialize all event listeners
     * @private
     */
  }, {
    key: "_initializeEventListeners",
    value: function _initializeEventListeners() {
      this._setupSearchEvents();
      this._setupSortEvents();
      this._setupResetEvents();
      this._setupListProductsEvent();
    }

    // -------------------------------------------------------------------------
    // Event Handling Methods
    // -------------------------------------------------------------------------

    /**
     * Set up search-related events
     * @private
     */
  }, {
    key: "_setupSearchEvents",
    value: function _setupSearchEvents() {
      var searchSelector = '.filter-search';

      // Use event delegation for better performance
      this.container.on('input', searchSelector, this._handleSearchInput.bind(this));
      this.container.on('click', '.clear-search', this._handleClearSearch.bind(this));
    }

    /**
     * Handle search input events with debounce
     * @private
     * @param {Event} e - The input event
     */
  }, {
    key: "_handleSearchInput",
    value: function _handleSearchInput(e) {
      var _this = this;
      var searchInput = $(e.currentTarget);
      var currentValue = searchInput.val();

      // Only trigger search if value has changed
      if (currentValue !== this.lastFilteredValue) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(function () {
          _this.lastFilteredValue = currentValue;
          _this.filterItems();
        }, this.searchDelay);
      }
    }

    /**
     * Handle clear search button clicks
     * @private
     */
  }, {
    key: "_handleClearSearch",
    value: function _handleClearSearch() {
      this.container.find('.filter-search').val('');
      this.lastFilteredValue = '';
      this.filterItems();
    }

    /**
     * Set up sort-related events
     * @private
     */
  }, {
    key: "_setupSortEvents",
    value: function _setupSortEvents() {
      var _this2 = this;
      this.container.on('change', '.filter-sort', function () {
        _this2.filterItems();
      });
    }

    /**
     * Set up reset-related events
     * @private
     */
  }, {
    key: "_setupResetEvents",
    value: function _setupResetEvents() {
      var _this3 = this;
      this.container.on('click', '.reset-all-filters', function () {
        var clearSearchBtn = _this3.container.find('.clear-search');
        var clearCategoriesBtn = _this3.container.find('.clear-categories-btn');
        if (clearSearchBtn.length) clearSearchBtn.click();
        if (clearCategoriesBtn.length) clearCategoriesBtn.click();
      });
    }

    /**
     * Set up List Products button for category view
     * @private
     */
  }, {
    key: "_setupListProductsEvent",
    value: function _setupListProductsEvent() {
      var _this4 = this;
      this.container.on('click', '.list-products-btn', function () {
        var selectedCategories = _this4.categoryManager.getSelectedCategories();
        if (selectedCategories.length > 0) {
          // Redirect to products view with selected categories
          window.location.href = "/products/staff/management/?category=".concat(selectedCategories.join(','));

          // Ensure the Product accordion is open
          setTimeout(function () {
            $('#product-list-section').addClass('show');
            $('#products-header button').attr('aria-expanded', 'true').removeClass('collapsed');

            // Scroll to the product section
            $('html, body').animate({
              scrollTop: $('#products-header').offset().top - 100
            }, 500);
          }, 300);
        } else {
          _utilities_notifications_js__WEBPACK_IMPORTED_MODULE_2__["default"].displayWarning('Please select at least one category first.');
        }
      });
    }

    // -------------------------------------------------------------------------
    // Filtering Methods
    // -------------------------------------------------------------------------

    /**
     * Filter items based on current filter settings
     */
  }, {
    key: "filterItems",
    value: function filterItems() {
      // Cancel any pending request
      this._cancelPendingRequest();

      // Gather filter parameters
      var requestParams = this._buildRequestParams();

      // Update UI before sending request
      this.uiManager.updateFilterSummary();
      this._showLoading(true);

      // Save search field focus state
      var focusState = this._captureSearchFieldState();

      // Make the request using ApiClient
      this._makeFilterRequest(requestParams, focusState);
    }

    /**
     * Cancel any pending filter request
     * @private
     */
  }, {
    key: "_cancelPendingRequest",
    value: function _cancelPendingRequest() {
      // If there's a pending request reference, abort it
      if (this.pendingRequest) {
        // Try using ApiClient's abort method first
        if (_static_js_api_client_js__WEBPACK_IMPORTED_MODULE_1__["default"].pendingRequests && _static_js_api_client_js__WEBPACK_IMPORTED_MODULE_1__["default"].pendingRequests.includes(this.pendingRequest)) {
          _static_js_api_client_js__WEBPACK_IMPORTED_MODULE_1__["default"].removePendingRequest(this.pendingRequest);
          if (typeof this.pendingRequest.abort === 'function') {
            this.pendingRequest.abort();
          }
        }
        // Fallback to direct abort if needed
        else if (typeof this.pendingRequest.abort === 'function') {
          this.pendingRequest.abort();
        }
        this.pendingRequest = null;
      }
    }

    /**
     * Build request parameters for filtering
     * @private
     * @returns {Object} Request parameters
     */
  }, {
    key: "_buildRequestParams",
    value: function _buildRequestParams() {
      var currentInputValue = this.container.find('.filter-search').val();
      var selectedCategories = this.categoryManager.getSelectedCategories();
      var categoryParam = selectedCategories.join(',');
      var requestParams = {
        search: currentInputValue,
        sort: this.container.find('.filter-sort').val(),
        items_only: true
      };

      // Only include category parameter for product filtering, not for category filtering
      // This way, when on the categories page, we'll show all categories regardless of which ones are selected
      if (categoryParam && this.itemType !== 'categories') {
        requestParams.category = categoryParam;
      }

      // Debug logging to help track what parameters are being sent
      console.log("Building filter params for ".concat(this.itemType, ":"), requestParams);
      return requestParams;
    }

    /**
     * Capture the current state of the search field for restoring later
     * @private
     * @returns {Object} The search field state
     */
  }, {
    key: "_captureSearchFieldState",
    value: function _captureSearchFieldState() {
      var searchField = this.container.find('.filter-search');
      var wasSearchFocused = document.activeElement === searchField[0];
      return {
        field: searchField,
        wasFocused: wasSearchFocused,
        selectionStart: wasSearchFocused ? searchField[0].selectionStart : null,
        selectionEnd: wasSearchFocused ? searchField[0].selectionEnd : null
      };
    }

    /**
     * Make the filter request to the server using ApiClient
     * @private
     * @param {Object} requestParams - The filter parameters
     * @param {Object} focusState - The search field focus state
     */
  }, {
    key: "_makeFilterRequest",
    value: function _makeFilterRequest(requestParams, focusState) {
      var _this5 = this;
      // Use ApiClient.get with Promise handling
      this.pendingRequest = _static_js_api_client_js__WEBPACK_IMPORTED_MODULE_1__["default"].get(this.filterUrl, requestParams, {
        // Skip global error handler as we'll handle errors here
        skipGlobalErrorHandler: true
      }).then(function (response) {
        _this5._handleFilterSuccess(response, focusState);
      })["catch"](function (error) {
        _this5._handleFilterError(error, focusState);
      })["finally"](function () {
        // This will execute regardless of success or failure
        _this5.pendingRequest = null;
      });
    }

    /**
     * Handle successful filter response
     * @private
     * @param {Object|string} response - The server response
     * @param {Object} focusState - The search field focus state
     */
  }, {
    key: "_handleFilterSuccess",
    value: function _handleFilterSuccess(response, focusState) {
      try {
        this._processSuccessfulResponse(response);
      } catch (error) {
        console.error('Error processing filter results:', error);
      } finally {
        this._finishFilterRequest(focusState);
      }
    }

    /**
     * Handle filter request error
     * @private
     * @param {Object} error - The error object
     * @param {Object} focusState - The search field focus state
     */
  }, {
    key: "_handleFilterError",
    value: function _handleFilterError(error, focusState) {
      if (error.statusText !== 'abort') {
        console.error("Error fetching ".concat(this.itemType, ":"), error);
        _utilities_notifications_js__WEBPACK_IMPORTED_MODULE_2__["default"].displayError("Failed to filter ".concat(this.itemType, ". Please try again."));
      }
      this._finishFilterRequest(focusState);
    }

    /**
     * Common cleanup after filter request completes
     * @private
     * @param {Object} focusState - The search field focus state
     */
  }, {
    key: "_finishFilterRequest",
    value: function _finishFilterRequest(focusState) {
      this._showLoading(false);

      // Restore search field focus if it was focused before
      if (focusState.wasFocused) {
        focusState.field.focus();
        if (focusState.selectionStart !== null && focusState.selectionEnd !== null) {
          focusState.field[0].setSelectionRange(focusState.selectionStart, focusState.selectionEnd);
        }
      }
    }

    /**
     * Process a successful API response
     * @private
     * @param {Object|string} response - The server response
     */
  }, {
    key: "_processSuccessfulResponse",
    value: function _processSuccessfulResponse(response) {
      // Find the proper container to update based on the item type
      var itemContainer;
      if (this.itemType === 'categories') {
        // Try to find the category cards grid first
        itemContainer = $('#category-cards-grid');

        // If not found, try to locate it within our container
        if (!itemContainer.length) {
          itemContainer = this.container.find('#category-cards-grid');
        }

        // Fallback to the filtered-items container if it exists
        if (!itemContainer.length) {
          itemContainer = this.container.find('.filtered-items');
        }
      } else {
        // Try to find the product cards grid first
        itemContainer = $('#product-cards-grid');

        // If not found, try to locate it within our container
        if (!itemContainer.length) {
          itemContainer = this.container.find('#product-cards-grid');
        }

        // Fallback to the filtered-items container if it exists
        if (!itemContainer.length) {
          itemContainer = this.container.find('.filtered-items');
        }
      }

      // If we still don't have a container, fall back to the main container
      if (!itemContainer.length) {
        console.warn("Could not find specific container for ".concat(this.itemType, ", using main container"));
        itemContainer = this.container;
      }

      // Update the content with the new HTML
      if (response.html) {
        itemContainer.html(response.html);
        console.log("Updated ".concat(this.itemType, " HTML content from response.html"));
      } else if (typeof response === 'string') {
        itemContainer.html(response);
        console.log("Updated ".concat(this.itemType, " HTML content from string response"));
      } else {
        console.warn("No HTML content found in response for ".concat(this.itemType));
      }

      // Get item count using the most reliable method available
      var itemCount = this._extractItemCount(response, itemContainer);

      // Update count displays
      this.uiManager.updateItemCountDisplays(itemCount);

      // Call the onUpdate callback if provided
      if (typeof this.onUpdate === 'function') {
        this.onUpdate(response);
      }
      console.log("Updated ".concat(this.itemType, " container with new content. Count: ").concat(itemCount));
    }

    /**
     * Extract the item count from the response using multiple fallback strategies
     * @private
     * @param {Object|string} response - The server response
     * @param {jQuery} container - The items container
     * @returns {number} The item count
     */
  }, {
    key: "_extractItemCount",
    value: function _extractItemCount(response, container) {
      // Try API response properties first
      if (response.count !== undefined) {
        return response.count;
      } else if (response.total_count !== undefined) {
        return response.total_count;
      }

      // Fallback to counting DOM elements
      return this._countItemsInContainer(container);
    }

    /**
     * Count items in the container as a fallback
     * @private
     * @param {jQuery} container - The items container
     * @returns {number} The item count
     */
  }, {
    key: "_countItemsInContainer",
    value: function _countItemsInContainer(container) {
      // Try to count items based on common selectors
      var itemSelectors = ['.card', '.item', '.product-card', '.category-card'];
      for (var _i = 0, _itemSelectors = itemSelectors; _i < _itemSelectors.length; _i++) {
        var selector = _itemSelectors[_i];
        var count = container.find(selector).length;
        if (count > 0) return count;
      }
      return 0;
    }

    /**
     * Show or hide loading state
     * @private
     * @param {boolean} show - Whether to show loading state
     */
  }, {
    key: "_showLoading",
    value: function _showLoading(show) {
      (0,_utilities_form_utils_js__WEBPACK_IMPORTED_MODULE_3__.setDisabledState)(this.container, '.filter-sort', show);
      // Don't disable the search field to prevent focus issues
      this.container.find('.filter-loading').toggleClass('loading', show);
    }

    // -------------------------------------------------------------------------
    // Public API Methods
    // -------------------------------------------------------------------------

    /**
     * Public method to apply saved categories (used by CategoryManager)
     */
  }, {
    key: "preloadCategories",
    value: function preloadCategories() {
      this.categoryManager.applySavedCategories();
    }

    /**
     * Clean up resources to prevent memory leaks
     */
  }, {
    key: "destroy",
    value: function destroy() {
      // Clear timeouts
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      // Abort any pending request
      if (this.pendingRequest) {
        this.pendingRequest.abort();
      }

      // Remove event handlers
      this.container.off('input', '.filter-search');
      this.container.off('click', '.clear-search');
      this.container.off('change', '.filter-sort');
      this.container.off('click', '.reset-all-filters');
      this.container.off('click', '.list-products-btn');

      // Destroy managers
      this.categoryManager.destroy();
      this.uiManager.destroy();
    }
  }]);
}();

/***/ }),

/***/ "./products/static/js/filters/category-filter-manager.js":
/*!***************************************************************!*\
  !*** ./products/static/js/filters/category-filter-manager.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CategoryFilterManager: () => (/* binding */ CategoryFilterManager)
/* harmony export */ });
/* harmony import */ var _utilities_form_utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utilities/form-utils.js */ "./products/static/js/utilities/form-utils.js");
/* harmony import */ var _utilities_array_utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utilities/array-utils.js */ "./products/static/js/utilities/array-utils.js");
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
 * category-filter-manager.js - Handles category selection and management for filters
 */



/**
 * CategoryFilterManager - Handles category selection and management
 */
var CategoryFilterManager = /*#__PURE__*/function () {
  function CategoryFilterManager(filterInstance) {
    _classCallCheck(this, CategoryFilterManager);
    this.filter = filterInstance;
    this.container = filterInstance.container;
    this.selectedCategories = this._getSavedCategories() || [];
  }

  /**
   * Initialize category management
   */
  return _createClass(CategoryFilterManager, [{
    key: "initialize",
    value: function initialize() {
      this._initializeSelect2();
      this._setupCategoryEvents();
      this._renderCategoryTags();
      this._updateCategoryCardStyling();

      // Update product count on initialization if categories are already selected
      if (this.selectedCategories.length > 0 && this.filter.itemType === 'categories') {
        this.filter.uiManager._updateProductCount();
      }
    }

    /**
     * Initialize Select2 dropdown for categories
     */
  }, {
    key: "_initializeSelect2",
    value: function _initializeSelect2() {
      var _this = this;
      var selectElement = this.container.find('.filter-category');
      if (!selectElement.length) return;
      (0,_utilities_form_utils_js__WEBPACK_IMPORTED_MODULE_0__.setupSelect2)(selectElement, {
        url: '/products/api/categories/search/',
        formatResult: function formatResult(category) {
          return _this._formatCategoryOption(category);
        },
        multiple: true,
        allowClear: true,
        closeOnSelect: false,
        placeholder: 'Select or search categories'
      });

      // Set up checkbox behavior in dropdown
      this._setupCheckboxHandlers();

      // Handle Select2 dropdown opening to update checkbox states
      selectElement.on('select2:open', function () {
        // Use setTimeout to ensure the dropdown is rendered before we try to update checkboxes
        setTimeout(function () {
          _this._updateDropdownCheckboxes();
        }, 50);
      });
    }

    /**
     * Format category options with checkboxes
     * @param {Object} category - The category data from Select2
     * @returns {jQuery} The formatted dropdown option
     */
  }, {
    key: "_formatCategoryOption",
    value: function _formatCategoryOption(category) {
      if (!category.id) return category.text;

      // Check if the category is in our selected categories
      var isSelected = this.selectedCategories.includes(category.id.toString());
      return $("\n            <div class=\"select2-result-category\">\n                <input type=\"checkbox\" class=\"form-check-input me-2\" id=\"category-".concat(category.id, "\" \n                       ").concat(isSelected ? 'checked' : '', ">\n                <label for=\"category-").concat(category.id, "\">").concat(category.text, "</label>\n            </div>\n        "));
    }

    /**
     * Update checkbox states in the dropdown to match current selections
     * This is called when the dropdown is opened
     */
  }, {
    key: "_updateDropdownCheckboxes",
    value: function _updateDropdownCheckboxes() {
      var _this2 = this;
      // Find all checkboxes in the dropdown
      $('.select2-results__options .select2-result-category input[type="checkbox"]').each(function (_, checkbox) {
        var $checkbox = $(checkbox);
        var categoryId = $checkbox.attr('id').replace('category-', '');

        // Set checked state based on whether the category is in selectedCategories
        var isSelected = _this2.selectedCategories.includes(categoryId);
        $checkbox.prop('checked', isSelected);
      });
    }

    /**
     * Set up handlers for checkbox clicks in dropdown
     */
  }, {
    key: "_setupCheckboxHandlers",
    value: function _setupCheckboxHandlers() {
      var _this3 = this;
      $(document).off('click', '.select2-result-category input[type="checkbox"]').on('click', '.select2-result-category input[type="checkbox"]', function (e) {
        e.stopPropagation();
        var checkbox = $(e.currentTarget);
        var id = checkbox.attr('id').replace('category-', '');
        var selectElement = _this3.container.find('.filter-category');
        var currentSelection = selectElement.val() || [];
        var newSelection = _toConsumableArray(currentSelection);
        if (checkbox.is(':checked') && !newSelection.includes(id)) {
          newSelection.push(id);
        } else if (!checkbox.is(':checked')) {
          newSelection = (0,_utilities_array_utils_js__WEBPACK_IMPORTED_MODULE_1__.removeFromArray)(newSelection, id);
        }
        selectElement.val(newSelection).trigger('change');
      });
    }

    /**
     * Set up category-related events
     */
  }, {
    key: "_setupCategoryEvents",
    value: function _setupCategoryEvents() {
      var _this4 = this;
      var selectElement = this.container.find('.filter-category');
      if (!selectElement.length) return;

      // Handle category selection changes
      selectElement.on('change', function () {
        var newSelection = selectElement.val() || [];
        _this4.selectedCategories = newSelection.map(function (id) {
          return id.toString();
        }); // Ensure string IDs
        _this4._saveCategories(_this4.selectedCategories);
        _this4.container.find('.category-count').text(_this4.selectedCategories.length);
        _this4._renderCategoryTags();

        // Update category card styling to match selection
        _this4._updateCategoryCardStyling();

        // Always update the filter summary when categories change
        _this4.filter.uiManager.updateFilterSummary();

        // Always trigger filtering for product page
        if (_this4.filter.itemType === 'products') {
          _this4.filter.filterItems();
        }
        // For categories page, only filter if the option is enabled
        else if (_this4.filter.filterOnCategorySelect) {
          _this4.filter.filterItems();
        }
      });

      // Clear categories button
      this.container.on('click', '.clear-categories-btn', function () {
        selectElement.val([]).trigger('change');
        _this4._saveCategories([]);
        _this4.container.find('.category-count').text('0');
        _this4._renderCategoryTags();

        // Always update the filter summary
        _this4.filter.uiManager.updateFilterSummary();

        // Always trigger filtering for product page
        if (_this4.filter.itemType === 'products') {
          _this4.filter.filterItems();
        }
        // For categories page, only filter if the option is enabled
        else if (_this4.filter.filterOnCategorySelect) {
          _this4.filter.filterItems();
        }
      });

      // Handle clicks on category cards - use document-level event delegation
      // This ensures the handler works even after cards are refreshed via AJAX
      $(document).off('click', '.category-header').on('click', '.category-header', function (e) {
        // Only handle if not clicking on a button or link inside the card
        if (!$(e.target).closest('button, a').length) {
          var categoryId = $(e.currentTarget).data('category-id');
          if (categoryId) {
            _this4._toggleCategory(categoryId.toString());
            return false; // Prevent any parent handlers from triggering
          }
        }
      });
    }

    /**
     * Toggle a category selection by ID
     */
  }, {
    key: "_toggleCategory",
    value: function _toggleCategory(categoryId) {
      console.log('Toggling category:', categoryId);
      var selectElement = this.container.find('.filter-category');
      if (!selectElement.length) return;
      var currentSelection = selectElement.val() || [];
      var newSelection = _toConsumableArray(currentSelection);
      if (newSelection.includes(categoryId)) {
        newSelection = (0,_utilities_array_utils_js__WEBPACK_IMPORTED_MODULE_1__.removeFromArray)(newSelection, categoryId);
      } else {
        newSelection.push(categoryId);
      }

      // Update the Select2 dropdown
      selectElement.val(newSelection).trigger('change');

      // Force the Select2 control to update its UI
      try {
        selectElement.trigger('change.select2');

        // If the dropdown is open, update checkbox states
        if ($('.select2-results__options').is(':visible')) {
          this._updateDropdownCheckboxes();
        }
      } catch (e) {
        console.warn('Error triggering Select2 change:', e);
      }
    }

    /**
     * Update the styling of category cards based on selection state
     */
  }, {
    key: "_updateCategoryCardStyling",
    value: function _updateCategoryCardStyling() {
      // Reset all cards to unselected state
      $('.category-header').removeClass('bg-primary text-white selected').addClass('bg-light');

      // Apply selected styling to cards that match the current selection
      this.selectedCategories.forEach(function (categoryId) {
        $(".category-header[data-category-id=\"".concat(categoryId, "\"]")).removeClass('bg-light').addClass('bg-primary text-white selected');
      });
    }

    /**
     * Render category tags based on selected categories
     */
  }, {
    key: "_renderCategoryTags",
    value: function _renderCategoryTags() {
      var _this5 = this;
      var tagsContainer = this.container.find('.selected-categories-tags');
      if (!tagsContainer.length) return;
      tagsContainer.empty();
      if (!this.selectedCategories.length) {
        tagsContainer.hide();
        return;
      }

      // Get category names from select options
      var selectElement = this.container.find('.filter-category');
      var selectedOptions = Array.from(selectElement.find('option:selected'));
      selectedOptions.forEach(function (option) {
        var categoryId = $(option).val();
        var categoryName = $(option).text();
        var tag = $("\n                <span class=\"badge bg-primary me-1 mb-1 category-tag\" data-category-id=\"".concat(categoryId, "\">\n                    ").concat(categoryName, "\n                    <button type=\"button\" class=\"btn-close btn-close-white ms-1\" aria-label=\"Remove\"></button>\n                </span>\n            "));
        tag.find('.btn-close').on('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          _this5.removeCategory(categoryId);
        });
        tagsContainer.append(tag);
      });
      tagsContainer.show();
    }

    /**
     * Remove a specific category by ID
     */
  }, {
    key: "removeCategory",
    value: function removeCategory(categoryId) {
      var selectElement = this.container.find('.filter-category');
      var currentSelection = selectElement.val() || [];
      var newSelection = (0,_utilities_array_utils_js__WEBPACK_IMPORTED_MODULE_1__.removeFromArray)(currentSelection, categoryId);
      selectElement.val(newSelection).trigger('change');
    }

    /**
     * Save selected categories to localStorage
     */
  }, {
    key: "_saveCategories",
    value: function _saveCategories(categories) {
      var normalizedCategories = categories.map(function (id) {
        return id.toString();
      });
      this.selectedCategories = normalizedCategories;
      localStorage.setItem('selectedCategories', JSON.stringify(normalizedCategories));
    }

    /**
     * Get saved categories from localStorage
     */
  }, {
    key: "_getSavedCategories",
    value: function _getSavedCategories() {
      var savedCategories = localStorage.getItem('selectedCategories');
      return savedCategories ? JSON.parse(savedCategories) : [];
    }

    /**
     * Apply saved categories to the UI
     */
  }, {
    key: "applySavedCategories",
    value: function applySavedCategories() {
      var savedCategories = this._getSavedCategories();
      if (!savedCategories || savedCategories.length === 0) return;
      var selectElement = this.container.find('.filter-category');
      selectElement.val(savedCategories);
      try {
        selectElement.trigger('change.select2');

        // If the dropdown is open, update checkbox states
        if ($('.select2-results__options').is(':visible')) {
          this._updateDropdownCheckboxes();
        }
      } catch (e) {
        console.warn('Error triggering Select2 change:', e);
        selectElement.trigger('change');
      }
      this.container.find('.category-count').text(savedCategories.length);
      this._renderCategoryTags();

      // Update product count on initialization if categories are loaded from localStorage
      if (savedCategories.length > 0 && this.filter.itemType === 'categories') {
        this.filter.uiManager._updateProductCount();
      }

      // If we're on the products page, filter items based on the loaded categories
      if (this.filter.itemType === 'products' && savedCategories.length > 0) {
        this.filter.filterItems();
      }
    }

    /**
     * Get the currently selected categories
     */
  }, {
    key: "getSelectedCategories",
    value: function getSelectedCategories() {
      return this.selectedCategories;
    }

    /**
     * Clean up resources
     */
  }, {
    key: "destroy",
    value: function destroy() {
      var selectElement = this.container.find('.filter-category');

      // Remove event handlers
      this.container.off('click', '.clear-categories-btn');
      selectElement.off('change');
      selectElement.off('select2:open');

      // Remove category card click handler
      $(document).off('click', '.category-header');

      // Clean up Select2
      if (selectElement.length && $.fn.select2) {
        try {
          selectElement.select2('destroy');
        } catch (e) {
          console.warn('Error destroying Select2:', e);
        }
      }

      // Clean up document event handlers
      $(document).off('click', '.select2-result-category input[type="checkbox"]');

      // Clean up category tags
      this.container.find('.selected-categories-tags .btn-close').off('click');
    }
  }]);
}();

/***/ }),

/***/ "./products/static/js/filters/filter-ui-manager.js":
/*!*********************************************************!*\
  !*** ./products/static/js/filters/filter-ui-manager.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FilterUIManager: () => (/* binding */ FilterUIManager)
/* harmony export */ });
/* harmony import */ var _utilities_form_utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utilities/form-utils.js */ "./products/static/js/utilities/form-utils.js");
/* harmony import */ var _static_js_api_client_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../static/js/api-client.js */ "./static/js/api-client.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * filter-ui-manager.js - Handles filter UI interactions and updates
 */



/**
 * FilterUIManager - Handles filter UI interactions and updates
 */
var FilterUIManager = /*#__PURE__*/function () {
  function FilterUIManager(filterInstance) {
    _classCallCheck(this, FilterUIManager);
    this.filter = filterInstance;
    this.container = filterInstance.container;
    this.itemType = filterInstance.itemType;
    this.productCountElement = this.container.find('.product-count');
  }

  /**
   * Initialize UI management
   */
  return _createClass(FilterUIManager, [{
    key: "initialize",
    value: function initialize() {
      this._setupToggleEvents();
      this._setupListProductsVisibility();

      // Get initial count from server instead of hardcoding to 0
      this._loadInitialItemCount();

      // Add the product count element to the filter summary if it doesn't exist
      if (this.itemType === 'categories' && !this.productCountElement.length) {
        var filterSummary = this.container.find('#filterSummary .results-count');
        if (filterSummary.length) {
          filterSummary.append('<span class="ms-2 text-muted product-count-display d-none">| <span class="product-count">0</span> products</span>');
          this.productCountElement = this.container.find('.product-count');
        }
      }
    }

    /**
     * Load the initial item count from the server
     * @private
     */
  }, {
    key: "_loadInitialItemCount",
    value: function _loadInitialItemCount() {
      var _this = this;
      // Create a simple request to get the count
      var requestParams = {
        items_only: true,
        count_only: true // Optional param - server can optimize if it supports this
      };

      // Use the same URL as the filter component
      _static_js_api_client_js__WEBPACK_IMPORTED_MODULE_1__["default"].get(this.filter.filterUrl, requestParams, {
        skipGlobalErrorHandler: true
      }).then(function (response) {
        // Extract count from response
        var count = 0;
        if (response.count !== undefined) {
          count = response.count;
        } else if (response.total_count !== undefined) {
          count = response.total_count;
        } else if (typeof response === 'string' && $(response).find('.card').length > 0) {
          // If HTML response, try to count cards
          count = $(response).find('.card').length;
        }

        // Update all count displays with the initial count
        _this.updateItemCountDisplays(count);
      })["catch"](function (error) {
        console.warn('Error loading initial item count:', error);
        // If error, initialize to 0 as fallback
        _this.updateItemCountDisplays(0);
      });
    }

    /**
     * Set up filter toggle events
     */
  }, {
    key: "_setupToggleEvents",
    value: function _setupToggleEvents() {
      var _this2 = this;
      var filterToggle = this.container.find('.filter-toggle');
      var filterOptions = this.container.find('#filterOptions');
      if (!filterToggle.length || !filterOptions.length) return;
      filterToggle.on('click', function (e) {
        e.preventDefault();
        (0,_utilities_form_utils_js__WEBPACK_IMPORTED_MODULE_0__.toggleElement)(filterOptions, {
          onShow: function onShow() {
            filterToggle.addClass('active');
            filterToggle.find('.filter-toggle-text').text('Hide Filters');
            filterToggle.find('i').removeClass('fa-sliders-h').addClass('fa-times');
            filterToggle.removeClass('btn-outline-primary').addClass('btn-primary');
            filterToggle.attr('aria-expanded', 'true');
            _this2.container.find('.filter-summary-category-tags').hide();

            // Hide the collapsed version of the List Products button
            if (_this2.itemType === 'categories') {
              _this2.container.find('.collapsed-list-products-btn-container').addClass('d-none');
            }
          },
          onHide: function onHide() {
            filterToggle.removeClass('active');
            filterToggle.find('.filter-toggle-text').text('Show Filters');
            filterToggle.find('i').addClass('fa-sliders-h').removeClass('fa-times');
            filterToggle.removeClass('btn-primary').addClass('btn-outline-primary');
            filterToggle.attr('aria-expanded', 'false');
            _this2.container.find('.filter-summary-category-tags').show();

            // Show the collapsed version of the List Products button if we have selected categories
            if (_this2.itemType === 'categories') {
              var hasSelectedCategories = _this2.filter.categoryManager.getSelectedCategories().length > 0;
              _this2.container.find('.collapsed-list-products-btn-container').toggleClass('d-none', !hasSelectedCategories);
            }
          }
        });
      });

      // Set up filter summary badge close handlers
      this.container.find('#filterSummary .search-summary .btn-close').on('click', function (e) {
        e.stopPropagation();
        _this2.container.find('.clear-search').click();
      });
      this.container.find('#filterSummary .categories-summary .btn-close').on('click', function (e) {
        e.stopPropagation();
        _this2.container.find('.clear-categories-btn').click();
      });
    }

    /**
     * Setup the List Products button visibility when filters are collapsed
     */
  }, {
    key: "_setupListProductsVisibility",
    value: function _setupListProductsVisibility() {
      if (this.itemType !== 'categories') return;

      // Make sure the List Products button click events are synchronized
      var collapsedBtn = this.container.find('.collapsed-list-products-btn-container .list-products-btn');
      var expandedBtn = this.container.find('#expanded-list-products-btn');

      // Remove previous click handlers to avoid duplicates
      collapsedBtn.off('click');

      // When the collapsed button is clicked, trigger the expanded button's click handler
      collapsedBtn.on('click', function () {
        expandedBtn.click();
      });

      // Initial visibility state based on selected categories
      var hasSelectedCategories = this.filter.categoryManager.getSelectedCategories().length > 0;
      var isFiltersExpanded = this.container.find('#filterOptions').hasClass('show');
      this.container.find('.collapsed-list-products-btn-container').toggleClass('d-none', isFiltersExpanded || !hasSelectedCategories);
    }

    /**
     * Update all item count displays with the current count
     */
  }, {
    key: "updateItemCountDisplays",
    value: function updateItemCountDisplays(count) {
      // Update the main item count in the filter summary
      this.container.find('.item-count').text(count);

      // Update any other count displays that might exist
      var searchSummary = this.container.find('.search-summary .badge');
      if (searchSummary.length) {
        searchSummary.text("".concat(count, " ").concat(this.itemType));
      }

      // Update the results count display
      this.container.find('.results-count .item-count').text(count);

      // Update product count if we're in categories view
      if (this.itemType === 'categories') {
        this._updateProductCount();
      }
    }

    /**
     * Update the product count display by fetching the count from the server
     */
  }, {
    key: "_updateProductCount",
    value: function _updateProductCount() {
      var _this3 = this;
      var selectedCategories = this.filter.categoryManager.getSelectedCategories();
      if (!selectedCategories.length) {
        // Hide product count if no categories are selected
        this.container.find('.selected-stats').addClass('d-none');
        return;
      }

      // Fetch the product count from the server
      _static_js_api_client_js__WEBPACK_IMPORTED_MODULE_1__["default"].get('/products/api/products/count/', {
        category: selectedCategories.join(',')
      }, {
        skipGlobalErrorHandler: true
      }).then(function (response) {
        if (response.product_count !== undefined) {
          // Update the product count display
          _this3.container.find('.product-count').text(response.product_count);
          _this3.container.find('.selected-count').text(selectedCategories.length);
          _this3.container.find('.selected-stats').removeClass('d-none');
        }
      })["catch"](function (error) {
        console.warn('Error fetching product count:', error);
        _this3.container.find('.selected-stats').addClass('d-none');
      });
    }

    /**
     * Update the filter summary display
     */
  }, {
    key: "updateFilterSummary",
    value: function updateFilterSummary() {
      var searchValue = this.container.find('.filter-search').val();
      var categorySelection = this.filter.categoryManager.getSelectedCategories();
      var filterSummary = this.container.find('#filterSummary');
      if (!filterSummary.length) return;

      // Update search summary
      var searchSummary = filterSummary.find('.search-summary');
      if (searchValue) {
        searchSummary.removeClass('d-none');
        searchSummary.find('.search-term-summary').text(searchValue);
      } else {
        searchSummary.addClass('d-none');
      }

      // Update categories summary
      var categoriesSummary = filterSummary.find('.categories-summary');
      if (categorySelection.length > 0) {
        categoriesSummary.removeClass('d-none');
        categoriesSummary.find('.category-count-summary').text(categorySelection.length);
      } else {
        categoriesSummary.addClass('d-none');
      }

      // Update the active filters display in expanded view
      var activeFiltersDisplay = this.container.find('.active-filters .active-filter-display');
      if (activeFiltersDisplay.length) {
        var searchDisplay = activeFiltersDisplay.find('.search-display');
        var categoriesDisplay = activeFiltersDisplay.find('.categories-display');
        if (searchValue) {
          searchDisplay.removeClass('d-none');
          searchDisplay.find('.search-term').text(searchValue);
        } else {
          searchDisplay.addClass('d-none');
        }
        if (categorySelection.length > 0) {
          categoriesDisplay.removeClass('d-none');
          categoriesDisplay.find('.category-count-display').text(categorySelection.length);
        } else {
          categoriesDisplay.addClass('d-none');
        }
      }

      // Show/hide the summary
      if (searchValue || categorySelection.length > 0) {
        filterSummary.addClass('d-flex').removeClass('d-none');
      } else if (!this.container.find('#filterOptions').hasClass('show')) {
        filterSummary.removeClass('d-flex').addClass('d-none');
      }

      // Update the List Products button visibility
      if (this.itemType === 'categories') {
        var isFiltersExpanded = this.container.find('#filterOptions').hasClass('show');
        var hasSelectedCategories = categorySelection.length > 0;
        this.container.find('.collapsed-list-products-btn-container').toggleClass('d-none', isFiltersExpanded || !hasSelectedCategories);

        // Also update the product count when filter summary changes
        if (hasSelectedCategories) {
          this._updateProductCount();
        } else {
          this.container.find('.selected-stats').addClass('d-none');
        }
      }
    }

    /**
     * Clean up resources
     */
  }, {
    key: "destroy",
    value: function destroy() {
      var filterToggle = this.container.find('.filter-toggle');

      // Remove event handlers
      if (filterToggle.length) {
        filterToggle.off('click');
      }
      this.container.find('#filterSummary .search-summary .btn-close').off('click');
      this.container.find('#filterSummary .categories-summary .btn-close').off('click');

      // Remove List Products button event handlers
      if (this.itemType === 'categories') {
        this.container.find('.collapsed-list-products-btn-container .list-products-btn').off('click');
      }
    }
  }]);
}();

/***/ }),

/***/ "./products/static/js/utilities/array-utils.js":
/*!*****************************************************!*\
  !*** ./products/static/js/utilities/array-utils.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addToArray: () => (/* binding */ addToArray),
/* harmony export */   arrayContains: () => (/* binding */ arrayContains),
/* harmony export */   arraysEqual: () => (/* binding */ arraysEqual),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   groupBy: () => (/* binding */ groupBy),
/* harmony export */   includesValue: () => (/* binding */ includesValue),
/* harmony export */   removeFromArray: () => (/* binding */ removeFromArray),
/* harmony export */   toggleInArray: () => (/* binding */ toggleInArray),
/* harmony export */   uniqueValues: () => (/* binding */ uniqueValues)
/* harmony export */ });
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
/**
 * array-utils.js - Utility functions for array operations
 * 
 * Provides common array manipulation and comparison functions
 */

/**
 * Compare two arrays for equality, regardless of element order
 * @param {Array} a - First array to compare
 * @param {Array} b - Second array to compare
 * @returns {boolean} - Whether the arrays contain the same elements
 */
function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  // Normalize and sort arrays for consistent comparison
  var normalizedA = _toConsumableArray(a).map(function (item) {
    return item === null || item === void 0 ? void 0 : item.toString();
  }).sort();
  var normalizedB = _toConsumableArray(b).map(function (item) {
    return item === null || item === void 0 ? void 0 : item.toString();
  }).sort();

  // Use JSON.stringify for deep comparison
  return JSON.stringify(normalizedA) === JSON.stringify(normalizedB);
}

/**
 * Check if an array contains a specific value
 * Handles type conversion for more consistent results
 * @param {Array} array - The array to check
 * @param {*} value - The value to look for
 * @returns {boolean} - Whether the value exists in the array
 */
function arrayContains(array, value) {
  if (!array || !Array.isArray(array)) return false;
  var valueStr = value === null || value === void 0 ? void 0 : value.toString();
  return array.some(function (item) {
    return (item === null || item === void 0 ? void 0 : item.toString()) === valueStr;
  });
}

/**
 * Safely add an item to an array without duplicates
 * @param {Array} array - The array to modify
 * @param {*} item - The item to add
 * @returns {Array} - The updated array
 */
function addToArray(array, item) {
  if (!array) array = [];
  if (!arrayContains(array, item)) {
    array.push(item);
  }
  return array;
}

/**
 * Remove an item from an array
 * @param {Array} array - The array to modify
 * @param {*} item - The item to remove
 * @returns {Array} - The updated array
 */
function removeFromArray(array, item) {
  if (!array || !Array.isArray(array)) return [];
  var valueStr = item === null || item === void 0 ? void 0 : item.toString();
  return array.filter(function (arrItem) {
    return (arrItem === null || arrItem === void 0 ? void 0 : arrItem.toString()) !== valueStr;
  });
}

/**
 * Toggle an item in an array (add if not present, remove if present)
 * @param {Array} array - The array to modify
 * @param {*} item - The item to toggle
 * @returns {Array} - The updated array with the item toggled
 */
function toggleInArray(array, item) {
  if (!array || !Array.isArray(array)) array = [];
  return arrayContains(array, item) ? removeFromArray(array, item) : addToArray(array, item);
}

/**
 * Check if an array includes a value (alias for arrayContains)
 * @param {Array} array - The array to check
 * @param {*} value - The value to find
 * @returns {boolean} True if the array includes the value
 */
function includesValue(array, value) {
  return arrayContains(array, value);
}

/**
 * Get unique values from an array
 * @param {Array} array - The array to process
 * @returns {Array} Array with duplicate values removed
 */
function uniqueValues(array) {
  if (!array || !Array.isArray(array)) return [];
  return _toConsumableArray(new Set(array));
}

/**
 * Group array items by a property
 * @param {Array} array - Array of objects
 * @param {string} property - Property to group by
 * @returns {Object} Grouped items
 */
function groupBy(array, property) {
  if (!array || !Array.isArray(array)) return {};
  return array.reduce(function (result, item) {
    var key = item[property];
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {});
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  arraysEqual: arraysEqual,
  arrayContains: arrayContains,
  addToArray: addToArray,
  removeFromArray: removeFromArray,
  toggleInArray: toggleInArray,
  includesValue: includesValue,
  uniqueValues: uniqueValues,
  groupBy: groupBy
});

/***/ }),

/***/ "./products/static/js/utilities/form-utils.js":
/*!****************************************************!*\
  !*** ./products/static/js/utilities/form-utils.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   resetForm: () => (/* binding */ resetForm),
/* harmony export */   setDisabledState: () => (/* binding */ setDisabledState),
/* harmony export */   setupSelect2: () => (/* binding */ setupSelect2),
/* harmony export */   toggleElement: () => (/* binding */ toggleElement)
/* harmony export */ });
/**
 * form-utils.js - Common form-related utilities
 */

/**
 * Set up a Select2 dropdown
 * @param {jQuery} element - The select element
 * @param {Object} options - Configuration options
 */
function setupSelect2(element, options) {
  if (!element.length) return;
  var config = {
    theme: 'bootstrap-5',
    width: '100%',
    multiple: options.multiple || false,
    allowClear: options.allowClear || false,
    closeOnSelect: options.closeOnSelect || true,
    placeholder: options.placeholder || 'Select an option',
    minimumInputLength: options.minimumInputLength || 0,
    minimumResultsForSearch: options.minimumResultsForSearch || 0,
    templateResult: options.formatResult || null,
    templateSelection: options.formatSelection || function (data) {
      return data.text;
    }
  };

  // Add AJAX configuration if URL is provided
  if (options.url) {
    config.ajax = {
      delay: 250,
      url: options.url,
      data: function data(params) {
        return {
          search: params.term || '',
          page: params.page || 1
        };
      },
      processResults: function processResults(data) {
        return {
          results: data.categories.map(function (item) {
            return {
              id: item.id,
              text: item.name,
              selected: false
            };
          }),
          pagination: {
            more: data.has_more
          }
        };
      },
      cache: true
    };
  }
  element.select2(config);
}

/**
 * Toggle an element's visibility with smooth transition
 * @param {jQuery} element - The element to toggle
 * @param {Object} callbacks - Optional callback functions
 */
function toggleElement(element) {
  var callbacks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var isExpanded = element.hasClass('show');
  var newState = !isExpanded;
  if (newState) {
    element.addClass('show');
    if (callbacks.onShow) callbacks.onShow();
  } else {
    element.removeClass('show');
    if (callbacks.onHide) callbacks.onHide();
  }
}

/**
 * Set disabled state for a group of elements
 * @param {jQuery} container - Container element
 * @param {string} selector - Selector for elements to disable/enable
 * @param {boolean} disabled - Whether to disable or enable the elements
 */
function setDisabledState(container, selector, disabled) {
  container.find(selector).prop('disabled', disabled);
}

/**
 * Reset a form to its initial state
 * @param {jQuery} form - The form element
 */
function resetForm(form) {
  form[0].reset();

  // Reset Select2 dropdowns
  form.find('select').each(function () {
    if ($(this).hasClass('select2-hidden-accessible')) {
      $(this).val(null).trigger('change');
    }
  });
}

/***/ }),

/***/ "./products/static/js/utilities/notifications.js":
/*!*******************************************************!*\
  !*** ./products/static/js/utilities/notifications.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NotificationService: () => (/* binding */ NotificationService),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var sweetalert2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! sweetalert2 */ "./node_modules/sweetalert2/dist/sweetalert2.all.js");
/* harmony import */ var sweetalert2__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(sweetalert2__WEBPACK_IMPORTED_MODULE_0__);
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
 * notifications.js - Reusable notification utilities
 * 
 * Provides standardized message displays using SweetAlert2
 */


/**
 * NotificationService class for handling user notifications
 */
var NotificationService = /*#__PURE__*/function () {
  function NotificationService() {
    _classCallCheck(this, NotificationService);
  }
  return _createClass(NotificationService, [{
    key: "displaySuccess",
    value:
    /**
     * Display a success message
     * @param {string} message - Success message to display
     * @param {Object} options - Additional options
     */
    function displaySuccess(message) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var defaults = {
        icon: 'success',
        title: message,
        showConfirmButton: true,
        timer: 2000,
        timerProgressBar: true
      };
      sweetalert2__WEBPACK_IMPORTED_MODULE_0___default().fire(_objectSpread(_objectSpread({}, defaults), options));
    }

    /**
     * Display an error message
     * @param {string} message - Error message to display
     * @param {Object} options - Additional options
     */
  }, {
    key: "displayError",
    value: function displayError(message) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var defaults = {
        icon: 'error',
        title: 'Error',
        text: message,
        showConfirmButton: true
      };
      sweetalert2__WEBPACK_IMPORTED_MODULE_0___default().fire(_objectSpread(_objectSpread({}, defaults), options));
    }

    /**
     * Display validation error in SweetAlert context
     * @param {Object} error - Error object
     * @param {string} defaultMessage - Default message if error details not available
     * @returns {Promise} - Rejected promise for promise chain
     */
  }, {
    key: "displaySwalError",
    value: function displaySwalError(error, defaultMessage) {
      var _error$responseJSON;
      sweetalert2__WEBPACK_IMPORTED_MODULE_0___default().showValidationMessage(((_error$responseJSON = error.responseJSON) === null || _error$responseJSON === void 0 ? void 0 : _error$responseJSON.error) || defaultMessage);
      return Promise.reject();
    }

    /**
     * Display a confirmation dialog
     * @param {Object} options - Configuration options
     * @returns {Promise} - Promise resolving with user's choice
     */
  }, {
    key: "confirm",
    value: function confirm(options) {
      var defaults = {
        icon: 'warning',
        showCancelButton: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
      };
      return sweetalert2__WEBPACK_IMPORTED_MODULE_0___default().fire(_objectSpread(_objectSpread({}, defaults), options));
    }

    /**
     * Display a prompt for user input
     * @param {Object} options - Configuration options
     * @returns {Promise} - Promise resolving with user's input
     */
  }, {
    key: "prompt",
    value: function prompt(options) {
      var defaults = {
        input: 'text',
        showCancelButton: true,
        inputValidator: function inputValidator(value) {
          return !value && 'Please enter a value.';
        }
      };
      return sweetalert2__WEBPACK_IMPORTED_MODULE_0___default().fire(_objectSpread(_objectSpread({}, defaults), options));
    }
  }]);
}();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (new NotificationService());

/***/ })

}]);
//# sourceMappingURL=products_static_js_filters_js.js.map