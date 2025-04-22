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
            'toggleSelectionButton': !!this.elements.toggleSelectionButton
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
        this.state.hasExistingImage = !!this.elements.currentImageContainer;
        this.state.hasNewImage = false;
        this.state.newImageSelected = false;
        this.state.removeImage = false;
        this.state.savedCroppedData = null;
    }

    /**
     * Set up the UI based on initial state
     */
    updateUIForInitialState() {
        if (this.elements.currentImageContainer) {
            this.elements.currentImageContainer.classList.add('selected');
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
            // Make sure the visible checkbox reflects the state of the hidden one
            this.elements.removeCheckbox.checked = this.elements.hiddenCheckbox.checked;

            // Bind event to sync the checkboxes
            this.elements.removeCheckbox.addEventListener('change', () => {
                // Update the hidden Django checkbox
                this.elements.hiddenCheckbox.checked = this.elements.removeCheckbox.checked;

                // Trigger the change handler to update the UI
                const event = new Event('change');
                this.elements.hiddenCheckbox.dispatchEvent(event);
            });

            console.log('Checkbox sync setup complete');
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

        // Select current image if it exists
        if (this.state.hasExistingImage) {
            this.selectImage('current');
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
     * Toggle selection between current and new image
     * @param {Event} [e] - Optional click event
     */
    toggleSelection(e) {
        if (e) e.preventDefault();

        // Only toggle if we have both images
        if (this.state.hasExistingImage && this.state.hasNewImage) {
            this.state.newImageSelected = !this.state.newImageSelected;
            this.updateSelectionUI();
            this.updateImageSelectionFlag();
        }
    }

    /**
     * Select a specific image type
     * @param {string} type - Either 'current' or 'new'
     */
    selectImage(type) {
        // Skip if there's no new image and we're trying to select it
        if (type === 'new' && !this.state.hasNewImage) {
            return;
        }

        // Skip if we're trying to select current image but don't have one
        if (type === 'current' && !this.state.hasExistingImage) {
            return;
        }

        this.state.newImageSelected = (type === 'new');
        this.updateSelectionUI();
        this.updateImageSelectionFlag();
    }

    /**
     * Update the UI to reflect the current selection
     */
    updateSelectionUI() {
        if (this.elements.currentImageContainer) {
            if (this.state.newImageSelected) {
                this.elements.currentImageContainer.classList.remove('selected');
            } else {
                this.elements.currentImageContainer.classList.add('selected');
            }
        }

        if (this.elements.newImageContainer) {
            if (this.state.newImageSelected) {
                this.elements.newImageContainer.classList.add('selected');
                this.elements.previewImageIndicator.classList.remove('d-none');
            } else {
                this.elements.newImageContainer.classList.remove('selected');
                this.elements.previewImageIndicator.classList.add('d-none');
            }
        }
    }

    /**
     * Update the hidden image selection flag form field
     */
    updateImageSelectionFlag() {
        if (this.elements.imageSelectedFlag) {
            if (this.state.newImageSelected) {
                this.elements.imageSelectedFlag.value = '1';
            } else {
                this.elements.imageSelectedFlag.value = '0';
            }
        }
    }

    /**
     * Handle remove checkbox change
     * @param {Event} e - Change event
     */
    handleRemoveCheckbox(e) {
        console.log('Remove checkbox changed:', this.elements.removeCheckbox.checked);

        // Update state
        this.state.removeImage = this.elements.removeCheckbox.checked;

        if (this.state.removeImage) {
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
     * Update the manager with a cropped image from an external cropper
     * @param {string} dataUrl - The cropped image data URL
     */
    updateWithCroppedImage(dataUrl) {
        if (!dataUrl) return;

        // Save the cropped data
        this.state.savedCroppedData = dataUrl;

        // Show preview
        if (this.elements.previewContainer && this.elements.previewImage) {
            this.elements.previewImage.src = dataUrl;
            this.elements.previewContainer.classList.remove('d-none');
        }

        // Update state
        this.state.hasNewImage = true;

        // Show action buttons
        if (this.elements.actionButtonsContainer) {
            this.elements.actionButtonsContainer.classList.remove('d-none');
            // Show the hint text
            const hintText = document.getElementById('image-action-hint');
            if (hintText) {
                hintText.classList.remove('d-none');
            }
        }

        // Select the new image
        this.selectImage('new');

        // Store the cropped data
        if (this.elements.croppedDataInput) {
            this.elements.croppedDataInput.value = dataUrl;
        }

        // Uncheck remove checkbox if checked
        this.uncheckRemoveCheckbox();
    }
}

// Create and export a singleton instance
const profileImageManager = new ProfileImageManager();

// Add to window for access by other modules like the cropper
window.profileImageManager = profileImageManager;

export default profileImageManager;
