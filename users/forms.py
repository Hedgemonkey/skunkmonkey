# users/forms.py
from allauth.account.forms import AddEmailForm, ChangePasswordForm
from allauth.account.models import EmailAddress
from django import forms
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Field, Submit
from django.contrib.auth import get_user_model
from allauth.account.forms import LoginForm

class ContactForm(forms.Form):  # Correct: defined at top level
    email = forms.EmailField(required=True)
    message = forms.CharField(widget=forms.Textarea, required=True)

class ResendVerificationForm(forms.Form):
    email = forms.EmailField(required=True, widget=forms.EmailInput(attrs={'class': 'form-control'}))

class CustomAddEmailForm(AddEmailForm):
    email2 = forms.CharField(
        label='Confirm E-mail', widget=forms.TextInput(attrs={'type': 'email', 'placeholder': 'Confirm E-mail', 'autocomplete': 'email'}), required=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_tag = False  #  <--- This line is essential


    def clean_email2(self):
        cleaned_data = super().clean()
        email = cleaned_data.get("email")
        email2 = cleaned_data.get("email2")

        if email and email2 and email != email2:
            raise forms.ValidationError("Emails don't match")
        return cleaned_data
    
    def save(self, request):
        email_address = EmailAddress.objects.add_email(request, request.user, self.cleaned_data['email'], confirm=True)
        return email_address


class CustomChangePasswordForm(ChangePasswordForm): 
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_tag = False

class UserForm(forms.ModelForm):  # Inherit directly from forms.ModelForm
    class Meta:
        model = get_user_model() # Use get_user_model() here
        fields = ['first_name', 'last_name']  # Or other fields you want

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_tag = False

class CustomLoginForm(LoginForm):

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None) 
        super().__init__(*args, **kwargs)
        # Add remember field to fields
        self.fields['remember'] = forms.BooleanField(required=False, label='Remember Me')


        self.helper = FormHelper()
        self.helper.layout = Layout(
            'login',
            'password',
            Field('remember', wrapper_class='form-check'),
            Submit('submit', 'Log In', css_class='btn btn-primary')
        )
        self.helper.form_tag = False

