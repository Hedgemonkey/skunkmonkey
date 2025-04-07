/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./static/js/users/manage.js":
/*!***********************************!*\
  !*** ./static/js/users/manage.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/src/jquery.js");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var sweetalert2__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! sweetalert2 */ "./node_modules/sweetalert2/dist/sweetalert2.all.js");
/* harmony import */ var sweetalert2__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(sweetalert2__WEBPACK_IMPORTED_MODULE_1__);
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
 // Import jQuery
 // Import SweetAlert2
// import { displayMessages } from '../messages'; // Import displayMessages function from main.js

function displayMessage(title, text, icon) {
  sweetalert2__WEBPACK_IMPORTED_MODULE_1___default().fire({
    title: title,
    text: text,
    icon: icon,
    confirmButtonText: 'OK'
  });
}
jquery__WEBPACK_IMPORTED_MODULE_0___default()(function () {
  var currentUrl = null;
  function loadContent(targetDiv, url) {
    console.log("loadContent called with url:", url);
    if (url === currentUrl) {
      // If same URL clicked, hide the div
      jquery__WEBPACK_IMPORTED_MODULE_0___default()(targetDiv).hide();
      currentUrl = null;
    } else {
      // Otherwise (different URL), load content
      jquery__WEBPACK_IMPORTED_MODULE_0___default()(targetDiv + " .card-body").load(url, function (response, status, xhr) {
        if (status == "error") {
          var errorMessage = "Sorry, but there was an error loading the content. "; //error handling added
          jquery__WEBPACK_IMPORTED_MODULE_0___default()(targetDiv + " .card-body").html(errorMessage + xhr.status + " " + xhr.statusText);
          jquery__WEBPACK_IMPORTED_MODULE_0___default()(targetDiv).show(); // Show the div even on error to display the message
        } else {
          console.log("Content loaded successfully from:", url);
          currentUrl = url; // Update currentUrl after successful load
          // displayMessages(window.messages); // Display new messages
          attachFormSubmitHandler(targetDiv); // Attach form handler
          jquery__WEBPACK_IMPORTED_MODULE_0___default()(targetDiv).show();
        }
      });
    }
  }
  function attachFormSubmitHandler(targetDiv) {
    jquery__WEBPACK_IMPORTED_MODULE_0___default()(targetDiv + " form").on('submit', function (event) {
      event.preventDefault();
      var form = jquery__WEBPACK_IMPORTED_MODULE_0___default()(this);
      var url = form.attr("action");
      var formData = form.serialize();
      console.log("Form submitting to URL:", url);
      jquery__WEBPACK_IMPORTED_MODULE_0___default().ajax({
        type: "POST",
        url: url,
        data: formData,
        success: function success(response) {
          jquery__WEBPACK_IMPORTED_MODULE_0___default()(targetDiv + " .card-body").html(response);
          attachFormSubmitHandler(targetDiv); // Reattach the handler after content update
        },
        error: function error(xhr, status, _error) {
          console.error("AJAX error:", _error, xhr.status, xhr.statusText);
          var msg = "Sorry, but there was an error: ";
          jquery__WEBPACK_IMPORTED_MODULE_0___default()(targetDiv + " .card-body").html(msg + xhr.status + " " + _error); // Update on error
          attachFormSubmitHandler(targetDiv); // Reattach the handler
        }
      });
    });
  }
  jquery__WEBPACK_IMPORTED_MODULE_0___default()(document).on('click', '#cancel-edit, #view-details, #change-email-link, #change-password-link, #social-connections-link', function (event) {
    event.preventDefault();
    var url = jquery__WEBPACK_IMPORTED_MODULE_0___default()(this).data("url");
    loadContent("#manage-details", url);
  });
  jquery__WEBPACK_IMPORTED_MODULE_0___default()(document).on('click', '#edit-user-link', function (event) {
    // "Edit" click handler
    event.preventDefault();
    console.log("Edit User link clicked");
    var url = jquery__WEBPACK_IMPORTED_MODULE_0___default()(this).data("url");
    currentUrl = url;
    jquery__WEBPACK_IMPORTED_MODULE_0___default()("#user-details").load(url, function (response, status, xhr) {
      //Simplified logic
      if (status == "error") {
        var msg = "Sorry but there was an error: ";
        jquery__WEBPACK_IMPORTED_MODULE_0___default()("#user-details").html(msg + xhr.status + " " + xhr.statusText);
      }
      //After initial content load:
      attachFormSubmitHandler("#user-details");
      jquery__WEBPACK_IMPORTED_MODULE_0___default()("#edit-user-link").hide();
      jquery__WEBPACK_IMPORTED_MODULE_0___default()("#save-user-link").show(); // Add Save button
      jquery__WEBPACK_IMPORTED_MODULE_0___default()("#cancel-edit").show(); // Add Cancel button
      jquery__WEBPACK_IMPORTED_MODULE_0___default()(document).on("click", "#save-user-link", function (event) {
        event.preventDefault();
        jquery__WEBPACK_IMPORTED_MODULE_0___default()("#user-details-form").submit();
      });
      //Click handler for cancel button
      jquery__WEBPACK_IMPORTED_MODULE_0___default()("#cancel-edit").on('click', function (event) {
        event.preventDefault();
        var url = jquery__WEBPACK_IMPORTED_MODULE_0___default()(this).data("url");
        jquery__WEBPACK_IMPORTED_MODULE_0___default()("#user-details").load(url, function (response, status, xhr) {
          if (status === "error") {
            // ... (Handle errors if necessary) ...
          }
          attachFormSubmitHandler("#user-details"); // Reattach event handlers
          currentUrl = url;
        });
        jquery__WEBPACK_IMPORTED_MODULE_0___default()("#user-details").show();
      });
    });
    jquery__WEBPACK_IMPORTED_MODULE_0___default()(document).on("submit", "#user-details form", function (event) {
      event.preventDefault();
      var form = jquery__WEBPACK_IMPORTED_MODULE_0___default()(this);
      var url = form.attr("action");
      var formData = form.serialize();
      jquery__WEBPACK_IMPORTED_MODULE_0___default().ajax({
        type: "POST",
        url: url,
        data: formData,
        success: function success(response) {
          jquery__WEBPACK_IMPORTED_MODULE_0___default()("#manage-details .card-body").html(response); // Replace content of #user-details
          attachFormSubmitHandler("#manage-details .card-body"); // Reattach
        },
        error: function error(xhr, status, _error2) {
          if (xhr.status === 400) {
            //Handle form errors
            var errors = JSON.parse(xhr.responseText);
            jquery__WEBPACK_IMPORTED_MODULE_0___default()("#user-details").html(errors.form); // Update the form with errors
            console.log(errors.errors);
            attachFormSubmitHandler("#user-details"); // Reattach event listeners
          } else {
            var msg = "Sorry but there was an error: ";
            jquery__WEBPACK_IMPORTED_MODULE_0___default()("#user-details .card-body").html(msg + xhr.status + " " + _error2);
          }
        }
      });
    });
  });
  function handleAccountAction(_x) {
    return _handleAccountAction.apply(this, arguments);
  }
  function _handleAccountAction() {
    _handleAccountAction = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(action) {
      var actionUrl, actionText, successMessage, method, response, data, errorText;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            if (!(action === 'deactivate')) {
              _context.next = 7;
              break;
            }
            actionUrl = jquery__WEBPACK_IMPORTED_MODULE_0___default()("#deactivate-delete-link").data('deactivate-url');
            actionText = 'deactivate';
            successMessage = 'Deactivated';
            method = 'POST';
            _context.next = 15;
            break;
          case 7:
            if (!(action === 'delete')) {
              _context.next = 14;
              break;
            }
            actionUrl = jquery__WEBPACK_IMPORTED_MODULE_0___default()("#deactivate-delete-link").data('delete-url');
            actionText = 'permanently delete';
            successMessage = 'Deleted';
            method = 'DELETE';
            _context.next = 15;
            break;
          case 14:
            return _context.abrupt("return");
          case 15:
            _context.prev = 15;
            _context.next = 18;
            return fetch(actionUrl, {
              method: method,
              credentials: "same-origin",
              headers: {
                'X-CSRFToken': getCookie('csrftoken')
              }
            });
          case 18:
            response = _context.sent;
            if (response.ok) {
              _context.next = 31;
              break;
            }
            _context.next = 22;
            return response.json();
          case 22:
            data = _context.sent;
            if (!(data && data.messages)) {
              _context.next = 27;
              break;
            }
            displayMessages(data.messages);
            _context.next = 29;
            break;
          case 27:
            errorText = data && data.error ? data.error : "Server responded with status ".concat(response.status, " (").concat(response.statusText, ")"); //Check for error messages from server
            throw new Error(errorText);
          case 29:
            _context.next = 32;
            break;
          case 31:
            sweetalert2__WEBPACK_IMPORTED_MODULE_1___default().fire("".concat(successMessage, "!"), "Your account has been ".concat(actionText, "d."), 'success').then(function () {
              if (action === 'delete') {
                setTimeout(function () {
                  window.location.href = redirectUrl;
                }, 2000); //Redirect after slight delay to allow message to be seen
              } else {
                window.location.href = redirectUrl; // Redirect immediately after deactivation
              }
            });
          case 32:
            _context.next = 37;
            break;
          case 34:
            _context.prev = 34;
            _context.t0 = _context["catch"](15);
            // Catch any errors during the fetch or processing

            displayMessage('Error', _context.t0.message, 'error'); // Show error message from server if received, or the generic message.
          case 37:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[15, 34]]);
    }));
    return _handleAccountAction.apply(this, arguments);
  }
  jquery__WEBPACK_IMPORTED_MODULE_0___default()(document).on('click', '#deactivate-delete-link', function (event) {
    var _this = this;
    event.preventDefault();
    var deactivateRedirectUrl = jquery__WEBPACK_IMPORTED_MODULE_0___default()(this).data('deactivate-url');
    var deleteRedirectUrl = jquery__WEBPACK_IMPORTED_MODULE_0___default()(this).data('delete-url');
    sweetalert2__WEBPACK_IMPORTED_MODULE_1___default().fire({
      title: 'Manage Account',
      html: "\n                <p>Choose an action:</p>\n                <p><strong>Deactivate:</strong> To temporarily deactivate your account.</p>\n                <p><strong>OR</strong></p>\n                <div class=\"form-check\">\n                    <input class=\"form-check-input\" type=\"checkbox\" id=\"permanent-delete-checkbox\">\n                    <label class=\"form-check-label\" for=\"permanent-delete-checkbox\">\n                        <p><strong>Delete:</strong> Select this box to permanently delete your account.</p>\n                    </label>\n                    <p style=\"color:red; display: none;\" id=\"permanent-warning\">WARNING: THIS CANNOT BE UNDONE!</p>\n\n                </div>\n\n            ",
      icon: 'info',
      showCancelButton: true,
      showDenyButton: true,
      // Add deny button
      confirmButtonColor: '#ffc107',
      // Yellow for Deactivate
      cancelButtonColor: '#6c757d',
      // Gray for Cancel
      denyButtonColor: '#d33',
      // Red for Delete
      confirmButtonText: 'Deactivate',
      denyButtonText: "Delete",
      // Text for delete button

      // Function to disable/enable delete button based on checkbox
      didOpen: function didOpen() {
        var deleteCheckbox = document.getElementById('permanent-delete-checkbox');
        var denyButton = sweetalert2__WEBPACK_IMPORTED_MODULE_1___default().getDenyButton(); // Get deny button element
        var warning = document.getElementById("permanent-warning");
        denyButton.disabled = !deleteCheckbox.checked; // Disable initially

        deleteCheckbox.addEventListener('change', function () {
          denyButton.disabled = !deleteCheckbox.checked; // Disable/enable delete button.
          warning.style.display = deleteCheckbox.checked ? "block" : "none"; // Show/hide warning on checkbox change.
        });
      } // didOpen function ends here
    }).then(function (result) {
      if (result.isConfirmed) {
        // Deactivate
        // ... your deactivate logic ...
        var deactivateUrl = jquery__WEBPACK_IMPORTED_MODULE_0___default()(_this).data('deactivate-url');
        var actionText = 'deactivate';
        var successMessage = 'Deactivated';
        var method = 'POST';
        var _redirectUrl = deactivateRedirectUrl;
        sendAccountActionRequest(deactivateUrl, method, actionText, successMessage, _redirectUrl);
      } else if (result.isDenied) {
        // Delete (only if checkbox is checked)

        var deleteUrl = jquery__WEBPACK_IMPORTED_MODULE_0___default()(_this).data('delete-url');
        var _actionText = 'permanently delete';
        var _successMessage = 'Deleted';
        var _method = 'DELETE';
        var _redirectUrl2 = deleteRedirectUrl;
        sweetalert2__WEBPACK_IMPORTED_MODULE_1___default().fire({
          //Second Swal Alert to make sure!
          title: 'Are you sure you want to permanently delete your account?',
          text: "This action cannot be undone!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: "Yes, ".concat(_actionText, "!")
        }).then(function (result) {
          if (result.isConfirmed) {
            sendAccountActionRequest(deleteUrl, _method, _actionText, _successMessage, _redirectUrl2);
          }
        });
      }
    });
  });
  function sendAccountActionRequest(actionUrl, method, actionText, successMessage, redirectUrl) {
    fetch(actionUrl, {
      method: method,
      credentials: "same-origin",
      headers: {
        'X-CSRFToken': getCookie('csrftoken')
      }
    }).then(function (response) {
      if (response.ok) {
        sweetalert2__WEBPACK_IMPORTED_MODULE_1___default().fire("".concat(successMessage, "!"), "Your account has been ".concat(actionText, "d."), 'success').then(function () {
          window.location.href = redirectUrl; // Redirect
        });
      } else {
        response.json().then(function (data) {
          displayMessages(data.messages || []); // Display error messages
        })["catch"](function () {
          displayMessage("Error", "There was a problem ".concat(actionText, "ing your account. Please try again."), "error");
        });
      }
    });
  }
  jquery__WEBPACK_IMPORTED_MODULE_0___default()("#permanent-delete-checkbox").on('change', function (event) {
    jquery__WEBPACK_IMPORTED_MODULE_0___default()("#perminant-warning").toggle(jquery__WEBPACK_IMPORTED_MODULE_0___default()(this).prop("checked"));
  });
  function getCookie(name) {
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
/******/ 			"js/user/user_manage": 0
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
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors"], () => (__webpack_require__("./static/js/users/manage.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=user_manage.js.map