# products/forms.py
import os

from django import forms

from crispy_forms.helper import FormHelper
from crispy_forms.layout import Column, Layout, Row, Submit

from .models import Category, Product
from .widgets import CustomCropperFileInput


class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = [
            'name',
            'category',
            'description',
            'price',
            'stock_quantity',
            'image',
            'is_active']
        widgets = {
            'description': forms.Textarea(
                attrs={
                    'rows': 4}),
            'category': forms.Select(
                attrs={
                    'class': 'form-select'}),
            'image': CustomCropperFileInput(
                attrs={
                    'class': 'form-control',
                    'id': 'image'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        print("ProductForm loaded")  # Debugging statement
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
                Column('price', css_class='form-group col-md-6 mb-0'),
                Column('stock_quantity', css_class='form-group col-md-6 mb-0'),
                css_class='form-row'
            ),
            # Row(
            #     Field('image', css_class='form-group col-md-12 mb-0'),
            # Explicitly use Field to ensure custom widget
            #     css_class='form-row'
            # ),
            'is_active',
        )

        for field_name, field in self.fields.items():
            field.widget.attrs['class'] = 'form-control'
            field.label_suffix = ""
            if field_name == 'category':
                field.queryset = Category.objects.all().order_by('name')

    @property
    def image_basename(self):
        if self.instance and self.instance.image:
            return os.path.basename(self.instance.image.name)
        return None


# Define CategoryForm
class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = ['name', 'slug']

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
            Submit('submit', 'Save', css_class='btn btn-primary mt-3')
        )

        for field_name, field in self.fields.items():
            field.widget.attrs['class'] = 'form-control'
            field.label_suffix = ""
