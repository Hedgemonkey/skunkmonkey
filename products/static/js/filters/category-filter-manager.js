/**
 * category-filter-manager.js - Handles category selection and management for filters
 */
import { setupSelect2 } from '../utilities/form-utils.js';
import { removeFromArray } from '../utilities/array-utils.js';

/**
 * CategoryFilterManager - Handles category selection and management
 */
export class CategoryFilterManager {
    constructor(filterInstance) {
        this.filter = filterInstance;
        this.container = filterInstance.container;
        this.selectedCategories = this._getSavedCategories() || [];
    }
    
    /**
     * Initialize category management
     */
    initialize() {
        this._initializeSelect2();
        this._setupCategoryEvents();
        this._renderCategoryTags();
        this._updateCategoryCardStyling();
        
        // Update product count on initialization if categories are already selected
        if (this.selectedCategories.length > 0 && this.filter.itemType === 'categories') {
            this.filter.uiManager._updateProductCount();
        }
    }
    
    /**
     * Initialize Select2 dropdown for categories
     */
    _initializeSelect2() {
        const selectElement = this.container.find('.filter-category');
        if (!selectElement.length) return;
        
        setupSelect2(selectElement, {
            url: '/products/api/categories/search/',
            formatResult: (category) => this._formatCategoryOption(category),
            multiple: true,
            allowClear: true,
            closeOnSelect: false,
            placeholder: 'Select or search categories'
        });
        
        // Set up checkbox behavior in dropdown
        this._setupCheckboxHandlers();
        
        // Handle Select2 dropdown opening to update checkbox states
        selectElement.on('select2:open', () => {
            // Use setTimeout to ensure the dropdown is rendered before we try to update checkboxes
            setTimeout(() => {
                this._updateDropdownCheckboxes();
            }, 50);
        });
    }
    
    /**
     * Format category options with checkboxes
     * @param {Object} category - The category data from Select2
     * @returns {jQuery} The formatted dropdown option
     */
    _formatCategoryOption(category) {
        if (!category.id) return category.text;
        
        // Check if the category is in our selected categories
        const isSelected = this.selectedCategories.includes(category.id.toString());
        
        return $(`
            <div class="select2-result-category">
                <input type="checkbox" class="form-check-input me-2" id="category-${category.id}" 
                       ${isSelected ? 'checked' : ''}>
                <label for="category-${category.id}">${category.text}</label>
            </div>
        `);
    }
    
    /**
     * Update checkbox states in the dropdown to match current selections
     * This is called when the dropdown is opened
     */
    _updateDropdownCheckboxes() {
        // Find all checkboxes in the dropdown
        $('.select2-results__options .select2-result-category input[type="checkbox"]').each((_, checkbox) => {
            const $checkbox = $(checkbox);
            const categoryId = $checkbox.attr('id').replace('category-', '');
            
            // Set checked state based on whether the category is in selectedCategories
            const isSelected = this.selectedCategories.includes(categoryId);
            $checkbox.prop('checked', isSelected);
        });
    }
    
    /**
     * Set up handlers for checkbox clicks in dropdown
     */
    _setupCheckboxHandlers() {
        $(document).off('click', '.select2-result-category input[type="checkbox"]')
            .on('click', '.select2-result-category input[type="checkbox"]', (e) => {
                e.stopPropagation();
                
                const checkbox = $(e.currentTarget);
                const id = checkbox.attr('id').replace('category-', '');
                const selectElement = this.container.find('.filter-category');
                const currentSelection = selectElement.val() || [];
                
                let newSelection = [...currentSelection];
                
                if (checkbox.is(':checked') && !newSelection.includes(id)) {
                    newSelection.push(id);
                } else if (!checkbox.is(':checked')) {
                    newSelection = removeFromArray(newSelection, id);
                }
                
                selectElement.val(newSelection).trigger('change');
            });
    }
    
    /**
     * Set up category-related events
     */
    _setupCategoryEvents() {
        const selectElement = this.container.find('.filter-category');
        if (!selectElement.length) return;
        
        // Handle category selection changes
        selectElement.on('change', () => {
            const newSelection = selectElement.val() || [];
            this.selectedCategories = newSelection.map(id => id.toString()); // Ensure string IDs
            this._saveCategories(this.selectedCategories);
            
            this.container.find('.category-count').text(this.selectedCategories.length);
            this._renderCategoryTags();
            
            // Update category card styling to match selection
            this._updateCategoryCardStyling();
            
            // Always update the filter summary when categories change
            this.filter.uiManager.updateFilterSummary();
            
            // Always trigger filtering for product page
            if (this.filter.itemType === 'products') {
                this.filter.filterItems();
            }
            // For categories page, only filter if the option is enabled
            else if (this.filter.filterOnCategorySelect) {
                this.filter.filterItems();
            }
        });
        
        // Clear categories button
        this.container.on('click', '.clear-categories-btn', () => {
            selectElement.val([]).trigger('change');
            this._saveCategories([]);
            this.container.find('.category-count').text('0');
            this._renderCategoryTags();
            
            // Always update the filter summary
            this.filter.uiManager.updateFilterSummary();
            
            // Always trigger filtering for product page
            if (this.filter.itemType === 'products') {
                this.filter.filterItems();
            }
            // For categories page, only filter if the option is enabled
            else if (this.filter.filterOnCategorySelect) {
                this.filter.filterItems();
            }
        });
        
        // Handle clicks on category cards - use document-level event delegation
        // This ensures the handler works even after cards are refreshed via AJAX
        $(document).off('click', '.category-header')
            .on('click', '.category-header', (e) => {
                // Only handle if not clicking on a button or link inside the card
                if (!$(e.target).closest('button, a').length) {
                    const categoryId = $(e.currentTarget).data('category-id');
                    if (categoryId) {
                        this._toggleCategory(categoryId.toString());
                        return false; // Prevent any parent handlers from triggering
                    }
                }
            });
    }
    
    /**
     * Toggle a category selection by ID
     */
    _toggleCategory(categoryId) {
        console.log('Toggling category:', categoryId);
        const selectElement = this.container.find('.filter-category');
        if (!selectElement.length) return;
        
        const currentSelection = selectElement.val() || [];
        let newSelection = [...currentSelection];
        
        if (newSelection.includes(categoryId)) {
            newSelection = removeFromArray(newSelection, categoryId);
        } else {
            newSelection.push(categoryId);
        }
        
        // Update the Select2 dropdown
        selectElement.val(newSelection).trigger('change');
        
        // Force the Select2 control to update its UI
        try {
            selectElement.trigger('change.select2');
            
            // If the dropdown is open, update checkbox states
            if ($('.select2-results__options').is(':visible')) {
                this._updateDropdownCheckboxes();
            }
        } catch (e) {
            console.warn('Error triggering Select2 change:', e);
        }
    }
    
    /**
     * Update the styling of category cards based on selection state
     */
    _updateCategoryCardStyling() {
        // Reset all cards to unselected state
        $('.category-header').removeClass('bg-primary text-white selected').addClass('bg-light');
        
        // Apply selected styling to cards that match the current selection
        this.selectedCategories.forEach(categoryId => {
            $(`.category-header[data-category-id="${categoryId}"]`)
                .removeClass('bg-light')
                .addClass('bg-primary text-white selected');
        });
    }
    
    /**
     * Render category tags based on selected categories
     */
    _renderCategoryTags() {
        const tagsContainer = this.container.find('.selected-categories-tags');
        if (!tagsContainer.length) return;
        
        tagsContainer.empty();
        
        if (!this.selectedCategories.length) {
            tagsContainer.hide();
            return;
        }
        
        // Get category names from select options
        const selectElement = this.container.find('.filter-category');
        const selectedOptions = Array.from(selectElement.find('option:selected'));
        
        selectedOptions.forEach(option => {
            const categoryId = $(option).val();
            const categoryName = $(option).text();
            
            const tag = $(`
                <span class="badge bg-primary me-1 mb-1 category-tag" data-category-id="${categoryId}">
                    ${categoryName}
                    <button type="button" class="btn-close btn-close-white ms-1" aria-label="Remove"></button>
                </span>
            `);
            
            tag.find('.btn-close').on('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.removeCategory(categoryId);
            });
            
            tagsContainer.append(tag);
        });
        
        tagsContainer.show();
    }
    
    /**
     * Remove a specific category by ID
     */
    removeCategory(categoryId) {
        const selectElement = this.container.find('.filter-category');
        const currentSelection = selectElement.val() || [];
        const newSelection = removeFromArray(currentSelection, categoryId);
        
        selectElement.val(newSelection).trigger('change');
    }
    
    /**
     * Save selected categories to localStorage
     */
    _saveCategories(categories) {
        const normalizedCategories = categories.map(id => id.toString());
        this.selectedCategories = normalizedCategories;
        localStorage.setItem('selectedCategories', JSON.stringify(normalizedCategories));
    }

    /**
     * Get saved categories from localStorage
     */
    _getSavedCategories() {
        const savedCategories = localStorage.getItem('selectedCategories');
        return savedCategories ? JSON.parse(savedCategories) : [];
    }
    
    /**
     * Apply saved categories to the UI
     */
    applySavedCategories() {
        const savedCategories = this._getSavedCategories();
        if (!savedCategories || savedCategories.length === 0) return;
        
        const selectElement = this.container.find('.filter-category');
        selectElement.val(savedCategories);
        
        try {
            selectElement.trigger('change.select2');
            
            // If the dropdown is open, update checkbox states
            if ($('.select2-results__options').is(':visible')) {
                this._updateDropdownCheckboxes();
            }
        } catch (e) {
            console.warn('Error triggering Select2 change:', e);
            selectElement.trigger('change');
        }
        
        this.container.find('.category-count').text(savedCategories.length);
        this._renderCategoryTags();
        
        // Update product count on initialization if categories are loaded from localStorage
        if (savedCategories.length > 0 && this.filter.itemType === 'categories') {
            this.filter.uiManager._updateProductCount();
        }
        
        // If we're on the products page, filter items based on the loaded categories
        if (this.filter.itemType === 'products' && savedCategories.length > 0) {
            this.filter.filterItems();
        }
    }
    
    /**
     * Get the currently selected categories
     */
    getSelectedCategories() {
        return this.selectedCategories;
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        const selectElement = this.container.find('.filter-category');
        
        // Remove event handlers
        this.container.off('click', '.clear-categories-btn');
        selectElement.off('change');
        selectElement.off('select2:open');
        
        // Remove category card click handler
        $(document).off('click', '.category-header');
        
        // Clean up Select2
        if (selectElement.length && $.fn.select2) {
            try {
                selectElement.select2('destroy');
            } catch (e) {
                console.warn('Error destroying Select2:', e);
            }
        }
        
        // Clean up document event handlers
        $(document).off('click', '.select2-result-category input[type="checkbox"]');
        
        // Clean up category tags
        this.container.find('.selected-categories-tags .btn-close').off('click');
    }
}
