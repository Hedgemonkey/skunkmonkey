/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./shop/static/js/shop/wishlist-initializer.js":
/*!*****************************************************!*\
  !*** ./shop/static/js/shop/wishlist-initializer.js ***!
  \*****************************************************/
/***/ (() => {

eval("/**\n * Wishlist Initializer Script\n * Ensures that wishlist functionality is properly initialized on any page that includes wishlist buttons\n */\n\ndocument.addEventListener('DOMContentLoaded', function () {\n  // Check if the WishlistManager was already loaded\n  if (window.wishlistManager) {\n    console.log('WishlistManager already initialized');\n    return;\n  }\n\n  // Helper function to dynamically load the wishlist-manager.js script\n  var loadWishlistManager = function loadWishlistManager() {\n    // Check if we're using bundled or unbundled versions\n    var useBundle = document.querySelector('script[src*=\"bundles\"]') !== null;\n    var scriptPath = useBundle ? '/static/bundles/js/shop/wishlist.js' : '/static/js/shop/wishlist-manager.js';\n\n    // Create script element\n    var script = document.createElement('script');\n    script.src = scriptPath;\n    script.type = 'text/javascript';\n    script.onload = function () {\n      console.log('WishlistManager script loaded');\n\n      // If not using modules, manually initialize\n      if (!window.wishlistManager && typeof WishlistManager === 'function') {\n        window.wishlistManager = new WishlistManager();\n      }\n\n      // Initialize tooltips after WishlistManager is loaded\n      initializeWishlistTooltips();\n    };\n    document.head.appendChild(script);\n  };\n\n  // Initialize tooltips for wishlist buttons\n  var initializeWishlistTooltips = function initializeWishlistTooltips() {\n    var wishlistButtons = document.querySelectorAll('.add-to-wishlist-btn, .remove-wishlist-btn');\n    wishlistButtons.forEach(function (button) {\n      // Initialize Bootstrap tooltips if Bootstrap is available\n      if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {\n        // Dispose existing tooltip if any\n        var existingTooltip = bootstrap.Tooltip.getInstance(button);\n        if (existingTooltip) {\n          existingTooltip.dispose();\n        }\n        new bootstrap.Tooltip(button, {\n          trigger: 'hover',\n          placement: 'left'\n        });\n      }\n\n      // Add ARIA labels for accessibility\n      var isInWishlist = button.classList.contains('remove-wishlist-btn');\n      var productName = button.dataset.productName || 'this product';\n      button.setAttribute('aria-label', \"\".concat(isInWishlist ? 'Remove' : 'Add', \" \").concat(productName, \" \").concat(isInWishlist ? 'from' : 'to', \" wishlist\"));\n    });\n  };\n\n  // If the page has wishlist buttons and WishlistManager isn't loaded, load it\n  var hasWishlistButtons = document.querySelector('.add-to-wishlist-btn, .remove-wishlist-btn') !== null;\n  if (hasWishlistButtons) {\n    loadWishlistManager();\n    // Initialize tooltips immediately in case we already have Bootstrap\n    initializeWishlistTooltips();\n  }\n\n  // Add event handlers for wishlist buttons\n  document.querySelectorAll('.add-to-wishlist-btn, .remove-wishlist-btn').forEach(function (button) {\n    // Only add if it doesn't already have a click handler\n    if (!button.hasAttribute('data-event-bound')) {\n      button.addEventListener('click', function (event) {\n        var _this = this;\n        event.preventDefault();\n\n        // Check if WishlistManager is available\n        if (window.wishlistManager) {\n          if (this.classList.contains('remove-wishlist-btn')) {\n            window.wishlistManager.handleRemoveFromWishlist(event);\n          } else {\n            window.wishlistManager.handleAddToWishlist(event);\n          }\n          return;\n        }\n\n        // Fallback implementation if WishlistManager is not available\n        var url = this.getAttribute('href');\n        var productId = this.dataset.productId;\n        var productName = this.dataset.productName || 'this product';\n        var isRemove = this.classList.contains('remove-wishlist-btn');\n\n        // Confirm removal if needed\n        if (isRemove && !confirm('Are you sure you want to remove this item from your wishlist?')) {\n          return;\n        }\n        fetch(url, {\n          method: 'GET',\n          headers: {\n            'X-Requested-With': 'XMLHttpRequest'\n          }\n        }).then(function (response) {\n          return response.json();\n        }).then(function (data) {\n          if (data.success) {\n            // Toggle button state\n            if (!isRemove) {\n              var _this$querySelector;\n              // Change to remove button\n              _this.classList.remove('add-to-wishlist-btn');\n              _this.classList.add('remove-wishlist-btn');\n              (_this$querySelector = _this.querySelector('i')) === null || _this$querySelector === void 0 || _this$querySelector.classList.replace('far', 'fas');\n              _this.setAttribute('title', 'Remove from wishlist');\n              _this.setAttribute('aria-label', \"Remove \".concat(productName, \" from wishlist\"));\n\n              // Update href\n              var newUrl = url.replace('add_to_wishlist', 'remove_from_wishlist');\n              _this.setAttribute('href', newUrl);\n\n              // Show notification\n              if (window.showToast) {\n                window.showToast('Added to Wishlist', \"\".concat(productName, \" added to your wishlist.\"), 'success');\n              }\n            } else {\n              var _this$querySelector2;\n              // Change to add button\n              _this.classList.remove('remove-wishlist-btn');\n              _this.classList.add('add-to-wishlist-btn');\n              (_this$querySelector2 = _this.querySelector('i')) === null || _this$querySelector2 === void 0 || _this$querySelector2.classList.replace('fas', 'far');\n              _this.setAttribute('title', 'Add to wishlist');\n              _this.setAttribute('aria-label', \"Add \".concat(productName, \" to wishlist\"));\n\n              // Update href\n              var _newUrl = url.replace('remove_from_wishlist', 'add_to_wishlist');\n              _this.setAttribute('href', _newUrl);\n\n              // Show notification\n              if (window.showToast) {\n                window.showToast('Removed from Wishlist', \"\".concat(productName, \" removed from your wishlist.\"), 'info');\n              }\n            }\n\n            // Update tooltips\n            if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {\n              var tooltip = bootstrap.Tooltip.getInstance(_this);\n              if (tooltip) {\n                tooltip.dispose();\n              }\n              new bootstrap.Tooltip(_this, {\n                trigger: 'hover',\n                placement: 'left'\n              });\n            }\n\n            // Update wishlist count if available\n            if (data.wishlist_count !== undefined) {\n              document.querySelectorAll('.wishlist-count').forEach(function (element) {\n                element.textContent = data.wishlist_count;\n              });\n            }\n          } else {\n            // Show error\n            if (window.showToast) {\n              window.showToast('Error', data.error || 'There was an error processing your request.', 'error');\n            } else {\n              alert(data.error || 'There was an error processing your request.');\n            }\n          }\n        })[\"catch\"](function (error) {\n          console.error('Error toggling wishlist:', error);\n          if (window.showToast) {\n            window.showToast('Error', 'There was an error processing your request.', 'error');\n          } else {\n            alert('There was an error processing your request.');\n          }\n        });\n      });\n\n      // Mark as bound to prevent duplicate event listeners\n      button.setAttribute('data-event-bound', 'true');\n    }\n  });\n});\n\n// Function to reinitialize wishlist buttons\n// This can be useful for dynamically loaded content\nfunction reinitializeWishlistButtons() {\n  // Initialize tooltips\n  var initTooltips = function initTooltips() {\n    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {\n      document.querySelectorAll('.add-to-wishlist-btn, .remove-wishlist-btn').forEach(function (button) {\n        var existingTooltip = bootstrap.Tooltip.getInstance(button);\n        if (existingTooltip) {\n          existingTooltip.dispose();\n        }\n        new bootstrap.Tooltip(button, {\n          trigger: 'hover',\n          placement: 'left'\n        });\n\n        // Add ARIA labels for accessibility\n        var isInWishlist = button.classList.contains('remove-wishlist-btn');\n        var productName = button.dataset.productName || 'this product';\n        button.setAttribute('aria-label', \"\".concat(isInWishlist ? 'Remove' : 'Add', \" \").concat(productName, \" \").concat(isInWishlist ? 'from' : 'to', \" wishlist\"));\n      });\n    }\n  };\n  if (window.wishlistManager) {\n    window.wishlistManager.initEventListeners();\n    initTooltips();\n  } else {\n    // Try to load the WishlistManager if it's not available\n    var useBundle = document.querySelector('script[src*=\"bundles\"]') !== null;\n    var scriptPath = useBundle ? '/static/bundles/js/shop/wishlist.js' : '/static/js/shop/wishlist-manager.js';\n    var script = document.createElement('script');\n    script.src = scriptPath;\n    script.onload = function () {\n      if (typeof WishlistManager === 'function' && !window.wishlistManager) {\n        window.wishlistManager = new WishlistManager();\n      }\n      initTooltips();\n    };\n    document.head.appendChild(script);\n  }\n\n  // Rebind event handlers for any new buttons\n  document.querySelectorAll('.add-to-wishlist-btn, .remove-wishlist-btn').forEach(function (button) {\n    if (!button.hasAttribute('data-event-bound')) {\n      // The DOMContentLoaded event handler will take care of binding events\n      // This is a trigger to force that process for new elements\n      button.dispatchEvent(new Event('needsBinding'));\n    }\n  });\n}\n\n// Make the function available globally\nwindow.reinitializeWishlistButtons = reinitializeWishlistButtons;\n\n//# sourceURL=webpack://skunkmonkey/./shop/static/js/shop/wishlist-initializer.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./shop/static/js/shop/wishlist-initializer.js"]();
/******/ 	
/******/ })()
;