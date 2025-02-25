import $ from 'jquery';
import 'bootstrap';
import Swal from 'sweetalert2';

$(function () {
    const csrfToken = getCookie('csrftoken');

    const addProductFormUrl = $('#product-add-button').data('product-add-form-url');
    const addProductUrl = $('#product-add-button').data('product-add-url');
    const productManagementUrl = $('#product-add-button').data('product-management-url');
    const getCategoryCardsUrl = $('#category-cards-container').data('category-cards-url');
    const addCategoryUrl = $('#category-add-button').data('category-add-url');
    const productBaseUrl = '/products/staff/product/';

    const addProductButton = $('#product-add-button');
    const productListContainer = $('#product-list');
    const addCategoryButtonStandalone = $('#category-add-button');

    function makeAjaxRequest(url, type, data = {}, successCallback, errorCallback, processData = true, contentType = 'application/x-www-form-urlencoded; charset=UTF-8') {
        return $.ajax({
            url: url,
            type: type,
            headers: {
                'X-CSRFToken': csrfToken,
                'X-Requested-With': 'XMLHttpRequest'
            },
            data: data,
            processData: processData,
            contentType: contentType,
            success: successCallback,
            error: errorCallback
        });
    }

    function showProductForm(url) {
        $.ajax({
            url: url,
            type: 'GET',
            success: function(response) {
                Swal.fire({
                    title: 'Edit Product',
                    html: response.html,
                    showCancelButton: true,
                    confirmButtonText: 'Save',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    preConfirm: () => {
                        const form = $('#product-update-form')[0];
                        const formData = new FormData(form);
                        return $.ajax({
                            url: form.action,
                            type: 'POST',
                            data: formData,
                            processData: false,
                            contentType: false,
                        }).then(response => {
                            if (!response.success) {
                                Swal.showValidationMessage('Failed to update product.');
                                return Promise.reject(response.errors);
                            }
                            return response;
                        }).catch(error => {
                            Swal.showValidationMessage('An error occurred while saving the product.');
                            return Promise.reject(error);
                        });
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        displaySuccess(result.value?.message || "Product updated successfully.");
                        fetchProductCards();
                    }
                });
            }
        });
    }

    function fetchCategoryCards() {
        makeAjaxRequest(getCategoryCardsUrl, 'GET', {}, (cardHTML) => {
            $('#category-cards-container').html(cardHTML);
        }, () => {
            displayError("Failed to load category cards.");
        });
    }

    function deleteCategory(categoryUrl, categoryName) {
        makeAjaxRequest(categoryUrl, 'POST', {}, () => {
            fetchCategoryCards();
            displaySuccess(`Deleted ${categoryName}`);
        }, () => {
            displayError("Failed to delete category.");
        });
    }

    function handleCategoryEdit(event) {
        event.preventDefault();
        const url = $(this).attr('href');
        loadEditForm(url, 'Edit Category', '#category-update-form', fetchCategoryCards);
    }

    function handleCategoryAdd(categoryName) {
        makeAjaxRequest(addCategoryUrl, 'POST', { name: categoryName }, () => {
            fetchCategoryCards();
            displaySuccess("Category added successfully.");
        }, (error) => {
            displaySwalError(error, "Category creation failed.");
        });
    }

    function handleCategoryDelete(event) {
        event.preventDefault();
        const categoryUrl = $(this).attr('href');
        const categoryName = $(this).data('category-name');
        const categorySlug = $(this).data('category-slug');

        makeAjaxRequest(`/products/staff/category/${categorySlug}/products/`, 'GET', {},
            (response) => {
                const productCount = response.products.length;
                const productsToDelete = response.products;

                let productListHTML = '';
                if (productCount > 0) {
                    productsToDelete.forEach(product => {
                        productListHTML += `${product}<br>`;
                    });
                }
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
                    inputValidator: (result) => {
                        if (!result) {
                            return 'You need to confirm by checking the box.'
                        }
                    },
                    preConfirm: () => {
                        return new Promise((resolve) => { resolve() });
                    },
                }).then((result) => {
                    if (result.isConfirmed) {
                        deleteCategory(categoryUrl, categoryName);
                        fetchCategoryCards();
                    }
                });

            }, (error) => {
                displaySwalError(error, "Failed to get products for category.");
            }
        );

    }

    function fetchProductCards() {
        makeAjaxRequest(productManagementUrl, 'GET', {}, (data) => {
            productListContainer.html(data);
            attachDeleteListeners();
        }, () => {
            displayError("Failed to refresh product list.");
        });
    }

    function deleteProduct(productSlug) {
        const deleteUrl = `${productBaseUrl}${productSlug}/delete/`;

        try {
            const ajaxPromise = makeAjaxRequest(deleteUrl, 'POST');
            if (!ajaxPromise || typeof ajaxPromise.then !== 'function') {
                return Promise.reject("Invalid AJAX response");
            }
            return ajaxPromise
                .then(response => {
                    return response;
                })
                .catch(error => {
                    return Promise.reject(error);
                });
        } catch (error) {
            return Promise.reject(error);
        }

    }

    function handleProductDelete(productSlug, productName) {
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
                return deleteProduct(productSlug)
                    .then(response => {
                        displaySuccess(response?.message || "Product deleted successfully.");
                        fetchProductCards();
                        return Promise.resolve();
                    })
                    .catch(error => {
                        Swal.hideLoading();
                        if (error.responseJSON && error.responseJSON.error) {
                            displaySwalError(error, error.responseJSON.error);
                        } else {
                            displaySwalError(error, 'Failed to delete product. Please try again.');
                        }

                        return Promise.reject(error);
                    });
            }
        }).then((result) => {
            if (result.isConfirmed) {
                displaySuccess(result.value?.message || `Product ${productName} deleted successfully.`);
                fetchProductCards();
            }
        });
    }

    function handleProductEdit(event) {
        event.preventDefault();
        const url = $(this).data('url');
        showProductForm(url);
    }

    function displaySuccess(message) {
        Swal.fire({
            icon: 'success',
            title: message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            timer: 10000,
            timerProgressBar: true,
        });
    }

    function displayError(message) {
        Swal.fire({
            icon: 'error',
            title: message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            timer: 10000,
            timerProgressBar: true,
        });
    }

    function displaySwalError(error, defaultMessage) {
        Swal.showValidationMessage(error.responseJSON?.error || defaultMessage);
        return Promise.reject();
    }

    function loadEditForm(url, title, formSelector, fetchFunction) {
        makeAjaxRequest(url, 'GET', {}, (response) => {
            Swal.fire({
                title: title,
                html: response.html,
                showCancelButton: true,
                allowOutsideClick: false,
                allowEscapeKey: false,
                confirmButtonText: `Update ${title.split(' ')[1]}`,
                preConfirm: () => {
                    Swal.showLoading();
                    const formData = $(formSelector).serialize();
                    return makeAjaxRequest(url, 'POST', formData, (response) => {
                        if (response.success) {
                            Swal.fire('Success', response.message, 'success').then(() => {
                                fetchFunction();
                            });
                        } else {
                            Swal.showValidationMessage('Failed to update.');
                        }
                    }, (error) => {
                        Swal.showValidationMessage('Failed to update.');
                    });
                }
            });
        }, (error) => {
            Swal.fire('Error', `Failed to load ${title.toLowerCase()} form.`, 'error');
        });
    }

    $('#category-list').on('click', '.delete-category', handleCategoryDelete);
    $(document).on('click', '.edit-category', handleCategoryEdit);
    $(document).on('click', '.edit-product', handleProductEdit);
    $(document).on('click', '.delete-product', function (event) {
        event.preventDefault();
        handleProductDelete($(this).data('product-slug'), $(this).data('product-name'));
    });

    addProductButton.on('click', () => {
        let outerSwal;

        makeAjaxRequest(addProductFormUrl, 'GET', {}, (htmlContent) => {
            outerSwal = Swal.fire({
                title: 'Add New Product',
                html: htmlContent,
                showCancelButton: true,
                allowOutsideClick: false,
                allowEscapeKey: false,
                confirmButtonText: 'Add Product',
                preConfirm: () => {
                    Swal.showLoading();
                    const formData = new FormData($('#product-form')[0]);
                    return makeAjaxRequest(
                        addProductUrl,
                        'POST',
                        formData,
                        (response) => {
                            fetchProductCards();
                            return productManagementUrl;
                        },
                        (error) => {
                            Swal.hideLoading();
                            displaySwalError(error, "Failed to add product.");
                            return Promise.reject(error);
                        },
                        false,
                        false
                    );
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    displaySuccess(result.value?.message || "Product added successfully.");
                    fetchProductCards();
                } else if (result.isDismissed) {
                    $("#product-form").remove();
                }
            }).then(() => {
                console.log("add Product outer Swal now closed after error.")
            });
        }, (error) => {
            displaySwalError(error, "Failed to add product.");
        });
    });

    addCategoryButtonStandalone.on('click', () => {
        Swal.fire({
            title: 'Add New Category',
            input: 'text',
            inputPlaceholder: 'Enter category name',
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                    return 'Please enter a category name.';
                }
            },
            preConfirm: (categoryName) => {
                return handleCategoryAdd(categoryName)
                    .catch(error => {
                        Swal.showValidationMessage(error.responseJSON?.error || 'Category creation failed.');
                        return Promise.reject();
                    });
            },
        }).then(result => {
            if (result.isConfirmed) {
                fetchCategoryCards();
                displaySuccess("Category Added!");
            }
        });
    });

    fetchCategoryCards();
    fetchProductCards();

    function attachDeleteListeners() {
        $('.delete-product').on('click', handleProductDelete);
    }

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

    attachDeleteListeners();
});