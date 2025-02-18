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

    const addProductButton = $('#product-add-button');
    const productListContainer = $('#product-list');
    const addCategoryButtonStandalone = $('#category-add-button');

    // --- Reusable AJAX function with CSRF protection ---
    function makeAjaxRequest(url, type, data = {}, successCallback, errorCallback, processData = true, contentType = 'application/x-www-form-urlencoded; charset=UTF-8') { // Added processData and contentType parameters
        $.ajax({
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

    function deleteProduct(productUrl, productName) {
        makeAjaxRequest(productUrl, 'POST', {}, (data) => {
            fetchProductCards();
            displaySuccess(data.message); // Use the server message
        }, () => {
            displayError("Failed to delete product.");
        });
    }

    function handleProductDelete(event) {
        event.preventDefault();
        const productUrl = $(this).attr('href');
        const productName = $(this).data('product-name');

        Swal.fire({
            // ... Swal confirmation options
        }).then((result) => {
            if (result.isConfirmed) {
                deleteProduct(productUrl, productName);
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
            timer: 3000,
            timerProgressBar: true,
        });
    }

    function displayError(message) {
        Swal.fire("Error", message, "error");
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
    $(document).on('click', '.delete-product', handleProductDelete);


    addProductButton.on('click', () => {
        let outerSwal; // declare outerSwal

        // function openOuterSwal(htmlContent) {
        //     outerSwal = Swal.fire({
        //         title: 'add New Product',
        //         html: htmlContent,
        //         showCancelButton: true,
        //         didRender: () => { //didRender for outer Swal - runs after HTML is loaded into Swal
        //             const categorySelect = $('#id_category');
        //             const addCategoryUrl = $('#product-form').data('add-category-url');

        //             const addCategoryButton = $('<button type="button">') //Button to open inner "Add Category" Swal
        //                 .text('Add Category')
        //                 .addClass('btn btn-sm btn-success ml-2')
        //                 .on('click', (event) => { //Add Category button click handler
        //                     event.stopPropagation();

        //                     Swal.fire({ //Inner "Add Category" Swal
        //                         title: 'Add New Category',
        //                         input: 'text',
        //                         preConfirm: (categoryName) => {
        //                             return addCategory(categoryName, addCategoryUrl)
        //                                 .catch(error => { //Handle errors returned from addCategory AJAX call
        //                                     Swal.showValidationMessage(error.responseJSON?.error || 'Category creation failed.');
        //                                     return Promise.reject(); //Crucial to keep the Swal open after handling the error
        //                                 });
        //                         }
        //                     }).then(result => { //After inner Swal closes for *any* reason
        //                         if (result.isConfirmed) {
        //                             $.ajax({  // AJAX to refresh the outer SweetAlert's content
        //                                 url: addFormUrl,
        //                                 type: 'GET',
        //                                 headers: { 'X-Requested-With': 'XMLHttpRequest' },
        //                                 success: (updatedFormHTML) => {
        //                                     Swal.fire({  // Show success message after outer Swal has re-opened
        //                                         title: 'Category Added!',
        //                                         text: 'Please select the new category from the dropdown list.',
        //                                         icon: 'success',
        //                                     }).then(result => { 
        //                                         console.log("Inner Success Swal closed!");
        //                                         $.ajax({ //Load outer Swal HTML content
        //                                             url: addFormUrl,
        //                                             type: 'GET',
        //                                             headers: { 'X-Requested-With': 'XMLHttpRequest' },
        //                                             success: openOuterSwal,
        //                                             error: () => {
        //                                                 Swal.fire("Error", "Failed to load form.", "error");
        //                                             }
        //                                         });
        //                                         console.log("Outer Swal re-opened!");

        //                                     });
        //                                 },
        //                                 error: () => {
        //                                     Swal.fire("Error", "Failed to refresh product form. Please try again.", "error").then(result => { //Inner "Success" Swal's .then - runs after success Swal closes for any reason
        //                                         console.log("Inner Error Swal closed!");
        //                                         $.ajax({ //Load outer Swal HTML content
        //                                             url: addFormUrl,
        //                                             type: 'GET',
        //                                             headers: { 'X-Requested-With': 'XMLHttpRequest' },
        //                                             success: openOuterSwal,
        //                                             error: () => {
        //                                                 Swal.fire("Error", "Failed to load form.", "error");
        //                                             }
        //                                         });
        //                                         console.log("Outer Swal re-opened!");

        //                                     });
        //                                 }
        //                             });
        //                         }
        //                     });

        //                 }); //End of Add Category button click handler


        //             $('#id_category').parent().append(addCategoryButton);


        //             //Form Submission handler:
        //             $('#product-form').on('submit', function (e) {
        //                 e.preventDefault();

        //                 //Your existing form submission logic here
        //                 console.log("Outer Swal Confirmed - submitting form", $(this).serialize());


        //             }); //End of form submit handler



        //         }, //End of didRender for Outer Swal

        //     }); //End of outer Swal definition

        //     return outerSwal; //Return promise
        // }

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
                            Swal.close(); // Close the loading state
                            fetchProductCards();
                            displaySuccess(response?.message || "Product added successfully.");
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
                    window.location.href = productManagementUrl; // Redirect after successful product creation
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



//     $.ajax({ //Load outer Swal HTML content
//         url: addFormUrl,
//         type: 'GET',
//         headers: { 'X-Requested-With': 'XMLHttpRequest' },
//         success: openOuterSwal,
//         error: () => {
//             Swal.fire("Error", "Failed to load form.", "error");
//         }
//     });

// });

// const addCategoryButtonStandalone = $('#add-category-button');
// addCategoryButtonStandalone.on('click', () => {
//     Swal.fire({  // Standalone "Add Category" Swal
//         title: 'Add New Category',
//         input: 'text',
//         inputPlaceholder: 'Enter category name',
//         showCancelButton: true,
//         inputValidator: (value) => {
//             if (!value) {
//                 return 'You need to write something!';
//             }
//         },
//         preConfirm: (categoryName) => {
//             const addCategoryUrl = addCategoryButtonStandalone.data('add-category-url'); // Correctly get URL
//             return addCategory(categoryName, addCategoryUrl)
//                 .then(response => {
//                     return response;
//                 })
//                 .catch(error => {
//                     Swal.showValidationMessage(error.responseJSON?.error || 'Category creation failed.');
//                     return Promise.reject(); // Crucial for handling errors in preConfirm
//                 });
//         },

//     }).then(result => {
//         if (result.isConfirmed) {
//             // Refresh category cards after adding a new category
//             fetchCategoryCards();
//             Swal.fire("Category Added!", "", "success")

//         }
//     });

// });


// fetchCategoryCards(); // Fetch category cards on page load

// function handleCategoryAdd(categoryName) { // No need for addCategoryUrl as a parameter
//     return $.ajax({
//         url: addCategoryUrl, // Use the global variable
//         type: 'POST',
//         data: { name: categoryName },
//         headers: {
//             'X-CSRFToken': getCookie('csrftoken'),
//             'X-Requested-With': 'XMLHttpRequest'
//         }
//     }).then(response => {
//         // Success handling (e.g., display success message, fetch updated cards)
//         console.log("Category added:", response);
//         return response; // Important for chaining
//     }).catch(error => {
//         // Error handling (e.g., display error message from responseJSON)
//         console.error("Error adding category:", error);
//         return Promise.reject(error); // Re-throw for Swal to handle
//     });
// }

// function handleProductDelete(event) {
//     event.preventDefault();
//     const productUrl = $(this).attr('href');
//     const productName = $(this).data('product-name');

//     Swal.fire({
//         // ... your existing Swal confirmation ...
//     }).then((result) => {
//         if (result.isConfirmed) {
//             $.ajax({
//                 // ... (your existing AJAX code to delete the product)
//                 success: (data) => {
//                     // Refresh product cards after deletion
//                     fetchProductCards();
//                     // Display success message
//                 },
//                 error: (error) => { // Enhanced error handling
//                     console.error("Error deleting product:", error);
//                     // Display error message
//                 }
//             });
//         }
//     });
// }

// $(document).on('click', '.delete-category', function (event) {  // Use event delegation
//     event.preventDefault();
//     const categoryUrl = $(this).attr('href');
//     const categoryName = $(this).data('category-name');


//     Swal.fire({ //Confirmation Swal
//         title: `Are you sure you want to delete ${categoryName}?`,
//         text: "This action cannot be undone.",
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonColor: '#d33',
//         cancelButtonColor: '#3085d6',
//         confirmButtonText: 'Delete',
//         reverseButtons: true, // Put cancel on the right
//     }).then((result) => {
//         if (result.isConfirmed) {
//             $.ajax({ //AJAX call to delete category
//                 url: categoryUrl,
//                 type: 'POST',
//                 headers: {
//                     'X-Requested-With': 'XMLHttpRequest',
//                     'X-CSRFToken': getCookie('csrftoken')
//                 },
//                 success: (response) => {
//                     console.log("Deleted Category:", response)
//                     fetchCategoryCards(); // Reload category cards
//                     Swal.fire("Deleted!", response.message, "success");


//                 },
//                 error: (xhr, status, error) => { //Handle errors
//                     Swal.fire("Error!", "An error occurred while deleting the category.", "error");
//                     console.error("AJAX Error:", status, error, xhr.responseText);

//                 }
//             });
//         }

//     });

// });


// $(document).on('click', '.edit-category', function (event) { //edit-category click handler

//     event.preventDefault();
//     const updateUrl = $(this).attr('href');

//     // 1. AJAX to get the update form:
//     $.ajax({
//         url: updateUrl,
//         type: 'GET',
//         headers: { 'X-Requested-With': 'XMLHttpRequest' },
//         success: (response) => {

//             // 2. Open SweetAlert2 with the form
//             Swal.fire({
//                 title: 'Edit Category',
//                 html: response.html,
//                 showCancelButton: true,
//                 preConfirm: () => {
//                     // 3. Submit the form using AJAX:
//                     return $.ajax({
//                         url: updateUrl,
//                         type: 'POST',
//                         data: $('#category-update-form').serialize(), // Correct form ID
//                         headers: {
//                             'X-Requested-With': 'XMLHttpRequest',
//                             'X-CSRFToken': getCookie('csrftoken')
//                         }
//                     }).then(response => { //Update successfull
//                         console.log("Successfully updated category:", response);
//                         // Refresh category cards after successful update:
//                         fetchCategoryCards();
//                     }).catch(error => { //Handle AJAX errors during update
//                         Swal.showValidationMessage(error.responseJSON?.error || 'An error occurred during the update.');
//                         return Promise.reject(error);
//                     });


//                 }, //End PreConfirm

//             }).then((result) => { //Inner Swal then - handle final success message display
//                 if (result.isConfirmed) {
//                     Swal.fire("Updated!", "Category updated successfully.", "success");


//                 }

//             });
//         },
//         error: (xhr, status, error) => {
//             console.error("AJAX Error (edit):", status, error, xhr.responseText);
//             Swal.fire("Error", "Failed to load the edit form.", "error");
//         }

//     });


// });


// function addCategory(categoryName, addCategoryUrl) {
//     console.log("Add Category URL addCategory:", addCategoryUrl);
//     return $.ajax({ // <-- Return the promise here
//         url: addCategoryUrl,
//         type: 'POST',
//         data: { name: categoryName },
//         headers: {
//             'X-CSRFToken': getCookie('csrftoken'),
//             'X-Requested-With': 'XMLHttpRequest'
//         },

//     }).then(response => {
//         console.log("Add Category Success:", response); // Log success
//         return response // resolve with response data.
//     })
//         .catch(error => { // Log and handle errors
//             console.error("Add Category Error:", error.status, error.responseText); // Log status and response on error
//             // Important: re-throw or return a rejected promise for Swal to handle the error
//             return Promise.reject(error);
//         });
// }

// function fetchProductCards() {
//     $.ajax({
//         url: getProductListUrl, // Use the global URL variable
//         type: 'GET',
//         headers: { 'X-Requested-With': 'XMLHttpRequest' },
//         success: (data) => {
//             $('#product-list').html(data); // Or #product-list-section, if that's where the product list goes
//             attachProductDeleteListeners();
//         },
//         error: (error) => {
//             console.error("Error fetching product list:", error);
//             // Handle errors appropriately
//         },
//     });
// }

// function attachDeleteListeners() {
//     $('.delete-product').on('click', function (event) {
//         event.preventDefault();
//         const productUrl = $(this).attr('href');
//         const productName = $(this).data('product-name');

//         Swal.fire({
//             title: `Are you sure you want to delete ${productName}?`,
//             text: "You won't be able to revert this!",
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonColor: '#3085d6',
//             cancelButtonColor: '#d33',
//             confirmButtonText: 'Yes, delete it!'
//         }).then((result) => {
//             if (result.isConfirmed) {
//                 $.ajax({
//                     url: productUrl,
//                     type: 'POST',
//                     headers: {
//                         'X-CSRFToken': getCookie('csrftoken'), // Consistent CSRF token retrieval
//                         'X-Requested-With': 'XMLHttpRequest',
//                     },
//                     success: (data) => {
//                         Swal.fire({
//                             icon: 'success',
//                             title: data.message,
//                             toast: true,
//                             position: 'top-end',
//                             showConfirmButton: false,
//                             timer: 3000,
//                             timerProgressBar: true,
//                         }).then(() => {
//                             fetchProductCards(); // Refresh the product list after deleting
//                         });


//                     },
//                     error: () => {
//                         Swal.fire("Error", "Failed to delete product.", "error");
//                     }
//                 });
//             }
//         });
//     });
// }

