import os
import pprint  # Import pprint for pretty-printing

from django.forms.widgets import ClearableFileInput


class CustomCropperFileInput(ClearableFileInput):
    template_name = 'widgets/custom_cropper_file_input.html'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def format_value(self, value):
        if value:
            return os.path.basename(value.name)
        return super().format_value(value)

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        if value and hasattr(value, 'url'):
            context['widget'].update({
                'image_name': os.path.basename(value.name),
                'image_url': value.url,
            })

        # Print the context for debugging
        pprint.pprint(context)

        return context

    def render(self, name, value, attrs=None, renderer=None):
        print(f"Rendering widget for {name}")
        attrs = attrs or {}
        attrs['class'] = 'form-control'
        attrs['id'] = 'image-file'  # Crucial ID for JavaScript
        return super().render(name, value, attrs, renderer)
