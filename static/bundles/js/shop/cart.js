(()=>{"use strict";function t(t){var e=null;if(document.cookie&&""!==document.cookie)for(var n=document.cookie.split(";"),o=0;o<n.length;o++){var r=n[o].trim();if(r.substring(0,t.length+1)===t+"="){e=decodeURIComponent(r.substring(t.length+1));break}}return e}function e(t){return e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},e(t)}function n(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,o(r.key),r)}}function o(t){var n=function(t){if("object"!=e(t)||!t)return t;var n=t[Symbol.toPrimitive];if(void 0!==n){var o=n.call(t,"string");if("object"!=e(o))return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t);return"symbol"==e(n)?n:n+""}var r=function(){return e=function e(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,e),this.errorHandler=n.errorHandler||console.error,this.baseUrl=n.baseUrl||"",this.csrfToken=t("csrftoken"),this.pendingRequests=[]},o=[{key:"buildUrl",value:function(t){return t.startsWith("http")||t.startsWith("/")?t:"".concat(this.baseUrl,"/").concat(t).replace(/([^:]\/)\/+/g,"$1")}},{key:"get",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return this.request("GET",t,e,n)}},{key:"post",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return this.request("POST",t,e,n)}},{key:"delete",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return this.request("DELETE",t,e,n)}},{key:"request",value:function(e,n){var o=this,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{},a=this.buildUrl(n),c=!1!==i.abortable,u=!(r instanceof FormData),s=!!u&&"application/x-www-form-urlencoded; charset=UTF-8";return new Promise((function(n,l){try{var d=function(e,n,o,r,i){var a=!(arguments.length>5&&void 0!==arguments[5])||arguments[5],c=!(arguments.length>6&&void 0!==arguments[6])||arguments[6],u=arguments.length>7&&void 0!==arguments[7]?arguments[7]:"application/x-www-form-urlencoded; charset=UTF-8";o instanceof FormData&&(c=!1,u=!1);var s={url:e,method:n,data:o,processData:c,contentType:u,headers:{"X-CSRFToken":t("csrftoken"),"X-Requested-With":"XMLHttpRequest"},success:function(t){"function"==typeof r&&("string"==typeof t&&t.trim().startsWith("<")?r({html:t}):r(t))},error:function(t,e,n){"abort"!==e&&(console.error("AJAX Request failed:",e,n),"function"==typeof i&&i(t,e,n))}};(e.includes("/api/")||e.endsWith(".json"))&&(s.dataType="json");var l=$.ajax(s);if(a)return l}(a,e,r,(function(t){o.removePendingRequest(d),n(t)}),(function(t,e,n){var r;o.removePendingRequest(d);var a={status:t.status,statusText:t.statusText,responseJSON:t.responseJSON,message:(null===(r=t.responseJSON)||void 0===r?void 0:r.error)||n||"Request failed"};o.errorHandler&&!i.skipGlobalErrorHandler&&o.errorHandler(a),l(a)}),c,u,s);c&&d&&o.pendingRequests.push(d),i.timeout&&setTimeout((function(){d&&d.readyState<4&&(d.abort(),l({message:"Request timed out",status:0,statusText:"timeout"}))}),i.timeout)}catch(t){console.error("Error making request:",t),l({message:t.message||"Failed to make request",error:t})}}))}},{key:"removePendingRequest",value:function(t){var e=this.pendingRequests.indexOf(t);-1!==e&&this.pendingRequests.splice(e,1)}},{key:"abortAll",value:function(){this.pendingRequests.forEach((function(t){t&&"function"==typeof t.abort&&t.abort()})),this.pendingRequests=[]}}],o&&n(e.prototype,o),Object.defineProperty(e,"prototype",{writable:!1}),e;var e,o}();function i(t){return i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},i(t)}function a(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(t);e&&(o=o.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,o)}return n}function c(t,e,n){return(e=s(e))in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function u(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,s(o.key),o)}}function s(t){var e=function(t){if("object"!=i(t)||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var n=e.call(t,"string");if("object"!=i(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t);return"symbol"==i(e)?e:e+""}new r;var l=function(){return t=function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.api=new r({errorHandler:this.handleApiError.bind(this)}),this.cartContainer=document.getElementById("cart-container"),this.cartTotal=document.getElementById("cart-total"),this.cartCount=document.getElementById("cart-count"),this.cartCountBadge=document.querySelector(".cart-count-badge"),this.initEventListeners()},e=[{key:"initEventListeners",value:function(){var t=this;document.querySelectorAll(".add-to-cart-form").forEach((function(e){e.addEventListener("submit",t.handleAddToCart.bind(t))})),document.querySelectorAll(".update-cart-form").forEach((function(e){e.addEventListener("submit",t.handleUpdateSubmit.bind(t))})),document.querySelectorAll(".remove-cart-item").forEach((function(e){e.addEventListener("click",t.handleRemoveItem.bind(t))})),this.initQuantityButtons()}},{key:"initQuantityButtons",value:function(){var t=this,e=document.getElementById("quantity"),n=document.getElementById("decrease-quantity"),o=document.getElementById("increase-quantity");n&&o&&e&&(n.addEventListener("click",(function(){var t=parseInt(e.value);t>1&&(e.value=t-1)})),o.addEventListener("click",(function(){var n=parseInt(e.value),o=parseInt(e.getAttribute("max"));n<o?e.value=n+1:t.showNotification("Maximum Quantity","Sorry, only ".concat(o," units available."),"info")})))}},{key:"handleAddToCart",value:function(t){var e,n=this;t.preventDefault();var o=t.target,r=o.action,i=new FormData(o),a=(null===(e=o.closest(".product-info"))||void 0===e||null===(e=e.querySelector("h1"))||void 0===e?void 0:e.textContent)||"Product",c=o.querySelector('button[type="submit"]');this.showNotification("Adding to Cart...","Please wait...","info",!1),this.api.post(r,i).then((function(t){t.success&&(c&&(c.classList.add("add-to-cart-animation"),setTimeout((function(){c.classList.remove("add-to-cart-animation")}),1500)),n.cartCount&&(n.cartCount.textContent=t.cart_count,n.cartCount.classList.add("cart-count-updated"),setTimeout((function(){n.cartCount.classList.remove("cart-count-updated")}),500)),n.cartCountBadge&&(n.cartCountBadge.textContent=t.cart_count,n.cartCountBadge.classList.remove("d-none")),n.showNotification("Added to Cart!","".concat(a," has been added to your cart."),"success",!0,{showDenyButton:!0,denyButtonText:"View Cart",denyButtonColor:"#198754",confirmButtonText:"Continue Shopping"}).then((function(t){t.isDenied&&(window.location.href="/shop/cart/")})))}))}},{key:"handleUpdateSubmit",value:function(t){var e=this;t.preventDefault();var n=t.target,o=n.action,r=new FormData(n);this.api.post(o,r).then((function(t){if(t.success){var o=n.closest("tr").querySelector(".item-subtotal");o&&(o.textContent="$".concat(t.item_subtotal),o.classList.add("highlight-update"),setTimeout((function(){o.classList.remove("highlight-update")}),1e3)),e.cartTotal&&(e.cartTotal.textContent="$".concat(t.cart_total),e.cartTotal.classList.add("highlight-update"),setTimeout((function(){e.cartTotal.classList.remove("highlight-update")}),1e3)),e.cartCountBadge&&(e.cartCountBadge.textContent=t.cart_count),e.showNotification("Cart Updated","Your cart has been updated successfully.","success",!0,{timer:2e3,timerProgressBar:!0,showConfirmButton:!1})}}))}},{key:"handleRemoveItem",value:function(t){var e=this;t.preventDefault();var n=t.currentTarget,o=n.href,r=n.dataset.productName||"this item";this.showConfirmation("Remove Item?","Are you sure you want to remove ".concat(r," from your cart?"),(function(){e.api.get(o).then((function(t){if(t.success){var o=n.closest("tr");o.classList.add("fade-out"),setTimeout((function(){o.remove(),e.cartTotal&&(e.cartTotal.textContent="$".concat(t.cart_total)),e.cartCountBadge&&(t.cart_count>0?e.cartCountBadge.textContent=t.cart_count:e.cartCountBadge.classList.add("d-none")),0===t.cart_count&&window.location.reload()}),300),e.showNotification("Item Removed","".concat(r," has been removed from your cart."),"success")}}))}))}},{key:"showConfirmation",value:function(t,e,n){"undefined"!=typeof Swal?Swal.fire({title:t,text:e,icon:"question",showCancelButton:!0,confirmButtonColor:"#dc3545",cancelButtonColor:"#6c757d",confirmButtonText:"Yes, remove it",cancelButtonText:"No, keep it"}).then((function(t){t.isConfirmed&&n()})):confirm(e)&&n()}},{key:"handleApiError",value:function(t){console.error("API Error:",t),this.showNotification("Error",t.message||"There was a problem with your request.","error")}},{key:"showNotification",value:function(t,e,n){var o=arguments.length>4&&void 0!==arguments[4]?arguments[4]:{};return"undefined"!=typeof Swal?Swal.fire(function(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?a(Object(n),!0).forEach((function(e){c(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}({title:t,text:e,icon:n,confirmButtonColor:"#0d6efd"},o)):(alert("".concat(t,": ").concat(e)),Promise.resolve())}}],e&&u(t.prototype,e),Object.defineProperty(t,"prototype",{writable:!1}),t;var t,e}();document.addEventListener("DOMContentLoaded",(function(){window.cartManager=new l}))})();