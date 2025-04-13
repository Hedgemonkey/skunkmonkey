// /users/static/users/js/profile.js

document.addEventListener('DOMContentLoaded', function () {
    // --- Address Deletion ---
    const deleteButtons = document.querySelectorAll('.btn-delete-address');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const addressId = this.dataset.addressId;
            const addressInfo = this.dataset.addressInfo || 'this address'; // Fallback text
            const url = window.deleteAddressUrlTemplate.replace('{address_id}', addressId);
            const csrfToken = window.csrfToken; // Assumes csrfToken is globally available

            if (!url || !csrfToken) {
                console.error("Missing URL template or CSRF token for delete action.");
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Could not prepare delete request. Please refresh the page.',
                });
                return;
            }

            Swal.fire({
                title: 'Are you sure?',
                html: `Do you really want to delete the address:<br><strong>${addressInfo}</strong>?`, // Use html property
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    fetch(url, {
                        method: 'POST', // Matches require_POST in Django view
                        headers: {
                            'X-CSRFToken': csrfToken,
                            'X-Requested-With': 'XMLHttpRequest', // Identify as AJAX
                            'Content-Type': 'application/json' // Optional, depends on view
                        },
                        // body: JSON.stringify({}) // Optional body if needed
                    })
                    .then(response => {
                        if (!response.ok) {
                            // Try to get error message from JSON response if available
                             return response.json().then(err => { throw new Error(err.message || `HTTP error! status: ${response.status}`) });
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.success) {
                            Swal.fire(
                                'Deleted!',
                                data.message || 'Your address has been deleted.',
                                'success'
                            ).then(() => {
                                // Option 1: Remove the card directly
                                const cardToRemove = button.closest('.col-md-6');
                                if (cardToRemove) {
                                    cardToRemove.remove();
                                    // Optionally check if any addresses remain and show a message
                                    if (document.querySelectorAll('.btn-delete-address').length === 0) {
                                        const container = document.querySelector('.address-list-container'); // Add this class to the container in HTML
                                        if (container) container.innerHTML = '<p>You haven\'t saved any addresses yet.</p>';
                                    }
                                } else {
                                     // Option 2: Reload the page if direct removal is complex
                                     window.location.reload();
                                }
                            });
                        } else {
                            throw new Error(data.message || 'Failed to delete address.');
                        }
                    })
                    .catch(error => {
                        console.error('Error deleting address:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Deletion Failed',
                            text: error.message || 'Something went wrong while deleting the address.',
                        });
                    });
                }
            });
        });
    });

    // --- Set Default Address ---
    const setDefaultButtons = document.querySelectorAll('.btn-set-default');
    setDefaultButtons.forEach(button => {
         button.addEventListener('click', function(e) {
            e.preventDefault();
            const addressId = this.dataset.addressId;
            const addressInfo = this.dataset.addressInfo || 'this address';
            const url = window.setDefaultAddressUrlTemplate.replace('{address_id}', addressId);
            const csrfToken = window.csrfToken;

             if (!url || !csrfToken) {
                console.error("Missing URL template or CSRF token for set default action.");
                Swal.fire('Error', 'Could not prepare request.', 'error');
                return;
            }

            // Optional: Add a loading state to the button
            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Setting...';

            fetch(url, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
            .then(response => {
                 if (!response.ok) {
                     return response.json().then(err => { throw new Error(err.message || `HTTP error! status: ${response.status}`) });
                 }
                 return response.json();
             })
             .then(data => {
                 if (data.success) {
                     Swal.fire({
                         icon: 'success',
                         title: 'Success!',
                         text: data.message || 'Address set as default.',
                         timer: 1500, // Auto close timer
                         showConfirmButton: false
                     }).then(() => {
                         window.location.reload(); // Easiest way to update UI state (default badge, buttons)
                     });
                 } else {
                      throw new Error(data.message || 'Failed to set default address.');
                 }
             })
             .catch(error => {
                 console.error('Error setting default address:', error);
                 Swal.fire('Error', error.message || 'Could not set address as default.', 'error');
                 // Restore button state on error
                 button.disabled = false;
                 button.innerHTML = 'Set as Default';
             });
         });
    });

}); // End DOMContentLoaded