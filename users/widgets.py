from django.forms.widgets import ClearableFileInput
from django.utils.translation import gettext_lazy as _
import os


class ProfileImageCropperWidget(ClearableFileInput):
    """
    Custom widget for profile image uploads that uses the image cropper.
    Reuses the existing cropper implementation from the products app.
    """
    clear_checkbox_label = _('Remove')
    input_text = _('Change Image')
    template_name = 'users/widgets/profile_image_cropper_input.html'

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        if value and hasattr(value, 'url'):
            context['widget'].update({
                'image_name': os.path.basename(value.name),
                'image_url': value.url,
            })
        return context

    def render(self, name, value, attrs=None, renderer=None):
        attrs = attrs or {}
        attrs['class'] = 'form-control profile-image-input'
        attrs['id'] = 'profile-image-file'  # Specific ID for profile images
        attrs['accept'] = 'image/*'
        return super().render(name, value, attrs, renderer)
