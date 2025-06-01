# users/forms.py
from django import forms
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

from allauth.account.forms import AddEmailForm, ChangePasswordForm, LoginForm
from allauth.account.models import EmailAddress
from crispy_forms.helper import FormHelper
from crispy_forms.layout import HTML, Field, Layout, Submit

from .models import Address, UserProfile
from .widgets import ProfileImageCropperWidget


class ContactForm(forms.Form):
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={
            'aria-describedby': 'id_email_help',
            'autocomplete': 'email',
        }),
        help_text='We\'ll use this to respond to your inquiry.',
        error_messages={
            'required': 'Please provide your email address so we can respond.',
            'invalid': 'Please enter a valid email address.',
        }
    )
    subject = forms.CharField(
        max_length=100,
        required=True,
        widget=forms.TextInput(attrs={
            'aria-describedby': 'id_subject_help',
            'autocomplete': 'off',
        }),
        help_text='Brief description of your inquiry.',
        error_messages={
            'required': 'Please provide a subject for your message.',
            'max_length': 'Subject must be 100 characters or less.',
        }
    )
    phone_number = forms.CharField(
        required=False,
        max_length=20,
        widget=forms.TextInput(attrs={
            'aria-describedby': 'id_phone_number_help',
            'autocomplete': 'tel',
        }),
        help_text='Optional. Include if you prefer a phone callback.',
        error_messages={
            'max_length': 'Phone number must be 20 characters or less.',
        }
    )
    message = forms.CharField(
        widget=forms.Textarea(attrs={
            'rows': 5,
            'aria-describedby': 'id_message_help',
            'maxlength': 2000,
        }),
        required=True,
        help_text='Please provide details about your inquiry '
                  '(maximum 2000 characters).',
        error_messages={
            'required': 'Please include your message.',
        }
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = 'post'
        self.helper.form_id = 'contact-form'
        self.helper.form_class = 'needs-validation'
        self.helper.attrs = {'novalidate': True}
        self.helper.layout = Layout(
            Field('email',
                  css_class='form-control',
                  aria_required='true',
                  placeholder='your.email@example.com'),
            Field('phone_number',
                  css_class='form-control',
                  placeholder='+44 123 456 7890 (optional)'),
            Field('subject',
                  css_class='form-control',
                  aria_required='true',
                  placeholder='Brief description of your inquiry'),
            Field('message',
                  css_class='form-control',
                  aria_required='true',
                  placeholder='Please provide details about your inquiry...'),
        )
        self.helper.add_input(Submit('submit', 'Send Message',
                                     css_class='btn btn-primary'))


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

    def __init__(self, request=None, *args, **kwargs):
        self.request = request
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_tag = False

        # Set the user property properly
        if request and request.user.is_authenticated:
            self.user = request.user

    def clean_email2(self):
        cleaned_data = super().clean()
        email = cleaned_data.get("email")
        email2 = cleaned_data.get("email2")

        if email and email2 and email != email2:
            raise forms.ValidationError("Emails don't match")
        return email2  # Return email2 value, not the whole cleaned_data

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
        self.helper.form_show_labels = True
        self.helper.form_class = 'form-horizontal'
        self.helper.label_class = 'col-lg-3'
        self.helper.field_class = 'col-lg-9'
        self.helper.wrapper_class = 'row mb-2'

        # Set defaults for all fields
        for fieldname in self.fields:
            self.fields[fieldname].widget.attrs.update({
                'class': 'form-control',
            })

        # Properly implement the layout
        self.helper.layout = Layout(
            Field('first_name', wrapper_class='row mb-2'),
            Field('last_name', wrapper_class='row mb-2'),
        )


class CustomLoginForm(LoginForm):
    def __init__(self, *args, **kwargs):
        self.request = kwargs.get('request', None)
        super().__init__(*args, **kwargs)
        self.fields['remember'] = forms.BooleanField(
            required=False, label='Remember Me'
        )

        self.helper = FormHelper()
        self.helper.form_tag = False  # Let the template handle the form tag
        self.helper.layout = Layout(
            Field('login'),
            Field('password'),
            Field('remember'),
            Submit(
                'submit',
                _('Sign In'),
                css_class='btn btn-primary w-100 mt-3'
            )
        )

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
            'display_name',
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
            'receive_marketing_emails': forms.CheckboxInput(attrs={
                'class': 'form-check-input',
            }),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_tag = False
        self.helper.form_show_labels = True
        self.helper.form_class = 'form-horizontal'
        self.helper.label_class = 'col-lg-3'
        self.helper.field_class = 'col-lg-9'
        self.helper.wrapper_class = 'row mb-2'

        # First apply form-control to all fields
        for fieldname in self.fields:
            self.fields[fieldname].widget.attrs.update({
                'class': 'form-control',
            })

        for fieldname in self.fields:
            if isinstance(self.fields[fieldname].widget, forms.CheckboxInput):
                self.fields[fieldname].widget.attrs[
                    'class'
                ] = 'form-check-input'

        # Use proper Layout with Field objects
        self.helper.layout = Layout(
            Field('display_name', wrapper_class='row mb-2'),
            Field('phone_number', wrapper_class='row mb-2'),
            Field('bio', wrapper_class='row mb-2'),
            Field('birth_date', wrapper_class='row mb-2'),
            Field('profile_image', wrapper_class='row mb-2'),
            Field('notification_preference', wrapper_class='row mb-2'),
            Field('receive_marketing_emails', wrapper_class='row mb-2'),
            Field('theme_preference', wrapper_class='row mb-2'),
        )

        self.fields['display_name'].label = "Display Name"
        self.fields['display_name'].help_text = (
            "The name that will be displayed on the site"
        )
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
        self.fields['theme_preference'].help_text = (
            "✨ Coming soon! Theme customization is currently in development."
        )


class ContactMessageReplyForm(forms.Form):
    """Form for users to reply to contact messages."""
    message = forms.CharField(
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 4,
            'placeholder': _('Type your reply here...'),
        }),
        label=_('Your Reply'),
        required=True,
    )


class StaffUserSearchForm(forms.Form):
    """Form for staff to search users."""
    search = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': _('Search by username, email, or name...'),
        })
    )

    STATUS_CHOICES = (
        ('', _('All')),
        ('active', _('Active')),
        ('inactive', _('Inactive')),
    )

    USER_TYPE_CHOICES = (
        ('', _('All')),
        ('staff', _('Staff')),
        ('customers', _('Customers')),
    )

    SORT_CHOICES = (
        ('-date_joined', _('Newest')),
        ('date_joined', _('Oldest')),
        ('username', _('Username (A-Z)')),
        ('-username', _('Username (Z-A)')),
        ('email', _('Email (A-Z)')),
        ('-email', _('Email (Z-A)')),
    )

    status = forms.ChoiceField(
        choices=STATUS_CHOICES,
        required=False,
        widget=forms.Select(attrs={'class': 'form-select'})
    )

    user_type = forms.ChoiceField(
        choices=USER_TYPE_CHOICES,
        required=False,
        widget=forms.Select(attrs={'class': 'form-select'})
    )

    sort = forms.ChoiceField(
        choices=SORT_CHOICES,
        required=False,
        initial='-date_joined',
        widget=forms.Select(attrs={'class': 'form-select'})
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = 'get'
        self.helper.form_class = 'row g-3'

        self.helper.layout = Layout(
            Field('search', wrapper_class='col-md-6'),
            Field('status', wrapper_class='col-md-2'),
            Field('user_type', wrapper_class='col-md-2'),
            Field('sort', wrapper_class='col-md-2'),
            Submit('submit', _('Search'), css_class='btn-primary col-12 mt-2')
        )
