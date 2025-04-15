/**
 * Profile Image Cropper
 *
 * This script uses the shared image cropper module for profile image processing.
 */

import $ from 'jquery';
import 'bootstrap';
// Import ImageCropper from the common module using path alias
import ImageCropper from '@core/common/image_cropper';

console.log('Profile Cropper module loading...');
console.log('DOM readyState at load time:', document.readyState);

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
        console.log('Looking for file input with ID: #id_profile_image');
        const fileInput = document.querySelector('#id_profile_image');
        console.log('File input found:', fileInput ? 'Yes' : 'No');
        if (fileInput) {
            console.log('File input ID:', fileInput.id);
            console.log('File input type:', fileInput.type);
        } else {
            console.log('Available file inputs:', Array.from(document.querySelectorAll('input[type="file"]')).map(el => el.id || 'no-id'));
        }

        // Check if ImageCropper is available globally
        if (window.ImageCropper && typeof window.ImageCropper.init === 'function') {
            console.log('Found global ImageCropper, initializing with it');

            // Initialize with specific profile options
            window.ImageCropper.init({
                fileInputSelector: '#id_profile_image', // Updated to use the actual form field ID
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
        } else if (ImageCropper && typeof ImageCropper.init === 'function') {
            // Use the imported version if global not available
            console.log('Using imported ImageCropper');
            ImageCropper.init({
                fileInputSelector: '#id_profile_image', // Updated to use the actual form field ID
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
            console.error('ImageCropper not available globally or as import');
            console.log('Window ImageCropper:', window.ImageCropper);
            console.log('Imported ImageCropper:', ImageCropper);
        }

        // Mark as initialized
        this.initialized = true;
        console.log('ProfileCropper initialization complete');
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

// Explicitly expose ProfileCropper globally
window.ProfileCropper = ProfileCropper;
console.log('ProfileCropper explicitly exposed globally');

// Multiple initialization points for safety
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded in profile_cropper.js - initializing');
    console.log('DOM readyState at DOMContentLoaded:', document.readyState);
    ProfileCropper.init();
});

// Also try jQuery ready for maximum compatibility
$(document).ready(function() {
    console.log('jQuery ready in profile_cropper.js - initializing');
    ProfileCropper.init();
});

// Additionally, if document already loaded, init immediately
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('Document already loaded at script end - initializing immediately');
    setTimeout(function() {
        ProfileCropper.init();
    }, 100); // Small timeout to ensure DOM is accessible
}

// For module systems
export default ProfileCropper;
