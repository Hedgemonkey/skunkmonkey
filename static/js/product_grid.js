/**
 * Product Grid Functionality
 * Handles wishlist toggling, product filtering, and sorting
 */
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const productGrid = document.querySelector('.product-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sort-options');

    // Initialize tooltips if Bootstrap is available
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    /**
     * Toggle wishlist status for a product
     */
    function setupWishlistButtons() {
        const wishlistButtons = document.querySelectorAll('.wishlist-btn');

        wishlistButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const productId = this.getAttribute('data-product-id');
                const heartIcon = this.querySelector('i');

                // Toggle heart icon
                if (heartIcon.classList.contains('fa-heart-o')) {
                    heartIcon.classList.replace('fa-heart-o', 'fa-heart');
                    this.classList.add('active');
                    addToWishlist(productId);
                } else {
                    heartIcon.classList.replace('fa-heart', 'fa-heart-o');
                    this.classList.remove('active');
                    removeFromWishlist(productId);
                }
            });
        });
    }

    /**
     * Add a product to the user's wishlist
     */
    function addToWishlist(productId) {
        // Get CSRF token from cookie
        const csrfToken = getCookie('csrftoken');

        fetch('/wishlist/add/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({ product_id: productId }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showMessage('Product added to wishlist', 'success');
            } else {
                // If error or login required
                if (data.login_required) {
                    window.location.href = '/accounts/login/?next=' + window.location.pathname;
                } else {
                    showMessage(data.message || 'Error adding to wishlist', 'danger');
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Error adding to wishlist', 'danger');
        });
    }

    /**
     * Remove a product from the user's wishlist
     */
    function removeFromWishlist(productId) {
        // Get CSRF token from cookie
        const csrfToken = getCookie('csrftoken');

        fetch('/wishlist/remove/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({ product_id: productId }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showMessage('Product removed from wishlist', 'success');
            } else {
                showMessage(data.message || 'Error removing from wishlist', 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Error removing from wishlist', 'danger');
        });
    }

    /**
     * Set up filtering functionality
     */
    function setupFilters() {
        if (!filterButtons.length) return;

        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Update active state
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                const filter = this.getAttribute('data-filter');
                const productItems = document.querySelectorAll('.product-item');

                // Apply filter to product items
                productItems.forEach(item => {
                    if (filter === 'all') {
                        item.style.display = 'block';
                    } else if (filter === 'new') {
                        item.style.display = item.getAttribute('data-is-new') === 'true' ? 'block' : 'none';
                    } else if (filter === 'low-stock') {
                        item.style.display = item.getAttribute('data-is-low-stock') === 'true' ? 'block' : 'none';
                    }
                });

                // Check if no products are visible and show message
                checkNoVisibleProducts();
            });
        });
    }

    /**
     * Check if there are no visible products after filtering
     */
    function checkNoVisibleProducts() {
        const productItems = document.querySelectorAll('.product-item');
        let visibleCount = 0;

        productItems.forEach(item => {
            if (item.style.display !== 'none') {
                visibleCount++;
            }
        });

        // Get or create no-products message element
        let noProductsEl = document.querySelector('.no-products');
        if (visibleCount === 0) {
            if (!noProductsEl) {
                noProductsEl = document.createElement('div');
                noProductsEl.className = 'no-products';
                noProductsEl.innerHTML = '<p>No products match your filter criteria.</p>';
                productGrid.appendChild(noProductsEl);
            }
            noProductsEl.style.display = 'block';
        } else if (noProductsEl) {
            noProductsEl.style.display = 'none';
        }
    }

    /**
     * Set up sorting functionality
     */
    function setupSorting() {
        if (!sortSelect) return;

        sortSelect.addEventListener('change', function() {
            const sortBy = this.value;
            const productItems = Array.from(document.querySelectorAll('.product-item'));

            // Skip if no items to sort
            if (productItems.length === 0) return;

            // Sort product items based on selected option
            productItems.sort((a, b) => {
                if (sortBy === 'price-low') {
                    return parseFloat(a.getAttribute('data-price')) - parseFloat(b.getAttribute('data-price'));
                } else if (sortBy === 'price-high') {
                    return parseFloat(b.getAttribute('data-price')) - parseFloat(a.getAttribute('data-price'));
                } else if (sortBy === 'name-az') {
                    return a.getAttribute('data-name').localeCompare(b.getAttribute('data-name'));
                } else if (sortBy === 'name-za') {
                    return b.getAttribute('data-name').localeCompare(a.getAttribute('data-name'));
                }

                // Default sorting (by position in DOM)
                return 0;
            });

            // Reorder elements in the DOM
            const parent = productItems[0].parentNode;
            productItems.forEach(item => parent.appendChild(item));
        });
    }

    /**
     * Set up add to cart functionality
     */
    function setupAddToCart() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

        addToCartButtons.forEach(button => {
            button.addEventListener('click', function() {
                if (this.disabled) return;

                const productId = this.getAttribute('data-product-id');
                const csrfToken = getCookie('csrftoken');

                // Add loading state
                const originalText = this.innerHTML;
                this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Adding...';
                this.disabled = true;

                fetch('/cart/add/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                    },
                    body: JSON.stringify({
                        product_id: productId,
                        quantity: 1
                    }),
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    // Reset button state
                    this.innerHTML = originalText;
                    this.disabled = false;

                    if (data.success) {
                        showMessage('Product added to cart', 'success');
                        // Update cart count in the navbar if it exists
                        const cartCountElement = document.querySelector('.cart-count');
                        if (cartCountElement && data.cart_count) {
                            cartCountElement.textContent = data.cart_count;
                        }
                    } else {
                        showMessage(data.message || 'Error adding to cart', 'danger');
                    }
                })
                .catch(error => {
                    // Reset button state
                    this.innerHTML = originalText;
                    this.disabled = false;

                    console.error('Error:', error);
                    showMessage('Error adding to cart', 'danger');
                });
            });
        });
    }

    /**
     * Helper function to get CSRF token from cookies
     */
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    /**
     * Display messages to the user
     */
    function showMessage(message, type) {
        // Check if a messages container exists, create one if not
        let messagesContainer = document.querySelector('.messages-container');

        if (!messagesContainer) {
            messagesContainer = document.createElement('div');
            messagesContainer.className = 'messages-container position-fixed top-0 end-0 p-3';
            messagesContainer.style.zIndex = '1050';
            document.body.appendChild(messagesContainer);
        }

        // Create alert element
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${type} alert-dismissible fade show`;
        alertElement.role = 'alert';
        alertElement.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        // Add to container
        messagesContainer.appendChild(alertElement);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            alertElement.classList.remove('show');
            setTimeout(() => {
                alertElement.remove();
            }, 150);
        }, 5000);
    }

    // Initialize all functionality if product grid exists
    if (productGrid) {
        setupWishlistButtons();
        setupFilters();
        setupSorting();
        setupAddToCart();
    }
});
