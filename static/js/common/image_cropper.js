/**
 * Common Image Cropper Module
 * 
 * This module provides reusable image cropping functionality using Cropper.js.
 * It can be imported by any application that needs image cropping capabilities.
 */

import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.min.css';
import $ from 'jquery';
import 'bootstrap';

// Log when this module is loaded
console.log('Image Cropper module loading...');

// Create an ImageCropper object for better organization
const ImageCropper = {
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
    init: function(options) {
        console.log('ImageCropper.init() called with options:', options);
        // Default options
        const defaultOptions = {
            cropperOptions: {
                aspectRatio: 1, // Square crop by default
                viewMode: 1,    // Restrict the crop box to not exceed the size of the canvas
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
        
        console.log('Elements found:', {
            fileInput: fileInput ? 'Yes' : 'No',
            cropperModal: cropperModal ? 'Yes' : 'No',
            cropperImage: cropperImage ? 'Yes' : 'No',
            cropButton: cropButton ? 'Yes' : 'No',
            previewImage: previewImage ? 'Yes' : 'No',
            previewContainer: previewContainer ? 'Yes' : 'No',
            croppedImageData: croppedImageData ? 'Yes' : 'No'
        });
        
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
        
        // Only proceed if we have the necessary elements
        if (!fileInput || !cropperModal || !cropperImage || !cropButton || !croppedImageData) {
            console.error('Missing required elements. Cropper initialization aborted.');
            return;
        }
        
        let cropper = null; // Cropper instance
        let bsModal = null; // Bootstrap modal instance

        // Initialize Bootstrap modal if available
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            bsModal = new bootstrap.Modal(cropperModal);
            console.log('Bootstrap Modal created');
        } else {
            console.log('Bootstrap Modal not available, will use jQuery fallback');
        }
        
        /**
         * Process the selected file
         */
        function processFile(file) {
            if (!file) return;
            
            console.log('Processing file:', file.name);
            
            if (!file.type.match('image.*')) {
                alert('Please select an image file');
                return;
            }
            
            const blobURL = URL.createObjectURL(file);
            cropperImage.src = blobURL;
            
            // Show modal using Bootstrap's API if available, otherwise fallback to jQuery
            if (bsModal) {
                bsModal.show();
            } else if (typeof $ !== 'undefined') {
                $(cropperModal).modal('show');
            } else {
                // Manual show if neither Bootstrap nor jQuery is available
                cropperModal.style.display = 'block';
                cropperModal.classList.add('show');
                document.body.classList.add('modal-open');
                
                // Create backdrop
                let backdrop = document.querySelector('.modal-backdrop');
                if (!backdrop) {
                    backdrop = document.createElement('div');
                    backdrop.classList.add('modal-backdrop', 'fade', 'show');
                    document.body.appendChild(backdrop);
                }
            }
            
            // Initialize cropper when the image is loaded
            cropperImage.onload = function() {
                if (cropper) {
                    cropper.destroy();
                }
                
                cropper = new Cropper(cropperImage, config.cropperOptions);
                console.log('Cropper initialized');
            };
        }
        
        /**
         * Initialize the cropper when a file is selected
         */
        fileInput.addEventListener('change', function(e) {
            console.log('File input change event triggered');
            if (e.target.files && e.target.files.length) {
                processFile(e.target.files[0]);
            }
        });
        
        /**
         * Handle crop button click
         */
        cropButton.addEventListener('click', function() {
            if (!cropper) {
                console.error('No cropper instance found');
                return;
            }
            
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
            
            canvas.toBlob(function(blob) {
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                
                reader.onloadend = function() {
                    const base64data = reader.result;
                    
                    // Store the cropped image data
                    croppedImageData.value = base64data;
                    console.log('Cropped image data stored');
                    
                    // Update preview if available
                    if (previewImage && previewContainer) {
                        previewImage.src = base64data;
                        previewContainer.classList.remove('d-none');
                        console.log('Preview updated');
                    }
                    
                    // Hide modal
                    if (bsModal) {
                        bsModal.hide();
                    } else if (typeof $ !== 'undefined') {
                        $(cropperModal).modal('hide');
                    } else {
                        // Manual hide
                        cropperModal.style.display = 'none';
                        cropperModal.classList.remove('show');
                        document.body.classList.remove('modal-open');
                        
                        // Remove backdrop
                        const backdrop = document.querySelector('.modal-backdrop');
                        if (backdrop) {
                            backdrop.parentNode.removeChild(backdrop);
                        }
                    }
                    
                    // Clean up
                    URL.revokeObjectURL(cropperImage.src);
                };
            }, 'image/jpeg', 0.9);  // JPEG format with 90% quality
        });
        
        // Set up image manipulation controls
        setupControls();
        
        // Set up close button event handler
        const closeButtons = cropperModal.querySelectorAll('[data-bs-dismiss="modal"]');
        if (closeButtons.length) {
            closeButtons.forEach(button => {
                button.addEventListener('click', function() {
                    if (bsModal) {
                        bsModal.hide();
                    } else if (typeof $ !== 'undefined') {
                        $(cropperModal).modal('hide');
                    } else {
                        // Manual hide
                        cropperModal.style.display = 'none';
                        cropperModal.classList.remove('show');
                        document.body.classList.remove('modal-open');
                        
                        // Remove backdrop
                        const backdrop = document.querySelector('.modal-backdrop');
                        if (backdrop) {
                            backdrop.parentNode.removeChild(backdrop);
                        }
                    }
                });
            });
        }
        
        // Reset the file input when the modal is closed manually without cropping
        cropperModal.addEventListener('hidden.bs.modal', function() {
            if (croppedImageData && !croppedImageData.value) {
                fileInput.value = '';
            }
            
            if (cropper) {
                cropper.destroy();
                cropper = null;
            }
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
        
        console.log('Image cropper setup complete');
    }
};

// IMPORTANT: Expose objects to global scope
// We need to do this explicitly to ensure they're available to other scripts
(function(global) {
    // First expose Cropper library
    global.Cropper = Cropper;
    console.log('Cropper library explicitly exposed to global scope');
    
    // Then expose ImageCropper module
    global.ImageCropper = ImageCropper;
    console.log('ImageCropper explicitly exposed to global scope');
})(typeof window !== 'undefined' ? window : this);

// For module systems
export default ImageCropper;