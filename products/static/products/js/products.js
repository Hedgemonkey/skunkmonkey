import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', () => { // Ensure the DOM is fully loaded before attaching event listeners.
    document.querySelectorAll('.delete-product').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const productUrl = event.target.href;  // More robust way to get the URL

            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = productUrl;
                }
            });
        });
    });
});

