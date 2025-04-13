/**
 * Product Image Cropper Initializer
 * 
 * This script initializes the image cropper for product images.
 */

import $ from 'jquery';
import 'bootstrap';
// Import ImageCropper from the common module
import ImageCropper from '@core/common/image_cropper';

console.log('Products cropper init loading...');

// Create ProductsCropper object for better organization
const ProductsCropper = {
    // Track initialization state
    initialized: false,
    
    // Main initialization function
    init: function() {
        // Only initialize once
        if (this.initialized) {
            console.log('ProductsCropper already initialized, skipping');
            return;
        }
        
        console.log('ProductsCropper.init() called');
        
        // Check if ImageCropper is available globally
        if (window.ImageCropper && typeof window.ImageCropper.init === 'function') {
            console.log('Found global ImageCropper, initializing with it');
            
            // Initialize with specific product options
            window.ImageCropper.init({
                fileInputSelector: 'input[type="file"]',
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
            // Use the imported version if global not available
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
            console.error('ImageCropper not available globally or as import');
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
        
        // Mark as initialized
        this.initialized = true;
        console.log('ProductsCropper initialization complete');
    },
    
    // Clean up resources
    cleanUp: function() {
        // If using the global ImageCropper, let it clean up
        if (window.ImageCropper && typeof window.ImageCropper.cleanUp === 'function') {
            window.ImageCropper.cleanUp();
        }
        
        // Reset initialization flag
        this.initialized = false;
    }
};

// Explicitly expose ProductsCropper globally
window.ProductsCropper = ProductsCropper;
console.log('ProductsCropper explicitly exposed globally');

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded in products cropper_init.js - initializing');
    ProductsCropper.init();
});

// For module systems
export default ProductsCropper;