# products/forms.py
from django import forms
from .models import Product, Category
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Submit, Row, Column, Field

class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = ['name', 'category', 'description', 'price', 'stock_quantity', 'image', 'is_active']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4}),
            'category': forms.Select(attrs={'class': 'form-select'}),
            'image': forms.ClearableFileInput(attrs={'class': 'form-control'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_tag = False  # Remove the enclosing <form> tag
        self.helper.form_show_labels = True # Ensure labels are shown (or handle in template if preferred)
        self.helper.layout = Layout(
            Row(
                Column('name', css_class='form-group col-md-6 mb-0'),
                Column('category', css_class='form-group col-md-6 mb-0'),
                css_class='form-row'
            ),
            'description',
            Row(
                Column('price', css_class='form-group col-md-4 mb-0'),
                Column('stock_quantity', css_class='form-group col-md-4 mb-0'),
                Column('image', css_class='form-group col-md-4 mb-0'),
                css_class='form-row'
            ),
            'is_active',  # Checkbox will be rendered as form-check by default with Bootstrap 5
            Submit('submit', 'Save', css_class='btn btn-primary mt-3')

        )

        for field_name, field in self.fields.items():
            field.widget.attrs['class'] = 'form-control'   # Apply Bootstrap form-control class to all fields.
            field.label_suffix = ""   # Removes the trailing colon on labels (adjust for your Bootstrap version).
            if field_name == 'category':
                field.queryset = Category.objects.all().order_by('name')  # Ensure categories are ordered by name.


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