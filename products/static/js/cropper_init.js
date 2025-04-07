/**
 * Products Image Cropper Initialization
 * 
 * This script uses the shared image cropper module for product image processing.
 */

import { initImageCropper } from '../../../static/js/common/image_cropper';
import 'bootstrap';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the image cropper with product-specific options
    initImageCropper({
        fileInputSelector: 'input[type="file"]', // Selector for file inputs in the products context
        modalSelector: '#cropperModal',
        cropperImageSelector: '#cropper-image',
        cropButtonSelector: '#crop-image-button',
        previewSelector: '#preview-image',
        previewContainerSelector: '#preview-container',
        croppedDataInputSelector: '#cropped-image-data',
        cropperOptions: {
            aspectRatio: 1, // Square crop for product images
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
        }
    });
    
    // Handle showing the preview image name (specific to products app)
    document.addEventListener('change', function(event) {
        if (event.target && event.target.type === 'file') {
            const files = event.target.files;
            if (files && files.length > 0) {
                const imageNameElement = document.getElementById('image-name');
                if (imageNameElement) {
                    imageNameElement.textContent = files[0].name;
                    imageNameElement.classList.remove('hidden');
                }
            }
        }
    });
});