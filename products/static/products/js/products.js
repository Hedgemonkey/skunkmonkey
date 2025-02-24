import $ from 'jquery';
import 'bootstrap';
import Cropper from 'cropperjs';
import Swal from 'sweetalert2';

$(function () {
    const csrfToken = getCookie('csrftoken'); // Get CSRF token once on load

    // URLs available on initial load
    const addProductFormUrl = $('#product-add-button').data('product-add-form-url');
    const addProductUrl = $('#product-add-button').data('product-add-url');
    const productManagementUrl = $('#product-add-button').data('product-management-url');
    const getCategoryCardsUrl = $('#category-cards-container').data('category-cards-url'); // Correct ID
    const addCategoryUrl = $('#category-add-button').data('category-add-url');
    const productBaseUrl = '/products/staff/product/';

    const addProductButton = $('#product-add-button');
    const productListContainer = $('#product-list');
    const addCategoryButtonStandalone = $('#category-add-button');

    // --- Reusable AJAX function with CSRF protection ---
    function makeAjaxRequest(url, type, data = {}, successCallback, errorCallback, processData = true, contentType = 'application/x-www-form-urlencoded; charset=UTF-8') { // Added processData and contentType parameters
        return $.ajax({
            url: url,
            type: type,
            headers: {
                'X-CSRFToken': csrfToken,
                'X-Requested-With': 'XMLHttpRequest'
            },
            data: data,
            processData: processData,        // Set processData based on parameter
            contentType: contentType,     // Set contentType based on parameter          
            success: successCallback,
            error: errorCallback
        });
    }

    // --- Product Image Cropping ---
    function showProductForm(url) {
        console.log(`Making AJAX request to load form: ${url}`);
        $.ajax({
            url: url,
            type: 'GET',
            success: function(response) {
                Swal.fire({
                    title: 'Edit Product',
                    html: response.html,
                    showCancelButton: true,
                    confirmButtonText: 'Save',
                    allowOutsideClick: false, // Prevent closing on outside click
                    allowEscapeKey: false,    // Prevent closing on escape key
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
                        fetchProductCards(); // Refresh product cards
                    }
                });
    
                // Call the image handling function after the form is loaded
                handleImageInputChange();
            }
        });
    }
    
    function handleImageInputChange() {
        const imageInput = $('#image-input');
        const uploadButton = $('#upload-button');
        let cropper;
    
        imageInput.on('change', function(event) {
            const files = event.target.files;
            if (files && files.length > 0) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    $('#cropper-image').attr('src', e.target.result);
                    $('#cropperModal').modal('show'); // Use jQuery to show the modal
    
                    $('#cropperModal').on('shown.bs.modal', function () {
                        const imageElement = document.getElementById('cropper-image');
                        cropper = new Cropper(imageElement, {
                            aspectRatio: 1,
                            viewMode: 1,
                            autoCropArea: 0.8,
                            movable: true,
                            zoomable: true,
                            rotatable: true,
                            scalable: true,
                            responsive: true,
                            background: false,
                            guides: false,
                            highlight: false,
                            cropBoxResizable: true,
                            cropBoxMovable: true,
                        });
    
                        // Bind the slider to the rotate method
                        $('#rotate-slider').on('input', function() {
                            const angle = parseFloat($(this).val());
                            cropper.rotateTo(angle);
                        });
                    });
                };
                reader.readAsDataURL(files[0]);
            }
        });
    
        $('#crop-button').on('click', function() {
            if (cropper) {
                const canvas = cropper.getCroppedCanvas();
                canvas.toBlob(function(blob) {
                    const url = URL.createObjectURL(blob);
                    $('#image-preview').attr('src', url); // Update the image preview in the main form
                    $('#cropperModal').modal('hide'); // Use jQuery to hide the modal
                    uploadButton.prop('disabled', false);
    
                    // Replace the original image file in the form data with the cropped image blob
                    const formData = new FormData($('#product-form')[0]);
                    formData.set('image', blob, 'cropped-image.png');
    
                    // Update the form submission logic to use the updated formData
                    uploadButton.on('click', function() {
                        $.ajax({
                            url: $('#product-update-form').attr('action'),
                            type: 'POST',
                            data: formData,
                            processData: false,
                            contentType: false,
                            success: function(response) {
                                if (response.success) {
                                    Swal.fire('Success', 'Product updated successfully!', 'success');
                                    fetchProductCards(); // Refresh product cards
                                } else {
                                    Swal.fire('Error', 'Failed to update product.', 'error');
                                }
                            },
                            error: function() {
                                Swal.fire('Error', 'An error occurred while updating the product.', 'error');
                            }
                        });
                    });
                });
            }
        });
    }


    // --- Category Functions ---
    function fetchCategoryCards() {
        makeAjaxRequest(getCategoryCardsUrl, 'GET', {}, (cardHTML) => {
            $('#category-cards-container').html(cardHTML);
        }, () => {
            console.error("Failed to load category cards.");
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
            (response) => { // Success callback
                const productCount = response.products.length;
                const productsToDelete = response.products;

                let productListHTML = '';
                if (productCount > 0) {
                    productsToDelete.forEach(product => {
                        productListHTML += `${product}<br>`; // Just add a line break after each product
                    });
                }
                Swal.fire({
                    title: `Delete ${categoryName}?`,
                    html: `Are you sure you want to delete this category? This action cannot be undone.<br>
                           ${productCount} product(s) will also be deleted. ${productListHTML ? '<br>' + productListHTML : ''}`, // Display product count and list
                    icon: 'warning',
                    showCancelButton: true,
                    allowOutsideClick: false, // Prevent closing on outside click
                    allowEscapeKey: false,    // Prevent closing on escape key
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Yes, delete it!',
                    input: 'checkbox',                           // Add checkbox
                    inputValue: 0,
                    inputPlaceholder: 'I understand the consequences', // Checkbox label
                    inputValidator: (result) => {
                        if (!result) {
                            return 'You need to confirm by checking the box.' // Checkbox validation message
                        }
                    },
                    preConfirm: () => {    // Keep preConfirm for potential future server-side validation, etc.
                        return new Promise((resolve) => { resolve() });
                    },
                }).then((result) => {
                    if (result.isConfirmed) {
                        deleteCategory(categoryUrl, categoryName);
                        fetchCategoryCards();
                    }
                });

            }, (error) => { // Error callback – IMPORTANT!
                displaySwalError(error, "Failed to get products for category."); // Handle errors
            }
        );

    }


    // --- Product Functions ---
    function fetchProductCards() {
        makeAjaxRequest(productManagementUrl, 'GET', {}, (data) => {
            productListContainer.html(data); // Use more descriptive name
            attachDeleteListeners();
        }, () => {
            console.error("Error fetching product list.");
            displayError("Failed to refresh product list.");
        });
    }

    function deleteProduct(productSlug) {
        const deleteUrl = `${productBaseUrl}${productSlug}/delete/`;

        try {  // Use try...catch to handle potential errors *before* the AJAX call
            const ajaxPromise = makeAjaxRequest(deleteUrl, 'POST');
            // *** Essential Check: Make sure makeAjaxRequest returns a Promise ***
            if (!ajaxPromise || typeof ajaxPromise.then !== 'function') { //Simplified Check
                return Promise.reject("Invalid AJAX response"); // Correct: Immediately reject if not a Promise
            }
            return ajaxPromise
                .then(response => {  // Success: Log the response and resolve
                    return response; //Resolve promise with value from server for preConfirm
                })
                .catch(error => {  // Error: log the error and reject
                    return Promise.reject(error);  // Reject and return the error - IMPORTANT!
                });
        } catch (error) {  // Catch errors before/during makeAjaxRequest
            return Promise.reject(error); // Return rejected promise for consistent error handling
        }

    }

    function handleProductDelete(productSlug, productName) {
        Swal.fire({
            title: `Delete ${productName}?`,
            text: "Are you sure you want to delete this product? This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            allowOutsideClick: false, // Prevent closing on outside click
            allowEscapeKey: false,    // Prevent closing on escape key
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            preConfirm: () => {
                Swal.showLoading();
                return deleteProduct(productSlug) //Call deleteProduct
                    .then(response => { // handle success
                        displaySuccess(response?.message || "Product deleted successfully.");
                        fetchProductCards();
                        return Promise.resolve();
                    })
                    .catch(error => {  // Handle errors
                        Swal.hideLoading();
                        if (error.responseJSON && error.responseJSON.error) {
                            displaySwalError(error, error.responseJSON.error);  // Display server error
                        } else {
                            displaySwalError(error, 'Failed to delete product. Please try again.'); //Display generic message
                        }

                        return Promise.reject(error); //Crucially return a rejected promise so Swal stays open
                    });
            }
        }).then((result) => { //Log Swal result if it was confirmed.
            if (result.isConfirmed) { //Only display success message and fetch cards if the product was deleted and the Swal wasn't dismissed in some other way.
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

    // --- Shared UI Functions ---
    function displaySuccess(message) {
        Swal.fire({
            icon: 'success',
            title: message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            allowOutsideClick: false, // Prevent closing on outside click
            allowEscapeKey: false,    // Prevent closing on escape key
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
            allowOutsideClick: false, // Prevent closing on outside click
            allowEscapeKey: false,    // Prevent closing on escape key
            timer: 10000,
            timerProgressBar: true,
        });
    }

    function displaySwalError(error, defaultMessage) {
        Swal.showValidationMessage(error.responseJSON?.error || defaultMessage);
        return Promise.reject();
    }

    function loadEditForm(url, title, formSelector, fetchFunction) {
        console.log(`Making AJAX request to load form: ${url}`);
        makeAjaxRequest(url, 'GET', {}, (response) => {
            console.log('Form HTML received:', response.html);
            Swal.fire({
                title: title,
                html: response.html,
                showCancelButton: true,
                allowOutsideClick: false, // Prevent closing on outside click
                allowEscapeKey: false,    // Prevent closing on escape key
                confirmButtonText: `Update ${title.split(' ')[1]}`,
                preConfirm: () => {
                    Swal.showLoading();
                    const formData = $(formSelector).serialize();
                    console.log('Submitting form data:', formData);
                    return makeAjaxRequest(url, 'POST', formData, (response) => {
                        if (response.success) {
                            console.log('Update successful:', response.message);
                            Swal.fire('Success', response.message, 'success').then(() => {
                                fetchFunction(); // Refresh the list after successful update
                            });
                        } else {
                            console.error('Update failed:', response.errors);
                            Swal.showValidationMessage('Failed to update.');
                        }
                    }, (error) => {
                        console.error('Error during form submission:', error);
                        Swal.showValidationMessage('Failed to update.');
                    });
                }
            });
        }, (error) => {
            console.error('Error loading form:', error);
            Swal.fire('Error', `Failed to load ${title.toLowerCase()} form.`, 'error');
        });
    }

    // --- Event Handlers ---
    $('#category-list').on('click', '.delete-category', handleCategoryDelete);
    $(document).on('click', '.edit-category', handleCategoryEdit);
    $(document).on('click', '.edit-product', handleProductEdit);
    $(document).on('click', '.delete-product', function (event) {
        event.preventDefault();
        handleProductDelete($(this).data('product-slug'), $(this).data('product-name'));
    });


    addProductButton.on('click', () => {
        let outerSwal; // declare outerSwal

        makeAjaxRequest(addProductFormUrl, 'GET', {}, (htmlContent) => {
            outerSwal = Swal.fire({
                title: 'Add New Product',
                html: htmlContent,
                showCancelButton: true,
                allowOutsideClick: false, // Prevent closing on outside click
                allowEscapeKey: false,    // Prevent closing on escape key
                confirmButtonText: 'Add Product',
                preConfirm: () => { // Correct placement for form submission
                    Swal.showLoading(); // Show loading state
                    const formData = new FormData($('#product-form')[0]); // Use FormData for file uploads
                    return makeAjaxRequest(  // Use makeAjaxRequest *directly* in preConfirm
                        addProductUrl,
                        'POST',
                        formData,
                        (response) => { // Success callback
                            fetchProductCards();
                            // Redirect *after* closing Swal to prevent duplicate messages
                            return productManagementUrl; // Return the redirect URL from preConfirm
                        },
                        (error) => { // Error callback
                            Swal.hideLoading();
                            displaySwalError(error, "Failed to add product.");
                            return Promise.reject(error); // Important: reject the promise if there's an error
                        },
                        false,
                        false
                    );
                }
            }).then((result) => {  //  *** Now outerSwal is guaranteed to be initialized ***
                console.log("add Product Swal closed. Result:", result);
                // All interaction with outerSwal MUST be inside this .then block:
                if (result.isConfirmed) {
                    displaySuccess(result.value?.message || "Product added successfully."); // Display success message here
                    fetchProductCards(); // Fetch new Product Cards
                } else if (result.isDismissed) { //If we are just closing the Swal then we also need to remove the form.
                    $("#product-form").remove();
                }
            }).then(() => {
                console.log("add Product outer Swal now closed after error.")
            }); // outerSwal declaration and initialization;
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

    // --- Initial Fetching ---
    fetchCategoryCards();
    fetchProductCards();

    // --- attachDeleteListeners ---
    function attachDeleteListeners() {
        $('.delete-product').on('click', handleProductDelete); // Consistent event handling
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
