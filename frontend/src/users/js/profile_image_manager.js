/**
 * Profile Image Manager
 *
 * Handles the functionality for the profile image management interface
 * - Image selection and preview
 * - Image toggling between current and new images
 * - Visual feedback for selected images
 * - Confirming or reverting image changes
 * - Checkbox synchronization for image removal
 */

class ProfileImageManager {
    constructor() {
        // DOM elements
        this.elements = {
            fileInput: null,
            fileNameDisplay: null,
            previewContainer: null,
            previewImage: null,
            removeCheckbox: null,
            hiddenCheckbox: null,
            undoButton: null,
            toggleSelectionButton: null,
            actionButtonsContainer: null,
            imageSelectedFlag: null,
            croppedDataInput: null,
            currentImageContainer: null,
            noImageContainer: null,
            newImageContainer: null,
            currentImageIndicator: null,
            previewImageIndicator: null
        };

        // State tracking
        this.state = {
            newImageSelected: false,
            hasNewImage: false,
            hasExistingImage: false,
            removeImage: false,
            savedCroppedData: null
        };

        // Initialization
        this.init();
    }

    /**
     * Initialize the component
     */
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupComponent());
        } else {
            this.setupComponent();
        }
    }

    /**
     * Set up the component by caching DOM elements and binding events
     */
    setupComponent() {
        this.cacheElements();
        if (this.elementsExist()) {
            this.initializeState();
            this.bindEvents();
            this.updateUIForInitialState();
            this.setupVisibleCheckbox();
            console.log('Profile Image Manager initialized');
        }
    }

    /**
     * Cache all required DOM elements
     */
    cacheElements() {
        // File input and related elements
        this.elements.fileInput = document.getElementById('profile-image-file');
        this.elements.fileNameDisplay = document.getElementById('file-name-display');

        // Image containers and preview elements
        this.elements.previewContainer = document.getElementById('preview-container');
        this.elements.previewImage = document.getElementById('preview-image');
        this.elements.currentImageContainer = document.querySelector('[data-image-type="current"]');
        this.elements.noImageContainer = document.querySelector('[data-image-type="none"]');
        this.elements.newImageContainer = document.querySelector('[data-image-type="new"]');

        // Selection indicators
        this.elements.currentImageIndicator = document.getElementById('current-image-indicator');
        this.elements.previewImageIndicator = document.getElementById('preview-image-indicator');

        // Form controls and action buttons
        this.elements.removeCheckbox = document.getElementById('remove-image-checkbox');
        this.elements.toggleSelectionButton = document.getElementById('toggle-selection-button');
        this.elements.actionButtonsContainer = document.getElementById('image-action-buttons');
        this.elements.imageSelectedFlag = document.getElementById('image-selected-flag');
        this.elements.croppedDataInput = document.getElementById('cropped-image-data');

        // Django generates the checkbox for clearing the image with an ID ending in "-clear"
        this.elements.hiddenCheckbox = document.querySelector('input[id$="-clear"]');

        // Log element availability for debugging
        console.log('Profile Image Manager: Elements cached', {
            'fileInput': !!this.elements.fileInput,
            'fileNameDisplay': !!this.elements.fileNameDisplay,
            'previewContainer': !!this.elements.previewContainer,
            'removeCheckbox': !!this.elements.removeCheckbox,
            'hiddenCheckbox': !!this.elements.hiddenCheckbox,
            'toggleSelectionButton': !!this.elements.toggleSelectionButton,
            'currentImageContainer': !!this.elements.currentImageContainer,
            'noImageContainer': !!this.elements.noImageContainer
        });
    }

    /**
     * Check if required elements exist
     */
    elementsExist() {
        return this.elements.fileInput && this.elements.fileNameDisplay;
    }

    /**
     * Initialize component state based on the DOM
     */
    initializeState() {
        // Check for existing image (either 'current' or 'none')
        this.state.hasExistingImage = !!this.elements.currentImageContainer || !!this.elements.noImageContainer;
        this.state.hasNewImage = false;
        this.state.newImageSelected = false;
        this.state.removeImage = false;
        this.state.savedCroppedData = null;
    }

    /**
     * Set up the UI based on initial state
     */
    updateUIForInitialState() {
        // Add selected class to current or no-image container
        if (this.elements.currentImageContainer) {
            this.elements.currentImageContainer.classList.add('selected');
        } else if (this.elements.noImageContainer) {
            this.elements.noImageContainer.classList.add('selected');
        }
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // File selection event
        this.elements.fileInput.addEventListener('change', this.handleFileSelection.bind(this));

        // Undo button event
        if (this.elements.undoButton) {
            this.elements.undoButton.addEventListener('click', this.handleUndo.bind(this));
        }

        // Toggle selection button event
        if (this.elements.toggleSelectionButton) {
            this.elements.toggleSelectionButton.addEventListener('click', this.toggleSelection.bind(this));
        }

        // Image container click events
        if (this.elements.currentImageContainer) {
            const container = this.elements.currentImageContainer.querySelector('.image-container');
            if (container) {
                container.addEventListener('click', () => this.selectImage('current'));
            }
        }

        // No image container click events
        if (this.elements.noImageContainer) {
            const container = this.elements.noImageContainer.querySelector('.no-image-placeholder');
            if (container) {
                container.addEventListener('click', () => this.selectImage('none'));
            }
        }

        if (this.elements.newImageContainer) {
            const container = this.elements.newImageContainer.querySelector('.image-container');
            if (container) {
                container.addEventListener('click', () => this.selectImage('new'));
            }
        }

        // Remove checkbox event
        if (this.elements.removeCheckbox) {
            this.elements.removeCheckbox.addEventListener('change', this.handleRemoveCheckbox.bind(this));
        }
    }

    /**
     * Set up the visible checkbox to control Django's hidden checkbox
     */
    setupVisibleCheckbox() {
        if (this.elements.removeCheckbox && this.elements.hiddenCheckbox) {
            console.log('Setting up checkbox sync between:', this.elements.removeCheckbox, this.elements.hiddenCheckbox);

            // Make sure the visible checkbox reflects the state of the hidden one
            this.elements.removeCheckbox.checked = this.elements.hiddenCheckbox.checked;

            // Bind event to sync the checkboxes
            this.elements.removeCheckbox.addEventListener('change', () => {
                // Update the hidden Django checkbox
                this.elements.hiddenCheckbox.checked = this.elements.removeCheckbox.checked;
                console.log('Checkbox synced. Hidden checkbox is now:', this.elements.hiddenCheckbox.checked);

                // Trigger change handler for any logic that depends on checkbox state
                this.handleRemoveCheckbox({target: this.elements.removeCheckbox});
            });
        } else {
            console.warn('Cannot setup checkbox sync - elements not found:', {
                removeCheckbox: this.elements.removeCheckbox,
                hiddenCheckbox: this.elements.hiddenCheckbox
            });
        }
    }

    /**
     * Handle file selection
     * @param {Event} e - Change event
     */
    handleFileSelection(e) {
        const files = this.elements.fileInput.files;

        if (files && files[0]) {
            // Update state
            this.state.hasNewImage = true;

            // Update filename display
            const fileName = files[0].name;
            this.elements.fileNameDisplay.textContent = fileName;

            // Show preview if cropper isn't handling it
            if (!window.ImageCropper && this.elements.previewImage && this.elements.previewContainer) {
                this.showDirectPreview(files[0]);
            }

            // Show action buttons and hint text
            if (this.elements.actionButtonsContainer) {
                this.elements.actionButtonsContainer.classList.remove('d-none');
                // Show the hint text
                const hintText = document.getElementById('image-action-hint');
                if (hintText) {
                    hintText.classList.remove('d-none');
                }
            }

            // Set image selection flag to 'pending'
            if (this.elements.imageSelectedFlag) {
                this.elements.imageSelectedFlag.value = 'pending';
            }

            // Select the new image
            this.selectImage('new');

            // Uncheck remove checkbox if checked
            this.uncheckRemoveCheckbox();
        } else {
            this.elements.fileNameDisplay.textContent = 'No file selected';
        }
    }

    /**
     * Show a direct preview of the selected image
     * @param {File} file - The selected image file
     */
    showDirectPreview(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            this.elements.previewImage.src = event.target.result;
            this.elements.previewContainer.classList.remove('d-none');
        };
        reader.readAsDataURL(file);
    }

    /**
     * Uncheck the remove checkbox and its hidden counterpart
     */
    uncheckRemoveCheckbox() {
        if (this.elements.removeCheckbox && this.elements.removeCheckbox.checked) {
            this.elements.removeCheckbox.checked = false;
            this.state.removeImage = false;
        }
    }

    /**
     * Handle undo button click
     * @param {Event} e - Click event
     */
    handleUndo(e) {
        e.preventDefault();

        // Clear file input
        this.elements.fileInput.value = '';
        this.elements.fileNameDisplay.textContent = 'No file selected';

        // Hide preview
        if (this.elements.previewContainer) {
            this.elements.previewContainer.classList.add('d-none');
        }

        // Hide action buttons
        if (this.elements.actionButtonsContainer) {
            this.elements.actionButtonsContainer.classList.add('d-none');
        }

        // Reset state
        this.state.hasNewImage = false;
        this.state.newImageSelected = false;

        // Select current image if it exists, otherwise select no image
        if (this.elements.currentImageContainer) {
            this.selectImage('current');
        } else if (this.elements.noImageContainer) {
            this.selectImage('none');
        }

        // Reset image selection flag
        if (this.elements.imageSelectedFlag) {
            this.elements.imageSelectedFlag.value = '0';
        }

        // Clear cropped data
        if (this.elements.croppedDataInput) {
            this.elements.croppedDataInput.value = '';
            this.state.savedCroppedData = null;
        }
    }

    /**
     * Toggle the selection between current and new image
     * @param {Event} e - Click event
     */
    toggleSelection(e) {
        if (e) e.preventDefault();
        console.log('Toggle selection called. Current state:', this.state.newImageSelected ? 'new' : 'current');

        // Only toggle if we have a new image
        if (this.state.hasNewImage) {
            this.state.newImageSelected = !this.state.newImageSelected;
            console.log('Toggle selection changed to:', this.state.newImageSelected ? 'new' : 'current');
            this.updateSelectionUI();
            this.updateImageSelectionFlag();
            console.log('Image selection flag updated to:', this.elements.imageSelectedFlag.value);
        } else {
            console.log('Cannot toggle: No new image available');
        }
    }

    /**
     * Select an image type (current, none, new)
     * @param {String} type - The type of image to select
     */
    selectImage(type) {
        console.log(`selectImage called with type: ${type}`);
        switch (type) {
            case 'current':
                this.state.newImageSelected = false;
                console.log('Selected current image, newImageSelected=false');
                break;
            case 'none':
                this.state.newImageSelected = false;
                console.log('Selected no image, newImageSelected=false');
                break;
            case 'new':
                this.state.newImageSelected = true;
                console.log('Selected new image, newImageSelected=true');
                break;
        }

        this.updateSelectionUI();
        this.updateImageSelectionFlag();
        console.log('After updateImageSelectionFlag, flag value=', this.elements.imageSelectedFlag.value);
    }

    /**
     * Update the UI to reflect the current selection
     * @param {string} selectedType - The type of image being selected
     */
    updateSelectionUI(selectedType = null) {
        const isNewSelected = this.state.newImageSelected;

        // Handle current image container if it exists
        if (this.elements.currentImageContainer) {
            this.elements.currentImageContainer.classList.toggle('selected', !isNewSelected);
        }

        // Handle no image container if it exists
        if (this.elements.noImageContainer) {
            this.elements.noImageContainer.classList.toggle('selected',
                !isNewSelected && (!this.elements.currentImageContainer || selectedType === 'none'));
        }

        // Handle new image container
        if (this.elements.newImageContainer) {
            this.elements.newImageContainer.classList.toggle('selected', isNewSelected);
            if (this.elements.previewImageIndicator) {
                this.elements.previewImageIndicator.classList.toggle('d-none', !isNewSelected);
            }
        }
    }

    /**
     * Update the hidden image selection flag form field
     */
    updateImageSelectionFlag() {
        if (this.elements.imageSelectedFlag) {
            this.elements.imageSelectedFlag.value = this.state.newImageSelected ? '1' : '0';
        }
    }

    /**
     * Handle remove checkbox change
     * @param {Event} e - Change event
     */
    handleRemoveCheckbox(e) {
        const isChecked = e.target ? e.target.checked : e;
        console.log('Remove checkbox changed:', isChecked);

        // Update state
        this.state.removeImage = isChecked;

        if (this.state.removeImage) {
            // Ensure hidden checkbox is properly checked
            if (this.elements.hiddenCheckbox) {
                this.elements.hiddenCheckbox.checked = true;
            }

            // Save cropped data before hiding preview
            if (this.elements.croppedDataInput && this.elements.croppedDataInput.value) {
                this.state.savedCroppedData = this.elements.croppedDataInput.value;
            }

            // Hide preview container but don't clear its data
            if (this.elements.previewContainer) {
                this.elements.previewContainer.classList.add('d-none');
            }

            // Hide action buttons
            if (this.elements.actionButtonsContainer) {
                this.elements.actionButtonsContainer.classList.add('d-none');
            }

            // Show the placeholder where the current image was
            if (this.elements.currentImageContainer) {
                const imgContainer = this.elements.currentImageContainer.querySelector('.image-container');
                if (imgContainer) {
                    // Store original HTML
                    if (!imgContainer.dataset.originalHtml) {
                        imgContainer.dataset.originalHtml = imgContainer.innerHTML;
                    }

                    // Replace with placeholder
                    imgContainer.innerHTML = '<div class="no-image-placeholder"><i class="fas fa-user-slash fa-2x text-muted"></i></div>';

                    // Make sure we visually indicate this is selected for removal
                    imgContainer.classList.add('image-removal');
                }
            }
        } else {
            // Uncheck hidden checkbox
            if (this.elements.hiddenCheckbox) {
                this.elements.hiddenCheckbox.checked = false;
            }

            // Restore original image if unchecking
            if (this.elements.currentImageContainer) {
                const imgContainer = this.elements.currentImageContainer.querySelector('.image-container');
                if (imgContainer && imgContainer.dataset.originalHtml) {
                    imgContainer.innerHTML = imgContainer.dataset.originalHtml;
                    imgContainer.classList.remove('image-removal');
                }
            }

            // Restore new image preview if we had one
            if (this.state.hasNewImage) {
                if (this.elements.previewContainer) {
                    this.elements.previewContainer.classList.remove('d-none');
                }

                if (this.elements.actionButtonsContainer) {
                    this.elements.actionButtonsContainer.classList.remove('d-none');
                }

                // Restore saved cropped data
                if (this.state.savedCroppedData && this.elements.croppedDataInput) {
                    this.elements.croppedDataInput.value = this.state.savedCroppedData;
                }
            }
        }
    }

    /**
     * Update the preview with a cropped image
     * @param {String} dataUrl - The data URL of the cropped image
     * @param {File} originalFile - The original file that was cropped
     */
    updateWithCroppedImage(dataUrl, originalFile) {
        console.log('updateWithCroppedImage called');

        // Sanitize the base64 data by removing any parameters (charset, encoding, etc.)
        if (dataUrl && dataUrl.includes(';base64,')) {
            // Split the data URL into format and data parts
            const [formatPart, dataPart] = dataUrl.split(';base64,');

            // Keep only the media type (e.g., "data:image/jpeg")
            // and remove all other parameters
            const baseFormat = formatPart.split(';')[0];

            // Reconstruct the data URL with only the media type and base64 data
            dataUrl = `${baseFormat};base64,${dataPart}`;
            console.log('Parameters removed from base64 data in ProfileImageManager');
        }

        // Log details about the format for debugging
        if (dataUrl) {
            const formatInfo = dataUrl.split(';base64,')[0];
            console.log(`Image format info after sanitization: ${formatInfo}`);
            console.log(`Contains charset? ${formatInfo.includes('charset=')}`);
        }

        this.state.hasNewImage = true;
        this.state.newImagePreview = dataUrl;

        // Update the cropped image data input with the sanitized data URL
        if (this.elements.croppedDataInput) {
            this.elements.croppedDataInput.value = dataUrl;
            console.log('Updated cropped image data input with sanitized data');
        }

        // Select the new image
        this.selectImage('new');

        // Force the image_selected value to be '1' to ensure the new image is selected
        if (this.elements.imageSelectedFlag) {
            this.elements.imageSelectedFlag.value = '1';
            console.log('Forced image_selected flag to 1');
        }

        this.updatePreviewUI();

        // Log final state for debugging
        console.log('Final state:', {
            hasNewImage: this.state.hasNewImage,
            newImageSelected: this.state.newImageSelected,
            imageSelectedFlag: this.elements.imageSelectedFlag ? this.elements.imageSelectedFlag.value : 'undefined'
        });
    }
}

// Create and export a singleton instance
const profileImageManager = new ProfileImageManager();

// Add to window for access by other modules like the cropper
window.profileImageManager = profileImageManager;

export default profileImageManager;
