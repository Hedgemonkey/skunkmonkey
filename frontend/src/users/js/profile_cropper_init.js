/**
 * Profile Cropper Initializer
 *
 * This module initializes the image cropper functionality for profile images
 * and connects it to the Profile Image Manager.
 */

// Import required modules
import './profile_cropper.js';  // Import the base profile cropper module

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const fileInput = document.getElementById('profile-image-file');
    const cropperModal = document.getElementById('cropperModal');
    const cropButton = document.getElementById('crop-image-button');
    const cropperImage = document.getElementById('cropper-image');
    const croppedImageDataInput = document.getElementById('cropped-image-data');

    // Exit if required elements don't exist
    if (!fileInput || !cropperModal || !cropButton || !cropperImage) {
        console.warn('Profile cropper initialization failed: Missing required DOM elements');
        return;
    }

    // Variables to hold cropper instance and Bootstrap modal
    let cropper;
    let modal;

    // Initialize Bootstrap modal if Bootstrap is available
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        modal = new bootstrap.Modal(cropperModal);
    } else {
        console.warn('Bootstrap Modal not available');
        return;
    }

    // Function to initialize or destroy cropper
    function initCropper() {
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }

        // Create new cropper instance with options
        cropper = new Cropper(cropperImage, {
            aspectRatio: 1, // Square image
            viewMode: 1, // Restrict to dimensions of container
            background: true, // Show grid background
            autoCropArea: 0.8, // 80% of the image area
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: true,
            responsive: true
        });
    }

    // Set up file input change event
    fileInput.addEventListener('change', function(e) {
        const files = e.target.files;

        if (files && files.length > 0) {
            const file = files[0];

            // Check if file is an image
            if (!file.type.match('image.*')) {
                alert('Please select an image file.');
                return;
            }

            // Read file and set to image
            const reader = new FileReader();

            reader.onload = function(e) {
                cropperImage.src = e.target.result;

                // Show modal and initialize cropper
                modal.show();

                // Initialize after modal is shown to ensure proper dimensions
                cropperModal.addEventListener('shown.bs.modal', function() {
                    initCropper();
                }, { once: true });
            };

            reader.readAsDataURL(file);
        }
    });

    // Set up crop button click event
    cropButton.addEventListener('click', function() {
        if (!cropper) return;

        try {
            // Get cropped image data as a base64 string
            const canvas = cropper.getCroppedCanvas({
                width: 300,
                height: 300,
                minWidth: 100,
                minHeight: 100,
                maxWidth: 1000,
                maxHeight: 1000,
                fillColor: '#fff',
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high'
            });

            if (!canvas) {
                console.error('Could not crop image');
                return;
            }

            // Convert canvas to data URL
            const croppedImageData = canvas.toDataURL('image/jpeg', 0.9);

            // Store cropped image data in hidden input
            if (croppedImageDataInput) {
                croppedImageDataInput.value = croppedImageData;
            }

            // Use the profile image manager to update with the cropped image
            if (window.profileImageManager) {
                window.profileImageManager.updateWithCroppedImage(croppedImageData);
            }

            // Hide modal
            modal.hide();
        } catch (error) {
            console.error('Error cropping image:', error);
        }
    });

    // Initialize movement and zoom controls
    const moveUp = document.getElementById('move-up');
    const moveDown = document.getElementById('move-down');
    const moveLeft = document.getElementById('move-left');
    const moveRight = document.getElementById('move-right');
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    const rotateLeft = document.getElementById('rotate-left');
    const rotateRight = document.getElementById('rotate-right');
    const rotateSlider = document.getElementById('rotate-slider');

    // Movement controls
    if (moveUp) moveUp.addEventListener('click', () => cropper && cropper.move(0, -10));
    if (moveDown) moveDown.addEventListener('click', () => cropper && cropper.move(0, 10));
    if (moveLeft) moveLeft.addEventListener('click', () => cropper && cropper.move(-10, 0));
    if (moveRight) moveRight.addEventListener('click', () => cropper && cropper.move(10, 0));

    // Zoom controls
    if (zoomIn) zoomIn.addEventListener('click', () => cropper && cropper.zoom(0.1));
    if (zoomOut) zoomOut.addEventListener('click', () => cropper && cropper.zoom(-0.1));

    // Rotation controls
    if (rotateLeft) rotateLeft.addEventListener('click', () => cropper && cropper.rotate(-90));
    if (rotateRight) rotateRight.addEventListener('click', () => cropper && cropper.rotate(90));

    // Free rotation control
    if (rotateSlider) {
        rotateSlider.addEventListener('input', function() {
            if (!cropper) return;
            const angle = parseInt(this.value);
            cropper.rotateTo(angle);
        });
    }

    // Clean up when modal is hidden
    cropperModal.addEventListener('hidden.bs.modal', function() {
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
    });
});
