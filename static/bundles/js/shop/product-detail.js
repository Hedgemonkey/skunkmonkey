/******/ (() => { // webpackBootstrap
/*!*******************************************************!*\
  !*** ./shop/static/js/shop/product-detail-manager.js ***!
  \*******************************************************/
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * ProductDetailManager - handles product detail page functionality
 * Manages quantity selectors and integrates with cart and wishlist
 */
var ProductDetailManager = /*#__PURE__*/function () {
  function ProductDetailManager() {
    _classCallCheck(this, ProductDetailManager);
    this.initQuantityControls();
  }

  /**
   * Initialize quantity controls for the product detail page
   * Sets up increment/decrement buttons with validation
   */
  return _createClass(ProductDetailManager, [{
    key: "initQuantityControls",
    value: function initQuantityControls() {
      var quantityInput = document.getElementById('quantity');
      var decreaseBtn = document.getElementById('decrease-quantity');
      var increaseBtn = document.getElementById('increase-quantity');
      if (decreaseBtn && increaseBtn && quantityInput) {
        decreaseBtn.addEventListener('click', function () {
          var currentValue = parseInt(quantityInput.value);
          if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
          }
        });
        increaseBtn.addEventListener('click', function () {
          var currentValue = parseInt(quantityInput.value);
          var maxValue = parseInt(quantityInput.getAttribute('max'));
          if (currentValue < maxValue) {
            quantityInput.value = currentValue + 1;
          } else {
            // Use SweetAlert2 directly
            // Always use SweetAlert2
            Swal.fire({
              title: 'Maximum Quantity',
              text: "Sorry, only ".concat(maxValue, " units available."),
              icon: 'info',
              confirmButtonColor: '#0d6efd'
            });
          }
        });
      }
    }
  }]);
}(); // Initialize the product detail manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  // No need to create new instances of cart and wishlist managers
  // They've already been initialized by their respective scripts
  // and are available as global variables

  // Create our product detail manager
  window.productDetailManager = new ProductDetailManager();
});
/******/ })()
;
//# sourceMappingURL=product-detail.js.map