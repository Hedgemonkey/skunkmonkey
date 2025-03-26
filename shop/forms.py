from django import forms
from django_countries.fields import CountryField
from django_countries.widgets import CountrySelectWidget
from .models import Order
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Submit, Row, Column, Div, HTML, Field
import stripe
from django.conf import settings

class CartAddProductForm(forms.Form):
    quantity = forms.IntegerField(min_value=1, initial=1, widget=forms.NumberInput(attrs={
        'class': 'form-control',
        'style': 'width: 80px;'
    }))
    update = forms.BooleanField(required=False, initial=False, widget=forms.HiddenInput)


class CartUpdateQuantityForm(forms.Form):
    """
    Form for updating the quantity of a product in the cart via AJAX
    """
    quantity = forms.IntegerField(min_value=0, widget=forms.NumberInput(attrs={
        'class': 'form-control cart-quantity-input',
        'style': 'width: 80px;',
        'min': '0'
    }))


class CheckoutForm(forms.ModelForm):
    shipping_country = CountryField(blank_label='Select country').formfield(
        widget=CountrySelectWidget(attrs={
            'class': 'form-control custom-select',
        })
    )
    
    billing_country = CountryField(blank_label='Select country').formfield(
        widget=CountrySelectWidget(attrs={
            'class': 'form-control custom-select',
        })
    )
    
    # Add a checkbox for "billing address same as shipping"
    billing_same_as_shipping = forms.BooleanField(
        required=False,
        initial=False,
        widget=forms.CheckboxInput(attrs={
            'id': 'billing_same_as_shipping',
        }),
        label="My billing address is the same as my shipping address"
    )
    
    # Save payment info for later checkbox
    save_payment_info = forms.BooleanField(
        required=False,
        initial=False,
        widget=forms.CheckboxInput(attrs={
            'id': 'save_payment_info',
        }),
        label="Save my payment information for future purchases"
    )
    
    class Meta:
        model = Order
        fields = [
            'full_name',
            'email',
            'phone_number',
            'shipping_address1',
            'shipping_address2',
            'shipping_city',
            'shipping_state',
            'shipping_zipcode',
            'shipping_country',
            'billing_address1',
            'billing_address2',
            'billing_city',
            'billing_state',
            'billing_zipcode',
            'billing_country',
        ]
        widgets = {
            'full_name': forms.TextInput(attrs={'placeholder': 'Full Name', 'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'placeholder': 'Email Address', 'class': 'form-control'}),
            'phone_number': forms.TextInput(attrs={'placeholder': 'Phone Number', 'class': 'form-control'}),
            'shipping_address1': forms.TextInput(attrs={'placeholder': 'Street Address 1', 'class': 'form-control'}),
            'shipping_address2': forms.TextInput(attrs={'placeholder': 'Street Address 2 (optional)', 'class': 'form-control'}),
            'shipping_city': forms.TextInput(attrs={'placeholder': 'City/Town', 'class': 'form-control'}),
            'shipping_state': forms.TextInput(attrs={'placeholder': 'State/Province/Region', 'class': 'form-control'}),
            'shipping_zipcode': forms.TextInput(attrs={'placeholder': 'Postal/ZIP Code', 'class': 'form-control'}),
            'billing_address1': forms.TextInput(attrs={'placeholder': 'Street Address 1', 'class': 'form-control billing-field'}),
            'billing_address2': forms.TextInput(attrs={'placeholder': 'Street Address 2 (optional)', 'class': 'form-control billing-field'}),
            'billing_city': forms.TextInput(attrs={'placeholder': 'City/Town', 'class': 'form-control billing-field'}),
            'billing_state': forms.TextInput(attrs={'placeholder': 'State/Province/Region', 'class': 'form-control billing-field'}),
            'billing_zipcode': forms.TextInput(attrs={'placeholder': 'Postal/ZIP Code', 'class': 'form-control billing-field'}),
        }

    def __init__(self, *args, **kwargs):
        # Get the client_secret from kwargs if it exists
        client_secret = kwargs.pop('client_secret', None)
        
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_tag = False  # Don't render the form tag here - let the template handle it
        
        # Store client_secret for use in the form
        self.client_secret = client_secret
        self.helper.form_class = 'checkout-form'
        self.helper.layout = Layout(
            # Contact Information Section
            Div(
                HTML('<h3 class="mb-4">Contact Information</h3>'),
                Row(
                    Column('full_name', css_class='form-group col-md-6 mb-3'),
                    Column('email', css_class='form-group col-md-6 mb-3'),
                    css_class='form-row'
                ),
                Row(
                    Column('phone_number', css_class='form-group col-md-6 mb-3'),
                    css_class='form-row'
                ),
                css_class='mb-4'
            ),
            
            # Shipping Address Section
            Div(
                HTML('<h3 class="mb-3">Shipping Address</h3>'),
                Field('shipping_address1', css_class='mb-3'),
                Field('shipping_address2', css_class='mb-3'),
                Row(
                    Column('shipping_city', css_class='form-group col-md-5 mb-3'),
                    Column('shipping_state', css_class='form-group col-md-4 mb-3'),
                    Column('shipping_zipcode', css_class='form-group col-md-3 mb-3'),
                    css_class='form-row'
                ),
                Field('shipping_country', css_class='mb-3'),
                css_class='mb-4'
            ),
            
            # Billing Address Section
            Div(
                HTML('<h3 class="mb-3">Billing Address</h3>'),
                Field('billing_same_as_shipping', css_class='mb-3'),
                Div(
                    Field('billing_address1', css_class='mb-3'),
                    Field('billing_address2', css_class='mb-3'),
                    Row(
                        Column('billing_city', css_class='form-group col-md-5 mb-3'),
                        Column('billing_state', css_class='form-group col-md-4 mb-3'),
                        Column('billing_zipcode', css_class='form-group col-md-3 mb-3'),
                        css_class='form-row'
                    ),
                    Field('billing_country', css_class='mb-3'),
                    css_class='billing-address-fields'
                ),
                css_class='mb-4'
            ),
            
            # Payment Information Section
            Div(
                HTML('<h3 class="mb-3">Payment Information</h3>'),
                Field('save_payment_info', css_class='mb-3'),
                css_class='mb-4'
            ),
            
            # Hidden fields for Stripe
            HTML('<div id="stripe-data" data-publishable-key="{{ stripe_public_key }}" data-client-secret="{{ client_secret }}" data-cache-url="{% url \'shop:cache_checkout_data\' %}"></div>'),
            HTML('<div id="card-element" class="form-control mb-3"></div>'),
            HTML('<div id="card-errors" class="text-danger mb-3"></div>'),
            HTML('<input type="hidden" name="client_secret" id="id_client_secret">'),
            HTML('<input type="hidden" name="payment_method_id" id="id_payment_method_id">'),
            
        )

        # Set autofocus on first field and add classes
        self.fields['full_name'].widget.attrs['autofocus'] = True
        
        # Make billing address fields not required initially
        for field_name, field in self.fields.items():
            if field_name.startswith('billing_') and field_name != 'billing_same_as_shipping':
                field.required = False
    
    def clean(self):
        """
        Custom validation to ensure billing address fields are provided if billing_same_as_shipping is False
        """
        cleaned_data = super().clean()
        billing_same_as_shipping = cleaned_data.get('billing_same_as_shipping')
        
        # If billing address is different, validate billing fields
        if not billing_same_as_shipping:
            required_billing_fields = [
                'billing_address1', 'billing_city', 'billing_state',
                'billing_zipcode', 'billing_country'
            ]
        
            for field_name in required_billing_fields:
                if not cleaned_data.get(field_name):
                    self.add_error(field_name, 'This field is required.')
        
        return cleaned_data
    
    def create_payment_intent(self, amount, currency='usd', metadata=None):
        """
        Create a Stripe PaymentIntent for this checkout
        
        Args:
            amount: Amount in cents to charge
            currency: Currency code (default: usd)
            metadata: Dictionary of metadata to attach to the PaymentIntent
            
        Returns:
            The client_secret from the PaymentIntent
        """
        try:
            # stripe.api_key = settings.STRIPE_SECRET_KEY
            
            # Create the PaymentIntent
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency=currency,
                metadata=metadata or {},
            )
            
            # Return the client_secret
            return intent.client_secret
        except Exception as e:
            # Log the error
            print(f"Error creating PaymentIntent: {str(e)}")
            return None
