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

/***/ "./shop/static/js/shop/product-list-manager.js":
/*!*****************************************************!*\
  !*** ./shop/static/js/shop/product-list-manager.js ***!
  \*****************************************************/
/***/ (() => {

eval("function _typeof(o) { \"@babel/helpers - typeof\"; return _typeof = \"function\" == typeof Symbol && \"symbol\" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && \"function\" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? \"symbol\" : typeof o; }, _typeof(o); }\nfunction _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError(\"Cannot call a class as a function\"); }\nfunction _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, \"value\" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }\nfunction _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, \"prototype\", { writable: !1 }), e; }\nfunction _toPropertyKey(t) { var i = _toPrimitive(t, \"string\"); return \"symbol\" == _typeof(i) ? i : i + \"\"; }\nfunction _toPrimitive(t, r) { if (\"object\" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || \"default\"); if (\"object\" != _typeof(i)) return i; throw new TypeError(\"@@toPrimitive must return a primitive value.\"); } return (\"string\" === r ? String : Number)(t); }\n/**\n * ProductListManager - handles product list page functionality\n * Manages sorting, filtering, and other product list interactions\n */\nvar ProductListManager = /*#__PURE__*/function () {\n  function ProductListManager() {\n    _classCallCheck(this, ProductListManager);\n    this.initSortingControls();\n  }\n\n  /**\n   * Initialize sorting controls\n   * Sets up the sort dropdown functionality\n   */\n  return _createClass(ProductListManager, [{\n    key: \"initSortingControls\",\n    value: function initSortingControls() {\n      // Sort select change\n      var sortSelect = document.getElementById('sort-select');\n      if (sortSelect) {\n        sortSelect.addEventListener('change', function (e) {\n          var url = new URL(window.location.href);\n          url.searchParams.set('sort', e.target.value);\n          window.location.href = url.toString();\n        });\n\n        // Set the selected option based on the current URL\n        var urlParams = new URLSearchParams(window.location.search);\n        var sortParam = urlParams.get('sort');\n        if (sortParam) {\n          sortSelect.value = sortParam;\n        }\n      }\n    }\n  }]);\n}(); // Initialize the product list manager when the DOM is loaded\ndocument.addEventListener('DOMContentLoaded', function () {\n  window.productListManager = new ProductListManager();\n});\n\n//# sourceURL=webpack://skunkmonkey/./shop/static/js/shop/product-list-manager.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./shop/static/js/shop/product-list-manager.js"]();
/******/ 	
/******/ })()
;