import Swal from 'sweetalert2';
import $ from 'jquery';

$(function () {
    const createProductButton = $('#create-product-button');
    const productListContainer = $('#product-list'); // More descriptive name

    createProductButton.on('click', () => {
        const createFormUrl = createProductButton.data('create-form-url');
        const createUrl = createProductButton.data('create-url');


        let outerSwal;

        function openOuterSwal(htmlContent) {
            outerSwal = Swal.fire({
                title: 'Create New Product',
                html: htmlContent,
                showCancelButton: true,
                didRender: () => { //didRender for outer Swal - runs after HTML is loaded into Swal
                    const categorySelect = $('#id_category');
                    const addCategoryUrl = $('#product-form').data('add-category-url');
        
                    const addCategoryButton = $('<button type="button">') //Button to open inner "Add Category" Swal
                        .text('Add Category')
                        .addClass('btn btn-sm btn-success ml-2')
                        .on('click', (event) => { //Add Category button click handler
                            event.stopPropagation();
        
                            Swal.fire({ //Inner "Add Category" Swal
                                title: 'Add New Category',
                                input: 'text',
                                preConfirm: (categoryName) => {
                                    return addCategory(categoryName, addCategoryUrl)
                                        .catch(error => { //Handle errors returned from addCategory AJAX call
                                            Swal.showValidationMessage(error.responseJSON?.error || 'Category creation failed.');
                                            return Promise.reject(); //Crucial to keep the Swal open after handling the error
                                        });
                                }
                            }).then(result => { //After inner Swal closes for *any* reason
                                if (result.isConfirmed) {
                                    $.ajax({  // AJAX to refresh the outer SweetAlert's content
                                        url: createFormUrl,
                                        type: 'GET',
                                        headers: { 'X-Requested-With': 'XMLHttpRequest' },
                                        success: (updatedFormHTML) => {
                                            Swal.fire({  // Show success message after outer Swal has re-opened
                                                title: 'Category Added!',
                                                text: 'Please select the new category from the dropdown list.',
                                                icon: 'success',
                                            }).then(result => { 
                                                console.log("Inner Success Swal closed!");
                                                $.ajax({ //Load outer Swal HTML content
                                                    url: createFormUrl,
                                                    type: 'GET',
                                                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                                                    success: openOuterSwal,
                                                    error: () => {
                                                        Swal.fire("Error", "Failed to load form.", "error");
                                                    }
                                                });
                                                console.log("Outer Swal re-opened!");

                                            });
                                        },
                                        error: () => {
                                            Swal.fire("Error", "Failed to refresh product form. Please try again.", "error").then(result => { //Inner "Success" Swal's .then - runs after success Swal closes for any reason
                                                console.log("Inner Error Swal closed!");
                                                $.ajax({ //Load outer Swal HTML content
                                                    url: createFormUrl,
                                                    type: 'GET',
                                                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                                                    success: openOuterSwal,
                                                    error: () => {
                                                        Swal.fire("Error", "Failed to load form.", "error");
                                                    }
                                                });
                                                console.log("Outer Swal re-opened!");

                                            });
                                        }
                                    });
                                }
                            });
        
                        }); //End of Add Category button click handler
        
        
                    $('#id_category').parent().append(addCategoryButton);
        
        
                    //Form Submission handler:
                    $('#product-form').on('submit', function (e) {
                        e.preventDefault();
        
                        //Your existing form submission logic here
                        console.log("Outer Swal Confirmed - submitting form", $(this).serialize());
        
        
                    }); //End of form submit handler
        
        
        
                }, //End of didRender for Outer Swal
        
            }); //End of outer Swal definition
        
            return outerSwal; //Return promise
        }


        $.ajax({ //Load outer Swal HTML content
            url: createFormUrl,
            type: 'GET',
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
            success: openOuterSwal,
            error: () => {
                Swal.fire("Error", "Failed to load form.", "error");
            }
        });

    });


    function addCategory(categoryName, addCategoryUrl) {
        console.log("Add Category URL addCategory:", addCategoryUrl);
        return $.ajax({ // <-- Return the promise here
            url: addCategoryUrl,
            type: 'POST',
            data: { name: categoryName },
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'X-Requested-With': 'XMLHttpRequest'
            },

        }).then(response => {
            console.log("Add Category Success:", response); // Log success
            return response // resolve with response data.
        })
            .catch(error => { // Log and handle errors
                console.error("Add Category Error:", error.status, error.responseText); // Log status and response on error
                // Important: re-throw or return a rejected promise for Swal to handle the error
                return Promise.reject(error);
            });
    }

    function fetchProductCards() {
        $.ajax({
            url: createProductButton.data('product-management-url'),
            type: 'GET',
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
            success: (data) => {
                productListContainer.html(data);
                attachDeleteListeners();
            },
            error: () => {
                Swal.fire("Error", "Failed to refresh product list.", "error");
            },
        });
    }

    function attachDeleteListeners() {
        $('.delete-product').on('click', function (event) {
            event.preventDefault();
            const productUrl = $(this).attr('href');
            const productName = $(this).data('product-name');

            Swal.fire({
                title: `Are you sure you want to delete ${productName}?`,
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    $.ajax({
                        url: productUrl,
                        type: 'POST',
                        headers: {
                            'X-CSRFToken': getCookie('csrftoken'), // Consistent CSRF token retrieval
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                        success: (data) => {
                            Swal.fire({
                                icon: 'success',
                                title: data.message,
                                toast: true,
                                position: 'top-end',
                                showConfirmButton: false,
                                timer: 3000,
                                timerProgressBar: true,
                            }).then(() => {
                                fetchProductCards(); // Refresh the product list after deleting
                            });


                        },
                        error: () => {
                            Swal.fire("Error", "Failed to delete product.", "error");
                        }
                    });
                }
            });
        });
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

