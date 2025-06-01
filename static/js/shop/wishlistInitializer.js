import{W as l}from"../chunks/WishlistManager.DmSBy4bw.js";let s=null;function n(){try{s=new l(null),window.wishlistManager=s,e(),window.location.pathname.includes("/wishlist/")&&o(),console.log("[WishlistInitializer] Wishlist functionality initialized successfully")}catch(i){console.error("[WishlistInitializer] Error initializing wishlist functionality:",i)}}function e(){document.addEventListener("click",i=>{const t=i.target.closest(".add-to-wishlist-btn, .remove-wishlist-btn, .wishlist-btn");t&&s&&(console.log("[WishlistInitializer] Wishlist button clicked:",t),s.handleWishlistButtonClick(i,t))}),console.log("[WishlistInitializer] Wishlist button event handlers initialized")}function o(){if(console.log("[WishlistInitializer] Wishlist page specific functionality initialized"),document.querySelectorAll(".wishlist-item, .product-card").length===0){const t=document.querySelector(".container main, .wishlist-container");t&&(t.innerHTML=`
                <div class="empty-wishlist alert alert-info text-center my-5">
                    <i class="fas fa-heart-broken mb-3" style="font-size: 3rem;"></i>
                    <h3>Your wishlist is empty</h3>
                    <p class="mb-3">You haven't added any products to your wishlist yet.</p>
                    <a href="/shop/" class="btn btn-primary">
                        <i class="fas fa-shopping-bag me-2"></i>Browse Products
                    </a>
                </div>
            `)}}document.addEventListener("DOMContentLoaded",n);window.initWishlist=n;
