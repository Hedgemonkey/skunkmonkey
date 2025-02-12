# users/forms.py
from django import forms

class ContactForm(forms.Form):  # Correct: defined at top level
    email = forms.EmailField(required=True)
    message = forms.CharField(widget=forms.Textarea, required=True)

class ResendVerificationForm(forms.Form):
    email = forms.EmailField(required=True, widget=forms.EmailInput(attrs={'class': 'form-control'}))