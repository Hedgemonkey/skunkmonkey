"""
Forms for product management functionality
"""
import os
import re

from django import forms
from django.core.exceptions import ValidationError
from django.utils.text import slugify

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
            Row(
                Column('sku', css_class='form-group col-md-6 mb-0'),
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

        # Add helpful placeholders and validation attributes
        self.fields['name'].widget.attrs.update({
            'placeholder': 'Enter product name',
            'maxlength': '200'
        })
        self.fields['sku'].widget.attrs.update({
            'placeholder': 'e.g. SKU-001 or leave blank for auto-generation',
            'pattern': '[A-Z0-9-_]+',
            'title': ('SKU should contain only uppercase letters, numbers, '
                      'hyphens, and underscores')
        })
        self.fields['price'].widget.attrs.update({
            'placeholder': '0.00',
            'min': '0',
            'step': '0.01'
        })
        self.fields['compare_at_price'].widget.attrs.update({
            'placeholder': '0.00 (optional)',
            'min': '0',
            'step': '0.01'
        })
        self.fields['stock_quantity'].widget.attrs.update({
            'placeholder': '0',
            'min': '0'
        })
        self.fields['description'].widget.attrs.update({
            'placeholder': ('Describe your product features, benefits, and '
                            'specifications...')
        })

    def clean_sku(self):
        """Validate and auto-generate SKU if not provided"""
        sku = self.cleaned_data.get('sku', '').strip()

        if not sku:
            # Auto-generate SKU from product name
            name = self.cleaned_data.get('name', '')
            if name:
                base_sku = slugify(name).upper().replace('-', '_')[:20]
                # Ensure uniqueness
                counter = 1
                original_sku = base_sku
                while Product.objects.filter(sku=base_sku).exclude(
                        pk=self.instance.pk if self.instance else None
                ).exists():
                    base_sku = f"{original_sku}_{counter:03d}"
                    counter += 1
                sku = base_sku
            else:
                raise ValidationError(
                    "SKU is required when product name is not provided."
                )

        # Validate SKU format
        if not re.match(r'^[A-Z0-9_-]+$', sku):
            raise ValidationError(
                "SKU should contain only uppercase letters, numbers, "
                "hyphens, and underscores."
            )

        # Check for uniqueness
        if Product.objects.filter(sku=sku).exclude(
                pk=self.instance.pk if self.instance else None).exists():
            raise ValidationError(
                f"A product with SKU '{sku}' already exists."
            )

        return sku

    def clean_price(self):
        """Validate product price"""
        price = self.cleaned_data.get('price')
        if price is not None:
            if price < 0:
                raise ValidationError("Price cannot be negative.")
            if price > 999999.99:
                raise ValidationError("Price cannot exceed $999,999.99.")
        return price

    def clean_compare_at_price(self):
        """Validate compare at price"""
        compare_at_price = self.cleaned_data.get('compare_at_price')
        if compare_at_price is not None:
            if compare_at_price < 0:
                raise ValidationError("Compare at price cannot be negative.")
            if compare_at_price > 999999.99:
                raise ValidationError(
                    "Compare at price cannot exceed $999,999.99."
                )
        return compare_at_price

    def clean_stock_quantity(self):
        """Validate stock quantity"""
        stock_quantity = self.cleaned_data.get('stock_quantity')
        if stock_quantity is not None:
            if stock_quantity < 0:
                raise ValidationError("Stock quantity cannot be negative.")
            if stock_quantity > 999999:
                raise ValidationError(
                    "Stock quantity cannot exceed 999,999."
                )
        return stock_quantity

    def clean(self):
        """Additional cross-field validation"""
        cleaned_data = super().clean()
        price = cleaned_data.get('price')
        compare_at_price = cleaned_data.get('compare_at_price')

        # Validate that compare_at_price is higher than price if both provided
        if price and compare_at_price:
            if compare_at_price <= price:
                raise ValidationError({
                    'compare_at_price': ('Compare at price must be higher '
                                         'than the regular price.')
                })

        return cleaned_data

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
                Column('friendly_name',
                       css_class='form-group col-md-6 mb-0'),
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

        # Add helpful placeholders and attributes
        self.fields['name'].widget.attrs.update({
            'placeholder': 'Enter category name',
            'maxlength': '100'
        })
        self.fields['slug'].widget.attrs.update({
            'placeholder': 'Auto-generated from name if left blank',
            'pattern': '[a-z0-9-]+',
            'title': ('Slug should contain only lowercase letters, numbers, '
                      'and hyphens')
        })
        self.fields['friendly_name'].widget.attrs.update({
            'placeholder': 'Display name for customers (optional)',
            'maxlength': '100'
        })
        self.fields['order'].widget.attrs.update({
            'placeholder': '0',
            'min': '0',
            'max': '9999'
        })

    def clean_name(self):
        """Validate category name"""
        name = self.cleaned_data.get('name', '').strip()
        if not name:
            raise ValidationError("Category name is required.")

        # Check for uniqueness
        if Category.objects.filter(name=name).exclude(
                pk=self.instance.pk if self.instance else None).exists():
            raise ValidationError(
                f"A category with name '{name}' already exists."
            )

        return name

    def clean_slug(self):
        """Validate and auto-generate slug if not provided"""
        slug = self.cleaned_data.get('slug', '').strip()

        if not slug:
            # Auto-generate slug from category name
            name = self.cleaned_data.get('name', '')
            if name:
                base_slug = slugify(name)[:50]
                # Ensure uniqueness
                counter = 1
                original_slug = base_slug
                while Category.objects.filter(slug=base_slug).exclude(
                        pk=self.instance.pk if self.instance else None
                ).exists():
                    base_slug = f"{original_slug}-{counter}"
                    counter += 1
                slug = base_slug
            else:
                raise ValidationError(
                    "Slug is required when category name is not provided."
                )

        # Validate slug format
        if not re.match(r'^[a-z0-9-]+$', slug):
            raise ValidationError(
                "Slug should contain only lowercase letters, numbers, "
                "and hyphens."
            )

        # Check for uniqueness
        if Category.objects.filter(slug=slug).exclude(
                pk=self.instance.pk if self.instance else None).exists():
            raise ValidationError(
                f"A category with slug '{slug}' already exists."
            )

        return slug

    def clean_order(self):
        """Validate category order"""
        order = self.cleaned_data.get('order')
        if order is not None:
            if order < 0:
                raise ValidationError("Order cannot be negative.")
            if order > 9999:
                raise ValidationError("Order cannot exceed 9999.")
        return order

    def clean_parent(self):
        """Validate parent category to prevent circular references"""
        parent = self.cleaned_data.get('parent')

        if parent and self.instance and self.instance.pk:
            # Check for circular reference
            if parent == self.instance:
                raise ValidationError("A category cannot be its own parent.")

            # Check if the selected parent is a descendant of this category
            current_parent = parent.parent
            while current_parent:
                if current_parent == self.instance:
                    raise ValidationError(
                        f"Cannot set '{parent.name}' as parent because it "
                        "would create a circular reference."
                    )
                current_parent = current_parent.parent

        return parent
