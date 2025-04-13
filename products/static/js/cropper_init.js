/**
 * Products Image Cropper Initialization
 * 
 * This script uses the shared image cropper module for product image processing.
 */

import ImageCropper from '../../../static/js/common/image_cropper';
import 'bootstrap';

console.log('Products cropper init loading...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded in products cropper_init.js');
    
    // Initialize the image cropper with product-specific options
    if (typeof window.ImageCropper !== 'undefined' && typeof window.ImageCropper.init === 'function') {
        console.log('Using global ImageCropper');
        window.ImageCropper.init({
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
    } else if (ImageCropper && typeof ImageCropper.init === 'function') {
        console.log('Using imported ImageCropper');
        ImageCropper.init({
            fileInputSelector: 'input[type="file"]',
            modalSelector: '#cropperModal',
            cropperImageSelector: '#cropper-image',
            cropButtonSelector: '#crop-image-button',
            previewSelector: '#preview-image',
            previewContainerSelector: '#preview-container',
            croppedDataInputSelector: '#cropped-image-data',
            cropperOptions: {
                aspectRatio: 1,
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
    } else {
        console.error('ImageCropper module not found or init method not available');
    }
    
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