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

/***/ "./shop/static/js/shop/product-detail-manager.js":
/*!*******************************************************!*\
  !*** ./shop/static/js/shop/product-detail-manager.js ***!
  \*******************************************************/
/***/ (() => {

eval("function _typeof(o) { \"@babel/helpers - typeof\"; return _typeof = \"function\" == typeof Symbol && \"symbol\" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && \"function\" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? \"symbol\" : typeof o; }, _typeof(o); }\nfunction _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError(\"Cannot call a class as a function\"); }\nfunction _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, \"value\" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }\nfunction _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, \"prototype\", { writable: !1 }), e; }\nfunction _toPropertyKey(t) { var i = _toPrimitive(t, \"string\"); return \"symbol\" == _typeof(i) ? i : i + \"\"; }\nfunction _toPrimitive(t, r) { if (\"object\" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || \"default\"); if (\"object\" != _typeof(i)) return i; throw new TypeError(\"@@toPrimitive must return a primitive value.\"); } return (\"string\" === r ? String : Number)(t); }\n/**\n * ProductDetailManager - handles product detail page functionality\n * Manages quantity selectors and integrates with cart and wishlist\n */\nvar ProductDetailManager = /*#__PURE__*/function () {\n  function ProductDetailManager() {\n    _classCallCheck(this, ProductDetailManager);\n    this.initQuantityControls();\n  }\n\n  /**\n   * Initialize quantity controls for the product detail page\n   * Sets up increment/decrement buttons with validation\n   */\n  return _createClass(ProductDetailManager, [{\n    key: \"initQuantityControls\",\n    value: function initQuantityControls() {\n      var quantityInput = document.getElementById('quantity');\n      var decreaseBtn = document.getElementById('decrease-quantity');\n      var increaseBtn = document.getElementById('increase-quantity');\n      if (decreaseBtn && increaseBtn && quantityInput) {\n        decreaseBtn.addEventListener('click', function () {\n          var currentValue = parseInt(quantityInput.value);\n          if (currentValue > 1) {\n            quantityInput.value = currentValue - 1;\n          }\n        });\n        increaseBtn.addEventListener('click', function () {\n          var currentValue = parseInt(quantityInput.value);\n          var maxValue = parseInt(quantityInput.getAttribute('max'));\n          if (currentValue < maxValue) {\n            quantityInput.value = currentValue + 1;\n          } else {\n            // Use SweetAlert2 directly\n            // Always use SweetAlert2\n            Swal.fire({\n              title: 'Maximum Quantity',\n              text: \"Sorry, only \".concat(maxValue, \" units available.\"),\n              icon: 'info',\n              confirmButtonColor: '#0d6efd'\n            });\n          }\n        });\n      }\n    }\n  }]);\n}(); // Initialize the product detail manager when the DOM is loaded\ndocument.addEventListener('DOMContentLoaded', function () {\n  // No need to create new instances of cart and wishlist managers\n  // They've already been initialized by their respective scripts\n  // and are available as global variables\n\n  // Create our product detail manager\n  window.productDetailManager = new ProductDetailManager();\n});\n\n//# sourceURL=webpack://skunkmonkey/./shop/static/js/shop/product-detail-manager.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./shop/static/js/shop/product-detail-manager.js"]();
/******/ 	
/******/ })()
;