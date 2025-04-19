/**
 * Wishlist Manager
 * Handles wishlist functionality for the shop
 */
import '../css/wishlist.css';
import apiClient from '@core/api-client.js';

/**
 * WishlistManager class for handling wishlist functionality
 */
class WishlistManager {
    /**
     * Initialize the WishlistManager
     */
    constructor() {
        // Initialize properties BEFORE calling methods that use them
        this.toastQueue = []; // Queue for storing toast notifications
        this.processingToast = false; // Flag to track if a toast is currently being processed
        this.debug = true; // Enable debug logging
        this.wishlistItems = new Set(); // Store wishlist item IDs <-- Initialize this FIRST

        this.initialize(); // Now call initialize, which uses this.wishlistItems
    }

    /**
     * Initialize the wishlist manager with error handling
     */
    initialize() {
        try {
            // Initialize the wishlist items set from any data available
            this.initializeWishlistItems();
            this.initEventListeners();
            this.checkSweetAlert2Availability();

            // Process any queued toasts once SweetAlert2 is available
            document.addEventListener('swal2-initialized', () => {
                this.log('SweetAlert2 initialized event received, processing queued toasts');
                this.processToastQueue();
            });
        } catch (error) {
            console.error('Error initializing Wishlist Manager:', error);
        }
    }

    /**
     * Initialize the wishlist items set from the DOM
     */
    initializeWishlistItems() {
        // Try to get wishlist count from the DOM
        const wishlistCountElements = document.querySelectorAll('.wishlist-count');
        if (wishlistCountElements.length > 0) {
            const count = parseInt(wishlistCountElements[0].textContent, 10);
            this.log('Initial wishlist count:', count);
        }

        // Try to collect wishlist product IDs from data attributes or classes
        document.querySelectorAll('.remove-wishlist-btn, .wishlist-btn.active').forEach(btn => {
            const productId = btn.dataset.productId;
            if (productId) {
                this.wishlistItems.add(productId);
                this.log('Added product to initial wishlist set:', productId);
            }
        });

        // Look for wishlist product IDs in a data attribute on the body or a hidden input
        const wishlistDataElement = document.getElementById('wishlist-data');
        if (wishlistDataElement) {
            try {
                const wishlistData = JSON.parse(wishlistDataElement.value);
                if (Array.isArray(wishlistData)) {
                    wishlistData.forEach(id => this.wishlistItems.add(id.toString()));
                    this.log('Initialized wishlist items from data element:', wishlistData);
                }
            } catch (e) {
                console.error('Error parsing wishlist data:', e);
            }
        }

        this.log('Initialized wishlist items:', [...this.wishlistItems]);
    }

    /**
     * Log debug messages if debug mode is enabled
     * @param {...any} args - Arguments to log
     */
    log(...args) {
        if (this.debug) {
            console.log('[WishlistManager]', ...args);
        }
    }

    /**
     * Check if SweetAlert2 is available and log the result
     */
    checkSweetAlert2Availability() {
        if (typeof window.Swal !== 'undefined') {
            this.log('SweetAlert2 is available for WishlistManager.');
            // Dispatch an event to signal SweetAlert2 is available
            document.dispatchEvent(new Event('swal2-initialized'));
        } else {
            console.warn('SweetAlert2 is not available for WishlistManager. Toast notifications will fall back to alerts.');
            // Set up a listener to check again when main.js might have loaded SweetAlert2
            window.addEventListener('load', () => {
                setTimeout(() => {
                    if (typeof window.Swal !== 'undefined') {
                        this.log('SweetAlert2 became available after window load');
                        document.dispatchEvent(new Event('swal2-initialized'));
                    } else {
                        // Try to load SweetAlert2 dynamically as a last resort
                        this.loadSweetAlert2Dynamically();
                    }
                }, 500);
            });
        }
    }

    /**
     * Try to load SweetAlert2 dynamically if it's not available
     */
    loadSweetAlert2Dynamically() {
        if (typeof window.Swal === 'undefined') {
            this.log('Attempting to load SweetAlert2 dynamically');

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
            script.onload = () => {
                this.log('SweetAlert2 loaded dynamically');
                document.dispatchEvent(new Event('swal2-initialized'));
            };
            script.onerror = (e) => {
                console.error('Failed to load SweetAlert2 dynamically:', e);
            };
            document.head.appendChild(script);
        }
    }

    /**
     * Initialize event listeners for wishlist buttons
     */
    initEventListeners() {
        // Use a single unified selector for all wishlist buttons
        const wishlistBtnSelector = '.wishlist-btn, .add-to-wishlist-btn, .remove-wishlist-btn';

        // Handle existing buttons
        document.querySelectorAll(wishlistBtnSelector).forEach(btn => {
            if (!btn.hasAttribute('data-event-bound')) {
                btn.setAttribute('data-event-bound', 'true');
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleWishlistToggle(e);
                });
            }
        });

        // Use delegation for future buttons
        document.addEventListener('click', (event) => {
            const toggleBtn = event.target.closest(wishlistBtnSelector);
            if (toggleBtn && !toggleBtn.hasAttribute('data-event-bound')) {
                // Check if this specific button already has a direct listener to avoid double handling
                if (!toggleBtn.getAttribute('data-event-bound')) {
                    toggleBtn.setAttribute('data-event-bound', 'true'); // Mark for delegation handling
                     // Add the listener directly here as well, ensures it works even if mutation observer misses it
                    toggleBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.handleWishlistToggle(e);
                    });
                    // Trigger the handler immediately for this click
                    this.handleWishlistToggle(event);
                    event.preventDefault();
                }
            }
        });


        // Add a mutation observer to handle dynamically added buttons
        this.setupMutationObserver();

        this.log('Wishlist event listeners initialized');
    }

    /**
     * Setup mutation observer to watch for dynamically added buttons
     */
    setupMutationObserver() {
        const wishlistBtnSelector = '.wishlist-btn:not([data-event-bound]), .add-to-wishlist-btn:not([data-event-bound]), .remove-wishlist-btn:not([data-event-bound])';
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if the added node itself is a button
                            if (node.matches(wishlistBtnSelector)) {
                                this.bindWishlistButtonListener(node);
                            }
                            // Check for buttons within the added node
                            const wishlistBtns = node.querySelectorAll(wishlistBtnSelector);
                            wishlistBtns.forEach((btn) => {
                                this.bindWishlistButtonListener(btn);
                            });
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        this.log('Mutation observer set up for wishlist buttons.');
    }

     /**
     * Binds the click listener to a wishlist button if not already bound.
     * @param {HTMLElement} btn - The button element.
     */
    bindWishlistButtonListener(btn) {
        if (!btn.hasAttribute('data-event-bound')) {
            btn.setAttribute('data-event-bound', 'true');
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleWishlistToggle(e);
            });
            this.log('Bound listener to dynamically added button:', btn);
        }
    }

    /**
     * Handle toggling an item in the wishlist
     * Handle toggling an item in the wishlist.
     * REVISED: Stores original content, restores in finally.
     * @param {Event} event - The click event
     */
    handleWishlistToggle(event) {
        const button = event.currentTarget || event.target.closest('.wishlist-btn, .add-to-wishlist-btn, .remove-wishlist-btn');
        if (!button) {
            this.log('Wishlist toggle handler called but no button found.');
            return;
        }

        // Prevent multiple rapid clicks
        if (button.classList.contains('disabled')) {
            this.log('Button already processing, ignoring click.');
            return;
        }

        const productId = button.dataset.productId;
        if (!productId) {
            console.error("Wishlist button missing data-product-id:", button);
            this.showToast('Error', 'Product ID missing.', 'error');
            return; // Stop if no product ID
        }
        const productName = button.dataset.productName || 'Product';
        const isCurrentlyInWishlist = this.wishlistItems.has(productId);
        this.log(`Toggling product ${productId}: Currently in Wishlist? ${isCurrentlyInWishlist}`);

        // --- Store original content BEFORE showing spinner ---
        const originalContent = button.innerHTML;
        let originalDisabledState = button.disabled; // Store original disabled state

        // Show spinner and disable
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
        button.disabled = true; // Use disabled attribute
        button.classList.add('disabled'); // Keep class for styling

        const url = `/shop/wishlist/toggle/${productId}/`;
        this.log('POSTing to:', url);

        apiClient.post(url, { product_id: productId })
            .then(response => {
                // ... (Keep the .then() logic for parsing, determining final state, updating Set, showing toast, removing item) ...
                this.log('Raw response:', response);
                let data;
                try {
                    if (typeof response === 'object' && response !== null) data = response;
                    else if (typeof response === 'string' && response.trim() !== '') data = JSON.parse(response);
                    else throw new Error('Invalid or empty response');
                } catch (error) {
                    console.error('Parse error:', error, 'Raw:', response);
                    this.showToast('Error', 'Received invalid data.', 'error');
                    // Return an object indicating error for finally block
                    return { finalState: isCurrentlyInWishlist, errorOccurred: true };
                }

                let finalIsInWishlist = isCurrentlyInWishlist;
                let actionSucceeded = false;
                if (typeof data.success === 'boolean' && data.success) {
                    actionSucceeded = true;
                    // Determine final state based on server response
                    if (data.isInWishlist !== undefined) {
                        finalIsInWishlist = data.isInWishlist;
                    } else if (data.added !== undefined) {
                        finalIsInWishlist = data.added;
                    } else if (data.removed !== undefined) {
                        finalIsInWishlist = !data.removed;
                    } else {
                        // Fallback if server doesn't provide state (less ideal)
                        finalIsInWishlist = !isCurrentlyInWishlist;
                        this.log('Warning: Server response did not explicitly state added/removed/isInWishlist status. Inferring state.');
                    }

                    this.log('API Success. Final state:', finalIsInWishlist);
                    // Update local set
                    if (finalIsInWishlist) this.wishlistItems.add(productId);
                    else this.wishlistItems.delete(productId);
                    this.log('Updated local Set:', [...this.wishlistItems]);

                    // Show toast
                    const actionType = finalIsInWishlist ? 'Added to' : 'Removed from';
                    this.showToast(`${actionType} Wishlist`, data.message || `${productName} ${actionType.toLowerCase()} wishlist.`, finalIsInWishlist ? 'success' : 'info');

                    // Update global count if provided
                    if (data.wishlist_count !== undefined) {
                        this.updateWishlistCount(data.wishlist_count);
                    }

                    // Handle removal from wishlist page
                    if (!finalIsInWishlist && window.location.pathname.includes('/wishlist/')) {
                         this.removeItemFromWishlistPage(button);
                    }
                } else {
                    actionSucceeded = false;
                    this.log('API Failure:', data.message || data.error || 'Unknown error.');
                    this.showToast('Error', data.message || data.error || 'Failed to update.', 'error');
                }
                // Return state for finally block
                return { finalState: finalIsInWishlist, errorOccurred: !actionSucceeded };
            })
            .catch(error => {
                // ... (Keep the .catch() logic for logging, showing error toast) ...
                console.error('API Call Error:', error);
                let errorMessage = 'Update failed. Check connection.';
                 if (error && typeof error === 'object') {
                     errorMessage = error.message || (error.response && error.response.data && (error.response.data.detail || error.response.data.error)) || errorMessage;
                 } else if (typeof error === 'string') {
                     errorMessage = error;
                 }
                this.showToast('Error', errorMessage, 'error');
                // Return state for finally block
                return { finalState: isCurrentlyInWishlist, errorOccurred: true };
            })
            .finally(() => { // Removed the result parameter as it's not reliably passed from catch/then in all scenarios
                // --- RELIABLE SPINNER REMOVAL ---
                // Always get the definitive state from the Set *inside* finally
                const finalState = this.wishlistItems.has(productId);
                this.log(`Finally block. Definitive final state from Set: ${finalState}. Restoring button ${productId}.`);

                 const buttonsToRestore = document.querySelectorAll(`.wishlist-btn[data-product-id="${productId}"], .add-to-wishlist-btn[data-product-id="${productId}"], .remove-wishlist-btn[data-product-id="${productId}"]`);

                 buttonsToRestore.forEach(btn => {
                    // 1. Restore original content if it's currently showing ONLY the spinner
                    const spinner = btn.querySelector('span.spinner-border');
                    if (spinner && btn.children.length === 1 && btn.firstChild === spinner) {
                         btn.innerHTML = originalContent;
                         this.log(`Restored original content for button:`, btn);
                    } else {
                         this.log(`Button content not just spinner, skipping content restore for:`, btn);
                    }

                    // 2. Remove disabled state/class
                    btn.disabled = originalDisabledState; // Restore original disabled property
                    btn.classList.remove('disabled', 'wishlist-btn-active'); // Remove active class too

                    // 3. Update visual state (icon, classes) AFTER restoring content/enabled state
                    this.updateWishlistButtonVisualState(btn, finalState); // Use definitive finalState from Set
                 });

                // Update global count based on final Set size
                this.updateWishlistCount(this.wishlistItems.size);
                this.log(`Finished processing toggle for product ${productId}.`);
            });
    }

    /**
     * Update all buttons for a specific product ID to reflect the current wishlist state.
     * @param {string} productId - The product ID.
     * @param {boolean} isInWishlist - The definitive state whether the product IS in the wishlist.
     */
    updateAllButtonsForProduct(productId, isInWishlist) {
        if (!productId) return;
        this.log(`Updating all buttons for product ${productId} to state: ${isInWishlist ? 'IN wishlist' : 'NOT in wishlist'}`);

        const buttons = document.querySelectorAll(
            `.wishlist-btn[data-product-id="${productId}"], ` +
            `.add-to-wishlist-btn[data-product-id="${productId}"], ` +
            `.remove-wishlist-btn[data-product-id="${productId}"]`
        );

        if (buttons.length === 0) {
             this.log(`No buttons found for product ${productId} to update.`);
             return;
        }

        buttons.forEach(button => {
             this.updateWishlistButtonVisualState(button, isInWishlist);
             // Ensure button is enabled after update (might have been disabled during API call)
             button.classList.remove('disabled', 'wishlist-btn-active');
             // Restore original content if spinner was present (safer check)
             const spinner = button.querySelector('.spinner-border');
             if(spinner) {
                // Need to know what the original content *should* be based on state
                // Assuming simple icon or text change happens in updateWishlistButtonVisualState
                // If original content varies wildly, this needs more complex state management
             }
        });
    }

    /**
     * Updates the visual appearance (classes, icon, title, aria-label, href) of a single wishlist button.
     * SIMPLIFIED: Only sets state based on isInWishlist, does NOT handle spinner removal or content restoration.
     * @param {HTMLElement} button - The button element to update.
     * @param {boolean} isInWishlist - Whether the product IS currently in the wishlist.
     */
    updateWishlistButtonVisualState(button, isInWishlist) {
        if (!button) return;

        const productName = button.dataset.productName || 'this product';
        const productId = button.dataset.productId;
        const icon = button.querySelector('i');

        // --- Update Button Classes ---
        if (isInWishlist) {
            button.classList.remove('add-to-wishlist-btn');
            button.classList.add('remove-wishlist-btn', 'active');
        } else {
            button.classList.remove('remove-wishlist-btn', 'active');
            button.classList.add('add-to-wishlist-btn');
        }

        // --- Update Icon Classes ---
        if (icon) {
            // Ensure correct icon state based on isInWishlist
            if (isInWishlist) {
                // ** CHANGE: Set SOLID heart as the default for "Remove" state **
                icon.classList.remove('far', 'fa-heart-broken', 'fa-heart-o'); // Remove others
                icon.classList.add('fas', 'fa-heart');                     // Add SOLID heart
            } else {
                // For "Add" state: Use regular outline heart (FA5 Free)
                icon.classList.remove('fas', 'fa-heart-broken', 'fa-heart', 'fa-heart-o'); // Remove others
                icon.classList.add('far', 'fa-heart');                  // Add outline heart
            }
        }

        // --- Update Title and Aria-label ---
        if (isInWishlist) {
            button.setAttribute('title', `Remove ${productName} from wishlist`);
            button.setAttribute('aria-label', `Remove ${productName} from wishlist`);
        } else {
            button.setAttribute('title', `Add ${productName} to wishlist`);
            button.setAttribute('aria-label', `Add ${productName} to wishlist`);
        }

        // --- Always update href ---
        if (productId) {
            button.setAttribute('href', `/shop/wishlist/toggle/${productId}/`);
        }

        // --- Mark state as set (for observer/debugging) ---
        button.setAttribute('data-visual-state-set', isInWishlist ? 'in' : 'out');

        // --- DO NOT handle spinner/disabled here - handled in finally block ---
        // --- DO NOT handle innerHTML restoration here - handled in finally block ---
    }

    /**
     * Remove an item visually from the wishlist page after successful removal via API.
     * @param {HTMLElement} button - The 'remove' button that was clicked.
     */
    removeItemFromWishlistPage(button) {
        const card = button.closest('.product-card, .wishlist-item');
        if (!card) {
            this.log('Could not find product card/item to remove from wishlist page.');
            return;
        }

        // Find the most appropriate container to remove (e.g., the grid column or list item)
        const container = card.closest('.col, .wishlist-item-container, li, div.product-entry'); // Add more selectors if needed
        const elementToRemove = container || card; // Fallback to removing the card itself

        this.log('Removing wishlist item element:', elementToRemove);

        // Animate removal
        elementToRemove.style.transition = 'opacity 0.5s ease, transform 0.5s ease, height 0.5s ease, margin 0.5s ease, padding 0.5s ease';
        elementToRemove.style.opacity = '0';
        elementToRemove.style.transform = 'scale(0.8)';
        elementToRemove.style.height = '0'; // Collapse height
        elementToRemove.style.marginTop = '0';
        elementToRemove.style.marginBottom = '0';
        elementToRemove.style.paddingTop = '0';
        elementToRemove.style.paddingBottom = '0';
        elementToRemove.style.borderWidth = '0'; // Collapse border


        setTimeout(() => {
            elementToRemove.remove();
            this.log('Wishlist item removed from DOM.');

            // Check if wishlist is now empty
            const remainingItems = document.querySelectorAll('.product-card, .wishlist-item');
            this.log('Remaining wishlist items on page:', remainingItems.length);
            if (remainingItems.length === 0) {
                this.displayEmptyWishlistMessage();
            } else {
                // Update count just in case it wasn't updated by API response
                this.updateWishlistCount(remainingItems.length);
            }
        }, 500); // Match animation duration
    }

    /**
     * Displays a message indicating the wishlist is empty.
     */
    displayEmptyWishlistMessage() {
         this.log('Displaying empty wishlist message.');
        const mainContent = document.querySelector('.container main, .wishlist-container, .content-section, #main-content'); // More robust selector
        if (mainContent) {
            // Clear existing content within the main area *carefully*
            // Avoid wiping out headers/footers if they are inside the selected container
             const wishlistGrid = mainContent.querySelector('.row.wishlist-items, #wishlist-items-container'); // Target specific container if possible
             const containerToEmpty = wishlistGrid || mainContent;

             containerToEmpty.innerHTML = `
                <div class="empty-wishlist alert alert-info text-center my-5 col-12">
                    <i class="fas fa-heart-broken fa-3x mb-3"></i>
                    <h3 class="alert-heading">Your Wishlist is Empty</h3>
                    <p class="lead mb-4">You haven't added any products yet. Start exploring!</p>
                    <a href="/shop/" class="btn btn-primary btn-lg">
                        <i class="fas fa-shopping-bag me-2"></i>Browse Products
                    </a>
                </div>
            `;
            // Ensure count is zero
            this.updateWishlistCount(0);
        } else {
             this.log('Could not find main content area to display empty wishlist message.');
        }
    }

    /**
     * Update the wishlist count in the UI
     * @param {number} count - The new wishlist count
     */
    updateWishlistCount(count) {
        if (count !== undefined && !isNaN(count)) {
            this.log('Updating wishlist count UI elements to:', count);
            document.querySelectorAll('.wishlist-count').forEach(element => {
                element.textContent = count;
                // Optional: Add animation or visual feedback on change
                element.classList.add('animate__animated', 'animate__bounceIn');
                element.onanimationend = () => element.classList.remove('animate__animated', 'animate__bounceIn');


                // Hide/show container based on count
                 const counterContainer = element.closest('.wishlist-count-container') || element; // Use element itself if no specific container
                if (counterContainer) {
                    counterContainer.style.display = count === 0 ? 'none' : ''; // Use style.display for better control
                }
            });
        } else {
             this.log('Invalid count received for UI update:', count);
        }
    }

    /**
     * Add a toast to the queue and process it
     * @param {string} title - The notification title
     * @param {string} message - The notification message (can be HTML).
     * @param {string} type - Notification type ('success', 'error', 'warning', 'info', 'question').
     */
    showToast(title, message, type = 'info') {
        this.log('Queueing toast:', { title, message, type });
        this.toastQueue.push({ title, message, type });
        if (!this.processingToast) {
            this.processToastQueue();
        }
    }

    /**
     * Process the next toast notification in the queue.
     */
    processToastQueue() {
        if (this.toastQueue.length === 0) {
            this.processingToast = false;
            this.log('Toast queue empty.');
            return;
        }

        this.processingToast = true;
        const toastToShow = this.toastQueue.shift();
        this.log('Processing toast from queue:', toastToShow);

        this.displayToast(toastToShow.title, toastToShow.message, toastToShow.type)
            .finally(() => {
                // Process next toast after a short delay to prevent rapid-fire toasts
                setTimeout(() => {
                    this.processToastQueue();
                }, 300); // Adjust delay as needed
            });
    }

    /**
     * Display a toast notification using SweetAlert2 or fallback
     * @param {string} title - The notification title
     * @param {string} message - The notification message
     * @param {string} message - The notification message (can be HTML).
     * @param {string} type - Notification type ('success', 'error', 'warning', 'info', 'question').
     * @returns {Promise} Resolves when the toast is displayed or fallback is shown.
     */
    displayToast(title, message, type) {
        return new Promise((resolve) => {
            this.log('Attempting to display toast:', { title, type });

            // Use global showToast if specifically defined elsewhere (e.g., in main.js)
            if (typeof window.showToast === 'function' && window.showToast !== this.showToast) { // Avoid recursion
                this.log('Using global window.showToast function.');
                try {
                    window.showToast(title, message, type);
                } catch (e) {
                    console.error("Error calling global showToast:", e);
                    this.fallbackToast(title, message); // Fallback if global fails
                }
                resolve(); // Assume global function handles itself
            }
            // Use SweetAlert2 if available
            else if (typeof window.Swal !== 'undefined') {
                this.log('Using SweetAlert2 for toast.');
                const iconType = type === 'danger' ? 'error' : type; // Map 'danger' to 'error' if needed

                window.Swal.fire({
                    title: title,
                    html: message, // Allow HTML content
                    icon: iconType,
                    toast: true,
                    position: 'top-end', // Common position for toasts
                    showConfirmButton: false,
                    timer: 3500, // Slightly longer timer
                    timerProgressBar: true,
                    customClass: {
                        popup: 'custom-swal-toast', // Add custom class for styling
                    },
                    showCloseButton: true, // Allow users to close manually
                    didOpen: (toast) => {
                        toast.style.zIndex = '9999'; // Ensure visibility
                        toast.addEventListener('mouseenter', window.Swal.stopTimer);
                        toast.addEventListener('mouseleave', window.Swal.resumeTimer);
                    }
                }).then(resolve, resolve); // Resolve whether confirmed or timed out
            }
            // Fallback to standard alert
            else {
                this.log('SweetAlert2 not available, using fallback alert.');
                this.fallbackToast(title, message);
                resolve(); // Resolve after showing alert
            }
        });
    }

    /**
     * Simple fallback alert mechanism.
     */
    fallbackToast(title, message) {
         // Basic alert, strip HTML for safety if message might contain it
         const cleanMessage = message.replace(/<[^>]*>/g, ''); // Basic HTML strip
         alert(`[${title}] ${cleanMessage}`);
    }

}

// --- Initialization ---
// Ensure DOM is ready before initializing
function initializeWishlistManager() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.wishlistManager = new WishlistManager();
        });
    } else {
        // DOM is already ready
        window.wishlistManager = new WishlistManager();
    }
}

initializeWishlistManager();

// Export the singleton instance *after* ensuring it's created
export default window.wishlistManager;
