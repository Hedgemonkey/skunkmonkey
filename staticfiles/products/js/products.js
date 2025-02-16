import Swal from 'sweetalert2';
import $ from 'jquery';

$(function () {
    const createProductButton = $('#create-product-button');
    const productListContainer = $('#product-list'); // More descriptive name

    createProductButton.on('click', () => {
        const createFormUrl = createProductButton.data('create-form-url');
        const createUrl = createProductButton.data('create-url');

        $.ajax({
            url: createFormUrl,
            type: 'GET',
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
            success: (formHTML) => {
                Swal.fire({
                    title: 'Create New Product',
                    html: formHTML,
                    showCancelButton: true,
                    confirmButtonText: 'Save',
                    showLoaderOnConfirm: true,
                    preConfirm: () => {
                        const formData = new FormData($('#product-form')[0]);
                        return $.ajax({
                            url: createUrl,
                            type: 'POST',
                            data: formData,
                            processData: false,
                            contentType: false,
                            headers: {
                                'X-Requested-With': 'XMLHttpRequest',
                                'X-CSRFToken': getCookie('csrftoken') // Consistent CSRF token retrieval
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
                                    productListContainer.empty(); // Clear and refresh product list
                                    fetchProductCards();
                                });
                            },
                            error: (xhr) => {
                                if (xhr.status === 422) {
                                    const errors = xhr.responseJSON ? Object.values(xhr.responseJSON).flat().join('<br>') : 'Validation error'; // Handle potential missing responseJSON
                                    Swal.showValidationMessage(errors);
                                    return $.Deferred().reject(); // Important for Swal to handle the error
                                } else {
                                    Swal.fire('Error', 'An error occurred during product creation.', 'error');
                                }
                            }
                        });
                    },
                    allowOutsideClick: () => !Swal.isLoading(),
                    didRender: () => {
                        const categorySelect = $('#id_category');
                        const addCategoryButton = $('<button>')
                            .addClass('btn btn-sm btn-success ml-2')
                            .text('Add Category');

                        categorySelect.parent().append(addCategoryButton);

                        addCategoryButton.on('click', () => {
                            Swal.fire({
                                title: 'Add New Category',
                                input: 'text',
                                inputPlaceholder: 'Enter category name',
                                showCancelButton: true,
                                inputValidator: (value) => {
                                    if (!value) {
                                        return 'You need to write something!';
                                    }
                                },
                                preConfirm: (categoryName) => addCategory(categoryName)
                            }).then(result => {
                                if (result.isConfirmed) {
                                    addCategory(result.value)
                                        .done(response => {
                                            categorySelect.append(
                                                $('<option>', {
                                                    value: response.id,
                                                    text: response.name,
                                                    selected: true
                                                })
                                            );
                                            Swal.fire({
                                                icon: 'success',
                                                title: 'Category added successfully.',
                                                toast: true,
                                                position: 'top-end',
                                                showConfirmButton: false,
                                                timer: 3000,
                                                timerProgressBar: true,
                                            });
                                        })
                                        .fail(xhr => {
                                            Swal.fire('Error', xhr.responseJSON?.error || 'An error occurred while adding a category.', 'error'); // Improved error handling
                                        });
                                }
                            });
                        });
                    },
                    didClose: () => {
                         // This is not strictly needed, the form will be removed on successful creation.
                    }
                });
            },
            error: () => {
                Swal.fire('Error', 'Failed to load product form.', 'error');
            }
        });
    });


    function addCategory(categoryName) {
        return $.ajax({
            url: $('#product-form').data('add-category-url'),
            type: 'POST',
            data: { name: categoryName },
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': getCookie('csrftoken') // Consistent CSRF token retrieval
            },
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

