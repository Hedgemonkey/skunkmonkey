import $ from 'jquery';
import 'bootstrap';
import Swal from 'sweetalert2';

$(function () {
    // Constants and Selectors
    const URLS = {
        addProductForm: $('#product-add-button').data('product-add-form-url'),
        addProduct: $('#product-add-button').data('product-add-url'),
        productManagement: $('#product-add-button').data('product-management-url'),
        getCategoryCards: $('#category-cards-container').data('category-cards-url'),
        addCategory: $('#category-add-button').data('category-add-url'),
        productBase: '/products/staff/product/'
    };

    const ELEMENTS = {
        addProductButton: $('#product-add-button'),
        productListContainer: $('#product-list'),
        addCategoryButton: $('#category-add-button'),
        categoryList: $('#category-list')
    };

    // Utility Functions
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

    function makeAjaxRequest(url, type, data = {}, successCallback, errorCallback, processData = true, contentType = 'application/x-www-form-urlencoded; charset=UTF-8') {
        return $.ajax({
            url: url,
            type: type,
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'X-Requested-With': 'XMLHttpRequest'
            },
            data: data,
            processData: processData,
            contentType: contentType,
            success: successCallback,
            error: errorCallback
        });
    }

    // UI Notification Functions
    const notifications = {
        displaySuccess: function(message) {
            Swal.fire({
                icon: 'success',
                title: message,
                showConfirmButton: true,
                timer: 2000,
                timerProgressBar: true
            });
        },
    
        displayError: function(message) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: message,
                showConfirmButton: true
            });
        },
    
        displaySwalError: function(error, defaultMessage) {
            Swal.showValidationMessage(error.responseJSON?.error || defaultMessage);
            return Promise.reject();
        }
    };

    // Product Management Functions
    const productManager = {
        fetchCards: function() {
            makeAjaxRequest(URLS.productManagement, 'GET', {}, 
                (data) => {
                    ELEMENTS.productListContainer.html(data);
                    this.attachDeleteListeners();
                }, 
                () => notifications.displayError("Failed to refresh product list.")
            );
        },

        showForm: function(url, isEdit = false) {
            makeAjaxRequest(
                url, 
                'GET', 
                {},
                (response) => {
                    Swal.fire({
                        title: isEdit ? 'Edit Product' : 'Add New Product',
                        html: isEdit ? response.html : response,  // Edit returns {html: ...}, Add returns direct HTML
                        showCancelButton: true,
                        confirmButtonText: isEdit ? 'Save' : 'Add Product',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        preConfirm: () => {
                            Swal.showLoading();
                            const form = $(isEdit ? '#product-update-form' : '#product-form')[0];
                            const formData = new FormData(form);
                            
                            return makeAjaxRequest(
                                form.action,
                                'POST',
                                formData,
                                (response) => {
                                    if (!response.success && isEdit) {
                                        Swal.showValidationMessage('Failed to update product.');
                                        return Promise.reject(response.errors);
                                    }
                                    return response;
                                },
                                (error) => {
                                    Swal.showValidationMessage('An error occurred while saving the product.');
                                    return Promise.reject(error);
                                },
                                false,  // processData
                                false   // contentType
                            );
                        }
                    }).then((result) => {
                        if (result.isConfirmed) {
                            notifications.displaySuccess(result.value?.message || 
                                (isEdit ? "Product updated successfully." : "Product added successfully."));
                            this.fetchCards();
                        }
                        if (result.isDismissed && !isEdit) {
                            $("#product-form").remove();
                        }
                    });
                },
                (error) => {
                    notifications.displaySwalError(error, `Failed to ${isEdit ? 'edit' : 'add'} product.`);
                }
            );
        },

        delete: function(productSlug) {
            const deleteUrl = `${URLS.productBase}${productSlug}/delete/`;
            try {
                const ajaxPromise = makeAjaxRequest(deleteUrl, 'POST');
                if (!ajaxPromise || typeof ajaxPromise.then !== 'function') {
                    return Promise.reject("Invalid AJAX response");
                }
                return ajaxPromise;
            } catch (error) {
                return Promise.reject(error);
            }
        },

        handleDelete: function(productSlug, productName) {
            Swal.fire({
                title: `Delete ${productName}?`,
                text: "Are you sure you want to delete this product? This action cannot be undone.",
                icon: 'warning',
                showCancelButton: true,
                allowOutsideClick: false,
                allowEscapeKey: false,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!',
                preConfirm: () => {
                    Swal.showLoading();
                    return this.delete(productSlug)
                        .then(response => {
                            notifications.displaySuccess(response?.message || "Product deleted successfully.");
                            this.fetchCards();
                            return Promise.resolve();
                        })
                        .catch(error => {
                            Swal.hideLoading();
                            if (error.responseJSON?.error) {
                                notifications.displaySwalError(error, error.responseJSON.error);
                            } else {
                                notifications.displaySwalError(error, 'Failed to delete product. Please try again.');
                            }
                            return Promise.reject(error);
                        });
                }
            });
        },

        attachDeleteListeners: function() {
            $('.delete-product').on('click', (e) => {
                e.preventDefault();
                const button = $(e.currentTarget);
                this.handleDelete(button.data('product-slug'), button.data('product-name'));
            });
        }
    };

    // Category Management Functions

    const categoryManager = {
        
        fetchCards: function() {
            makeAjaxRequest(URLS.getCategoryCards, 'GET', {}, 
                (cardHTML) => {
                    $('#category-cards-container').html(cardHTML);
                }, 
                () => notifications.displayError("Failed to load category cards.")
            );
        },

        delete: function(categoryUrl, categoryName) {
            makeAjaxRequest(categoryUrl, 'POST', {}, 
                () => {
                    this.fetchCards();
                    notifications.displaySuccess(`Deleted ${categoryName}`);
                }, 
                () => notifications.displayError("Failed to delete category.")
            );
        },

        add: function(categoryName) {
            makeAjaxRequest(URLS.addCategory, 'POST', { name: categoryName }, 
                () => {
                    this.fetchCards();
                    notifications.displaySuccess("Category added successfully.");
                }, 
                (error) => notifications.displaySwalError(error, "Category creation failed.")
            );
        },

        handleDelete: function(event) {
            event.preventDefault();
            const categoryUrl = $(event.currentTarget).attr('href');
            const categoryName = $(event.currentTarget).data('category-name');
            const categorySlug = $(event.currentTarget).data('category-slug');

            makeAjaxRequest(`/products/staff/category/${categorySlug}/products/`, 'GET', {},
                (response) => {
                    const productCount = response.products.length;
                    const productsToDelete = response.products;
                    let productListHTML = productsToDelete.map(product => `${product}<br>`).join('');

                    Swal.fire({
                        title: `Delete ${categoryName}?`,
                        html: `Are you sure you want to delete this category? This action cannot be undone.<br>
                               ${productCount} product(s) will also be deleted. ${productListHTML ? '<br>' + productListHTML : ''}`,
                        icon: 'warning',
                        showCancelButton: true,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        confirmButtonText: 'Yes, delete it!',
                        input: 'checkbox',
                        inputValue: 0,
                        inputPlaceholder: 'I understand the consequences',
                        inputValidator: (result) => !result && 'You need to confirm by checking the box.',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            this.delete(categoryUrl, categoryName);
                        }
                    });
                },
                (error) => notifications.displaySwalError(error, "Failed to get products for category.")
            );
        }
    };

    // Event Listeners
    function initializeEventListeners() {
        ELEMENTS.categoryList.on('click', '.delete-category', (e) => categoryManager.handleDelete(e));
        $(document).on('click', '.edit-product', function(e) {
            e.preventDefault();
            productManager.showForm($(this).data('url'), true);
        });
        
        ELEMENTS.addProductButton.on('click', () => productManager.showForm(URLS.addProductForm, false));
        
        ELEMENTS.addCategoryButton.on('click', () => {
            Swal.fire({
                title: 'Add New Category',
                input: 'text',
                inputPlaceholder: 'Enter category name',
                showCancelButton: true,
                inputValidator: (value) => !value && 'Please enter a category name.',
                preConfirm: (categoryName) => categoryManager.add(categoryName)
            });
        });
    }

    // Initialize
    function initialize() {
        initializeEventListeners();
        categoryManager.fetchCards();
        productManager.fetchCards();
    }

    initialize();
});