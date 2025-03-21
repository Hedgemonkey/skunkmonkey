from django import forms
from .models import Order
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Submit, Row, Column

class CartAddProductForm(forms.Form):
    quantity = forms.IntegerField(min_value=1, initial=1, widget=forms.NumberInput(attrs={
        'class': 'form-control',
        'style': 'width: 80px;'
    }))
    update = forms.BooleanField(required=False, initial=False, widget=forms.HiddenInput)


class CheckoutForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = ['full_name', 'email', 'shipping_address']
        widgets = {
            'shipping_address': forms.Textarea(attrs={'rows': 4}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_tag = True
        self.helper.form_method = 'post'
        self.helper.form_class = 'checkout-form'
        self.helper.layout = Layout(
            Row(
                Column('full_name', css_class='form-group col-md-6 mb-0'),
                Column('email', css_class='form-group col-md-6 mb-0'),
                css_class='form-row'
            ),
            'shipping_address',
            Submit('submit', 'Place Order', css_class='btn btn-primary mt-3')
        )

        for field_name, field in self.fields.items():
            field.widget.attrs['class'] = 'form-control'
            field.label_suffix = ""