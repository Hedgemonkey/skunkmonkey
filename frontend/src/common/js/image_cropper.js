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
    // Track if we're initialized
    initialized: false,

    // Store the current cropper instance
    cropperInstance: null,

    // Store references to DOM elements
    elements: {},

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
        // If already initialized and running on the same elements, prevent duplicate initialization
        if (this.initialized) {
            console.log('ImageCropper already initialized, cleaning up first');
            this.cleanUp();
        }

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

        // Store config for later reference
        this.config = config;

        // Elements
        this.elements.fileInput = document.querySelector(config.fileInputSelector);
        this.elements.cropperModal = document.querySelector(config.modalSelector);
        this.elements.cropperImage = document.querySelector(config.cropperImageSelector);
        this.elements.cropButton = document.querySelector(config.cropButtonSelector);
        this.elements.previewImage = config.previewSelector ? document.querySelector(config.previewSelector) : null;
        this.elements.previewContainer = config.previewContainerSelector ? document.querySelector(config.previewContainerSelector) : null;
        this.elements.croppedImageData = document.querySelector(config.croppedDataInputSelector);

        console.log('Elements found:', {
            fileInput: this.elements.fileInput ? 'Yes' : 'No',
            cropperModal: this.elements.cropperModal ? 'Yes' : 'No',
            cropperImage: this.elements.cropperImage ? 'Yes' : 'No',
            cropButton: this.elements.cropButton ? 'Yes' : 'No',
            previewImage: this.elements.previewImage ? 'Yes' : 'No',
            previewContainer: this.elements.previewContainer ? 'Yes' : 'No',
            croppedImageData: this.elements.croppedImageData ? 'Yes' : 'No'
        });

        // Enhanced debugging - show IDs of elements that were found
        if (this.elements.fileInput) {
            console.log(`File input found with ID: ${this.elements.fileInput.id}`);
        } else {
            console.warn(`File input not found with selector: ${config.fileInputSelector}`);
            console.log('Available file inputs:', Array.from(document.querySelectorAll('input[type="file"]')).map(el => el.id || 'no-id'));
        }

        // Control elements
        this.elements.zoomInButton = document.querySelector('#zoom-in');
        this.elements.zoomOutButton = document.querySelector('#zoom-out');
        this.elements.moveLeftButton = document.querySelector('#move-left');
        this.elements.moveRightButton = document.querySelector('#move-right');
        this.elements.moveUpButton = document.querySelector('#move-up');
        this.elements.moveDownButton = document.querySelector('#move-down');
        this.elements.rotateLeftButton = document.querySelector('#rotate-left');
        this.elements.rotateRightButton = document.querySelector('#rotate-right');
        this.elements.rotateSlider = document.querySelector('#rotate-slider');

        // Only proceed if we have the necessary elements
        if (!this.elements.fileInput || !this.elements.cropperModal || !this.elements.cropperImage || !this.elements.cropButton || !this.elements.croppedImageData) {
            console.error('Missing required elements. Cropper initialization aborted.');

            // Enhanced debugging for missing elements
            const missingElements = [];
            if (!this.elements.fileInput) missingElements.push(`fileInput (${config.fileInputSelector})`);
            if (!this.elements.cropperModal) missingElements.push(`cropperModal (${config.modalSelector})`);
            if (!this.elements.cropperImage) missingElements.push(`cropperImage (${config.cropperImageSelector})`);
            if (!this.elements.cropButton) missingElements.push(`cropButton (${config.cropButtonSelector})`);
            if (!this.elements.croppedImageData) missingElements.push(`croppedImageData (${config.croppedDataInputSelector})`);

            console.error('Missing elements:', missingElements.join(', '));
            return;
        }

        // Bootstrap modal instance
        this.bsModal = null;

        // Initialize Bootstrap modal if available
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            this.bsModal = new bootstrap.Modal(this.elements.cropperModal);
            console.log('Bootstrap Modal created');
        } else {
            console.log('Bootstrap Modal not available, will use jQuery fallback');
        }

        // Setup event listeners
        this.setupEventListeners();

        // Mark as initialized
        this.initialized = true;

        console.log('Image cropper setup complete');
    },

    /**
     * Set up event listeners
     */
    setupEventListeners: function() {
        // Remove any existing event listeners first to prevent duplicates
        this.removeEventListeners();

        // File input change event
        this.fileChangeHandler = this.handleFileInputChange.bind(this);
        this.elements.fileInput.addEventListener('change', this.fileChangeHandler);

        // Crop button click event
        this.cropButtonHandler = this.handleCropButtonClick.bind(this);
        this.elements.cropButton.addEventListener('click', this.cropButtonHandler);

        // Modal hidden event
        this.modalHiddenHandler = this.handleModalHidden.bind(this);
        this.elements.cropperModal.addEventListener('hidden.bs.modal', this.modalHiddenHandler);

        // Set up control button events
        this.setupControlEvents();

        // Close button event handler
        const closeButtons = this.elements.cropperModal.querySelectorAll('[data-bs-dismiss="modal"]');
        if (closeButtons.length) {
            closeButtons.forEach(button => {
                this.closeButtonHandler = this.handleModalClose.bind(this);
                button.addEventListener('click', this.closeButtonHandler);
            });
        }
    },

    /**
     * Remove event listeners to prevent memory leaks
     */
    removeEventListeners: function() {
        // Only try to remove if elements and handlers exist
        if (this.elements.fileInput && this.fileChangeHandler) {
            this.elements.fileInput.removeEventListener('change', this.fileChangeHandler);
            this.fileChangeHandler = null;
        }

        if (this.elements.cropButton && this.cropButtonHandler) {
            this.elements.cropButton.removeEventListener('click', this.cropButtonHandler);
            this.cropButtonHandler = null;
        }

        if (this.elements.cropperModal && this.modalHiddenHandler) {
            this.elements.cropperModal.removeEventListener('hidden.bs.modal', this.modalHiddenHandler);
            this.modalHiddenHandler = null;
        }

        // Control buttons are handled in cleanUpControlEvents
        this.cleanUpControlEvents();
    },

    /**
     * Handle file input change event
     */
    handleFileInputChange: function(e) {
        console.log('File input change event triggered');
        if (e.target.files && e.target.files.length) {
            console.log(`Selected file: ${e.target.files[0].name}`);
            this.processFile(e.target.files[0]);
        } else {
            console.warn('No file selected or change event fired without files');
        }
    },

    /**
     * Process the selected file
     */
    processFile: function(file) {
        if (!file) return;

        console.log('Processing file:', file.name);

        if (!file.type.match('image.*')) {
            alert('Please select an image file');
            return;
        }

        // Clean up any existing cropper instance
        this.destroyCropper();

        // Create a new blob URL and set the image source
        const blobURL = URL.createObjectURL(file);
        this.elements.cropperImage.src = blobURL;

        // Show modal using proper Bootstrap 5 API
        if (this.bsModal) {
            console.log('Using Bootstrap 5 Modal API');
            this.bsModal.show();
        } else if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            console.log('Creating new Bootstrap 5 Modal instance');
            this.bsModal = new bootstrap.Modal(this.elements.cropperModal);
            this.bsModal.show();
        } else {
            console.log('Fallback: Manual modal display');
            // Manual show if Bootstrap is not available
            this.elements.cropperModal.style.display = 'block';
            this.elements.cropperModal.classList.add('show');
            document.body.classList.add('modal-open');

            // Create backdrop
            let backdrop = document.querySelector('.modal-backdrop');
            if (!backdrop) {
                backdrop = document.createElement('div');
                backdrop.classList.add('modal-backdrop', 'fade', 'show');
                document.body.appendChild(backdrop);
            }
        }

        // Use setTimeout to ensure DOM is ready before initializing cropper
        setTimeout(() => {
            // Initialize the cropper
            this.initializeCropper();
        }, 300);
    },

    /**
     * Initialize the cropper instance
     */
    initializeCropper: function() {
        // Make sure any previous cropper instance is destroyed
        this.destroyCropper();

        try {
            // Create a new cropper instance
            this.cropperInstance = new Cropper(this.elements.cropperImage, this.config.cropperOptions);
            console.log('Cropper initialized successfully');
        } catch (error) {
            console.error('Error initializing cropper:', error);
        }
    },

    /**
     * Destroy the cropper instance if it exists
     */
    destroyCropper: function() {
        if (this.cropperInstance) {
            try {
                this.cropperInstance.destroy();
                this.cropperInstance = null;
                console.log('Cropper instance destroyed');
            } catch (error) {
                console.error('Error destroying cropper:', error);
            }
        }
    },

    /**
     * Handle crop button click
     */
    handleCropButtonClick: function() {
        if (!this.cropperInstance) {
            console.error('No cropper instance found');
            return;
        }

        try {
            const canvas = this.cropperInstance.getCroppedCanvas({
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

            canvas.toBlob((blob) => {
                const reader = new FileReader();
                reader.readAsDataURL(blob);

                reader.onloadend = () => {
                    // Get the base64 data
                    let base64data = reader.result;

                    // Sanitize the base64 data by removing any parameters (charset, encoding, etc.)
                    // This ensures consistency between test environment and web interface
                    if (base64data && base64data.includes(';base64,')) {
                        // Split the data URL into format and data parts
                        const [formatPart, dataPart] = base64data.split(';base64,');

                        // Keep only the media type (e.g., "data:image/jpeg")
                        // and remove all other parameters
                        const baseFormat = formatPart.split(';')[0];

                        // Reconstruct the data URL with only the media type and base64 data
                        base64data = `${baseFormat};base64,${dataPart}`;
                        console.log('Parameters removed from base64 data');
                    }

                    // Store the sanitized cropped image data
                    this.elements.croppedImageData.value = base64data;
                    console.log('Cropped image data stored');

                    // Update preview if available
                    if (this.elements.previewImage && this.elements.previewContainer) {
                        this.elements.previewImage.src = base64data;
                        this.elements.previewContainer.classList.remove('d-none');
                        console.log('Preview updated');
                    }

                    // Hide modal
                    this.hideModal();

                    // Clean up
                    URL.revokeObjectURL(this.elements.cropperImage.src);
                };
            }, 'image/jpeg', 0.9);  // JPEG format with 90% quality
        } catch (error) {
            console.error('Error cropping image:', error);
        }
    },

    /**
     * Hide the modal
     */
    hideModal: function() {
        if (this.bsModal) {
            console.log('Using existing Bootstrap 5 Modal instance to hide');
            this.bsModal.hide();
        } else if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            console.log('Creating temporary Bootstrap 5 Modal instance to hide');
            const modalInstance = bootstrap.Modal.getInstance(this.elements.cropperModal) ||
                                  new bootstrap.Modal(this.elements.cropperModal);
            modalInstance.hide();
        } else {
            console.log('Fallback: Manual modal hide');
            // Manual hide
            this.elements.cropperModal.style.display = 'none';
            this.elements.cropperModal.classList.remove('show');
            document.body.classList.remove('modal-open');

            // Remove backdrop
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.parentNode.removeChild(backdrop);
            }
        }
    },

    /**
     * Handle modal close
     */
    handleModalClose: function() {
        this.hideModal();
    },

    /**
     * Handle modal hidden event
     */
    handleModalHidden: function() {
        // Reset the file input if no cropped image data
        if (this.elements.croppedImageData && !this.elements.croppedImageData.value) {
            this.elements.fileInput.value = '';
        }

        // Clean up cropper
        this.destroyCropper();
    },

    /**
     * Setup image manipulation control events
     */
    setupControlEvents: function() {
        // Zoom controls
        this.setupButtonControl(this.elements.zoomInButton, () => {
            if (this.cropperInstance) this.cropperInstance.zoom(0.1);
        });

        this.setupButtonControl(this.elements.zoomOutButton, () => {
            if (this.cropperInstance) this.cropperInstance.zoom(-0.1);
        });

        // Move controls
        this.setupButtonControl(this.elements.moveLeftButton, () => {
            if (this.cropperInstance) this.cropperInstance.move(-10, 0);
        });

        this.setupButtonControl(this.elements.moveRightButton, () => {
            if (this.cropperInstance) this.cropperInstance.move(10, 0);
        });

        this.setupButtonControl(this.elements.moveUpButton, () => {
            if (this.cropperInstance) this.cropperInstance.move(0, -10);
        });

        this.setupButtonControl(this.elements.moveDownButton, () => {
            if (this.cropperInstance) this.cropperInstance.move(0, 10);
        });

        // Rotate controls
        this.setupButtonControl(this.elements.rotateLeftButton, () => {
            if (this.cropperInstance) {
                this.cropperInstance.rotate(-45);
                if (this.elements.rotateSlider) {
                    this.elements.rotateSlider.value = this.cropperInstance.getData().rotate;
                }
            }
        });

        this.setupButtonControl(this.elements.rotateRightButton, () => {
            if (this.cropperInstance) {
                this.cropperInstance.rotate(45);
                if (this.elements.rotateSlider) {
                    this.elements.rotateSlider.value = this.cropperInstance.getData().rotate;
                }
            }
        });

        // Rotate slider
        if (this.elements.rotateSlider) {
            // Store reference to handler for later cleanup
            this.rotateSliderHandler = (e) => {
                if (this.cropperInstance) {
                    const angle = parseInt(e.target.value, 10);
                    this.cropperInstance.rotateTo(angle);
                }
            };

            // Add event listener
            this.elements.rotateSlider.addEventListener('input', this.rotateSliderHandler);
        }
    },

    /**
     * Helper to setup a button control with proper event handling
     */
    setupButtonControl: function(button, handler) {
        if (!button) return;

        // Store the handler in the button's data attribute for later cleanup
        const handlerFunction = () => {
            handler();
        };

        // Store reference to handler
        button._cropperHandler = handlerFunction;

        // Add event listener
        button.addEventListener('click', handlerFunction);
    },

    /**
     * Clean up control events
     */
    cleanUpControlEvents: function() {
        // Clean up button controls
        this.cleanupButtonControl(this.elements.zoomInButton);
        this.cleanupButtonControl(this.elements.zoomOutButton);
        this.cleanupButtonControl(this.elements.moveLeftButton);
        this.cleanupButtonControl(this.elements.moveRightButton);
        this.cleanupButtonControl(this.elements.moveUpButton);
        this.cleanupButtonControl(this.elements.moveDownButton);
        this.cleanupButtonControl(this.elements.rotateLeftButton);
        this.cleanupButtonControl(this.elements.rotateRightButton);

        // Clean up rotate slider
        if (this.elements.rotateSlider && this.rotateSliderHandler) {
            this.elements.rotateSlider.removeEventListener('input', this.rotateSliderHandler);
            this.rotateSliderHandler = null;
        }
    },

    /**
     * Helper to clean up a button control
     */
    cleanupButtonControl: function(button) {
        if (!button || !button._cropperHandler) return;

        // Remove event listener
        button.removeEventListener('click', button._cropperHandler);

        // Remove reference
        button._cropperHandler = null;
    },

    /**
     * Clean up all resources
     */
    cleanUp: function() {
        console.log('Cleaning up ImageCropper resources');

        // Destroy cropper instance
        this.destroyCropper();

        // Remove event listeners
        this.removeEventListeners();

        // Reset initialization flag
        this.initialized = false;
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
