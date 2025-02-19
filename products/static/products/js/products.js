import Swal from 'sweetalert2';
import $ from 'jquery';

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
        const updateUrl = $(this).attr('href');

        makeAjaxRequest(updateUrl, 'GET', {}, (response) => {
            showEditCategorySwal(response, updateUrl);
        }, () => {
            displayError("Failed to load edit form.");
        });
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

        Swal.fire({
            // ... your Swal confirmation options
        }).then((result) => {
            if (result.isConfirmed) {
                deleteCategory(categoryUrl, categoryName);
            }
        });
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

    // --- Shared UI Functions ---
    function displaySuccess(message) {
        Swal.fire({
            icon: 'success',
            title: message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
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
            timer: 10000,
            timerProgressBar: true,
        });
    }

    function displaySwalError(error, defaultMessage) {
        Swal.showValidationMessage(error.responseJSON?.error || defaultMessage);
        return Promise.reject();
    }

    function showEditCategorySwal(response, updateUrl) {
        Swal.fire({
            title: 'Edit Category',
            html: response.html, // Assuming your view sends the HTML in response.html
            showCancelButton: true,
            preConfirm: () => {
                return makeAjaxRequest(
                    updateUrl,
                    'POST',
                    $('#category-update-form').serialize(),
                    () => {
                        fetchCategoryCards();
                    },
                    (error) => displaySwalError(error, "Category update failed.")
                );
            }
        }).then((result) => {
            if (result.isConfirmed) {
                displaySuccess("Category updated successfully.");
            }
        });
    }

    // --- Event Handlers ---
    $('#category-list').on('click', '.delete-category', handleCategoryDelete);
    $(document).on('click', '.edit-category', handleCategoryEdit);
    $(document).on('click', '.delete-product', function(event) { 
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

        function refreshaddProductForm() {
            makeAjaxRequest(addFormUrl, 'GET', {}, (updatedFormHTML) => {
                outerSwal.update({ html: updatedFormHTML });
            }, () => {
                displayError("Failed to refresh product form.");
                outerSwal.close(); // Close the outer Swal on failure to refresh the form.
            });
        }
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
