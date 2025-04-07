/**
 * Common Image Cropper Module
 * 
 * This module provides reusable image cropping functionality using Cropper.js.
 * It can be imported by any application that needs image cropping capabilities.
 */

import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.min.css';

/**
 * Initialize image cropper functionality
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.fileInputSelector - Selector for the file input element
 * @param {string} options.modalSelector - Selector for the modal element
 * @param {string} options.cropperImageSelector - Selector for the image element in the modal
 * @param {string} options.cropButtonSelector - Selector for the crop button
 * @param {string} options.previewSelector - Selector for the preview image (optional)
 * @param {string} options.previewContainerSelector - Selector for the preview container (optional)
 * @param {string} options.croppedDataInputSelector - Selector for the hidden input to store cropped data
 * @param {Object} options.cropperOptions - Options for the Cropper.js instance
 */
export function initImageCropper(options) {
    // Default options
    const defaultOptions = {
        cropperOptions: {
            aspectRatio: 1, // Square crop by default
            viewMode: 1,     // Restrict the crop box to not exceed the size of the canvas
            autoCropArea: 0.8,
            responsive: true,
            restore: false,
            guides: true,
            center: true,
            highlight: false,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false,
        }
    };
    
    // Merge provided options with defaults
    const config = { ...defaultOptions, ...options };
    
    // Elements
    const fileInput = document.querySelector(config.fileInputSelector);
    const cropperModal = document.querySelector(config.modalSelector);
    const cropperImage = document.querySelector(config.cropperImageSelector);
    const cropButton = document.querySelector(config.cropButtonSelector);
    const previewImage = config.previewSelector ? document.querySelector(config.previewSelector) : null;
    const previewContainer = config.previewContainerSelector ? document.querySelector(config.previewContainerSelector) : null;
    const croppedImageData = document.querySelector(config.croppedDataInputSelector);
    
    // Control elements
    const zoomInButton = document.querySelector('#zoom-in');
    const zoomOutButton = document.querySelector('#zoom-out');
    const moveLeftButton = document.querySelector('#move-left');
    const moveRightButton = document.querySelector('#move-right');
    const moveUpButton = document.querySelector('#move-up');
    const moveDownButton = document.querySelector('#move-down');
    const rotateLeftButton = document.querySelector('#rotate-left');
    const rotateRightButton = document.querySelector('#rotate-right');
    const rotateSlider = document.querySelector('#rotate-slider');
    
    // Bootstrap modal instance
    let modal;
    if (cropperModal) {
        modal = new bootstrap.Modal(cropperModal);
    }
    
    // Cropper instance
    let cropper;
    
    // Only proceed if we have the necessary elements
    if (!fileInput || !cropperModal || !cropperImage || !cropButton || !croppedImageData) {
        console.error('Image cropper: Required elements not found');
        return;
    }
    
    /**
     * Initialize the cropper when a file is selected
     */
    fileInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files.length) {
            const file = e.target.files[0];
            
            // Check if the file is an image
            if (!file.type.match('image.*')) {
                alert('Please select an image file');
                return;
            }
            
            // Create a blob URL for the image
            const blobURL = URL.createObjectURL(file);
            
            // Set the image source
            cropperImage.src = blobURL;
            
            // Show the modal
            modal.show();
            
            // Initialize cropper when the image is loaded
            cropperImage.onload = function() {
                // Destroy previous cropper if exists
                if (cropper) {
                    cropper.destroy();
                }
                
                // Initialize new cropper
                cropper = new Cropper(cropperImage, config.cropperOptions);
            };
        }
    });
    
    /**
     * Handle crop button click
     */
    cropButton.addEventListener('click', function() {
        if (!cropper) return;
        
        // Get the cropped canvas
        const canvas = cropper.getCroppedCanvas({
            width: 300,  // Output size
            height: 300,
            minWidth: 100,
            minHeight: 100,
            maxWidth: 4096,
            maxHeight: 4096,
            fillColor: '#fff',
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
        });
        
        // Convert canvas to blob
        canvas.toBlob(function(blob) {
            // Convert blob to base64
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = function() {
                const base64data = reader.result;
                
                // Store the cropped image data in the hidden input
                if (croppedImageData) {
                    croppedImageData.value = base64data;
                }
                
                // Update preview if it exists
                if (previewImage && previewContainer) {
                    previewImage.src = base64data;
                    previewContainer.classList.remove('d-none');
                }
                
                // Close the modal
                modal.hide();
                
                // Clean up blob URL
                URL.revokeObjectURL(cropperImage.src);
            };
        }, 'image/jpeg', 0.9);  // JPEG format with 90% quality
    });
    
    /**
     * Set up image manipulation controls
     */
    function setupControls() {
        // Zoom controls
        if (zoomInButton) {
            zoomInButton.addEventListener('click', function() {
                if (cropper) cropper.zoom(0.1);
            });
        }
        
        if (zoomOutButton) {
            zoomOutButton.addEventListener('click', function() {
                if (cropper) cropper.zoom(-0.1);
            });
        }
        
        // Move controls
        if (moveLeftButton) {
            moveLeftButton.addEventListener('click', function() {
                if (cropper) cropper.move(-10, 0);
            });
        }
        
        if (moveRightButton) {
            moveRightButton.addEventListener('click', function() {
                if (cropper) cropper.move(10, 0);
            });
        }
        
        if (moveUpButton) {
            moveUpButton.addEventListener('click', function() {
                if (cropper) cropper.move(0, -10);
            });
        }
        
        if (moveDownButton) {
            moveDownButton.addEventListener('click', function() {
                if (cropper) cropper.move(0, 10);
            });
        }
        
        // Rotate controls
        if (rotateLeftButton) {
            rotateLeftButton.addEventListener('click', function() {
                if (cropper) {
                    cropper.rotate(-45);
                    if (rotateSlider) rotateSlider.value = cropper.getData().rotate;
                }
            });
        }
        
        if (rotateRightButton) {
            rotateRightButton.addEventListener('click', function() {
                if (cropper) {
                    cropper.rotate(45);
                    if (rotateSlider) rotateSlider.value = cropper.getData().rotate;
                }
            });
        }
        
        // Rotate slider
        if (rotateSlider) {
            rotateSlider.addEventListener('input', function() {
                if (cropper) {
                    const angle = parseInt(this.value, 10);
                    cropper.rotateTo(angle);
                }
            });
        }
    }
    
    // Set up control event listeners
    setupControls();
    
    // Reset the file input when the modal is closed manually without applying a crop
    cropperModal.addEventListener('hidden.bs.modal', function() {
        if (croppedImageData && !croppedImageData.value) {
            fileInput.value = '';
        }
        
        // Destroy cropper instance
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
    });
}