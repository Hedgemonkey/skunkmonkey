/**
 * Profile Image Cropper Initialization
 *
 * This file reuses the existing cropper implementation but with profile-specific configurations.
 * It's specifically for handling profile image uploads and cropping.
 */
import Cropper from 'cropperjs';
import $ from 'jquery';

$(function () {
    let cropper;

    function initializeCropper(imageElement) {
        if (cropper) {
            cropper.destroy();
        }
        cropper = new Cropper(imageElement, {
            aspectRatio: 1, // Square aspect ratio for profile images
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
        });
    }

    function setupEventListeners() {
        // Reusing the same control IDs as in the products implementation
        $('#zoom-in').off('click').on('click', function () {
            cropper.zoom(0.1);
        });

        $('#zoom-out').off('click').on('click', function () {
            cropper.zoom(-0.1);
        });

        $('#move-left').off('click').on('click', function () {
            cropper.move(-10, 0);
        });

        $('#move-right').off('click').on('click', function () {
            cropper.move(10, 0);
        });

        $('#move-up').off('click').on('click', function () {
            cropper.move(0, -10);
        });

        $('#move-down').off('click').on('click', function () {
            cropper.move(0, 10);
        });

        $('#rotate-left').off('click').on('click', function () {
            cropper.rotate(-45);
        });

        $('#rotate-right').off('click').on('click', function () {
            cropper.rotate(45);
        });

        $('#rotate-slider').off('input').on('input', function () {
            const angle = parseFloat($(this).val());
            cropper.rotateTo(angle);
        });

        $('#crop-image-button').off('click').on('click', function() {
            if (cropper) {
                const canvas = cropper.getCroppedCanvas();
                canvas.toBlob(function(blob) {
                    const url = URL.createObjectURL(blob);
                    $('#cropped-image-display').attr('src', url);

                    const reader = new FileReader();
                    reader.onloadend = function() {
                        $('#cropped-image-data').val(reader.result);
                        // Show the preview image and name using classes
                        $('#preview-image')
                            .attr('src', reader.result)
                            .removeClass('hidden');
                        $('#image-name')
                            .text('profile-image.png')
                            .removeClass('hidden');
                    };
                    reader.readAsDataURL(blob);
                });

                $('#cropperModal').modal('hide');
            }
        });

        $('#cropperModal').on('hidden.bs.modal', function () {
            $('#cropperModal').css({
                'display': 'none',
                'z-index': 1040
            });
            if (cropper) {
                cropper.destroy();
                cropper = null;
            }
        });
    }

    // Target specifically the profile image input
    $(document).on('change', '.profile-image-input', function (event) {
        const files = event.target.files;
        if (files && files.length > 0) {
            const reader = new FileReader();
            reader.onload = function (e) {
                $('#cropper-image').attr('src', e.target.result);
                $('#cropperModal').css({
                    'display': 'flex',
                    'z-index': 2000
                }).modal('show');

                $('#cropperModal').on('shown.bs.modal', function () {
                    const imageElement = document.getElementById('cropper-image');
                    initializeCropper(imageElement);
                    setupEventListeners();
                });
            };
            reader.readAsDataURL(files[0]);
        }
    });
});
