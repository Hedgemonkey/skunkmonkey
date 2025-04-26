from django import forms

from shop.models import Order

from .models import OrderNote, StaffProfile


class OrderFilterForm(forms.Form):
    """Form for filtering orders"""
    STATUS_CHOICES = [('', 'All Statuses')] + list(Order.STATUS_CHOICES)
    PAYMENT_CHOICES = [('', 'All Payment Statuses')] + list(
        Order.PAYMENT_STATUS_CHOICES)

    order_number = forms.CharField(
        required=False,
        widget=forms.TextInput(
            attrs={
                'class': 'form-control form-control-sm',
                'placeholder': 'Order #'
            }
        )
    )
    customer_email = forms.EmailField(
        required=False,
        widget=forms.EmailInput(
            attrs={
                'class': 'form-control form-control-sm',
                'placeholder': 'Email'
            }
        )
    )
    status = forms.ChoiceField(
        choices=STATUS_CHOICES,
        required=False,
        widget=forms.Select(
            attrs={'class': 'form-select form-select-sm'}
        )
    )
    payment_status = forms.ChoiceField(
        choices=PAYMENT_CHOICES,
        required=False,
        widget=forms.Select(
            attrs={'class': 'form-select form-select-sm'}
        )
    )
    date_from = forms.DateField(
        required=False,
        widget=forms.DateInput(
            attrs={
                'class': 'form-control form-control-sm',
                'type': 'date'
            }
        )
    )
    date_to = forms.DateField(
        required=False,
        widget=forms.DateInput(
            attrs={
                'class': 'form-control form-control-sm',
                'type': 'date'
            }
        )
    )


class OrderUpdateForm(forms.ModelForm):
    """
    Form for updating order details
    """
    class Meta:
        model = Order
        fields = [
            'status',
            'payment_status',
            'tracking_number',
            'notes'
        ]
        widgets = {
            'status': forms.Select(attrs={'class': 'form-select'}),
            'payment_status': forms.Select(attrs={'class': 'form-select'}),
            'tracking_number': forms.TextInput(
                attrs={'class': 'form-control'}
            ),
            'notes': forms.Textarea(
                attrs={'class': 'form-control', 'rows': 3}
            ),
        }


class OrderStatusUpdateForm(forms.ModelForm):
    """Form for updating order status"""

    class Meta:
        model = Order
        fields = ['status', 'payment_status']
        widgets = {
            'status': forms.Select(
                attrs={'class': 'form-select'}
            ),
            'payment_status': forms.Select(
                attrs={'class': 'form-select'}
            ),
        }


class OrderShippingUpdateForm(forms.ModelForm):
    """Form for updating shipping information for an order"""
    shipping_carrier = forms.CharField(max_length=100, required=False)
    notify_customer = forms.BooleanField(required=False)
    shipping_notes = forms.CharField(
        widget=forms.Textarea(attrs={'rows': 3}),
        required=False,
        label='Notes'
    )

    class Meta:
        model = Order
        fields = ['tracking_number', 'shipped_at', 'delivered_at',
                  'shipping_carrier', 'notify_customer', 'shipping_notes']
        widgets = {
            'tracking_number': forms.TextInput(
                attrs={'class': 'form-control'}
            ),
            'shipped_at': forms.DateTimeInput(
                attrs={'type': 'datetime-local', 'class': 'form-control'}
            ),
            'delivered_at': forms.DateTimeInput(
                attrs={'type': 'datetime-local', 'class': 'form-control'}
            ),
        }


class OrderNoteForm(forms.ModelForm):
    """Form for adding notes to an order"""

    class Meta:
        model = OrderNote
        fields = ['content', 'is_important']
        widgets = {
            'content': forms.Textarea(
                attrs={
                    'class': 'form-control',
                    'rows': 3,
                    'placeholder': 'Add a note about this order...'
                }
            ),
            'is_important': forms.CheckboxInput(
                attrs={'class': 'form-check-input'}
            ),
        }
        labels = {
            'is_important': 'Mark as important',
        }


class StaffProfileForm(forms.ModelForm):
    """Form for editing staff profile"""

    class Meta:
        model = StaffProfile
        fields = ['department', 'phone_extension', 'notes']
        widgets = {
            'department': forms.Select(
                attrs={'class': 'form-select'}
            ),
            'phone_extension': forms.TextInput(
                attrs={'class': 'form-control'}
            ),
            'notes': forms.Textarea(
                attrs={
                    'class': 'form-control',
                    'rows': 3
                }
            ),
        }


class CustomerContactForm(forms.Form):
    """Form for contacting customers"""
    subject = forms.CharField(
        max_length=100,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    message = forms.CharField(
        widget=forms.Textarea(
            attrs={
                'class': 'form-control',
                'rows': 5,
                'placeholder': 'Enter your message to the customer here...'
            }
        )
    )
    send_email = forms.BooleanField(
        required=False,
        initial=True,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        label='Send email to customer'
    )
    log_contact = forms.BooleanField(
        required=False,
        initial=True,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        label='Log this contact in order history'
    )
    send_copy = forms.BooleanField(
        required=False,
        initial=True,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        label='Send a copy to myself'
    )
