/**
 * Shop product filtering and sorting functionality
 * Based on the dynamic filtering in the products app
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize filters if container exists
    const filterContainer = document.getElementById('dynamic-filter-container');
    if (!filterContainer) return;

    // URLs
    const productListUrl = filterContainer.dataset.productListUrl;

    // Initial state from data attributes or defaults
    const initialState = {
        search: filterContainer.dataset.searchQuery || '',
        category: filterContainer.dataset.currentCategory || '',
        sort: 'name-asc'
    };

    // DOM elements
    const searchInput = document.querySelector('.filter-search');
    const sortSelect = document.querySelector('.filter-sort');
    const categorySelect = document.querySelector('.filter-category');
    const clearSearchBtn = document.querySelector('.clear-search');
    const resetAllBtn = document.querySelector('.reset-all-filters');
    const filterToggleBtn = document.querySelector('.filter-toggle');
    const filterOptions = document.getElementById('filterOptions');
    const searchDisplay = document.querySelector('.search-display');
    const searchTerm = document.querySelector('.search-term');
    const searchTermSummary = document.querySelector('.search-term-summary');
    const searchSummary = document.querySelector('.search-summary');
    const categoriesDisplay = document.querySelector('.categories-display');
    const categoryCountDisplay = document.querySelector('.category-count-display');
    const categoriesSummary = document.querySelector('.categories-summary');
    const categoryCountSummary = document.querySelector('.category-count-summary');
    const categoryTagsContainer = document.getElementById('selectedCategoriesTags');
    const clearCategoriesBtn = document.querySelector('.clear-categories-btn');
    const itemCountDisplay = document.querySelector('.item-count');
    const productCountDisplay = document.getElementById('product-count');
    const productGridContainer = document.getElementById('product-grid-container');

    // Current filter state
    let filterState = {...initialState};

    // Initialize Select2 for category multi-select if available
    if (typeof $.fn.select2 !== 'undefined' && categorySelect) {
        $(categorySelect).select2({
            placeholder: "Select Categories",
            allowClear: true,
            width: '100%'
        });
    }

    // Function to update the UI based on filter state
    function updateUI() {
        // Update input and select values
        if (searchInput) searchInput.value = filterState.search;
        if (sortSelect) sortSelect.value = filterState.sort;

        // Update category multi-select
        if (categorySelect && typeof $.fn.select2 !== 'undefined') {
            const categoryIds = filterState.category ? filterState.category.split(',') : [];
            $(categorySelect).val(categoryIds).trigger('change');
        }

        // Update search display
        if (searchTerm) searchTerm.textContent = filterState.search;
        if (searchTermSummary) searchTermSummary.textContent = filterState.search;
        if (searchDisplay) searchDisplay.classList.toggle('d-none', !filterState.search);
        if (searchSummary) searchSummary.classList.toggle('d-none', !filterState.search);

        // Update category display
        const categoryCount = filterState.category ? filterState.category.split(',').filter(c => c).length : 0;
        if (categoryCountDisplay) categoryCountDisplay.textContent = categoryCount;
        if (categoryCountSummary) categoryCountSummary.textContent = categoryCount;
        if (categoriesDisplay) categoriesDisplay.classList.toggle('d-none', categoryCount === 0);
        if (categoriesSummary) categoriesSummary.classList.toggle('d-none', categoryCount === 0);

        // Update category tags
        updateCategoryTags();
    }

    // Function to update category tags
    function updateCategoryTags() {
        if (!categoryTagsContainer) return;

        categoryTagsContainer.innerHTML = '';

        if (!filterState.category) return;

        const categoryIds = filterState.category.split(',').filter(c => c);
        if (categoryIds.length === 0) return;

        categoryIds.forEach(categoryId => {
            const option = Array.from(categorySelect.options).find(opt => opt.value === categoryId);
            if (!option) return;

            const categoryName = option.textContent.trim();

            const tagDiv = document.createElement('div');
            tagDiv.className = 'category-tag';
            tagDiv.innerHTML = `
                <span class="tag-text">${categoryName}</span>
                <button type="button" class="tag-remove" data-category-id="${categoryId}">
                    <i class="fas fa-times"></i>
                </button>
            `;

            categoryTagsContainer.appendChild(tagDiv);

            // Add event listener to remove button
            tagDiv.querySelector('.tag-remove').addEventListener('click', function() {
                const categoryIdToRemove = this.dataset.categoryId;
                removeCategoryById(categoryIdToRemove);
            });
        });
    }

    // Function to remove a category by ID
    function removeCategoryById(categoryId) {
        const categoryIds = filterState.category.split(',').filter(c => c);
        const updatedCategoryIds = categoryIds.filter(id => id !== categoryId);

        filterState.category = updatedCategoryIds.join(',');

        // Update UI and fetch new results
        updateUI();
        fetchProducts();
    }

    // Function to fetch products based on filter state
    function fetchProducts() {
        // Show loading state
        if (productGridContainer) {
            productGridContainer.classList.add('loading');
        }

        // Build URL with query parameters
        let url = new URL(productListUrl, window.location.origin);

        // Add query parameters
        if (filterState.search) url.searchParams.append('search', filterState.search);
        if (filterState.category) url.searchParams.append('category', filterState.category);
        if (filterState.sort) url.searchParams.append('sort', filterState.sort);

        // Fetch data
        fetch(url, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            // Update product grid
            if (productGridContainer) {
                productGridContainer.innerHTML = data.html;
                productGridContainer.classList.remove('loading');
            }

            // Update counts
            if (itemCountDisplay) itemCountDisplay.textContent = data.count;
            if (productCountDisplay) productCountDisplay.textContent = data.count;

            // Re-initialize wishlist buttons
            initWishlistButtons();
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            if (productGridContainer) {
                productGridContainer.classList.remove('loading');
                productGridContainer.innerHTML = '<div class="alert alert-danger">Error loading products. Please try again.</div>';
            }
        });
    }

    // Initialize wishlist buttons after AJAX load
    function initWishlistButtons() {
        document.querySelectorAll('.wishlist-toggle').forEach(button => {
            button.addEventListener('click', function(e) {
                // Handle wishlist toggling
                // This is defined in the wishlist.js file
                if (typeof handleWishlistToggle === 'function') {
                    handleWishlistToggle(e);
                }
            });
        });
    }

    // Event listeners
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterState.search = this.value;
            updateUI();

            // Debounce for performance
            clearTimeout(this.timer);
            this.timer = setTimeout(fetchProducts, 300);
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            filterState.sort = this.value;
            updateUI();
            fetchProducts();
        });
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            const selectedCategories = Array.from(this.selectedOptions).map(opt => opt.value);
            filterState.category = selectedCategories.join(',');
            updateUI();
            fetchProducts();
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function() {
            filterState.search = '';
            updateUI();
            fetchProducts();
        });
    }

    if (clearCategoriesBtn) {
        clearCategoriesBtn.addEventListener('click', function() {
            filterState.category = '';
            updateUI();
            fetchProducts();
        });
    }

    if (resetAllBtn) {
        resetAllBtn.addEventListener('click', function() {
            filterState = {
                search: '',
                category: '',
                sort: 'name-asc'
            };
            updateUI();
            fetchProducts();
        });
    }

    if (filterToggleBtn) {
        filterToggleBtn.addEventListener('click', function() {
            const isCollapsed = filterOptions.classList.contains('show');
            this.classList.toggle('collapsed', !isCollapsed);
            this.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
            this.querySelector('.filter-toggle-text').textContent = isCollapsed ? 'Show Filters' : 'Hide Filters';

            // Bootstrap 5 handles the actual collapsing
            // This just updates the button text
        });
    }

    // Document-level event delegation for dynamic elements
    document.addEventListener('click', function(e) {
        // Handle click on search summary close button
        if (e.target.closest('.search-summary .btn-close')) {
            filterState.search = '';
            updateUI();
            fetchProducts();
        }

        // Handle click on categories summary close button
        if (e.target.closest('.categories-summary .btn-close')) {
            filterState.category = '';
            updateUI();
            fetchProducts();
        }
    });

    // Initialize UI and fetch products
    updateUI();
    fetchProducts();
});
