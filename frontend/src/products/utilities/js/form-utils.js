/**
 * form-utils.js - Common form-related utilities
 */

/**
 * Set up a Select2 dropdown
 * @param {jQuery} element - The select element
 * @param {Object} options - Configuration options
 */
export function setupSelect2(element, options) {
    if (!element.length) return;

    const config = {
        theme: 'bootstrap-5',
        width: '100%',
        multiple: options.multiple || false,
        allowClear: options.allowClear || false,
        closeOnSelect: options.closeOnSelect || true,
        placeholder: options.placeholder || 'Select an option',
        minimumInputLength: options.minimumInputLength || 0,
        minimumResultsForSearch: options.minimumResultsForSearch || 0,
        templateResult: options.formatResult || null,
        templateSelection: options.formatSelection || function(data) {
            return data.text;
        }
    };

    // Add AJAX configuration if URL is provided
    if (options.url) {
        config.ajax = {
            delay: 250,
            url: options.url,
            data: (params) => ({
                search: params.term || '',
                page: params.page || 1
            }),
            processResults: (data) => ({
                results: data.categories.map(item => ({
                    id: item.id,
                    text: item.name,
                    selected: false
                })),
                pagination: {
                    more: data.has_more
                }
            }),
            cache: true
        };
    }

    element.select2(config);
}

/**
 * Toggle an element's visibility with smooth transition
 * @param {jQuery} element - The element to toggle
 * @param {Object} callbacks - Optional callback functions
 */
export function toggleElement(element, callbacks = {}) {
    const isExpanded = element.hasClass('show');
    const newState = !isExpanded;

    if (newState) {
        element.addClass('show');
        if (callbacks.onShow) callbacks.onShow();
    } else {
        element.removeClass('show');
        if (callbacks.onHide) callbacks.onHide();
    }
}

/**
 * Set disabled state for a group of elements
 * @param {jQuery} container - Container element
 * @param {string} selector - Selector for elements to disable/enable
 * @param {boolean} disabled - Whether to disable or enable the elements
 */
export function setDisabledState(container, selector, disabled) {
    container.find(selector).prop('disabled', disabled);
}

/**
 * Reset a form to its initial state
 * @param {jQuery} form - The form element
 */
export function resetForm(form) {
    form[0].reset();

    // Reset Select2 dropdowns
    form.find('select').each(function() {
        if ($(this).hasClass('select2-hidden-accessible')) {
            $(this).val(null).trigger('change');
        }
    });
}
