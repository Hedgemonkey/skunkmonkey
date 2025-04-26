"""
Forms for staff order management functionality
"""
from datetime import date

from django import forms

from shop.models import Order
from staff.models import OrderNote


class OrderFilterForm(forms.Form):
    """Form for filtering orders in list view"""
    order_number = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control form-control-sm'})
    )
    customer_email = forms.EmailField(
        required=False,
        widget=forms.EmailInput(
            attrs={'class': 'form-control form-control-sm'}
        )
    )
    status = forms.ChoiceField(
        choices=[('', '-- All Statuses --')] + list(Order.STATUS_CHOICES),
        required=False,
        widget=forms.Select(attrs={'class': 'form-select form-select-sm'})
    )
    payment_status = forms.ChoiceField(
        choices=[('', '-- All Payment Statuses --')]
        + list(Order.PAYMENT_STATUS_CHOICES),
        required=False,
        widget=forms.Select(attrs={'class': 'form-select form-select-sm'})
    )
    date_from = forms.DateField(
        required=False,
        widget=forms.DateInput(
            attrs={'type': 'date', 'class': 'form-control form-control-sm'}
        )
    )
    date_to = forms.DateField(
        required=False,
        widget=forms.DateInput(
            attrs={'type': 'date', 'class': 'form-control form-control-sm'}
        )
    )


class OrderStatusUpdateForm(forms.ModelForm):
    """Form for updating order status"""
    class Meta:
        model = Order
        fields = ['status', 'payment_status']
        widgets = {
            'status': forms.Select(attrs={'class': 'form-select'}),
            'payment_status': forms.Select(attrs={'class': 'form-select'})
        }


class OrderShippingUpdateForm(forms.ModelForm):
    """Form for updating order shipping information"""
    shipping_carrier = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    notify_customer = forms.BooleanField(
        required=False,
        initial=True,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )
    shipping_notes = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 3,
        })
    )

    class Meta:
        model = Order
        fields = ['tracking_number', 'shipped_at', 'delivered_at', 'notes']
        widgets = {
            'tracking_number': forms.TextInput(
                attrs={'class': 'form-control'}
            ),
            'shipped_at': forms.DateInput(
                attrs={'class': 'form-control', 'type': 'date'}
            ),
            'delivered_at': forms.DateInput(
                attrs={'class': 'form-control', 'type': 'date'}
            ),
            'notes': forms.Textarea(
                attrs={'class': 'form-control', 'rows': 3}
            ),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Set today's date as default for shipped_at if it's not already set
        if not self.instance.shipped_at:
            self.initial['shipped_at'] = date.today()


class OrderNoteForm(forms.ModelForm):
    """Form for adding a note to an order"""
    class Meta:
        model = OrderNote
        fields = ['content', 'is_important']
        widgets = {
            'content': forms.Textarea(
                attrs={'class': 'form-control', 'rows': 3}
            ),
            'is_important': forms.CheckboxInput(
                attrs={'class': 'form-check-input'}
            ),
        }


class CustomerContactForm(forms.Form):
    """Form for contacting customers"""
    subject = forms.CharField(
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    message = forms.CharField(
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 5})
    )
    send_email = forms.BooleanField(
        required=False,
        initial=True,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )
    send_copy = forms.BooleanField(
        required=False,
        initial=False,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )
    log_contact = forms.BooleanField(
        required=False,
        initial=True,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )
