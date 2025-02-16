# products/forms.py
from django import forms
from .models import Product, Category  # Import your models

class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = ['name', 'category', 'description', 'price', 'stock_quantity', 'image', 'is_active']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4}),  # Customize the description field to be a larger textarea
            'category': forms.Select(attrs={'class': 'form-select'}), # Style the category dropdown
            'image': forms.ClearableFileInput(attrs={'class': 'form-control'}),  # add some styling to the file upload input.
        }


    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Add Bootstrap classes to form fields
        for field_name, field in self.fields.items():

            if type(field.widget) == forms.BooleanField:
                # field.widget.attrs['class'] = 'form-check-input' # Uncomment to add this styling to the checkbox/radio buttons.
                pass # For now, we are skipping checkbox styling
            else:

                field.widget.attrs['class'] = 'form-control'  # Apply form-control class for styling


            # Add 'form-label' class to labels if Bootstrap 5 or higher.
            field.label_suffix = ""  # Remove the trailing colon (adjust if needed for your Bootstrap version)

        self.fields['is_active'].widget.attrs['class'] = 'form-check-input' # Add correct styling for checkboxes

