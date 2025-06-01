/**
 * WishlistManager - Handles all wishlist functionality
 */
export class WishlistManager {
    constructor(productListManager) {
        this.plm = productListManager; // Reference to main ProductListManager
    }

    /**
     * Handle wishlist button click
     * @param {Event} event - Click event
     * @param {HTMLElement} button - Wishlist button element
     */
    handleWishlistButtonClick(event, button) {
        // Prevent default to handle via AJAX instead of full page reload
        event.preventDefault();

        const url = button.getAttribute('href');

        // Find heart icon - support both Font Awesome and SVG elements
        let heartIcon = this.findHeartIcon(button);
        if (!heartIcon) {
            console.error('Wishlist button missing heart icon element. Button HTML:', button.outerHTML);
            // Try to continue anyway by creating the icon
            const newIcon = document.createElement('i');
            this.setIconClasses(newIcon, ['far', 'fa-heart']);
            button.appendChild(newIcon);
            heartIcon = newIcon;
        }

        // Store original classes for restoration on error
        const originalClasses = this.getIconClasses(heartIcon);

        // Set loading spinner
        this.setIconClasses(heartIcon, ['fas', 'fa-spinner', 'fa-spin']);

        // Send AJAX request to add/remove from wishlist
        fetch(url, {
            method: 'POST',
            headers: {
                'X-CSRFToken': this.getCookie('csrftoken'),
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // Re-find the icon since it might have been replaced during spinner display
            let currentIcon = this.findHeartIcon(button);

            if (data.success) {
                const productName = button.dataset.productName || 'Product';

                // Use the response flags from Django to determine the action
                if (data.added) {
                    // Item was just added to wishlist
                    this.setIconClasses(currentIcon, ['fas', 'fa-heart']);
                    button.classList.remove('add-to-wishlist-btn');
                    button.classList.add('remove-wishlist-btn');
                    button.setAttribute('title', 'Remove from wishlist');

                    // Show success feedback
                    this.showToast('Added to Wishlist',
                        data.message || `${productName} has been added to your wishlist.`,
                        'success');
                } else if (data.removed) {
                    // Item was just removed from wishlist
                    this.setIconClasses(currentIcon, ['far', 'fa-heart']);
                    button.classList.remove('remove-wishlist-btn');
                    button.classList.add('add-to-wishlist-btn');
                    button.setAttribute('title', 'Add to wishlist');

                    // Show success feedback
                    this.showToast('Removed from Wishlist',
                        data.message || `${productName} has been removed from your wishlist.`,
                        'info');

                    // If we're on the wishlist page, refresh to update the list
                    if (this.isOnWishlistPage()) {
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500); // Give time for the toast to show
                    }
                }

                // Update wishlist count if available
                if (data.wishlist_count !== undefined) {
                    this.updateWishlistCounter(data.wishlist_count);
                }
            } else {
                // Error occurred - restore original state
                this.setIconClasses(currentIcon, originalClasses);
                this.showToast('Error', data.message || 'An error occurred', 'error');
            }
        })
        .catch(error => {
            console.error('Wishlist operation failed:', error);
            // Restore original state on error
            let currentIcon = this.findHeartIcon(button);
            this.setIconClasses(currentIcon, originalClasses);
        });
    }

    /**
     * Update wishlist counter in navigation and other locations
     * @param {number} count - The new wishlist count
     */
    updateWishlistCounter(count) {
        try {
            // Find all wishlist counter elements with various selectors
            const selectors = [
                '.wishlist-count',
                '[data-wishlist-count]',
                '#wishlist-count',
                '.wishlist-counter',
                '.nav-wishlist-count'
            ];

            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    element.textContent = count;

                    // Also update data attribute if it exists
                    if (element.hasAttribute('data-wishlist-count')) {
                        element.setAttribute('data-wishlist-count', count);
                    }
                });
            });

            // Update any "View Your Wishlist" text that might include count
            const wishlistLinks = document.querySelectorAll('a[href*="wishlist"]');
            wishlistLinks.forEach(link => {
                const text = link.textContent.trim();
                if (text.includes('(') && text.includes(')')) {
                    // Update count in parentheses
                    link.textContent = text.replace(/\(\d+\)/, `(${count})`);
                }
            });

            console.log(`Updated wishlist counter to: ${count}`);
        } catch (err) {
            console.error('Error updating wishlist counter:', err);
        }
    }

    /**
     * Find heart icon within a button (supports both <i> and <svg> elements)
     * @param {HTMLElement} button - The button element
     * @returns {HTMLElement|null} - The heart icon element
     */
    findHeartIcon(button) {
        // Look for Font Awesome <i> elements first
        let icon = button.querySelector('i.fa-heart, i[class*="fa-heart"]');

        if (!icon) {
            // Look for SVG elements
            icon = button.querySelector('svg');
        }

        if (!icon) {
            // Look for any <i> element as fallback
            icon = button.querySelector('i');
        }

        return icon;
    }

    /**
     * Set icon classes - Simple approach: just update the classes directly
     * @param {HTMLElement} icon - The icon element
     * @param {Array} classes - Array of class names to set
     */
    setIconClasses(icon, classes) {
        if (!icon) return;

        try {
            // Clear existing Font Awesome classes
            const faIconClasses = ['fa-heart', 'fas', 'far', 'fab', 'fal', 'fa-spinner', 'fa-spin'];
            faIconClasses.forEach(cls => icon.classList.remove(cls));

            // Add new classes
            classes.forEach(cls => {
                if (cls && cls.trim().length > 0) {
                    icon.classList.add(cls.trim());
                }
            });

            console.log('Icon classes updated:', {
                element: icon.tagName,
                finalClasses: Array.from(icon.classList)
            });
        } catch (error) {
            console.error('Error setting icon classes:', error);
        }
    }

    /**
     * Get current icon classes
     * @param {HTMLElement} icon - The icon element
     * @returns {Array} - Array of current class names
     */
    getIconClasses(icon) {
        if (!icon) return [];

        try {
            return Array.from(icon.classList);
        } catch (error) {
            console.error('Error getting icon classes:', error);
            return [];
        }
    }

    /**
     * Get cookie value by name
     * @param {string} name - Cookie name
     * @returns {string} - Cookie value
     */
    getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                cookie = cookie.trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    /**
     * Show a notification using SweetAlert2
     * @param {string} title - The notification title
     * @param {string} message - The notification message
     * @param {string} type - The notification type (success, error, warning, info)
     */
    showToast(title, message, type = 'info') {
        try {
            // Check if SweetAlert2 is available
            if (typeof Swal !== 'undefined') {
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer);
                        toast.addEventListener('mouseleave', Swal.resumeTimer);
                    }
                });

                Toast.fire({
                    icon: type,
                    title: title,
                    text: message
                });
            } else {
                // Fallback to console log if SweetAlert2 is not available
                console.log(`${type.toUpperCase()}: ${title} - ${message}`);
            }
        } catch (err) {
            console.error('Error showing toast notification:', err);
            // Fallback to console log
            console.log(`${type.toUpperCase()}: ${title} - ${message}`);
        }
    }

    /**
     * Replace a Font Awesome SVG icon with new classes
     * @param {SVGElement} svgIcon - The SVG icon element
     * @param {Array} classes - Array of class names for the new icon
     */
    replaceFontAwesomeIcon(svgIcon, classes) {
        try {
            // Check if the SVG is still in the DOM
            if (!svgIcon.parentNode) {
                console.warn('SVG icon is no longer in the DOM, skipping replacement');
                return;
            }

            const button = svgIcon.closest('button, a');
            if (!button) {
                console.warn('Could not find parent button for SVG icon');
                return;
            }

            // Create a new i element with the correct classes
            const newIcon = document.createElement('i');
            classes.forEach(cls => {
                if (cls && cls.trim().length > 0) {
                    newIcon.classList.add(cls.trim());
                }
            });

            // Copy any data attributes from the SVG to the new element
            if (svgIcon.dataset) {
                Object.keys(svgIcon.dataset).forEach(key => {
                    newIcon.dataset[key] = svgIcon.dataset[key];
                });
            }

            // Replace the SVG with the new i element
            svgIcon.parentNode.replaceChild(newIcon, svgIcon);

            // Force FontAwesome to convert the new <i> element to SVG with proper timing
            // Use requestAnimationFrame to ensure DOM is ready, then setTimeout for processing
            requestAnimationFrame(() => {
                setTimeout(() => {
                    // First attempt: try to convert the icon
                    dom.i2svg({ node: newIcon });

                    // Fallback: if the icon still isn't converted after 100ms, try again
                    setTimeout(() => {
                        if (newIcon && newIcon.tagName === 'I' && !newIcon.hasAttribute('data-fa-i2svg')) {
                            console.log('FontAwesome icon not converted, retrying...');
                            dom.i2svg({ node: newIcon });
                        }
                    }, 100);
                }, 50);
            });

            console.log('Replaced SVG icon with new i element:', {
                newClasses: classes,
                newElement: newIcon
            });

            return newIcon;
        } catch (error) {
            console.error('Error replacing Font Awesome SVG icon:', error);
            return null;
        }
    }

    /**
     * Check if we're currently on the wishlist page
     * @returns {boolean} - True if on wishlist page
     */
    isOnWishlistPage() {
        // Check URL path
        const currentPath = window.location.pathname;
        return currentPath.includes('/wishlist') || currentPath.includes('/wishlist/');
    }

    /**
     * Position wishlist buttons based on whether badges are present
     */
    positionWishlistButtons() {
        try {
            const productCards = document.querySelectorAll('.product-card');

            productCards.forEach(card => {
                const badges = card.querySelector('.product-badges');
                const wishlistBtn = card.querySelector('.add-to-wishlist-btn');

                if (badges && wishlistBtn) {
                    // Check if badges container has any badges
                    const hasBadges = badges.querySelectorAll('.badge').length > 0;

                    // Adjust wishlist button position based on badges presence
                    if (hasBadges) {
                        wishlistBtn.style.top = 'auto';
                        wishlistBtn.style.bottom = '10px';
                        wishlistBtn.style.right = '10px';
                    } else {
                        wishlistBtn.style.top = '10px';
                        wishlistBtn.style.bottom = 'auto';
                        wishlistBtn.style.right = '10px';
                    }
                }
            });
        } catch (err) {
            console.error('Error positioning wishlist buttons:', err);
        }
    }
}
