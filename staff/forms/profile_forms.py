"""
Forms for staff profile management
"""
from django import forms

from staff.models import StaffProfile


class StaffProfileForm(forms.ModelForm):
    """Form for updating staff profile information"""
    class Meta:
        model = StaffProfile
        fields = [
            'department', 'phone_extension', 'notes'
        ]
        widgets = {
            'department': forms.Select(attrs={'class': 'form-select'}),
            'phone_extension': forms.TextInput(
                attrs={'class': 'form-control'}
            ),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 3})
        }
