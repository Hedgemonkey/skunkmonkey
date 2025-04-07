/**
 * Profile Image Cropper
 * 
 * This script uses the shared image cropper module for profile image processing.
 */

import { initImageCropper } from '../../../../static/js/common/image_cropper';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the image cropper with profile-specific options
    initImageCropper({
        fileInputSelector: 'input[type="file"][name="profile_image"]',
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
        }
    });
});