/******/ (() => { // webpackBootstrap
/*!*****************************************!*\
  !*** ./shop/static/js/shop/checkout.js ***!
  \*****************************************/
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/**
 * Checkout form handling with Stripe Payment Element integration
 * Features:
 * - Stripe Payment Element for comprehensive payment processing
 * - Billing information handled by Stripe Payment Element
 * - Auto-population of shipping fields
 * - Robust error handling
 */

document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM fully loaded - initializing checkout script with Payment Element');

  // Get Stripe data from the DOM
  var stripeDataElement = document.getElementById('stripe-data');

  // Check if the Stripe data element exists
  if (!stripeDataElement) {
    console.error('Stripe data element not found');
    showError('Payment system initialization error. Please refresh the page or contact support.');
    return;
  }
  var stripePublishableKey = stripeDataElement.dataset.publishableKey;
  var clientSecret = stripeDataElement.dataset.clientSecret;
  var cacheCheckoutUrl = stripeDataElement.dataset.cacheUrl;

  // Debug logging to verify data is available
  console.log('Stripe publishable key:', stripePublishableKey ? 'Available' : 'Missing');
  console.log('Client secret available:', !!clientSecret);
  console.log('Cache checkout URL:', cacheCheckoutUrl);

  // Store the client secret in sessionStorage with a timestamp
  if (clientSecret) {
    storeClientSecret(clientSecret);
  } else {
    // Check if we have a stored client secret that might be valid
    var storedSecret = sessionStorage.getItem('client_secret');
    if (storedSecret) {
      console.log('Using stored client secret from session storage');
    }
  }

  // Check for expired client secret
  checkClientSecretExpiry();

  // Check if required data is present
  if (!stripePublishableKey) {
    console.error('Stripe publishable key is missing');
    showError('Payment system configuration error. Please contact support.');
    disableSubmitButton();
    return;
  }
  if (!clientSecret) {
    console.error('Client secret is missing');
    showError('Payment session could not be initialized. Please refresh the page or contact support.');
    disableSubmitButton();
    return;
  }

  // Initialize Stripe
  var stripe = Stripe(stripePublishableKey);

  // Initialize variables
  var form = document.getElementById('checkout-form');
  var submitButton = document.getElementById('submit-button');
  var loadingOverlay = document.getElementById('loading-overlay');
  var paymentElement = document.getElementById('payment-element');
  var paymentErrorsElement = document.getElementById('payment-errors');
  if (!form) {
    console.error('Checkout form not found');
    return;
  }
  if (!submitButton) {
    console.error('Submit button not found');
    return;
  }
  if (!paymentElement) {
    console.error('Payment element container not found');
    return;
  }

  // Create Stripe Elements instance
  var options = {
    clientSecret: clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#007bff',
        colorBackground: '#ffffff',
        colorText: '#32325d',
        colorDanger: '#dc3545',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        spacingUnit: '4px',
        borderRadius: '4px'
      }
    },
    // Business name for the payment form
    business: {
      name: 'SkunkMonkey Shop'
    }
  };

  // Create the Payment Element
  var elements = stripe.elements(options);
  var paymentElementInstance = elements.create('payment', {
    layout: {
      type: 'tabs',
      defaultCollapsed: false
    },
    fields: {
      billingDetails: {
        address: {
          country: 'auto'
        }
      }
    },
    terms: {
      card: 'never'
    },
    // Don't show terms text in the Element
    wallets: {
      applePay: 'auto',
      googlePay: 'auto'
    }
  });

  // Mount the Payment Element
  paymentElementInstance.mount('#payment-element');

  /**
   * Function to fix Stripe iframe styling issues
   */
  function fixStripeIframeStyles() {
    // Find the Stripe iframe
    var stripeIframe = document.querySelector('#payment-element iframe');
    if (stripeIframe) {
      console.log('Found Stripe iframe, applying style fixes');

      // Create a style element to add to the head
      var styleEl = document.createElement('style');
      styleEl.textContent = "\n                #payment-element iframe {\n                    margin: 0 !important;\n                    width: 100% !important;\n                    max-width: 100% !important;\n                    min-width: 100% !important;\n                    transform: none !important;\n                    position: static !important;\n                }\n                #payment-element .__PrivateStripeElement {\n                    margin: 0 !important;\n                    position: relative !important;\n                    transform: none !important;\n                }\n                .payment-element-container {\n                    position: relative !important;\n                    z-index: 1 !important;\n                    overflow: visible !important;\n                    min-height: 350px !important;\n                }\n            ";
      document.head.appendChild(styleEl);
      console.log('Added Stripe iframe style fixes');
    } else {
      console.log('Stripe iframe not found yet, will retry');
    }
  }

  // Apply fix for Stripe iframe styling immediately and after delays
  fixStripeIframeStyles();
  setTimeout(fixStripeIframeStyles, 500);
  setTimeout(fixStripeIframeStyles, 1000);

  // Listen for changes to the Payment Element to handle validation errors and adjust sizing
  paymentElementInstance.on('change', function (event) {
    if (event.error) {
      showError(event.error.message);
    } else {
      clearError();
    }

    // Adjust container height if needed
    adjustContainerHeight();
    enhanceContainerHeightAdjustment();
  });

  // Also listen for the ready event to adjust the container height and fix styles
  paymentElementInstance.on('ready', function () {
    console.log('Payment element is ready and fully rendered');
    // Allow a brief delay for the iframe to fully render
    setTimeout(adjustContainerHeight, 100);
    // Fix Stripe iframe styles
    fixStripeIframeStyles();
    setTimeout(fixStripeIframeStyles, 100);
    // Apply enhanced height adjustment
    enhanceContainerHeightAdjustment();
    setupExpansionDetection();
  });

  // Keep track of form submission status
  var isSubmitting = false;

  /**
   * Store client secret in sessionStorage with a timestamp
   * @param {string} clientSecret - The Stripe client secret
   */
  function storeClientSecret(clientSecret) {
    // Store the client secret and a timestamp
    var now = new Date().getTime();
    sessionStorage.setItem('client_secret', clientSecret);
    sessionStorage.setItem('client_secret_timestamp', now);

    // Store the cart total as an additional verification
    var cartTotalElement = document.querySelector('.checkout-total') || document.querySelector('.cart-total') || document.getElementById('cart-total');
    if (cartTotalElement) {
      sessionStorage.setItem('cart_total', cartTotalElement.textContent.trim());
    }
  }

  /**
   * Clear client secret data from sessionStorage
   */
  function clearClientSecretData() {
    sessionStorage.removeItem('client_secret');
    sessionStorage.removeItem('client_secret_timestamp');
    sessionStorage.removeItem('cart_total');
  }

  /**
   * Check if the stored client secret is expired
   */
  function checkClientSecretExpiry() {
    var storedSecret = sessionStorage.getItem('client_secret');
    var timestamp = sessionStorage.getItem('client_secret_timestamp');
    if (storedSecret && timestamp) {
      var now = new Date().getTime();
      var timeDiff = now - parseInt(timestamp);

      // If more than 1 hour old, consider it expired (60 * 60 * 1000 = 3600000 ms)
      if (timeDiff > 3600000) {
        console.log('Client secret expired, clearing data');
        clearClientSecretData();

        // Show a message if we're on the checkout page
        if (window.location.href.includes('checkout')) {
          handlePaymentIntentIssue('Your payment session has expired. Please refresh the page to continue.');
        }
      }
    }
  }

  /**
   * Disable the submit button
   */
  function disableSubmitButton() {
    if (submitButton) {
      submitButton.disabled = true;
    }
  }

  /**
   * Show an error message
   * @param {string} message - The error message to display
   */
  function showError(message) {
    if (paymentErrorsElement) {
      paymentErrorsElement.textContent = message;
      paymentErrorsElement.classList.remove('d-none');
    }
  }

  /**
   * Clear error messages
   */
  function clearError() {
    if (paymentErrorsElement) {
      paymentErrorsElement.textContent = '';
      paymentErrorsElement.classList.add('d-none');
    }
  }

  /**
   * Helper function to adjust the container height based on the iframe content
   */
  function adjustContainerHeight() {
    var iframeElement = document.querySelector('#payment-element iframe');
    var containerElement = document.querySelector('.payment-element-container');
    if (iframeElement && containerElement) {
      var iframeHeight = iframeElement.scrollHeight || iframeElement.offsetHeight;

      // Add some padding to ensure it fits well
      var newHeight = iframeHeight + 50;

      // Only update if the new height is larger than the minimum
      if (newHeight > 300) {
        containerElement.style.minHeight = "".concat(newHeight, "px");
      }
      console.log('Adjusted payment element container height to:', newHeight + 'px');
    }
  }

  /**
   * Enhanced function to adjust heights of all containers based on iframe content
   */
  function enhanceContainerHeightAdjustment() {
    // Find all the relevant elements
    var iframeElement = document.querySelector('#payment-element iframe');
    var containerElement = document.querySelector('.payment-element-container');
    var wrapperElement = document.querySelector('.stripe-element-wrapper');
    var paymentElement = document.getElementById('payment-element');
    var privateElement = document.querySelector('#payment-element .__PrivateStripeElement');
    if (!iframeElement) return;

    // Function to check and update heights
    function updateHeights() {
      // Get actual height of iframe (try multiple methods)
      var iframeHeight = iframeElement.scrollHeight || iframeElement.offsetHeight || iframeElement.clientHeight || parseInt(iframeElement.style.height, 10) || 280; // Fallback

      // Only proceed if we got a reasonable height
      if (iframeHeight > 100) {
        console.log('Propagating iframe height:', iframeHeight);

        // Set explicit height on elements to ensure expansion
        if (privateElement) privateElement.style.height = iframeHeight + 5 + 'px';
        if (paymentElement) paymentElement.style.height = iframeHeight + 25 + 'px';
        if (wrapperElement) wrapperElement.style.height = iframeHeight + 35 + 'px';
        if (containerElement) containerElement.style.height = iframeHeight + 50 + 'px';
      }
    }

    // Call immediately
    updateHeights();

    // Set up mutation observer to detect iframe height changes
    var observer = new MutationObserver(function (mutations) {
      updateHeights();
    });

    // Start observing iframe for style changes that could affect height
    observer.observe(iframeElement, {
      attributes: true,
      attributeFilter: ['style', 'height', 'class']
    });

    // Also check periodically (as a fallback)
    var heightInterval = setInterval(updateHeights, 1000);

    // Stop checking after 60 seconds (when most interactions should be complete)
    setTimeout(function () {
      return clearInterval(heightInterval);
    }, 60000);
    console.log('Enhanced container height adjustment enabled');
  }

  /**
   * Sets up expansion detection for Stripe iframe
   */
  function setupExpansionDetection() {
    // Check for expansion periodically (fallback approach)
    var expansionChecker = setInterval(function () {
      var iframe = document.querySelector('#payment-element iframe');
      if (!iframe) {
        clearInterval(expansionChecker);
        return;
      }

      // Store current height to check for changes
      var currentHeight = iframe.style.height || iframe.offsetHeight;

      // Check again after a short delay
      setTimeout(function () {
        var newHeight = iframe.style.height || iframe.offsetHeight;
        if (newHeight !== currentHeight) {
          console.log('Iframe height changed from', currentHeight, 'to', newHeight);
          adjustContainerHeight();
          enhanceContainerHeightAdjustment();
        }
      }, 50);
    }, 500); // Check every 500ms

    // Clean up after 1 minute (when most interactions should be complete)
    setTimeout(function () {
      clearInterval(expansionChecker);
    }, 60000);

    // Add click listeners to detect user interaction with payment element
    var paymentElement = document.getElementById('payment-element');
    if (paymentElement) {
      paymentElement.addEventListener('click', function () {
        // Check height after interaction
        setTimeout(function () {
          adjustContainerHeight();
          enhanceContainerHeightAdjustment();
        }, 300);
      });

      // Also listen for focus events which might trigger expansions
      paymentElement.addEventListener('focusin', function () {
        setTimeout(function () {
          adjustContainerHeight();
          enhanceContainerHeightAdjustment();
        }, 300);
      });
    }
    console.log('Expansion detection set up');
  }

  /**
   * Enhance container height adjustment to capture and propagate iframe height changes
   * This function should be called after adjustContainerHeight
   */
  function enhanceContainerHeightAdjustment() {
    // Find all the relevant elements
    var iframeElement = document.querySelector('#payment-element iframe');
    var containerElement = document.querySelector('.payment-element-container');
    var wrapperElement = document.querySelector('.stripe-element-wrapper');
    var paymentElement = document.getElementById('payment-element');
    var privateElement = document.querySelector('#payment-element .__PrivateStripeElement');
    if (!iframeElement) return;

    // Function to check and update heights
    function updateHeights() {
      // Get actual height of iframe (try multiple methods)
      var iframeHeight = iframeElement.scrollHeight || iframeElement.offsetHeight || iframeElement.clientHeight || parseInt(iframeElement.style.height, 10) || 280; // Fallback

      // Only proceed if we got a reasonable height
      if (iframeHeight > 100) {
        console.log('Propagating iframe height:', iframeHeight);

        // Set explicit height on elements to ensure expansion
        if (privateElement) privateElement.style.height = iframeHeight + 5 + 'px';
        if (paymentElement) paymentElement.style.height = iframeHeight + 25 + 'px';
        if (wrapperElement) wrapperElement.style.height = iframeHeight + 35 + 'px';
        if (containerElement) containerElement.style.height = iframeHeight + 50 + 'px';
      }
    }

    // Call immediately
    updateHeights();

    // Set up mutation observer to detect iframe height changes
    var observer = new MutationObserver(function (mutations) {
      updateHeights();
    });

    // Start observing iframe for style changes that could affect height
    observer.observe(iframeElement, {
      attributes: true,
      attributeFilter: ['style', 'height', 'class']
    });

    // Also check periodically (as a fallback)
    var heightInterval = setInterval(updateHeights, 1000);

    // Stop checking after 60 seconds (when most interactions should be complete)
    setTimeout(function () {
      return clearInterval(heightInterval);
    }, 60000);
    console.log('Enhanced container height adjustment enabled');
  }

  /**
   * Handle payment intent issues by showing error and refresh button
   * @param {string} errorMessage - The error message to display
   */
  function handlePaymentIntentIssue() {
    var errorMessage = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'The payment session has expired. Please refresh the page to continue.';
    // Show error message
    showError(errorMessage);

    // Create a refresh button
    var refreshButton = document.createElement('button');
    refreshButton.className = 'btn btn-warning mt-3';
    refreshButton.innerText = 'Refresh Page';
    refreshButton.onclick = function () {
      // Clear any stored client secret data
      clearClientSecretData();

      // Force a hard refresh of the page to get a new payment intent
      window.location.href = window.location.href.split('?')[0] + '?refresh=' + new Date().getTime();
    };

    // Add the refresh button after the error message
    if (paymentErrorsElement && !document.getElementById('refresh-button')) {
      refreshButton.id = 'refresh-button';
      paymentErrorsElement.parentNode.insertBefore(refreshButton, paymentErrorsElement.nextSibling);
    }

    // Reset submission status
    isSubmitting = false;

    // Re-enable the submit button and hide overlay
    if (submitButton) submitButton.disabled = false;
    if (loadingOverlay) loadingOverlay.style.display = 'none';
  }

  /**
   * Helper function to get value from any field
   * @param {string} fieldName - The name of the field
   * @returns {string} The field value
   */
  function getFieldValue(fieldName) {
    // Try with both regular name and id_ prefix (Django convention)
    var field = form.elements[fieldName] || form.elements["id_".concat(fieldName)] || document.getElementById("id_".concat(fieldName));
    return field ? field.value : '';
  }

  /**
   * Verify cart total matches stored value
   */
  function verifyCartTotal() {
    var storedTotal = sessionStorage.getItem('cart_total');
    var currentTotalElement = document.querySelector('.checkout-total') || document.querySelector('.cart-total') || document.getElementById('cart-total');
    if (storedTotal && currentTotalElement) {
      var currentTotal = currentTotalElement.textContent.trim();

      // If cart total has changed, clear the client secret
      if (storedTotal !== currentTotal) {
        console.log('Cart total changed, clearing client secret data');
        clearClientSecretData();
      }
    }
  }

  // Handle form submission
  form.addEventListener('submit', /*#__PURE__*/function () {
    var _ref = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(event) {
      var termsCheckbox, buttonText, spinner, _document$getElementB, csrfTokenElement, csrfToken, formData, response, responseData, returnUrl, baseUrl, formAction, currentPath, currentDir, shipping, _yield$stripe$confirm, error, paymentIntentIdField, paymentMethodTypeField;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            event.preventDefault();
            console.log('Form submission started');

            // Prevent multiple submissions
            if (!isSubmitting) {
              _context.next = 5;
              break;
            }
            console.log('Form already submitting, preventing duplicate submission');
            return _context.abrupt("return");
          case 5:
            // Verify terms checkbox is checked
            termsCheckbox = document.getElementById('terms-check');
            if (!(!termsCheckbox || !termsCheckbox.checked)) {
              _context.next = 9;
              break;
            }
            showError('Please agree to the terms and conditions.');
            return _context.abrupt("return");
          case 9:
            // Set submission status
            isSubmitting = true;

            // Disable the submit button to prevent double clicks
            submitButton.disabled = true;

            // Show loading indicator in button
            buttonText = document.getElementById('button-text');
            spinner = document.getElementById('spinner');
            if (buttonText) buttonText.classList.add('d-none');
            if (spinner) spinner.classList.remove('d-none');

            // Show the loading overlay
            if (loadingOverlay) {
              loadingOverlay.style.display = 'flex';
            }
            _context.prev = 16;
            // First cache the checkout data on the server
            csrfTokenElement = form.querySelector('input[name="csrfmiddlewaretoken"]');
            if (csrfTokenElement) {
              _context.next = 20;
              break;
            }
            throw new Error('CSRF token not found in form');
          case 20:
            csrfToken = csrfTokenElement.value; // Get form data that we want to pass to the payment intent
            formData = new FormData();
            formData.append('client_secret', clientSecret);
            formData.append('save_info', ((_document$getElementB = document.getElementById('id_save_payment_info')) === null || _document$getElementB === void 0 ? void 0 : _document$getElementB.checked) || false);
            console.log('Sending data to cache_checkout_data...');
            _context.prev = 25;
            _context.next = 28;
            return fetch(cacheCheckoutUrl, {
              method: 'POST',
              headers: {
                'X-CSRFToken': csrfToken
              },
              body: formData
            });
          case 28:
            response = _context.sent;
            _context.prev = 29;
            _context.next = 32;
            return response.json();
          case 32:
            responseData = _context.sent;
            _context.next = 39;
            break;
          case 35:
            _context.prev = 35;
            _context.t0 = _context["catch"](29);
            console.error('Failed to parse response JSON:', _context.t0);
            responseData = {};
          case 39:
            if (!(response.status === 409 && responseData.error === 'payment_intent_unexpected_state')) {
              _context.next = 43;
              break;
            }
            console.error('Payment intent is in an unexpected state');
            handlePaymentIntentIssue(responseData.message || 'The payment session has expired. Please refresh the page to continue.');
            return _context.abrupt("return");
          case 43:
            if (response.ok) {
              _context.next = 52;
              break;
            }
            // Handle server error
            console.error('Server error:', responseData);
            showError(responseData.error || 'An error occurred. Please try again.');
            isSubmitting = false;
            submitButton.disabled = false;
            if (buttonText) buttonText.classList.remove('d-none');
            if (spinner) spinner.classList.add('d-none');
            if (loadingOverlay) loadingOverlay.style.display = 'none';
            return _context.abrupt("return");
          case 52:
            console.log('Cache checkout data successful');
            _context.next = 65;
            break;
          case 55:
            _context.prev = 55;
            _context.t1 = _context["catch"](25);
            console.error('Error during fetch operation:', _context.t1);
            showError('Network error. Please check your connection and try again.');
            isSubmitting = false;
            submitButton.disabled = false;
            if (buttonText) buttonText.classList.remove('d-none');
            if (spinner) spinner.classList.add('d-none');
            if (loadingOverlay) loadingOverlay.style.display = 'none';
            return _context.abrupt("return");
          case 65:
            _context.prev = 65;
            // Get the base URL
            baseUrl = window.location.origin; // Make sure origin ends with a trailing slash if needed
            if (!baseUrl.endsWith('/')) {
              baseUrl += '/';
            }

            // Get the form action URL
            formAction = form.action; // If form.action is a relative URL, construct a proper absolute URL
            if (formAction.startsWith('/') || !formAction.includes('://')) {
              // If it starts with /, it's already relative to origin
              if (formAction.startsWith('/')) {
                returnUrl = baseUrl + formAction.substring(1).replace('checkout', 'checkout/success');
              } else {
                // Otherwise it's relative to current path
                currentPath = window.location.pathname;
                currentDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
                returnUrl = baseUrl + currentDir + formAction.replace('checkout', 'checkout/success');
              }
            } else {
              // It's already an absolute URL
              returnUrl = formAction.replace('checkout', 'checkout/success');
            }

            // Ensure we don't have double slashes in the URL (except after protocol)
            returnUrl = returnUrl.replace(/([^:])\/\//g, '$1/');

            // Log the constructed URL for debugging
            console.log('Success return URL:', returnUrl);

            // Ensure the return URL is a valid absolute URL
            if (returnUrl.startsWith('http')) {
              _context.next = 74;
              break;
            }
            throw new Error('Return URL is not absolute: ' + returnUrl);
          case 74:
            // Additional validation: make sure it doesn't end with two slashes
            if (returnUrl.endsWith('//')) {
              returnUrl = returnUrl.slice(0, -1);
            }
            _context.next = 82;
            break;
          case 77:
            _context.prev = 77;
            _context.t2 = _context["catch"](65);
            // Fallback to a simple, reliable approach if there's any error
            console.error('Error constructing return URL:', _context.t2);
            returnUrl = window.location.origin + '/shop/checkout/success/';
            console.log('Using fallback return URL:', returnUrl);
          case 82:
            // Get shipping details to pass to Stripe
            shipping = getShippingDetails(); // Confirm payment using the Payment Element
            _context.next = 85;
            return stripe.confirmPayment({
              elements: elements,
              confirmParams: {
                // Return to checkout success page after payment
                return_url: returnUrl,
                shipping: shipping,
                receipt_email: getFieldValue('email')
              },
              redirect: 'if_required'
            });
          case 85:
            _yield$stripe$confirm = _context.sent;
            error = _yield$stripe$confirm.error;
            if (error) {
              // Handle payment confirmation error
              if (error.type === 'card_error' || error.type === 'validation_error') {
                showError(error.message);
              } else if (error.type === 'invalid_request_error' && (error.code === 'payment_intent_unexpected_state' || error.message.includes('is not available') || error.message.includes('payment_intent'))) {
                // Handle payment intent issues
                clearClientSecretData();
                handlePaymentIntentIssue('The payment session has expired. Please refresh the page to continue.');
              } else {
                showError('An unexpected error occurred.');
                console.error('Payment error:', error);
              }

              // Reset form state
              isSubmitting = false;
              submitButton.disabled = false;
              if (buttonText) buttonText.classList.remove('d-none');
              if (spinner) spinner.classList.add('d-none');
              if (loadingOverlay) loadingOverlay.style.display = 'none';
            } else {
              // The payment has been processed!
              console.log('Payment processing completed, form will be submitted');

              // Add payment intent ID to form if available
              paymentIntentIdField = document.getElementById('id_payment_intent_id');
              if (paymentIntentIdField && clientSecret) {
                paymentIntentIdField.value = clientSecret.split('_secret')[0];
              }

              // Update payment method type in form if needed
              paymentMethodTypeField = document.getElementById('id_payment_method_type');
              if (paymentMethodTypeField) {
                // Default to 'card' if not specified
                paymentMethodTypeField.value = 'card';
              }

              // Clear session storage as payment is being processed
              clearClientSecretData();

              // Submit the form to complete order processing
              form.submit();
            }
            _context.next = 99;
            break;
          case 90:
            _context.prev = 90;
            _context.t3 = _context["catch"](16);
            console.error('Error in checkout process:', _context.t3);
            // Show error to user
            showError(_context.t3.message || 'An unexpected error occurred. Please try again.');

            // Reset form state
            isSubmitting = false;
            submitButton.disabled = false;
            if (buttonText) buttonText.classList.remove('d-none');
            if (spinner) spinner.classList.add('d-none');
            if (loadingOverlay) loadingOverlay.style.display = 'none';
          case 99:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[16, 90], [25, 55], [29, 35], [65, 77]]);
    }));
    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  /**
   * Get shipping details from form fields
   * @returns {Object} Shipping details for Stripe
   */
  function getShippingDetails() {
    return {
      name: "".concat(getFieldValue('shipping_first_name'), " ").concat(getFieldValue('shipping_last_name')).trim(),
      address: {
        line1: getFieldValue('shipping_address1'),
        line2: getFieldValue('shipping_address2') || undefined,
        city: getFieldValue('shipping_city'),
        state: getFieldValue('shipping_state'),
        postal_code: getFieldValue('shipping_zipcode'),
        country: getFieldValue('shipping_country') || 'US'
      }
    };
  }

  // Auto-propagate contact info to shipping when empty
  var contactFields = [{
    source: 'first_name',
    target: 'shipping_first_name'
  }, {
    source: 'last_name',
    target: 'shipping_last_name'
  }];
  contactFields.forEach(function (pair) {
    var sourceField = document.getElementById("id_".concat(pair.source));
    var targetField = document.getElementById("id_".concat(pair.target));
    if (sourceField && targetField) {
      sourceField.addEventListener('change', function () {
        if (!targetField.value) {
          targetField.value = sourceField.value;
          // Billing check removed to eliminate error
        }
      });
    }
  });

  // Run initial cart verification
  verifyCartTotal();

  // Listen for resize events which might change the iframe size
  window.addEventListener('resize', function () {
    // Use debounce technique to prevent too many adjustments
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(function () {
      adjustContainerHeight();
      enhanceContainerHeightAdjustment();
    }, 200);
  });
  console.log('Checkout script with Payment Element initialization complete');
});
/******/ })()
;
//# sourceMappingURL=checkout.js.map