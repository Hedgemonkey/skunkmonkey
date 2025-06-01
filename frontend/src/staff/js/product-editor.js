/**
 * Product Editor Module
 *
 * Provides product form functionality including image cropping.
 * This module uses Cropper.js for image cropping functionality.
 */
import '@staff/css/product-edit.css';
import Cropper from 'cropperjs';
import { Modal } from 'bootstrap';

class ProductEditor {
    constructor() {
        // Image cropper configuration
        this.cropper = null;
        this.cropperConfig = {
            aspectRatio: 1,
            viewMode: 2,
            minContainerWidth: 300,
            minContainerHeight: 300,
            minCropBoxWidth: 200,
            minCropBoxHeight: 200,
            responsive: true,
            autoCropArea: 0.8
        };
    }

    /**
     * Initialize the image cropper functionality
     */
    initImageCropper() {
        // Elements
        const imageInput = document.getElementById('id_image');
        const imagePreview = document.getElementById('image-preview');
        const noImageDiv = document.getElementById('no-image');
        const cropperModal = document.getElementById('cropperModal');
        const imageToCrop = document.getElementById('image-to-crop');
        const cropBtn = document.getElementById('crop-btn');
        const croppedImageDataInput = document.getElementById('cropped-image-data');
        const removeImageBtn = document.getElementById('remove-image-btn');
        const productForm = document.getElementById('product-form');

        // Return early if any critical element is missing
        if (!imageInput || !imagePreview) {
            console.error('Product editor: Critical elements not found');
            return;
        }

        // Initialize Bootstrap modal
        console.log('Initializing Bootstrap modal for image cropper');
        const modal = new Modal(cropperModal);
        console.log('Bootstrap modal initialized:', modal);

        // Handle image input change
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Create a file reader to load the image
            const reader = new FileReader();
            reader.onload = (event) => {
                // Set the image source to prepare for cropping
                imageToCrop.src = event.target.result;
                console.log('Image loaded into cropper:', imageToCrop.src.substring(0, 30) + '...');

                // Show the cropper modal
                console.log('Showing modal...');
                try {
                    modal.show();
                    console.log('Modal shown successfully');
                } catch (err) {
                    console.error('Error showing modal:', err);
                }

                // Initialize cropper after modal is shown
                cropperModal.addEventListener('shown.bs.modal', () => {
                    // Destroy previous cropper instance if it exists
                    if (this.cropper) {
                        this.cropper.destroy();
                    }

                    // Initialize new cropper
                    this.cropper = new Cropper(imageToCrop, this.cropperConfig);
                }, { once: true });
            };

            reader.readAsDataURL(file);
        });

        // Handle crop button click
        if (cropBtn) {
            cropBtn.addEventListener('click', () => {
                if (!this.cropper) return;

                // Get cropped canvas as data URL
                const croppedData = this.cropper.getCroppedCanvas({
                    minWidth: 256,
                    minHeight: 256,
                    maxWidth: 1000,
                    maxHeight: 1000
                }).toDataURL();

                // Update preview image
                imagePreview.src = croppedData;
                imagePreview.classList.remove('d-none');

                // Hide placeholder if it exists
                if (noImageDiv) {
                    noImageDiv.style.display = 'none';
                }

                // Store cropped image data in hidden input
                if (croppedImageDataInput) {
                    croppedImageDataInput.value = croppedData;
                }

                // Close modal
                modal.hide();

                // Destroy cropper
                this.cropper.destroy();
                this.cropper = null;
            });
        }

        // Handle remove image button
        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', () => {
                // Clear the file input
                imageInput.value = '';

                // Clear the preview
                imagePreview.src = '';
                imagePreview.classList.add('d-none');

                // Show the placeholder if it exists
                if (noImageDiv) {
                    noImageDiv.style.display = 'block';
                }

                // Add a flag to indicate the image should be removed
                const removeImageFlag = document.createElement('input');
                removeImageFlag.type = 'hidden';
                removeImageFlag.name = 'remove_image';
                removeImageFlag.value = 'true';
                productForm.appendChild(removeImageFlag);

                // Hide the remove button itself
                removeImageBtn.style.display = 'none';
            });
        }

        // Handle form submission
        if (productForm) {
            productForm.addEventListener('submit', () => {
                // Custom validation could be added here if needed
                console.log('Product form submitted');
            });
        }
    }
}

// Create and export instance
const productEditor = new ProductEditor();

// Make it available globally for direct template access
window.ProductEditor = productEditor;

export default productEditor;
