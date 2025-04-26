"""
Forms for user management functionality
"""
from django import forms
from django.contrib.auth.forms import UserCreationForm as BaseUserCreationForm
from django.contrib.auth.models import Group, User

from users.models import Address, UserProfile


class UserSearchForm(forms.Form):
    """Form for searching users in the list view"""
    query = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Search by username, email, or name'
        })
    )
    is_active = forms.ChoiceField(
        choices=[
            ('', 'All Users'),
            ('true', 'Active Users'),
            ('false', 'Inactive Users')
        ],
        required=False,
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    is_staff = forms.ChoiceField(
        choices=[
            ('', 'All Types'),
            ('true', 'Staff'),
            ('false', 'Customers')
        ],
        required=False,
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    date_joined_from = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={
            'class': 'form-control',
            'type': 'date'
        })
    )
    date_joined_to = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={
            'class': 'form-control',
            'type': 'date'
        })
    )


class StaffUserCreationForm(BaseUserCreationForm):
    """Form for creating new users from staff panel"""
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={'class': 'form-control'})
    )
    first_name = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    last_name = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    is_active = forms.BooleanField(
        required=False,
        initial=True,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )
    is_staff = forms.BooleanField(
        required=False,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )
    groups = forms.ModelMultipleChoiceField(
        queryset=Group.objects.all(),
        required=False,
        widget=forms.SelectMultiple(attrs={'class': 'form-select'})
    )

    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'password1', 'password2', 'is_active', 'is_staff', 'groups'
        ]
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control'}),
        }


class StaffUserUpdateForm(forms.ModelForm):
    """Form for updating existing users"""
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={'class': 'form-control'})
    )
    is_active = forms.BooleanField(
        required=False,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )
    is_staff = forms.BooleanField(
        required=False,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )
    groups = forms.ModelMultipleChoiceField(
        queryset=Group.objects.all(),
        required=False,
        widget=forms.SelectMultiple(attrs={'class': 'form-select'})
    )

    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'is_active', 'is_staff', 'groups'
        ]
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control'}),
            'first_name': forms.TextInput(attrs={'class': 'form-control'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control'}),
        }


class UserProfileForm(forms.ModelForm):
    """Form for updating user profiles from staff panel"""

    class Meta:
        model = UserProfile
        fields = [
            'phone_number', 'display_name', 'bio',
            'birth_date', 'notification_preference',
            'receive_marketing_emails', 'theme_preference'
        ]
        widgets = {
            'phone_number': forms.TextInput(attrs={'class': 'form-control'}),
            'display_name': forms.TextInput(attrs={'class': 'form-control'}),
            'bio': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'birth_date': forms.DateInput(
                attrs={'class': 'form-control', 'type': 'date'}
            ),
            'notification_preference': forms.Select(
                attrs={'class': 'form-select'}
            ),
            'receive_marketing_emails': forms.CheckboxInput(
                attrs={'class': 'form-check-input'}
            ),
            'theme_preference': forms.Select(attrs={'class': 'form-select'}),
        }


class AddressForm(forms.ModelForm):
    """Form for user address management"""

    class Meta:
        model = Address
        fields = [
            'address_line_1', 'address_line_2', 'town_or_city',
            'county', 'postcode', 'country', 'phone_number'
        ]
        widgets = {
            'address_line_1': forms.TextInput(attrs={'class': 'form-control'}),
            'address_line_2': forms.TextInput(attrs={'class': 'form-control'}),
            'town_or_city': forms.TextInput(attrs={'class': 'form-control'}),
            'county': forms.TextInput(attrs={'class': 'form-control'}),
            'postcode': forms.TextInput(attrs={'class': 'form-control'}),
            'country': forms.TextInput(attrs={'class': 'form-control'}),
            'phone_number': forms.TextInput(attrs={'class': 'form-control'}),
        }
