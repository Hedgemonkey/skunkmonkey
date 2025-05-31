/**
 * Wishlist Initializer
 * Bootstraps the wishlist functionality when the page loads
 */

// Import the wishlist CSS
import '../css/wishlist.css';

// Import the WishlistManager for handling button functionality
import { WishlistManager } from './managers/WishlistManager.js';

// Global wishlist manager instance
let wishlistManager = null;

/**
 * Initialize wishlist functionality
 */
function initWishlist() {
    try {
        // Initialize the WishlistManager (pass null since we don't have ProductListManager)
        wishlistManager = new WishlistManager(null);

        // Make it globally accessible for detection by other modules
        window.wishlistManager = wishlistManager;

        // Set up event delegation for wishlist buttons
        initWishlistButtonHandlers();

        // Check if we're on the wishlist page
        const isWishlistPage = window.location.pathname.includes('/wishlist/');

        if (isWishlistPage) {
            // Initialize special wishlist page functionality
            initWishlistPage();
        }

        console.log('[WishlistInitializer] Wishlist functionality initialized successfully');
    } catch (error) {
        console.error('[WishlistInitializer] Error initializing wishlist functionality:', error);
    }
}

/**
 * Initialize event handlers for wishlist buttons
 */
function initWishlistButtonHandlers() {
    // Use event delegation to handle both existing and dynamically added wishlist buttons
    document.addEventListener('click', (event) => {
        const wishlistBtn = event.target.closest('.add-to-wishlist-btn, .remove-wishlist-btn, .wishlist-btn');

        if (wishlistBtn && wishlistManager) {
            console.log('[WishlistInitializer] Wishlist button clicked:', wishlistBtn);
            wishlistManager.handleWishlistButtonClick(event, wishlistBtn);
        }
    });

    console.log('[WishlistInitializer] Wishlist button event handlers initialized');
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

// Make initWishlist globally accessible for detection by other modules
window.initWishlist = initWishlist;

// Export both as named export and default export for compatibility
export { initWishlist };
export default { initWishlist };
