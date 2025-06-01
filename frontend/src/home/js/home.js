/**
 * Home page JavaScript functionality
 */
import '../css/home.css'; // Import home-specific CSS

document.addEventListener('DOMContentLoaded', function() {
    // Initialize featured products carousel if present
    const carousel = document.querySelector('.home-carousel');
    if (carousel) {
        initializeCarousel(carousel);
    }

    // Initialize featured products hover effects
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('shadow');
        });
        card.addEventListener('mouseleave', function() {
            this.classList.remove('shadow');
        });
    });

    // Lazy load testimonial images
    const testimonialImages = document.querySelectorAll('.testimonial-img[data-src]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                    }
                    imageObserver.unobserve(img);
                }
            });
        });

        testimonialImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        testimonialImages.forEach(img => {
            const src = img.getAttribute('data-src');
            if (src) {
                img.src = src;
                img.removeAttribute('data-src');
            }
        });
    }

    // Add category filtering functionality
    const categoryButtons = document.querySelectorAll('.category-filter-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');

            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Show all products if 'all' category is selected
            if (category === 'all') {
                document.querySelectorAll('.product-item').forEach(item => {
                    item.style.display = 'block';
                });
                return;
            }

            // Hide all products
            document.querySelectorAll('.product-item').forEach(item => {
                item.style.display = 'none';
            });

            // Show products with matching category
            document.querySelectorAll(`.product-item[data-category="${category}"]`).forEach(item => {
                item.style.display = 'block';
            });
        });
    });

    // Add to cart functionality for home page product cards
    const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.getAttribute('data-product-id');

            // Disable button during AJAX request to prevent double-clicks
            this.disabled = true;
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

            // Send AJAX request to add product to cart
            fetch(`/cart/add/${productId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': getCSRFToken()
                },
                body: 'quantity=1&update=False'
            })
            .then(response => response.json())
            .then(data => {
                // Re-enable button
                this.disabled = false;
                this.innerHTML = originalText;

                if (data.success) {
                    // Show success message
                    showToast('success', data.message);

                    // Update cart count in navbar if it exists
                    const cartCount = document.querySelector('.cart-count');
                    if (cartCount) {
                        cartCount.textContent = data.item_count;
                    }
                } else {
                    // Show error message
                    showToast('error', data.errors || 'Error adding to cart');
                }
            })
            .catch(error => {
                // Re-enable button
                this.disabled = false;
                this.innerHTML = originalText;

                // Show error message
                showToast('error', 'Error adding to cart');
                console.error('Error:', error);
            });
        });
    });

    // Add wishlist functionality for home page product cards
    const wishlistButtons = document.querySelectorAll('.btn-wishlist');
    wishlistButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.getAttribute('data-product-id');

            // Disable button during AJAX request
            this.disabled = true;

            // Send AJAX request to toggle wishlist status
            fetch(`/wishlist/toggle/${productId}/`, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': getCSRFToken()
                }
            })
            .then(response => response.json())
            .then(data => {
                // Re-enable button
                this.disabled = false;

                if (data.success) {
                    // Update wishlist icon
                    const icon = this.querySelector('i');
                    if (data.action === 'added') {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                        showToast('success', 'Added to wishlist');
                    } else {
                        icon.classList.remove('fas');
                        icon.classList.add('far');
                        showToast('success', 'Removed from wishlist');
                    }
                } else {
                    // Show error or login message
                    if (data.error === 'login_required') {
                        showToast('info', 'Please log in to add items to your wishlist');
                    } else {
                        showToast('error', data.error || 'Error updating wishlist');
                    }
                }
            })
            .catch(error => {
                // Re-enable button
                this.disabled = false;
                showToast('error', 'Error updating wishlist');
                console.error('Error:', error);
            });
        });
    });
});

/**
 * Initialize carousel with default settings
 * @param {HTMLElement} carouselElement - The carousel container element
 */
function initializeCarousel(carouselElement) {
    // Get all slides
    const slides = carouselElement.querySelectorAll('.carousel-slide');
    if (slides.length === 0) return;

    let currentSlide = 0;
    const totalSlides = slides.length;

    // Show first slide, hide others
    slides.forEach((slide, index) => {
        slide.style.display = index === 0 ? 'block' : 'none';
    });

    // Create navigation dots
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel-dots';

    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('span');
        dot.className = 'carousel-dot';
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            goToSlide(i);
        });
        dotsContainer.appendChild(dot);
    }

    carouselElement.appendChild(dotsContainer);

    // Create prev/next buttons
    const prevButton = document.createElement('button');
    prevButton.className = 'carousel-button carousel-prev';
    prevButton.innerHTML = '&lt;';
    prevButton.addEventListener('click', () => {
        goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
    });

    const nextButton = document.createElement('button');
    nextButton.className = 'carousel-button carousel-next';
    nextButton.innerHTML = '&gt;';
    nextButton.addEventListener('click', () => {
        goToSlide((currentSlide + 1) % totalSlides);
    });

    carouselElement.appendChild(prevButton);
    carouselElement.appendChild(nextButton);

    // Auto-rotate slides
    const intervalTime = 5000; // 5 seconds
    let slideInterval = setInterval(() => {
        goToSlide((currentSlide + 1) % totalSlides);
    }, intervalTime);

    // Pause on hover
    carouselElement.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });

    carouselElement.addEventListener('mouseleave', () => {
        slideInterval = setInterval(() => {
            goToSlide((currentSlide + 1) % totalSlides);
        }, intervalTime);
    });

    // Function to change slides
    function goToSlide(slideIndex) {
        // Hide current slide
        slides[currentSlide].style.display = 'none';

        // Update dots
        dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === slideIndex);
        });

        // Show new slide
        slides[slideIndex].style.display = 'block';
        currentSlide = slideIndex;
    }
}

/**
 * Get CSRF token from cookies
 * @returns {string} CSRF token
 */
function getCSRFToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrftoken') {
            return value;
        }
    }
    return '';
}

/**
 * Show toast message
 * @param {string} type - Type of toast (success, error, info)
 * @param {string} message - Message to display
 */
function showToast(type, message) {
    // Check if we have a toast container, create one if not
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-header">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
            <button class="toast-close">&times;</button>
        </div>
        <div class="toast-body">${message}</div>
    `;

    // Add to container
    toastContainer.appendChild(toast);

    // Show toast with animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Add close button functionality
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
    }, 5000);
}
