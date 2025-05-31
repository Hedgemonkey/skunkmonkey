import"./wishlistManager.js";import"./apiClient.js";import"./ajax_helper.77meLuHN.js";import"./vendor-common.B4uieipM.js";/* empty css                       */function s(){window.location.pathname.includes("/wishlist/")&&e(),console.log("[WishlistInitializer] Wishlist functionality initialized")}function e(){if(console.log("[WishlistInitializer] Wishlist page specific functionality initialized"),document.querySelectorAll(".wishlist-item, .product-card").length===0){const i=document.querySelector(".container main, .wishlist-container");i&&(i.innerHTML=`
                <div class="empty-wishlist alert alert-info text-center my-5">
                    <i class="fas fa-heart-broken mb-3" style="font-size: 3rem;"></i>
                    <h3>Your wishlist is empty</h3>
                    <p class="mb-3">You haven't added any products to your wishlist yet.</p>
                    <a href="/shop/" class="btn btn-primary">
                        <i class="fas fa-shopping-bag me-2"></i>Browse Products
                    </a>
                </div>
            `)}}document.addEventListener("DOMContentLoaded",s);
