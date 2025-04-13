/**
 * Catalog Manager - handles product catalog browsing
 * Leverages existing api-client.js for API interactions
 */
import apiClient from '@core/api-client.js';
import { BaseManager } from '@products/utilities/base-manager.js';
import Swal from 'sweetalert2';

/**
 * CatalogManager class for handling shop catalog browsing
 * Extends BaseManager to leverage common functionality
 */
export class CatalogManager extends BaseManager {
    /**
     * Create a new CatalogManager instance
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        // Initialize with default options
        super({
            ...options,
            itemType: 'product',
            notifications: options.notifications || {
                displaySuccess: (message) => {
                    Swal.fire({
                        title: 'Success',
                        text: message,
                        icon: 'success',
                        confirmButtonColor: '#0d6efd'
                    });
                },
                displayError: (message) => {
                    Swal.fire({
                        title: 'Error',
                        text: message,
                        icon: 'error',
                        confirmButtonColor: '#0d6efd'
                    });
                }
            }
        });
        
        // Additional options specific to CatalogManager
        this.options = {
            productGridSelector: '#product-grid',
            categoryFilterSelector: '.category-filter',
            searchFormSelector: '#product-search-form',
            sortSelectSelector: '#sort-select',
            paginationSelector: '.pagination',
            ...options
        };
        
        this.initSortingControls();
        this.initProductCardAnimations();
    }
    
    /**
     * Fetch catalog items - placeholder implementation
     * Required by BaseManager but handled through page navigation for catalog
     */
    fetchItems() {
        // Not needed as we use page navigation instead of AJAX loading for catalog
        console.log('Catalog navigation handled through URL changes');
    }
    
    /**
     * Initialize sorting controls for the catalog view
     * Sets up sort dropdown and retrieves current sort parameter from URL
     */
    initSortingControls() {
        // Sort select change
        const sortSelect = document.querySelector(this.options.sortSelectSelector);
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortProducts(e.target.value);
            });
            
            // Set the selected option based on the current URL
            const urlParams = new URLSearchParams(window.location.search);
            const sortParam = urlParams.get('sort');
            if (sortParam) {
                sortSelect.value = sortParam;
            }
        }
    }
    
    /**
     * Initialize filters - placeholder implementation
     * Required by BaseManager but handled differently for catalog
     */
    initializeFilters() {
        // Not needed for catalog as we use URL parameters instead of AJAX filtering
    }
    
    /**
     * Sort products by changing URL parameters
     * @param {string} sortOption - Sort option value
     */
    sortProducts(sortOption) {
        const url = new URL(window.location.href);
        url.searchParams.set('sort', sortOption);
        window.location.href = url.toString();
    }
    
    /**
     * Initialize animations for product cards
     * Uses IntersectionObserver for scroll-based animations with fallback
     */
    initProductCardAnimations() {
        const productGrid = document.querySelector(this.options.productGridSelector);
        if (!productGrid) return;
        
        const productCards = productGrid.querySelectorAll('.product-card');
        
        // If IntersectionObserver is available, use it for scroll animations
        if ('IntersectionObserver' in window) {
            const appearOptions = {
                threshold: 0.1,
                rootMargin: "0px 0px -100px 0px"
            };
            
            const appearOnScroll = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('appear');
                    observer.unobserve(entry.target);
                });
            }, appearOptions);
            
            productCards.forEach(card => {
                card.classList.add('fade-in');
                appearOnScroll.observe(card);
            });
        } else {
            // Fallback for browsers that don't support IntersectionObserver
            productCards.forEach(card => {
                card.classList.add('appear');
            });
        }
    }
    
    /**
     * Add a product to the wishlist
     * @param {number} productId - The product ID
     * @param {HTMLElement} button - The wishlist button element
     */
    addToWishlist(productId, button) {
        const url = `/shop/wishlist/add/${productId}/`;
        
        apiClient.get(url)
            .then(response => {
                if (response.success) {
                    button.classList.add('added');
                    button.innerHTML = '<i class="fas fa-heart"></i>';
                    this.options.notifications.displaySuccess('Product has been added to your wishlist.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                this.options.notifications.displayError('There was a problem adding to your wishlist.');
            });
    }
}

// Initialize catalog manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.catalogManager = new CatalogManager();
});

export default CatalogManager;
