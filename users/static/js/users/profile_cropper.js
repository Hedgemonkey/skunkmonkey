/**
 * Profile Image Cropper
 * 
 * This script uses the shared image cropper module for profile image processing.
 */

import $ from 'jquery';
import 'bootstrap';
import Cropper from 'cropperjs';

console.log('Profile Cropper module loading...');

// Create ProfileCropper object
const ProfileCropper = {
    // Track initialization state
    initialized: false,
    
    // Main initialization function
    init: function() {
        // Only initialize once
        if (this.initialized) {
            console.log('ProfileCropper already initialized, skipping');
            return;
        }
        
        console.log('ProfileCropper.init() called');
        
        // Check if ImageCropper is available globally
        if (window.ImageCropper && typeof window.ImageCropper.init === 'function') {
            console.log('Found global ImageCropper, initializing with it');
            
            // Initialize with specific profile options
            window.ImageCropper.init({
                fileInputSelector: '#id_profile_image',
                modalSelector: '#cropperModal',
                cropperImageSelector: '#cropper-image',
                cropButtonSelector: '#crop-image-button',
                previewSelector: '#preview-image',
                previewContainerSelector: '#preview-container',
                croppedDataInputSelector: '#cropped-image-data',
                cropperOptions: {
                    aspectRatio: 1, // Square profile pictures
                    viewMode: 1,
                    autoCropArea: 0.9,
                    responsive: true,
                    restore: false,
                    guides: true,
                    center: true,
                    highlight: false,
                    cropBoxMovable: true,
                    cropBoxResizable: true,
                    toggleDragModeOnDblclick: false,
                }
            });
        } else {
            console.log('ImageCropper not available globally, using direct initialization');
            this.directInitialize();
        }
        
        // Mark as initialized
        this.initialized = true;
        console.log('ProfileCropper initialization complete');
    },
    
    // Direct initialization without dependency on ImageCropper
    directInitialize: function() {
        console.log('Starting direct initialization with Cropper.js');
        
        // Make sure Cropper is available globally - import it again if needed
        if (!window.Cropper) {
            window.Cropper = Cropper;
            console.log('Set Cropper from local import');
        }
        
        // Elements
        const fileInput = document.querySelector('#id_profile_image');
        const cropperModal = document.querySelector('#cropperModal');
        const cropperImage = document.querySelector('#cropper-image');
        const cropButton = document.querySelector('#crop-image-button');
        const previewImage = document.querySelector('#preview-image');
        const previewContainer = document.querySelector('#preview-container');
        const croppedImageData = document.querySelector('#cropped-image-data');
        
        // Only proceed if we have the necessary elements
        if (!fileInput || !cropperModal || !cropperImage || !cropButton || !croppedImageData) {
            console.error('Missing required elements. Direct initialization aborted.');
            return;
        }
        
        let cropper = null;
        let bsModal = null;
        
        // Initialize Bootstrap modal
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            try {
                bsModal = new bootstrap.Modal(cropperModal);
                console.log('Bootstrap Modal created successfully');
            } catch (error) {
                console.error('Failed to create Bootstrap Modal:', error);
            }
        } else {
            console.log('Bootstrap Modal not available, will use jQuery fallback');
        }
        
        // Initialize cropper when file is selected
        fileInput.addEventListener('change', function(e) {
            console.log('File input change event triggered (direct initialization)');
            if (e.target.files && e.target.files.length) {
                const file = e.target.files[0];
                
                if (!file.type.match('image.*')) {
                    alert('Please select an image file');
                    return;
                }
                
                const blobURL = URL.createObjectURL(file);
                cropperImage.src = blobURL;
                
                // Show modal
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
                
                // Initialize cropper
                cropperImage.onload = function() {
                    if (cropper) {
                        cropper.destroy();
                    }
                    
                    try {
                        cropper = new window.Cropper(cropperImage, {
                            aspectRatio: 1,
                            viewMode: 1,
                            autoCropArea: 0.9,
                            responsive: true,
                            restore: false,
                            guides: true,
                            center: true,
                            highlight: false,
                            cropBoxMovable: true,
                            cropBoxResizable: true,
                            toggleDragModeOnDblclick: false,
                        });
                        console.log('Cropper initialized directly');
                    } catch (error) {
                        console.error('Failed to initialize Cropper:', error);
                    }
                };
            }
        });
        
        // Handle crop button click
        cropButton.addEventListener('click', function() {
            if (!cropper) {
                console.error('No cropper instance found');
                return;
            }
            
            try {
                const canvas = cropper.getCroppedCanvas({
                    width: 300,
                    height: 300,
                    minWidth: 100,
                    minHeight: 100,
                    maxWidth: 4096,
                    maxHeight: 4096,
                    fillColor: '#fff'
                });
                
                canvas.toBlob(function(blob) {
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    
                    reader.onloadend = function() {
                        const base64data = reader.result;
                        
                        // Store cropped data
                        croppedImageData.value = base64data;
                        console.log('Cropped image data stored');
                        
                        // Update preview
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
                }, 'image/jpeg', 0.9);
            } catch (error) {
                console.error('Error during cropping:', error);
            }
        });
        
        console.log('Direct initialization complete');
    }
};

// Explicitly expose ProfileCropper globally
window.ProfileCropper = ProfileCropper;
console.log('ProfileCropper explicitly exposed globally');

// Single initialization point - called when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded in profile_cropper.js - initializing');
    ProfileCropper.init();
});

// For module systems
export default ProfileCropper;