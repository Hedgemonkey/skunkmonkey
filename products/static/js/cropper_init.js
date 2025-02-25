import Cropper from 'cropperjs';

$(function () {
    $(document).on('change', 'input[type="file"]', function(event) {
        const imageInput = $(this);
        let cropper;

        const files = event.target.files;
        if (files && files.length > 0) {
            const reader = new FileReader();
            reader.onload = function(e) {
                $('#cropper-image').attr('src', e.target.result);
                $('#cropperModal').css({
                    'display': 'flex',
                    'z-index': 2000 // Bring to front
                }).modal('show');
                $('.swal2-actions').css({
                    visibility: 'hidden'
                })

                $('#cropperModal').on('shown.bs.modal', function () {
                    const imageElement = document.getElementById('cropper-image');
                    cropper = new Cropper(imageElement, {
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
                    });

                    $('#rotate-slider').on('input', function() {
                        const angle = parseFloat($(this).val());
                        cropper.rotateTo(angle);
                    });
                });
            };
            reader.readAsDataURL(files[0]);
        }

        $('#crop-image-button').on('click', function() {
            if (cropper) {
                const canvas = cropper.getCroppedCanvas();
                canvas.toBlob(function(blob) {
                    const url = URL.createObjectURL(blob);
                    $('#cropped-image-display').attr('src', url);

                    // Update the hidden input field with the data URL
                    const reader = new FileReader();
                    reader.onloadend = function() {
                        $('#cropped-image-data').val(reader.result);
                        // Update the preview image and image name
                        $('#preview-image').attr('src', reader.result);
                        $('#image-name').text('cropped-image.png');
                    };
                    reader.readAsDataURL(blob);
                });

                $('#cropperModal').css({
                    'display': 'none',
                    'z-index': 1040
                }).modal('hide');
            }
        });

        $('#cropperModal').on('hidden.bs.modal', function () {
            $('#cropperModal').css({
                'display': 'none',
                'z-index': 1040 // Reset to initial state
            });
            $('.swal2-actions').css({
                visibility: 'visible'
            })
        });
    });
});