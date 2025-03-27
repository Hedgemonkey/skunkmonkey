from django import forms
from django_countries.fields import CountryField
from django_countries.widgets import CountrySelectWidget
from .models import Order
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Row, Column, Div, HTML, Field
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
    """
    Checkout form that lets Stripe Payment Element handle billing information
    """
    # We need to split the full_name field into first_name and last_name for the form
    first_name = forms.CharField(
        max_length=50,
        required=True,
        widget=forms.TextInput(attrs={
            'placeholder': 'First Name',
            'class': 'form-control',
        }),
    )
    
    last_name = forms.CharField(
        max_length=50,
        required=True,
        widget=forms.TextInput(attrs={
            'placeholder': 'Last Name',
            'class': 'form-control',
        }),
    )
    
    # Shipping name fields (not in model)
    shipping_first_name = forms.CharField(
        max_length=50,
        required=True,
        widget=forms.TextInput(attrs={
            'placeholder': 'First Name',
            'class': 'form-control',
        }),
    )
    
    shipping_last_name = forms.CharField(
        max_length=50,
        required=True,
        widget=forms.TextInput(attrs={
            'placeholder': 'Last Name',
            'class': 'form-control',
        }),
    )
    
    shipping_country = CountryField(blank_label='Select country').formfield(
        widget=CountrySelectWidget(attrs={
            'class': 'form-control custom-select',
        })
    )

    # Save payment info for later checkbox
    save_payment_info = forms.BooleanField(
        required=False,
        initial=False,
        widget=forms.CheckboxInput(attrs={
            'id': 'save_payment_info',
            'class': 'form-check-input'
        }),
        label="Save my payment information for future purchases"
    )
    
    # Hidden field to store the payment intent ID
    payment_intent_id = forms.CharField(
        required=False,
        widget=forms.HiddenInput(attrs={'id': 'payment_intent_id'})
    )
    
    # Hidden field to store payment method type
    payment_method_type = forms.CharField(
        required=False,
        widget=forms.HiddenInput(attrs={'id': 'payment_method_type'})
    )
    
    class Meta:
        model = Order
        fields = [
            # Contact information
            'email',
            'phone_number',
            
            # Shipping information
            'shipping_address1',
            'shipping_address2',
            'shipping_city',
            'shipping_state',
            'shipping_zipcode',
            'shipping_country',
            
            # Hidden fields
            'payment_intent_id',
            'payment_method_type',
        ]
        widgets = {
            # Contact information fields
            'first_name': forms.TextInput(attrs={
                'placeholder': 'First Name',
                'class': 'form-control',
                'data-propagate-to': 'id_shipping_first_name'
            }),
            'last_name': forms.TextInput(attrs={
                'placeholder': 'Last Name',
                'class': 'form-control',
                'data-propagate-to': 'id_shipping_last_name'
            }),
            'email': forms.EmailInput(attrs={
                'placeholder': 'Email Address',
                'class': 'form-control'
            }),
            'phone_number': forms.TextInput(attrs={
                'placeholder': 'Phone Number',
                'class': 'form-control'
            }),

            # Shipping information fields
            'shipping_first_name': forms.TextInput(attrs={
                'placeholder': 'First Name',
                'class': 'form-control'
            }),
            'shipping_last_name': forms.TextInput(attrs={
                'placeholder': 'Last Name',
                'class': 'form-control'
            }),
            'shipping_address1': forms.TextInput(attrs={
                'placeholder': 'Street Address 1',
                'class': 'form-control'
            }),
            'shipping_address2': forms.TextInput(attrs={
                'placeholder': 'Street Address 2 (optional)',
                'class': 'form-control'
            }),
            'shipping_city': forms.TextInput(attrs={
                'placeholder': 'City/Town',
                'class': 'form-control'
            }),
            'shipping_state': forms.TextInput(attrs={
                'placeholder': 'State/Province/Region',
                'class': 'form-control'
            }),
            'shipping_zipcode': forms.TextInput(attrs={
                'placeholder': 'Postal/ZIP Code',
                'class': 'form-control'
            }),
        }

    def __init__(self, *args, **kwargs):
        # Get the client_secret from kwargs if it exists
        client_secret = kwargs.pop('client_secret', None)
        
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_tag = False  # Don't render the form tag here
        
        # Store client_secret for use in the form
        self.client_secret = client_secret
        self.helper.form_class = 'checkout-form'
        self.helper.layout = Layout(
            # Contact Information Section
            Div(
                HTML('<h3 class="mb-4">Contact Information</h3>'),
                Row(
                    Column('first_name', css_class='form-group col-md-6 mb-3'),
                    Column('last_name', css_class='form-group col-md-6 mb-3'),
                    css_class='form-row'
                ),
                Row(
                    Column('email', css_class='form-group col-md-6 mb-3'),
                    Column('phone_number', css_class='form-group col-md-6 mb-3'),
                    css_class='form-row'
                ),
                css_class='mb-4'
            ),
            
            # Shipping Address Section
            Div(
                HTML('<h3 class="mb-3">Shipping Address</h3>'),
                Row(
                    Column('shipping_first_name', css_class='form-group col-md-6 mb-3'),
                    Column('shipping_last_name', css_class='form-group col-md-6 mb-3'),
                    css_class='form-row'
                ),
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
            
            # Payment Information Section
            Div(
                HTML('<h3 class="mb-3 above-payment-element">Payment Information</h3>'),
                HTML('<p class="text-muted mb-3 above-payment-element">The billing information will be collected securely by Stripe.</p>'),
                
                # Stripe Payment Element Container with proper containment classes
                Div(
                    # Create a wrapper div with position:relative to contain the payment element
                    HTML('<div class="stripe-element-wrapper">'),
                    HTML('<div id="payment-element" class="mb-3"></div>'),
                    HTML('</div>'),
                    HTML('<div id="payment-errors" class="alert alert-danger d-none"></div>'),
                    css_class='payment-element-container'
                ),
                
                # Save Payment Info Option
                Field('save_payment_info', css_class='mb-3'),
                
                # Hidden Fields
                Field('payment_intent_id'),
                Field('payment_method_type'),
                
                css_class='payment-form-section mb-4'
            ),
            
            # Hidden fields for Stripe
            HTML('<div id="stripe-data" data-publishable-key="{{ stripe_public_key }}" data-client-secret="{{ client_secret }}" data-cache-url="{% url \'shop:cache_checkout_data\' %}"></div>'),
        )

        # Set autofocus on first field
        self.fields['first_name'].widget.attrs['autofocus'] = True

        # Enable autopropagation from contact to shipping
        for field in self.fields:
            if field == 'first_name' or field == 'last_name':
                self.fields[field].widget.attrs[
                    'data-propagate-to'
                ] = f'id_shipping_{field}'

    def clean(self):
        """
        Custom validation and auto-population
        """
        cleaned_data = super().clean()
        
        # Automatically propagate contact info to shipping if shipping is empty
        if not cleaned_data.get('shipping_first_name') and cleaned_data.get('first_name'):
            cleaned_data['shipping_first_name'] = cleaned_data.get('first_name')
            
        if not cleaned_data.get('shipping_last_name') and cleaned_data.get('last_name'):
            cleaned_data['shipping_last_name'] = cleaned_data.get('last_name')
        
        return cleaned_data
    
    def save(self, commit=True):
        """
        Custom save method to handle combining first_name and last_name into full_name
        """
        instance = super().save(commit=False)
        
        # Set the full_name from first_name and last_name
        first_name = self.cleaned_data.get('first_name', '')
        last_name = self.cleaned_data.get('last_name', '')
        instance.full_name = f"{first_name} {last_name}"
        
        # Set the billing_name from shipping names if separate billing info isn't provided
        shipping_first = self.cleaned_data.get('shipping_first_name', '')
        shipping_last = self.cleaned_data.get('shipping_last_name', '')
        instance.billing_name = f"{shipping_first} {shipping_last}"
        
        if commit:
            instance.save()
        
        return instance

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
            # Get Stripe API key
            stripe_api_key = settings.STRIPE_SECRET_KEY

            if not stripe_api_key:
                # Log the error
                print("Error: Stripe API key not configured")
                return None

            # Set the API key
            stripe.api_key = stripe_api_key

            # Create the PaymentIntent
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency=currency,
                metadata=metadata or {},
                automatic_payment_methods={
                    'enabled': True,
                },
            )

            # Return the client_secret
            return intent.client_secret
        except Exception as e:
            # Log the error
            print(f"Error creating PaymentIntent: {str(e)}")
            return None
