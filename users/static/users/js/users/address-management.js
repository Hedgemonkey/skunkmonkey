/**
 * Address Management JavaScript
 * Handles AJAX interactions for address deletion and setting default address
 */
document.addEventListener('DOMContentLoaded', function() {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
                       document.querySelector('[name=csrfmiddlewaretoken]')?.value;

    // Handle address deletion
    document.querySelectorAll('.btn-delete-address').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const addressId = this.dataset.addressId;
            const deleteUrl = this.dataset.deleteUrl || `/users/addresses/delete/${addressId}/`;
            const addressInfo = this.dataset.addressInfo;

            Swal.fire({
                title: 'Are you sure?',
                text: `Do you really want to delete the address "${addressInfo}"? This cannot be undone.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    fetch(deleteUrl, {
                        method: 'POST',
                        headers: {
                            'X-CSRFToken': csrfToken,
                            'X-Requested-With': 'XMLHttpRequest',
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire(
                                'Deleted!',
                                data.message || 'Address has been deleted.',
                                'success'
                            ).then(() => {
                                window.location.reload();
                            });
                        } else {
                            Swal.fire(
                                'Error!',
                                data.message || 'Could not delete address.',
                                'error'
                            );
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        Swal.fire(
                            'Error!',
                            'An unexpected error occurred.',
                            'error'
                        );
                    });
                }
            });
        });
    });

    // Handle setting default address
    document.querySelectorAll('.btn-set-default, .btn-set-default-address').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const addressId = this.dataset.addressId;
            const setDefaultUrl = this.dataset.setdefaultUrl || `/users/addresses/set_default/${addressId}/`;
            const addressInfo = this.dataset.addressInfo;

            Swal.fire({
                title: 'Set as Default?',
                text: `Set "${addressInfo}" as your default delivery address?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#28a745',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Yes, set as default!'
            }).then((result) => {
                if (result.isConfirmed) {
                    fetch(setDefaultUrl, {
                        method: 'POST',
                        headers: {
                            'X-CSRFToken': csrfToken,
                            'X-Requested-With': 'XMLHttpRequest',
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire(
                                'Success!',
                                data.message || 'Address set as default.',
                                'success'
                            ).then(() => {
                                window.location.reload();
                            });
                        } else {
                            Swal.fire(
                                'Error!',
                                data.message || 'Could not set default address.',
                                'error'
                            );
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        Swal.fire(
                            'Error!',
                            'An unexpected error occurred.',
                            'error'
                        );
                    });
                }
            });
        });
    });
});
