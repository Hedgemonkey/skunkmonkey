# users/forms.py
from allauth.account.forms import AddEmailForm
from allauth.account.models import EmailAddress
from django import forms
from crispy_forms.helper import FormHelper

class ContactForm(forms.Form):  # Correct: defined at top level
    email = forms.EmailField(required=True)
    message = forms.CharField(widget=forms.Textarea, required=True)

class ResendVerificationForm(forms.Form):
    email = forms.EmailField(required=True, widget=forms.EmailInput(attrs={'class': 'form-control'}))

class ConfirmAddEmailForm(AddEmailForm):
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