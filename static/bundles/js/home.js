/******/ (() => { // webpackBootstrap
/*!*************************************!*\
  !*** ./home/static/js/home/home.js ***!
  \*************************************/
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
/**
 * Home page JavaScript functionality
 */

document.addEventListener('DOMContentLoaded', function () {
  // Initialize featured products carousel if present
  var carousel = document.querySelector('.home-carousel');
  if (carousel) {
    initializeCarousel(carousel);
  }

  // Initialize featured products hover effects
  var productCards = document.querySelectorAll('.product-card');
  productCards.forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      this.classList.add('shadow');
    });
    card.addEventListener('mouseleave', function () {
      this.classList.remove('shadow');
    });
  });

  // Lazy load testimonial images
  var testimonialImages = document.querySelectorAll('.testimonial-img[data-src]');
  if ('IntersectionObserver' in window) {
    var imageObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          var src = img.getAttribute('data-src');
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }
          imageObserver.unobserve(img);
        }
      });
    });
    testimonialImages.forEach(function (img) {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    testimonialImages.forEach(function (img) {
      var src = img.getAttribute('data-src');
      if (src) {
        img.src = src;
        img.removeAttribute('data-src');
      }
    });
  }

  // Add category filtering functionality
  var categoryButtons = document.querySelectorAll('.category-filter-btn');
  categoryButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var category = this.getAttribute('data-category');

      // Remove active class from all buttons
      categoryButtons.forEach(function (btn) {
        return btn.classList.remove('active');
      });

      // Add active class to clicked button
      this.classList.add('active');

      // Show all products if 'all' category is selected
      if (category === 'all') {
        document.querySelectorAll('.product-item').forEach(function (item) {
          item.style.display = 'block';
        });
        return;
      }

      // Hide all products
      document.querySelectorAll('.product-item').forEach(function (item) {
        item.style.display = 'none';
      });

      // Show products with matching category
      document.querySelectorAll(".product-item[data-category=\"".concat(category, "\"]")).forEach(function (item) {
        item.style.display = 'block';
      });
    });
  });

  // Add to cart functionality for home page product cards
  var addToCartButtons = document.querySelectorAll('.btn-add-to-cart');
  addToCartButtons.forEach(function (button) {
    button.addEventListener('click', function (e) {
      var _this = this;
      e.preventDefault();
      var productId = this.getAttribute('data-product-id');

      // Disable button during AJAX request to prevent double-clicks
      this.disabled = true;
      var originalText = this.innerHTML;
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

      // Send AJAX request to add product to cart
      fetch("/cart/add/".concat(productId, "/"), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRFToken': getCSRFToken()
        },
        body: 'quantity=1&update=False'
      }).then(function (response) {
        return response.json();
      }).then(function (data) {
        // Re-enable button
        _this.disabled = false;
        _this.innerHTML = originalText;
        if (data.success) {
          // Show success message
          showToast('success', data.message);

          // Update cart count in navbar if it exists
          var cartCount = document.querySelector('.cart-count');
          if (cartCount) {
            cartCount.textContent = data.item_count;
          }
        } else {
          // Show error message
          showToast('error', data.errors || 'Error adding to cart');
        }
      })["catch"](function (error) {
        // Re-enable button
        _this.disabled = false;
        _this.innerHTML = originalText;

        // Show error message
        showToast('error', 'Error adding to cart');
        console.error('Error:', error);
      });
    });
  });

  // Add wishlist functionality for home page product cards
  var wishlistButtons = document.querySelectorAll('.btn-wishlist');
  wishlistButtons.forEach(function (button) {
    button.addEventListener('click', function (e) {
      var _this2 = this;
      e.preventDefault();
      var productId = this.getAttribute('data-product-id');

      // Disable button during AJAX request
      this.disabled = true;

      // Send AJAX request to toggle wishlist status
      fetch("/wishlist/toggle/".concat(productId, "/"), {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRFToken': getCSRFToken()
        }
      }).then(function (response) {
        return response.json();
      }).then(function (data) {
        // Re-enable button
        _this2.disabled = false;
        if (data.success) {
          // Update wishlist icon
          var icon = _this2.querySelector('i');
          if (data.action === 'added') {
            icon.classList.remove('far');
            icon.classList.add('fas');
            showToast('success', 'Added to wishlist');
          } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            showToast('success', 'Removed from wishlist');
          }
        } else {
          // Show error or login message
          if (data.error === 'login_required') {
            showToast('info', 'Please log in to add items to your wishlist');
          } else {
            showToast('error', data.error || 'Error updating wishlist');
          }
        }
      })["catch"](function (error) {
        // Re-enable button
        _this2.disabled = false;
        showToast('error', 'Error updating wishlist');
        console.error('Error:', error);
      });
    });
  });
});

/**
 * Initialize carousel with default settings
 * @param {HTMLElement} carouselElement - The carousel container element
 */
function initializeCarousel(carouselElement) {
  // Get all slides
  var slides = carouselElement.querySelectorAll('.carousel-slide');
  if (slides.length === 0) return;
  var currentSlide = 0;
  var totalSlides = slides.length;

  // Show first slide, hide others
  slides.forEach(function (slide, index) {
    slide.style.display = index === 0 ? 'block' : 'none';
  });

  // Create navigation dots
  var dotsContainer = document.createElement('div');
  dotsContainer.className = 'carousel-dots';
  var _loop = function _loop(i) {
    var dot = document.createElement('span');
    dot.className = 'carousel-dot';
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', function () {
      goToSlide(i);
    });
    dotsContainer.appendChild(dot);
  };
  for (var i = 0; i < totalSlides; i++) {
    _loop(i);
  }
  carouselElement.appendChild(dotsContainer);

  // Create prev/next buttons
  var prevButton = document.createElement('button');
  prevButton.className = 'carousel-button carousel-prev';
  prevButton.innerHTML = '&lt;';
  prevButton.addEventListener('click', function () {
    goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
  });
  var nextButton = document.createElement('button');
  nextButton.className = 'carousel-button carousel-next';
  nextButton.innerHTML = '&gt;';
  nextButton.addEventListener('click', function () {
    goToSlide((currentSlide + 1) % totalSlides);
  });
  carouselElement.appendChild(prevButton);
  carouselElement.appendChild(nextButton);

  // Auto-rotate slides
  var intervalTime = 5000; // 5 seconds
  var slideInterval = setInterval(function () {
    goToSlide((currentSlide + 1) % totalSlides);
  }, intervalTime);

  // Pause on hover
  carouselElement.addEventListener('mouseenter', function () {
    clearInterval(slideInterval);
  });
  carouselElement.addEventListener('mouseleave', function () {
    slideInterval = setInterval(function () {
      goToSlide((currentSlide + 1) % totalSlides);
    }, intervalTime);
  });

  // Function to change slides
  function goToSlide(slideIndex) {
    // Hide current slide
    slides[currentSlide].style.display = 'none';

    // Update dots
    dotsContainer.querySelectorAll('.carousel-dot').forEach(function (dot, index) {
      dot.classList.toggle('active', index === slideIndex);
    });

    // Show new slide
    slides[slideIndex].style.display = 'block';
    currentSlide = slideIndex;
  }
}

/**
 * Get CSRF token from cookies
 * @returns {string} CSRF token
 */
function getCSRFToken() {
  var cookies = document.cookie.split(';');
  var _iterator = _createForOfIteratorHelper(cookies),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var cookie = _step.value;
      var _cookie$trim$split = cookie.trim().split('='),
        _cookie$trim$split2 = _slicedToArray(_cookie$trim$split, 2),
        name = _cookie$trim$split2[0],
        value = _cookie$trim$split2[1];
      if (name === 'csrftoken') {
        return value;
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return '';
}

/**
 * Show toast message
 * @param {string} type - Type of toast (success, error, info)
 * @param {string} message - Message to display
 */
function showToast(type, message) {
  // Check if we have a toast container, create one if not
  var toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  var toast = document.createElement('div');
  toast.className = "toast toast-".concat(type);
  toast.innerHTML = "\n        <div class=\"toast-header\">\n            <i class=\"fas fa-".concat(type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle', "\"></i>\n            <span class=\"toast-title\">").concat(type.charAt(0).toUpperCase() + type.slice(1), "</span>\n            <button class=\"toast-close\">&times;</button>\n        </div>\n        <div class=\"toast-body\">").concat(message, "</div>\n    ");

  // Add to container
  toastContainer.appendChild(toast);

  // Show toast with animation
  setTimeout(function () {
    toast.classList.add('show');
  }, 10);

  // Add close button functionality
  toast.querySelector('.toast-close').addEventListener('click', function () {
    toast.classList.remove('show');
    setTimeout(function () {
      toast.remove();
    }, 300);
  });

  // Auto-remove after 5 seconds
  setTimeout(function () {
    if (toast.parentNode) {
      toast.classList.remove('show');
      setTimeout(function () {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    }
  }, 5000);
}
/******/ })()
;
//# sourceMappingURL=home.js.map