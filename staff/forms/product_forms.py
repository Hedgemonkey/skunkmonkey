"""
Forms for product management functionality
"""
import os

from django import forms

from crispy_forms.helper import FormHelper
from crispy_forms.layout import Column, Layout, Row, Submit

from products.models import Category, Product


class CustomCropperFileInput(forms.FileInput):
    """
    Custom file input widget with cropper functionality
    """
    template_name = 'staff/widgets/custom_cropper_file_input.html'

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        context['widget']['image_url'] = value.url if value and hasattr(
            value, 'url') else None
        return context


class ProductForm(forms.ModelForm):
    """Form for creating and updating products"""

    class Meta:
        model = Product
        fields = [
            'name',
            'category',
            'sku',
            'description',
            'price',
            'compare_at_price',
            'stock_quantity',
            'image',
            'is_active'
        ]
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4}),
            'category': forms.Select(attrs={'class': 'form-select'}),
            'image': CustomCropperFileInput(attrs={
                'class': 'form-control',
                'id': 'image'
            }),
            'is_active': forms.CheckboxInput(
                attrs={'class': 'form-check-input'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_tag = False
        self.helper.form_show_labels = True
        self.helper.layout = Layout(
            Row(
                Column('name', css_class='form-group col-md-6 mb-0'),
                Column('category', css_class='form-group col-md-6 mb-0'),
                css_class='form-row'
            ),
            'description',
            Row(
                Column('price', css_class='form-group col-md-4 mb-0'),
                Column('compare_at_price',
                       css_class='form-group col-md-4 mb-0'),
                Column('stock_quantity',
                       css_class='form-group col-md-4 mb-0'),
                css_class='form-row'
            ),
            'image',
            'is_active',
            Submit('submit', 'Save', css_class='btn btn-primary mt-3')
        )

        # Apply bootstrap classes to all form fields
        for field_name, field in self.fields.items():
            field.widget.attrs['class'] = 'form-control'
            field.label_suffix = ""

            # Special handling for is_active checkbox
            if field_name == 'is_active':
                field.widget.attrs['class'] = 'form-check-input'

            # Set up category queryset ordered by name
            if field_name == 'category':
                field.queryset = Category.objects.all().order_by('name')
                field.widget.attrs['class'] = 'form-select'

    @property
    def image_basename(self):
        """Get the basename of the current image"""
        if self.instance and self.instance.image:
            return os.path.basename(self.instance.image.name)
        return None


class CategoryForm(forms.ModelForm):
    """Form for creating and updating product categories"""

    class Meta:
        model = Category
        fields = ['name', 'slug', 'friendly_name', 'parent',
                  'order', 'image', 'is_active']
        widgets = {
            'parent': forms.Select(attrs={'class': 'form-select'}),
            'image': forms.FileInput(attrs={'class': 'form-control'}),
            'is_active': forms.CheckboxInput(
                attrs={'class': 'form-check-input'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_tag = False
        self.helper.form_show_labels = True
        self.helper.layout = Layout(
            Row(
                Column('name', css_class='form-group col-md-6 mb-0'),
                Column('slug', css_class='form-group col-md-6 mb-0'),
                css_class='form-row'
            ),
            Row(
                Column('friendly_name', css_class='form-group col-md-6 mb-0'),
                Column('parent', css_class='form-group col-md-6 mb-0'),
                css_class='form-row'
            ),
            Row(
                Column('order', css_class='form-group col-md-6 mb-0'),
                Column('image', css_class='form-group col-md-6 mb-0'),
                css_class='form-row'
            ),
            'is_active',
            Submit('submit', 'Save', css_class='btn btn-primary mt-3')
        )

        # Apply bootstrap classes to all form fields
        for field_name, field in self.fields.items():
            field.widget.attrs['class'] = 'form-control'
            field.label_suffix = ""

            # Special handling for is_active checkbox
            if field_name == 'is_active':
                field.widget.attrs['class'] = 'form-check-input'

            # Set up parent queryset ordered by name
            if field_name == 'parent':
                # Exclude self from parent options when editing
                if self.instance and self.instance.pk:
                    field.queryset = Category.objects.exclude(
                        pk=self.instance.pk
                    ).order_by('name')
                else:
                    field.queryset = Category.objects.all().order_by('name')
                field.widget.attrs['class'] = 'form-select'
                field.required = False

        # Make slug field optional for auto-generation
        self.fields['slug'].required = False
        self.fields['parent'].empty_label = "No parent (top-level category)"
        self.fields['friendly_name'].required = False
