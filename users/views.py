from django.contrib import messages
from django.contrib.auth import (
    REDIRECT_FIELD_NAME, get_user_model, login as auth_login, logout,
)
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LoginView
from django.core.exceptions import FieldError
from django.http import Http404, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse, reverse_lazy
from django.views.decorators.http import require_POST

from allauth.account.models import EmailAddress
from allauth.account.utils import send_email_confirmation

from shop.models import Order

from .forms import (
    AddressForm, ContactForm, CustomAddEmailForm, CustomChangePasswordForm,
    CustomLoginForm, ProfileForm, UserForm,
)
from .models import Address, UserProfile

User = get_user_model()


@login_required
def manage_account(request):
    return render(request, 'users/manage.html')


def contact(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            # Process the form data, e.g., send an email to support
            email = form.cleaned_data['email']
            message = form.cleaned_data['message']
            # Example: Log the email and message for debugging
            print(f"Email: {email}, Message: {message}")
            return redirect(
                reverse('users:contact') + '?ok'
            )
    else:
        form = ContactForm()
    return render(request, 'users/contact.html', {'form': form})


class CustomLoginView(LoginView):
    success_url = reverse_lazy('home')
    form_class = CustomLoginForm
    template_name = 'allauth/account/login.html'

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['request'] = self.request  # Pass the request to the form
        return kwargs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context

    def form_valid(self, form):
        # Set session expiry based on remember me checkbox
        if form.cleaned_data.get('remember'):
            self.request.session.set_expiry(60 * 60 * 24 * 7)  # 1 week
        else:
            self.request.session.set_expiry(0)  # Expire on browser close

        # Call the parent class form_valid method which handles authentication
        auth_login(self.request, form.get_user())

        # Check user status after login
        user = self.request.user
        if user:
            if not user.is_active:
                logout(self.request)
                messages.info(
                    self.request,
                    "Your account is inactive. Please contact support or "
                    "check your email for reactivation instructions."
                )
                next_url = self.request.GET.get(
                    REDIRECT_FIELD_NAME, self.get_success_url()
                )
                return redirect(
                    reverse('account_inactive')
                    + f'?{REDIRECT_FIELD_NAME}=' + next_url
                )

            elif not user.emailaddress_set.filter(
                verified=True, primary=True
            ).exists():
                messages.info(
                    self.request,
                    "Please verify your email address to log in."
                )
                return redirect(reverse('account_email_verification_required'))

        return redirect(self.get_success_url())


login = CustomLoginView.as_view()


@login_required
def email_verification_required(request):
    email = request.GET.get('email') or request.POST.get('email')

    if request.method == 'POST' and 'resend' in request.POST:
        try:
            email_address = EmailAddress.objects.get(email__iexact=email)
            if email_address.verified:
                messages.info(
                    request,
                    "Your email is already verified. Please log in."
                )
                return redirect('account_login')

            user = email_address.user
            send_email_confirmation(request, user, signup=False)
            messages.success(request, "Verification email resent.")
            return render(
                request, 'allauth/account/verification_sent.html'
            )

        except EmailAddress.DoesNotExist:
            messages.error(
                request,
                "No user exists for that email address. Please register or "
                "contact support."
            )
            return redirect('account_signup')

    return render(
        request,
        'allauth/account/verified_email_required.html',
        {'email': email}
    )


@login_required
def manage_details(request):
    user = request.user

    # Example: Load user's email addresses
    email_addresses = EmailAddress.objects.filter(user=user)

    return render(
        request, "users/details.html", {
            'email_addresses': email_addresses,
            'active_tab': 'email',  # Add this to highlight the email tab
        }
    )  # New template


@login_required
def manage_email(request):
    """Manage user email addresses."""
    email_addresses = EmailAddress.objects.filter(user=request.user)
    form = CustomAddEmailForm(request, request.POST or None)

    if request.method == 'POST' and form.is_valid():
        email_address = form.save(request)
        messages.success(
            request,
            f"Confirmation email sent to {email_address.email}. Please verify."
        )
        return redirect('users:manage_email')

    context = {
        'email_addresses': email_addresses,
        'form': form,
        'title': "Manage Email Addresses",
        'active_tab': 'email',  # Add this to highlight the correct tab
    }
    return render(request, "users/email.html", context)


@login_required
def manage_password(request):
    """Allow users to change their password."""
    form = CustomChangePasswordForm(
        data=request.POST or None, user=request.user
    )

    if request.method == 'POST' and form.is_valid():
        form.save()
        messages.success(
            request,
            "Your password has been changed successfully."
        )
        return render(
            request,
            'users/password_change_done.html',
            {'active_tab': 'password'},
        )

    return render(
        request,
        'users/password_change.html',
        {'form': form, 'active_tab': 'password'},
    )


@login_required
def manage_social(request):
    return render(request, 'users/social.html', {
        'title': "Manage Social Connections",
        'active_tab': 'social'  # Add active_tab for navigation highlighting
    })


@login_required
def manage_details_update(request):  # View to render the form
    form = UserForm(
        instance=request.user  # Instantiate with current user data
    )
    if request.method == 'POST':  # Check if the form has been submitted
        print(request.POST)
        form = UserForm(
            request.POST, instance=request.user  # Get data from POST
        )
        if form.is_valid():  # Validate form
            print('Valid')
            form.save()  # Save form
            messages.success(
                request,
                'Your profile details have been updated successfully.'
            )
            return redirect('manage_details')  # Redirect to view details page
        elif request.headers.get('x-requested-with') == 'XMLHttpRequest':
            print('Ajax')
            errors = form.errors.as_json()
            return JsonResponse(
                {'errors': errors, 'form': form.as_p()}, status=400
            )
    return render(
        request, 'users/user_form.html', {'form': form}
    )


@login_required
def deactivate_account(request):
    if request.method == 'POST':
        request.user.is_active = False
        request.user.save()
        messages.success(request, "Your account has been deactivated.")

        logout(request)  # Automatically log the user out after deactivation.

        return JsonResponse(
            {
                'success': True,
                'redirect_url': reverse('account_inactive_message')
            }
        )
    return JsonResponse({'success': False, 'error': 'Invalid request.'})


@login_required
def delete_account(request):
    if request.method == 'DELETE':
        request.user.delete()

        username = request.user.username  # Get username before logging out
        logout(request)
        messages.success(
            request,
            f"Account '{username}' has been permanently deleted."
        )

        return JsonResponse(
            {
                'messages': [
                    {"message": m.message, "tags": m.tags}
                    for m in messages.get_messages(request)
                ],
                'deleted': True
            }  # Indicates successful deletion
        )

    return JsonResponse({'error': 'Invalid request'}, status=400)


def deleted_account(request):
    return render(request, 'users/account_deleted.html')


def account_inactive_message(request):
    messages.info(
        request,
        'Your account is currently inactive. Please login or reactivate your '
        'account.'
    )  # Or a custom message
    return render(request, 'allauth/account/account_inactive.html')


# --- New Profile Views ---


@login_required
def profile_dashboard(request):
    """
    Display the main user profile dashboard. Creates profile if missing.
    """
    # Use get_or_create to handle users who might not have a profile yet
    user_profile, created = UserProfile.objects.get_or_create(
        user=request.user
    )

    if created:
        # Optional: Log or message if a profile was just created
        print(f"Created UserProfile for {request.user.username}")
        messages.info(request, "Your profile has been initialized.")

    context = {
        'profile': user_profile,
        'active_tab': 'dashboard'  # For highlighting navigation
    }
    return render(
        request, 'users/profile_dashboard.html', context
    )  # Ensure template path is correct


@login_required
def manage_profile(request):
    """View for managing user profile information."""
    user = request.user
    user_profile, _ = UserProfile.objects.get_or_create(user=user)

    if request.method == 'POST':
        user_form = UserForm(request.POST, instance=user)
        profile_form = ProfileForm(
            request.POST,
            request.FILES,
            instance=user_profile
        )

        # Process cropped image data if provided
        cropped_image_data = request.POST.get('cropped_image_data')

        if user_form.is_valid() and profile_form.is_valid():
            user_form.save()
            profile = profile_form.save(commit=False)

            # Handle cropped image if available
            if cropped_image_data and cropped_image_data.startswith(
                    'data:image'):
                # Import necessary modules
                import base64
                import uuid

                from django.core.files.base import ContentFile

                # Parse the base64 image data
                format, imgstr = cropped_image_data.split(';base64,')
                ext = format.split('/')[-1]

                # Generate a unique filename
                filename = f"{uuid.uuid4()}.{ext}"

                # Convert base64 to file and save to profile
                data = ContentFile(base64.b64decode(imgstr), name=filename)
                profile.profile_image = data

            profile.save()
            messages.success(
                request, 'Your profile has been updated successfully.'
            )
            return redirect('users:manage_profile')
    else:
        user_form = UserForm(instance=user)
        profile_form = ProfileForm(instance=user_profile)

    context = {
        'user_form': user_form,
        'profile_form': profile_form,
        'profile': user_profile,
        'active_tab': 'profile',
    }
    return render(request, 'users/manage_profile.html', context)


# --- Address Management Views ---


@login_required
def manage_addresses(request):
    """Display and manage user's saved addresses."""
    addresses = Address.objects.filter(user=request.user)
    user_profile, _ = UserProfile.objects.get_or_create(
        user=request.user  # Ensure profile exists
    )
    context = {
        'addresses': addresses,
        'default_address_id': (
            user_profile.default_delivery_address.id
            if user_profile.default_delivery_address else None
        ),
        'active_tab': 'addresses',
    }
    return render(request, 'users/address_list.html', context)


@login_required
def add_address(request):
    """Handle adding a new address."""
    user_profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if request.method == 'POST':
        form = AddressForm(request.POST)
        if form.is_valid():
            address = form.save(commit=False)
            address.user = request.user
            address.save()

            if not user_profile.default_delivery_address:
                user_profile.default_delivery_address = address
                user_profile.save()
                messages.success(
                    request, 'Address added and set as default.'
                )
            else:
                messages.success(request, 'Address added successfully.')

            return redirect('users:manage_addresses')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = AddressForm()

    context = {
        'form': form,
        'form_title': 'Add New Address',
        'active_tab': 'addresses',
    }
    return render(request, 'users/address_form.html', context)


@login_required
def edit_address(request, address_id):
    """ Handle editing an existing address """
    address = get_object_or_404(
        Address, id=address_id, user=request.user  # Ensure user owns address
    )

    if request.method == 'POST':
        form = AddressForm(request.POST, instance=address)
        if form.is_valid():
            form.save()
            messages.success(request, 'Address updated successfully.')
            return redirect('users:manage_addresses')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = AddressForm(instance=address)

    context = {
        'form': form,
        'form_title': 'Edit Address',
        'address': address,  # Pass address for context if needed
        'active_tab': 'addresses'
    }
    return render(
        request, 'users/address_form.html', context
    )  # Ensure template path is correct


@login_required
@require_POST  # Ensure this view only accepts POST requests for safety
def delete_address(request, address_id):
    """ Delete an address """
    address = get_object_or_404(Address, id=address_id, user=request.user)
    user_profile, _ = UserProfile.objects.get_or_create(
        user=request.user  # Ensure profile exists
    )

    # Check if it's the default address
    if user_profile.default_delivery_address == address:
        user_profile.default_delivery_address = None
        user_profile.save()
        # Optionally find and set another address as default if one exists
        # next_default = Address.objects.filter(
        #     user=request.user
        # ).exclude(id=address_id).first()
        # if next_default:
        #    request.user.userprofile.default_delivery_address = next_default
        #    request.user.userprofile.save()

    address_info = address.get_short_address()  # Get info before deleting
    address.delete()

    # Use JSON response for AJAX calls, otherwise use messages + redirect
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return JsonResponse(
            {
                'success': True,
                'message': f'Address "{address_info}" deleted.'
            }
        )
    else:
        messages.success(request, f'Address "{address_info}" deleted.')
        return redirect('users:manage_addresses')


@login_required
@require_POST  # Ensure this view only accepts POST requests
def set_default_address(request, address_id):
    """ Set an address as the default delivery address """
    address = get_object_or_404(Address, id=address_id, user=request.user)
    user_profile, _ = UserProfile.objects.get_or_create(
        user=request.user  # Ensure profile exists
    )
    user_profile.default_delivery_address = address
    user_profile.save()

    address_info = address.get_short_address()
    # Use JSON response for AJAX calls, otherwise use messages + redirect
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return JsonResponse(
            {
                'success': True,
                'message': f'Address "{address_info}" set as default.'
            }
        )
    else:
        messages.success(request, f'Address "{address_info}" set as default.')
        return redirect('users:manage_addresses')


# --- Order History Views ---


@login_required
def order_history(request):
    """ Display the user's order history """
    orders = []
    user_profile, _ = UserProfile.objects.get_or_create(
        user=request.user  # Ensure profile exists
    )

    if Order:  # Check if Order model was imported successfully
        try:
            # Adjust the query based on your actual Order model structure
            orders = Order.objects.filter(
                user=request.user
            ).order_by('-created_at')  # Primary attempt
        except FieldError:  # Handle cases where the field name is different
            try:
                # Try linking through UserProfile if Order links there
                orders = Order.objects.filter(
                    user_profile=user_profile
                ).order_by('-created_at')  # Use the fetched user_profile
            except (AttributeError, FieldError):
                messages.error(
                    request,
                    "Could not retrieve order history. Order model linkage "
                    "mismatch."
                )
                orders = []  # Ensure orders is an empty list on error
        except Exception as e:
            # Catch other potential errors during query
            messages.error(
                request,
                f"An error occurred retrieving order history: {e}"
            )
            orders = []

    else:
        messages.warning(request, "Order history feature is not available.")

    context = {
        'orders': orders,
        'active_tab': 'orders'
    }
    return render(
        request, 'users/order_history.html', context
    )  # Ensure template path is correct


@login_required
def order_detail(request, order_number):
    """ Display details for a specific order """
    order = None
    user_profile, _ = UserProfile.objects.get_or_create(
        user=request.user  # Ensure profile exists
    )

    if Order:
        try:
            # Fetch the specific order
            order = get_object_or_404(Order, order_number=order_number)
            # Security check: Ensure the order belongs to the current user
            # Adjust the check based on how Order links to User/UserProfile
            if hasattr(order, 'user') and order.user == request.user:
                pass  # Order linked directly to user and matches
            elif hasattr(order, 'user_profile') and (
                order.user_profile == user_profile
            ):
                pass  # Order linked to user_profile and matches
            else:
                # If neither matches, deny access
                raise Http404("Order not found or access denied.")

        except Order.DoesNotExist:
            messages.error(request, "Order not found.")
            return redirect('users:order_history')
        except Http404:  # Catch the explicit Http404 raised above
            messages.error(request, "Order not found or access denied.")
            return redirect('users:order_history')
        except Exception as e:
            messages.error(
                request,
                f"An error occurred retrieving the order: {e}"
            )
            return redirect('users:order_history')
    else:
        messages.warning(request, "Order detail feature is not available.")
        return redirect('users:order_history')

    context = {
        'order': order,
        'active_tab': 'orders'
    }
    return render(
        request, 'users/order_detail.html', context
    )  # Ensure template path is correct


def users_contact(request):
    """Render the contact form for users."""
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            # Process the form data (e.g., send an email to support)
            messages.success(request, "Message sent successfully.")
            return redirect('users:users_contact')
    else:
        form = ContactForm()

    return render(request, 'users/contact.html', {'form': form})
