/**
 * Wishlist Initializer
 * 
 * This script initializes the wishlist functionality by importing and instantiating
 * the WishlistManager class. It serves as an entry point for webpack to bundle
 * the wishlist functionality.
 */

import WishlistManager from './wishlist-manager.js';

// Initialize wishlist functionality
console.log('Initializing wishlist functionality');

// Create a global instance of the WishlistManager
let wishlistManager;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the wishlist manager
    wishlistManager = new WishlistManager();
    
    // Make it available globally
    window.wishlistManager = wishlistManager;
});

// Export the wishlist manager for module usage
export default wishlistManager;
