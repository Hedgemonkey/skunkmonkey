import{B as o}from"../products/baseManager.js";import{S as r}from"../chunks/chunks/vendor/common.Dz0GDR6V.js";/* empty css                               */import"../chunks/ajax_helper.EulIYOr7.js";class n extends o{constructor(t={}){super({...t,itemType:"order",notifications:t.notifications||{displaySuccess:e=>{r.fire({title:"Success",text:e,icon:"success",confirmButtonColor:"#0d6efd"})},displayError:e=>{r.fire({title:"Error",text:e,icon:"error",confirmButtonColor:"#0d6efd"})},displaySwalError:(e,i)=>{var s;r.fire({title:"Error",text:((s=e.responseJSON)==null?void 0:s.error)||i,icon:"error",confirmButtonColor:"#0d6efd"})}}}),this.options={checkoutFormSelector:"#checkout-form",termsCheckboxSelector:"#terms-check",termsLinkSelector:"#terms-link",placeOrderButtonSelector:"#place-order-btn",...t},this.stripeElements=null,this.stripe=null,this.initEventListeners()}initEventListeners(){const t=document.querySelector(this.options.termsLinkSelector);t&&t.addEventListener("click",i=>{i.preventDefault(),this.showTermsAndConditions()});const e=document.querySelector(this.options.checkoutFormSelector);e&&e.addEventListener("submit",i=>{i.preventDefault(),this.validateAndSubmitForm(e)})}showTermsAndConditions(){r.fire({title:"Terms and Conditions",html:`
                <div class="text-start">
                    <h6 class="mb-2">1. General Terms</h6>
                    <p class="mb-3">By placing an order with SkunkMonkey, you agree to these terms and conditions.</p>

                    <h6 class="mb-2">2. Payment</h6>
                    <p class="mb-3">All payments are processed securely. We accept major credit cards and payment platforms.</p>

                    <h6 class="mb-2">3. Shipping</h6>
                    <p class="mb-3">Orders are usually processed within 1-2 business days. Shipping times vary by location.</p>

                    <h6 class="mb-2">4. Returns</h6>
                    <p class="mb-3">We accept returns within 14 days of delivery. Items must be unused and in original packaging.</p>

                    <h6 class="mb-2">5. Privacy</h6>
                    <p class="mb-3">Your personal information is kept secure and only used for order processing and delivery.</p>
                </div>
            `,width:"600px",confirmButtonText:"I Understand",confirmButtonColor:"#0d6efd",showClass:{popup:"animate__animated animate__fadeInDown"},hideClass:{popup:"animate__animated animate__fadeOutUp"}})}validateAndSubmitForm(t){const e=document.querySelector(this.options.termsCheckboxSelector);if(!e||!e.checked){r.fire({title:"Terms Required",text:"You must agree to the terms and conditions to proceed.",icon:"warning",confirmButtonColor:"#0d6efd"});return}r.fire({title:"Processing Order",html:"Please wait while we process your order...",allowOutsideClick:!1,didOpen:()=>{r.showLoading(),t.submit()}})}initStripeElements(){console.log("Stripe Elements would be initialized here in the future")}fetchItems(){}initializeFilters(){}}document.addEventListener("DOMContentLoaded",()=>{window.checkoutManager=new n});
