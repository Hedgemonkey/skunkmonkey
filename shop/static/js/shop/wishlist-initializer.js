/**
 * Wishlist Initializer
 * Bootstraps the wishlist functionality when the page loads
 */

import wishlistManager from './wishlist-manager.js';

/**
 * Initialize wishlist functionality
 */
function initWishlist() {
    // The wishlist manager is automatically initialized on import,
    // but we can perform additional initialization here if needed

    // Check if we're on the wishlist page
    const isWishlistPage = window.location.pathname.includes('/wishlist/');

    if (isWishlistPage) {
        // Initialize special wishlist page functionality
        initWishlistPage();
    }

    console.log('[WishlistInitializer] Wishlist functionality initialized');
}

/**
 * Initialize wishlist page specific functionality
 */
function initWishlistPage() {
    // Add any wishlist page specific functionality here
    console.log('[WishlistInitializer] Wishlist page specific functionality initialized');

    // Example: Add empty wishlist check
    const wishlistItems = document.querySelectorAll('.wishlist-item, .product-card');
    if (wishlistItems.length === 0) {
        const container = document.querySelector('.container main, .wishlist-container');
        if (container) {
            container.innerHTML = `
                <div class="empty-wishlist alert alert-info text-center my-5">
                    <i class="fas fa-heart-broken mb-3" style="font-size: 3rem;"></i>
                    <h3>Your wishlist is empty</h3>
                    <p class="mb-3">You haven't added any products to your wishlist yet.</p>
                    <a href="/shop/" class="btn btn-primary">
                        <i class="fas fa-shopping-bag me-2"></i>Browse Products
                    </a>
                </div>
            `;
        }
    }
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initWishlist);

// Also export the init function to allow manual initialization
export { initWishlist };
