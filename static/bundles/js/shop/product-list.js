/******/ (() => { // webpackBootstrap
/*!*****************************************************!*\
  !*** ./shop/static/js/shop/product-list-manager.js ***!
  \*****************************************************/
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Product List Manager
 * Manages product filtering, sorting and AJAX loading for the shop product list
 * Also handles product grid interactions like wishlist toggling
 */
var ProductListManager = /*#__PURE__*/function () {
  function ProductListManager() {
    var _this = this;
    _classCallCheck(this, ProductListManager);
    // Initialize with error handling
    try {
      // Initialize product grid interaction features
      this.initializeProductGridFeatures();
      this.filterContainer = document.getElementById('dynamic-filter-container');
      if (!this.filterContainer) {
        console.warn('Product List Manager: dynamic-filter-container not found in the DOM');
        // Continue anyway as we might just be on a page with product grid but no filters
      }

      // Get URLs from data attributes with validation
      if (this.filterContainer) {
        this.productListUrl = this.filterContainer.dataset.productListUrl;
        if (!this.productListUrl) {
          console.warn('Product List Manager: No product list URL provided in data-product-list-url attribute');
          this.productListUrl = window.location.href; // Fallback to current URL
        }

        // Initial filter state with safety checks
        this.filterState = {
          search: (this.filterContainer.dataset.searchQuery || '').trim(),
          category: (this.filterContainer.dataset.currentCategory || '').trim(),
          sort: 'name-asc'
        };

        // Initialize DOM element references for filtering
        this.initializeFilterDomReferences();

        // Only proceed with filter setup if essential elements are present
        if (this.hasEssentialFilterElements()) {
          this.initializeFilterControls();
          this.bindFilterEvents();
          this.updateFilterUI();

          // Delay initial product fetch to ensure DOM is fully ready
          setTimeout(function () {
            _this.fetchProducts();
          }, 100);
        }
      }
    } catch (err) {
      console.error('Error initializing Product List Manager:', err);
    }
  }

  /**
   * Initialize product grid interaction features
   */
  return _createClass(ProductListManager, [{
    key: "initializeProductGridFeatures",
    value: function initializeProductGridFeatures() {
      var _this2 = this;
      try {
        // Position wishlist buttons correctly
        this.positionWishlistButtons();

        // Add event listeners for product grid interactions
        document.addEventListener('click', function (event) {
          var wishlistBtn = event.target.closest('.add-to-wishlist-btn');
          if (wishlistBtn) {
            _this2.handleWishlistButtonClick(event, wishlistBtn);
          }
        });

        // Re-position elements on window resize
        window.addEventListener('resize', function () {
          _this2.positionWishlistButtons();
        });

        // Re-position elements when products are loaded via AJAX
        document.addEventListener('productsLoaded', function () {
          _this2.positionWishlistButtons();
        });
      } catch (err) {
        console.error('Error initializing product grid features:', err);
      }
    }

    /**
     * Initialize all DOM element references for filtering
     */
  }, {
    key: "initializeFilterDomReferences",
    value: function initializeFilterDomReferences() {
      // Essential elements
      this.productGridContainer = document.getElementById('product-grid-container');

      // Filter elements
      this.searchInput = document.querySelector('.filter-search');
      this.sortSelect = document.querySelector('.filter-sort');
      this.categorySelect = document.querySelector('.filter-category');
      this.clearSearchBtn = document.querySelector('.clear-search');
      this.resetAllBtn = document.querySelector('.reset-all-filters');
      this.filterToggleBtn = document.querySelector('.filter-toggle');
      this.filterOptions = document.getElementById('filterOptions');

      // Display elements
      this.searchDisplay = document.querySelector('.search-display');
      this.searchTerm = document.querySelector('.search-term');
      this.searchTermSummary = document.querySelector('.search-term-summary');
      this.searchSummary = document.querySelector('.search-summary');
      this.categoriesDisplay = document.querySelector('.categories-display');
      this.categoryCountDisplay = document.querySelector('.category-count-display');
      this.categoriesSummary = document.querySelector('.categories-summary');
      this.categoryCountSummary = document.querySelector('.category-count-summary');
      this.categoryTagsContainer = document.getElementById('selectedCategoriesTags');
      this.clearCategoriesBtn = document.querySelector('.clear-categories-btn');
      this.itemCountDisplay = document.querySelector('.item-count');
      this.productCountDisplay = document.getElementById('product-count');
    }

    /**
     * Check if essential filter elements are present
     */
  }, {
    key: "hasEssentialFilterElements",
    value: function hasEssentialFilterElements() {
      if (!this.productGridContainer) {
        console.warn('Product List Manager: product-grid-container not found in the DOM');
        return false;
      }
      return true;
    }

    /**
     * Initialize filter controls including sorting and filtering
     */
  }, {
    key: "initializeFilterControls",
    value: function initializeFilterControls() {
      try {
        // Initialize sorting
        var urlParams = new URLSearchParams(window.location.search);
        var sortParam = urlParams.get('sort');
        if (this.sortSelect && sortParam) {
          this.sortSelect.value = sortParam;
          this.filterState.sort = sortParam;
        }

        // Initialize category select if using a multi-select plugin
        if (this.categorySelect) {
          if (typeof $ !== 'undefined' && $.fn && typeof $.fn.select2 !== 'undefined') {
            try {
              $(this.categorySelect).select2({
                placeholder: "Select Categories",
                allowClear: true,
                width: '100%'
              });
            } catch (selectError) {
              console.warn('Error initializing Select2:', selectError);
            }
          }
        }
      } catch (err) {
        console.error('Error initializing controls:', err);
      }
    }

    /**
     * Bind event listeners to filter DOM elements with error handling
     */
  }, {
    key: "bindFilterEvents",
    value: function bindFilterEvents() {
      var _this3 = this;
      try {
        if (this.searchInput) {
          this.searchInput.addEventListener('input', this.handleSearchInput.bind(this));
        }
        if (this.sortSelect) {
          this.sortSelect.addEventListener('change', this.handleSortChange.bind(this));
        }
        if (this.categorySelect) {
          this.categorySelect.addEventListener('change', this.handleCategoryChange.bind(this));
        }
        if (this.clearSearchBtn) {
          this.clearSearchBtn.addEventListener('click', this.handleClearSearch.bind(this));
        }
        if (this.clearCategoriesBtn) {
          this.clearCategoriesBtn.addEventListener('click', this.handleClearCategories.bind(this));
        }
        if (this.resetAllBtn) {
          this.resetAllBtn.addEventListener('click', this.handleResetAll.bind(this));
        }
        if (this.filterToggleBtn) {
          this.filterToggleBtn.addEventListener('click', this.handleFilterToggle.bind(this));
        }

        // Document-level event delegation for dynamic elements with error handling
        document.addEventListener('click', function (event) {
          try {
            // Handle click on search summary close button
            if (event.target.closest('.search-summary .btn-close')) {
              _this3.handleClearSearch();
            }

            // Handle click on categories summary close button
            if (event.target.closest('.categories-summary .btn-close')) {
              _this3.handleClearCategories();
            }

            // Handle tag remove button click
            if (event.target.closest('.tag-remove')) {
              var categoryId = event.target.closest('.tag-remove').dataset.categoryId;
              if (categoryId) {
                _this3.removeCategoryById(categoryId);
              }
            }
          } catch (eventError) {
            console.error('Error handling click event:', eventError);
          }
        });
      } catch (err) {
        console.error('Error binding events:', err);
      }
    }

    /**
     * Handle search input changes
     */
  }, {
    key: "handleSearchInput",
    value: function handleSearchInput(event) {
      var _this4 = this;
      try {
        this.filterState.search = event.target.value;
        this.updateFilterUI();

        // Debounce for performance
        clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(function () {
          _this4.fetchProducts();
        }, 300);
      } catch (err) {
        console.error('Error handling search input:', err);
      }
    }

    /**
     * Handle sort selection changes
     */
  }, {
    key: "handleSortChange",
    value: function handleSortChange(event) {
      try {
        this.filterState.sort = event.target.value;
        this.updateFilterUI();
        this.fetchProducts();
      } catch (err) {
        console.error('Error handling sort change:', err);
      }
    }

    /**
     * Handle category selection changes
     */
  }, {
    key: "handleCategoryChange",
    value: function handleCategoryChange(event) {
      try {
        var selectedCategories = [];

        // Handle different selection types
        if (event.target.selectedOptions) {
          selectedCategories = Array.from(event.target.selectedOptions).map(function (opt) {
            return opt.value;
          });
        } else if (event.target.options && event.target.multiple) {
          selectedCategories = Array.from(event.target.options).filter(function (opt) {
            return opt.selected;
          }).map(function (opt) {
            return opt.value;
          });
        } else if (event.target.value) {
          selectedCategories = [event.target.value];
        }
        this.filterState.category = selectedCategories.join(',');
        this.updateFilterUI();
        this.fetchProducts();
      } catch (err) {
        console.error('Error handling category change:', err);
      }
    }

    /**
     * Clear search term
     */
  }, {
    key: "handleClearSearch",
    value: function handleClearSearch() {
      try {
        this.filterState.search = '';
        if (this.searchInput) this.searchInput.value = '';
        this.updateFilterUI();
        this.fetchProducts();
      } catch (err) {
        console.error('Error clearing search:', err);
      }
    }

    /**
     * Clear category selections
     */
  }, {
    key: "handleClearCategories",
    value: function handleClearCategories() {
      try {
        this.filterState.category = '';
        if (this.categorySelect) {
          if (typeof $ !== 'undefined' && $.fn && typeof $.fn.select2 !== 'undefined') {
            try {
              $(this.categorySelect).val(null).trigger('change');
            } catch (selectError) {
              console.warn('Error with Select2 clearing:', selectError);
              // Fallback to standard DOM operation if Select2 fails
              Array.from(this.categorySelect.options).forEach(function (opt) {
                return opt.selected = false;
              });
            }
          } else {
            Array.from(this.categorySelect.options).forEach(function (opt) {
              return opt.selected = false;
            });
          }
        }
        this.updateFilterUI();
        this.fetchProducts();
      } catch (err) {
        console.error('Error clearing categories:', err);
      }
    }

    /**
     * Reset all filters to default values
     */
  }, {
    key: "handleResetAll",
    value: function handleResetAll() {
      try {
        this.filterState = {
          search: '',
          category: '',
          sort: 'name-asc'
        };
        if (this.searchInput) this.searchInput.value = '';
        if (this.sortSelect) {
          this.sortSelect.value = 'name-asc';
        }
        if (this.categorySelect) {
          if (typeof $ !== 'undefined' && $.fn && typeof $.fn.select2 !== 'undefined') {
            try {
              $(this.categorySelect).val(null).trigger('change');
            } catch (selectError) {
              console.warn('Error with Select2 resetting:', selectError);
              // Fallback
              Array.from(this.categorySelect.options).forEach(function (opt) {
                return opt.selected = false;
              });
            }
          } else {
            Array.from(this.categorySelect.options).forEach(function (opt) {
              return opt.selected = false;
            });
          }
        }
        this.updateFilterUI();
        this.fetchProducts();
      } catch (err) {
        console.error('Error resetting filters:', err);
      }
    }

    /**
     * Toggle filter visibility
     */
  }, {
    key: "handleFilterToggle",
    value: function handleFilterToggle() {
      try {
        if (!this.filterOptions) return;
        var isCollapsed = this.filterOptions.classList.contains('show');
        this.filterOptions.classList.toggle('show');
        if (this.filterToggleBtn) {
          this.filterToggleBtn.classList.toggle('collapsed', !isCollapsed);
          this.filterToggleBtn.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
          var toggleText = this.filterToggleBtn.querySelector('.filter-toggle-text');
          if (toggleText) {
            toggleText.textContent = isCollapsed ? 'Show Filters' : 'Hide Filters';
          }
        }
      } catch (err) {
        console.error('Error toggling filter visibility:', err);
      }
    }

    /**
     * Remove a specific category by ID
     */
  }, {
    key: "removeCategoryById",
    value: function removeCategoryById(categoryId) {
      try {
        if (!categoryId) return;
        var categoryIds = this.filterState.category.split(',').filter(function (c) {
          return c;
        });
        var updatedCategoryIds = categoryIds.filter(function (id) {
          return id !== categoryId;
        });
        this.filterState.category = updatedCategoryIds.join(',');

        // Update select element
        if (this.categorySelect) {
          if (typeof $ !== 'undefined' && $.fn && typeof $.fn.select2 !== 'undefined') {
            try {
              $(this.categorySelect).val(updatedCategoryIds).trigger('change');
            } catch (selectError) {
              console.warn('Error with Select2 category removal:', selectError);
              // Fallback
              Array.from(this.categorySelect.options).forEach(function (opt) {
                opt.selected = updatedCategoryIds.includes(opt.value);
              });
            }
          } else {
            Array.from(this.categorySelect.options).forEach(function (opt) {
              opt.selected = updatedCategoryIds.includes(opt.value);
            });
          }
        }

        // Update UI and fetch new results
        this.updateUI();
        this.fetchProducts();
      } catch (err) {
        console.error('Error removing category:', err);
      }
    }

    /**
     * Update UI elements based on current filter state
     */
  }, {
    key: "updateFilterUI",
    value: function updateFilterUI() {
      try {
        // Update search display
        if (this.searchTerm) this.searchTerm.textContent = this.filterState.search;
        if (this.searchTermSummary) this.searchTermSummary.textContent = this.filterState.search;
        if (this.searchDisplay) this.searchDisplay.classList.toggle('d-none', !this.filterState.search);
        if (this.searchSummary) this.searchSummary.classList.toggle('d-none', !this.filterState.search);

        // Update category display with validation
        var categoryIds = this.filterState.category ? this.filterState.category.split(',').filter(function (c) {
          return c;
        }) : [];
        var categoryCount = categoryIds.length;
        if (this.categoryCountDisplay) this.categoryCountDisplay.textContent = categoryCount;
        if (this.categoryCountSummary) this.categoryCountSummary.textContent = categoryCount;
        if (this.categoriesDisplay) this.categoriesDisplay.classList.toggle('d-none', categoryCount === 0);
        if (this.categoriesSummary) this.categoriesSummary.classList.toggle('d-none', categoryCount === 0);

        // Update category tags
        this.updateCategoryTags();
      } catch (err) {
        console.error('Error updating UI:', err);
      }
    }

    /**
     * Update category tags display
     */
  }, {
    key: "updateCategoryTags",
    value: function updateCategoryTags() {
      var _this5 = this;
      try {
        if (!this.categoryTagsContainer || !this.categorySelect) return;
        this.categoryTagsContainer.innerHTML = '';
        if (!this.filterState.category) return;
        var categoryIds = this.filterState.category.split(',').filter(function (c) {
          return c;
        });
        if (categoryIds.length === 0) return;
        categoryIds.forEach(function (categoryId) {
          try {
            var option = Array.from(_this5.categorySelect.options).find(function (opt) {
              return opt.value === categoryId;
            });
            if (!option) return;
            var categoryName = option.textContent.trim();
            var tagDiv = document.createElement('div');
            tagDiv.className = 'category-tag';
            tagDiv.innerHTML = "\n                        <span class=\"tag-text\">".concat(categoryName, "</span>\n                        <button type=\"button\" class=\"tag-remove\" data-category-id=\"").concat(categoryId, "\">\n                            <i class=\"fas fa-times\"></i>\n                        </button>\n                    ");
            _this5.categoryTagsContainer.appendChild(tagDiv);
          } catch (tagError) {
            console.warn("Error creating tag for category ID ".concat(categoryId, ":"), tagError);
          }
        });
      } catch (err) {
        console.error('Error updating category tags:', err);
      }
    }

    /**
     * Safely test if a string is a valid URL
     */
  }, {
    key: "isValidUrl",
    value: function isValidUrl(urlString) {
      try {
        new URL(urlString);
        return true;
      } catch (error) {
        return false;
      }
    }

    /**
     * Get the appropriate base URL for product fetching
     */
  }, {
    key: "getBaseUrl",
    value: function getBaseUrl() {
      // First try the explicitly provided URL
      if (this.productListUrl && this.isValidUrl(this.productListUrl)) {
        return this.productListUrl;
      }

      // If we have a relative URL, resolve it against the current page
      if (this.productListUrl && this.productListUrl.startsWith('/')) {
        return new URL(this.productListUrl, window.location.origin).href;
      }

      // Fallback to current URL as a last resort
      return window.location.href;
    }

    /**
     * Fetch products via AJAX with enhanced error handling
     */
  }, {
    key: "fetchProducts",
    value: function fetchProducts() {
      var _this6 = this;
      // Show loading state if container exists
      if (this.productGridContainer) {
        // Just add the loading class - the CSS will handle the spinner display
        this.productGridContainer.classList.add('loading');

        // Store the current HTML to restore in case of an error
        this.originalGridHtml = this.productGridContainer.innerHTML;
      }
      try {
        // Get base URL with proper validation
        var baseUrl = this.getBaseUrl();

        // Create URL with validation
        var url = new URL(baseUrl);

        // Add query parameters
        if (this.filterState.search) url.searchParams.set('search', this.filterState.search);
        if (this.filterState.category) url.searchParams.set('category', this.filterState.category);
        if (this.filterState.sort) url.searchParams.set('sort', this.filterState.sort);

        // Add timestamp to prevent caching issues
        url.searchParams.set('_', Date.now());

        // Fetch data with timeout for network issues
        var controller = new AbortController();
        var timeoutId = setTimeout(function () {
          return controller.abort();
        }, 15000); // 15 second timeout

        fetch(url, {
          method: 'GET',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
          },
          signal: controller.signal
        }).then(function (response) {
          clearTimeout(timeoutId);
          if (!response.ok) {
            throw new Error("Server returned ".concat(response.status, ": ").concat(response.statusText));
          }
          var contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Response was not JSON. Received: ' + contentType);
          }
          return response.json();
        }).then(function (data) {
          // Update product grid if container exists
          if (_this6.productGridContainer) {
            if (data.html) {
              _this6.productGridContainer.innerHTML = data.html;
            } else {
              _this6.productGridContainer.innerHTML = '<div class="alert alert-info">No products found matching your criteria.</div>';
            }
          }

          // Update counts if elements exist
          var count = data.count || 0;
          if (_this6.itemCountDisplay) _this6.itemCountDisplay.textContent = count;
          if (_this6.productCountDisplay) _this6.productCountDisplay.textContent = count;

          // Trigger event for other components that might need to initialize
          document.dispatchEvent(new CustomEvent('productsLoaded', {
            detail: data
          }));

          // Re-position wishlist buttons after products are loaded
          _this6.positionWishlistButtons();
        })["catch"](function (error) {
          console.error('Error fetching products:', error);
          var errorMessage = 'Error loading products. ';
          if (error.name === 'AbortError') {
            errorMessage += 'Request timed out. Please check your internet connection and try again.';
          } else if (error.message.includes('JSON')) {
            errorMessage += 'Unexpected response format from server.';
          } else {
            errorMessage += 'Please try again or contact support if the issue persists.';
          }
          if (_this6.productGridContainer) {
            _this6.productGridContainer.innerHTML = "<div class=\"alert alert-danger\">".concat(errorMessage, "</div>");
          }
        })["finally"](function () {
          // Ensure loading class is always removed, even if there are other issues
          if (_this6.productGridContainer) {
            _this6.productGridContainer.classList.remove('loading');
          }
        });
      } catch (error) {
        console.error('Error constructing request:', error);

        // Remove loading class and show error
        if (this.productGridContainer) {
          this.productGridContainer.classList.remove('loading');
          this.productGridContainer.innerHTML = "<div class=\"alert alert-danger\">Configuration error: ".concat(error.message, "</div>");
        }
      }
    }

    /**
     * Handle wishlist button click
     * @param {Event} event - Click event
     * @param {HTMLElement} button - Wishlist button element
     */
  }, {
    key: "handleWishlistButtonClick",
    value: function handleWishlistButtonClick(event, button) {
      // Prevent default to handle via AJAX instead of full page reload
      event.preventDefault();
      var productId = button.dataset.productId;
      var url = button.getAttribute('href');

      // Toggle wishlist heart icon
      var heartIcon = button.querySelector('i');
      var originalClass = heartIcon.className;
      heartIcon.className = 'fas fa-spinner fa-spin';

      // Send AJAX request to add/remove from wishlist
      fetch(url, {
        method: 'POST',
        headers: {
          'X-CSRFToken': this.getCookie('csrftoken'),
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin'
      }).then(function (response) {
        if (!response.ok) {
          throw new Error("Server returned ".concat(response.status, ": ").concat(response.statusText));
        }
        return response.json();
      }).then(function (data) {
        // Update icon based on response
        if (data.success) {
          if (data.added) {
            heartIcon.className = 'fas fa-heart';
            button.classList.add('active');
          } else {
            heartIcon.className = 'far fa-heart';
            button.classList.remove('active');
          }
        } else {
          // If there was an error in the response
          heartIcon.className = originalClass;
          console.error('Error updating wishlist:', data.message || 'Unknown error');
        }
      })["catch"](function (error) {
        console.error('Error updating wishlist:', error);
        heartIcon.className = originalClass;
      });
    }

    /**
     * Position wishlist buttons based on whether badges are present
     */
  }, {
    key: "positionWishlistButtons",
    value: function positionWishlistButtons() {
      try {
        var productCards = document.querySelectorAll('.product-card');
        productCards.forEach(function (card) {
          var badges = card.querySelector('.product-badges');
          var wishlistBtn = card.querySelector('.add-to-wishlist-btn');
          if (badges && wishlistBtn) {
            // Check if badges container has any badges
            var hasBadges = badges.querySelectorAll('.badge').length > 0;

            // Adjust wishlist button position based on badges presence
            if (hasBadges) {
              wishlistBtn.style.top = 'auto';
              wishlistBtn.style.bottom = '10px';
              wishlistBtn.style.right = '10px';
            } else {
              wishlistBtn.style.top = '10px';
              wishlistBtn.style.bottom = 'auto';
              wishlistBtn.style.right = '10px';
            }
          }
        });
      } catch (err) {
        console.error('Error positioning wishlist buttons:', err);
      }
    }

    /**
     * Get CSRF cookie for AJAX requests
     * @param {string} name - Cookie name
     * @returns {string} - Cookie value
     */
  }, {
    key: "getCookie",
    value: function getCookie(name) {
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
  }]);
}();
/**
 * Initialize the product list manager when the DOM is loaded
 * with error handling to prevent crashes
 */
document.addEventListener('DOMContentLoaded', function () {
  try {
    window.productListManager = new ProductListManager();
  } catch (error) {
    console.error('Fatal error initializing Product List Manager:', error);
    // Try to show error on page
    var container = document.getElementById('product-grid-container');
    if (container) {
      container.innerHTML = '<div class="alert alert-danger">There was an error initializing the product list. Please refresh the page or contact support.</div>';
    }
  }
});
/******/ })()
;
//# sourceMappingURL=product-list.js.map