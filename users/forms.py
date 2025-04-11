# users/forms.py
from allauth.account.forms import AddEmailForm, ChangePasswordForm, LoginForm
from allauth.account.models import EmailAddress
from django import forms
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Field, Submit, HTML
from django.contrib.auth import get_user_model
from .models import Address, UserProfile
from .widgets import ProfileImageCropperWidget


class ContactForm(forms.Form):
    email = forms.EmailField(required=True)
    message = forms.CharField(widget=forms.Textarea, required=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = 'post'
        self.helper.add_input(Submit('submit', 'Send Message'))


class ResendVerificationForm(forms.Form):
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={'class': 'form-control'}),
    )


class CustomAddEmailForm(AddEmailForm):
    email2 = forms.CharField(
        label='Confirm E-mail',
        widget=forms.TextInput(
            attrs={
                'type': 'email',
                'placeholder': 'Confirm E-mail',
                'autocomplete': 'email',
            },
        ),
        required=True,
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_tag = False

    def clean_email2(self):
        cleaned_data = super().clean()
        email = cleaned_data.get("email")
        email2 = cleaned_data.get("email2")

        if email and email2 and email != email2:
            raise forms.ValidationError("Emails don't match")
        return cleaned_data

    def save(self, request):
        email_address = EmailAddress.objects.add_email(
            request, request.user, self.cleaned_data['email'], confirm=True
        )
        return email_address


class CustomChangePasswordForm(ChangePasswordForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_tag = False


class UserForm(forms.ModelForm):
    class Meta:
        model = get_user_model()
        fields = ['first_name', 'last_name']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_tag = False


class CustomLoginForm(LoginForm):
    def __init__(self, *args, **kwargs):
        self.request = kwargs.get('request', None)
        super().__init__(*args, **kwargs)
        self.fields['remember'] = forms.BooleanField(
            required=False, label='Remember Me'
        )

        self.helper = FormHelper()
        self.helper.layout = Layout(
            'login',
            'password',
            Field('remember', wrapper_class='form-check'),
            Submit('submit', 'Log In', css_class='btn btn-primary'),
        )
        self.helper.form_tag = False

    def get_user(self):
        """Return authenticated user after successful login."""
        if not hasattr(self, '_user'):
            self._user = self.user
        return self._user


class AddressForm(forms.ModelForm):
    """Form for creating and editing Address objects."""

    class Meta:
        model = Address
        fields = [
            'address_line_1',
            'address_line_2',
            'town_or_city',
            'county',
            'postcode',
            'country',
            'phone_number',
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = 'post'
        self.helper.layout = Layout(
            Field('address_line_1', placeholder='Street Address 1'),
            Field('address_line_2', placeholder='Street Address 2 (Optional)'),
            Field('town_or_city', placeholder='Town or City'),
            Field('county', placeholder='County (Optional)'),
            Field('postcode', placeholder='Postcode'),
            Field('country', placeholder='Country'),
            Field('phone_number', placeholder='Phone Number (Optional)'),
            HTML('<hr>'),
            Submit('submit', 'Save Address', css_class='btn btn-primary'),
        )
        self.fields['address_line_1'].label = 'Address Line 1'


class ProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = [
            'phone_number',
            'bio',
            'birth_date',
            'profile_image',
            'notification_preference',
            'receive_marketing_emails',
            'theme_preference',
        ]
        widgets = {
            'birth_date': forms.DateInput(attrs={'type': 'date'}),
            'bio': forms.Textarea(attrs={'rows': 3}),
            'profile_image': ProfileImageCropperWidget(),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_tag = False
        self.fields['bio'].help_text = (
            "Tell us a little about yourself (max 500 characters)"
        )
        self.fields['phone_number'].help_text = (
            "For order-related communications only"
        )
        self.fields['receive_marketing_emails'].label = (
            "I want to receive promotional emails"
        )
        self.fields['notification_preference'].label = (
            "Email notification preferences"
        )
        self.fields['theme_preference'].label = "Site theme preference"
