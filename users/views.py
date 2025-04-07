# users/views.py

from allauth.account.views import LoginView
from allauth.account.models import EmailAddress
from allauth.socialaccount.models import SocialAccount
from allauth.account.utils import send_email_confirmation
from allauth.account import app_settings as account_settings
from allauth.socialaccount.forms import DisconnectForm
# Updated form imports
from .forms import (
    ContactForm, CustomAddEmailForm, CustomChangePasswordForm,
    UserForm, CustomLoginForm, AddressForm
)
from .models import UserProfile, Address # Import Address
from django.shortcuts import render, redirect, reverse, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout, REDIRECT_FIELD_NAME, get_user_model
from django.contrib import messages
from django.urls import reverse_lazy
from django.http import JsonResponse, HttpResponseForbidden, HttpResponseRedirect, Http404
from django.views.decorators.http import require_POST # For delete/set_default

# Import Order model from shop app (adjust import path as necessary)
try:
    from shop.models import Order
except ImportError:
    Order = None # Handle case where shop app or Order model doesn't exist yet


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
            # ... send email logic using email and message
            return redirect(reverse('users_contact')+'?ok') # redirect to contact page on success
    else:
        form = ContactForm()
    return render(request, 'users/contact.html', {'form': form})


class CustomLoginView(LoginView):
    success_url = reverse_lazy('home')
    form_class = CustomLoginForm

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['request'] = self.request  # Pass the request to the form
        return kwargs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context

    def form_valid(self, form):
        # Set 'remember' session key based on checkbox value BEFORE super().form_valid(form)
        if form.cleaned_data.get('remember'):
            self.request.session.set_expiry(60 * 60 * 24 * 7 * 1) # 1 week
        else:
            self.request.session.set_expiry(0) # Expire on browser close

        # Perform email verification checks *after* setting session expiry

        response = super().form_valid(form)


        user = self.request.user  # Access user from the request
        if user: #checks if a user object exists
            if not user.is_active: #checks for active status, inactive is False
                logout(self.request) #logout
                messages.info(self.request, "Your account is inactive. Please contact support or check your email for reactivation instructions.")
                next_url = self.request.GET.get(REDIRECT_FIELD_NAME, self.get_success_url()) #get next url, if exists
                return redirect(reverse('account_inactive') + f'?{REDIRECT_FIELD_NAME}=' + next_url) #redirect with next parameter
            
            elif not user.emailaddress_set.filter(verified=True, primary=True).exists():
                messages.info(self.request, "Please verify your email address to log in.")
                # Modify the message so that the url can be retrieved from the message variable if you wish to pass the email address to the page.
                return redirect(reverse('account_email_verification_required'))

        return response


login = CustomLoginView.as_view()

def email_verification_required(request):
    email = request.GET.get('email') or request.POST.get('email')
    print(email)

    if request.method == 'POST' and 'resend' in request.POST:  # Check for POST and 'resend'
        print('POST and resend')
        print('Email: ', email)
        try:
            email_address = EmailAddress.objects.get(email__iexact=email)  # Case-insensitive lookup
            print(email_address)
            if email_address.verified:
                print('verified')
                messages.info(request, "Your email is already verified. Please log in.")
                return redirect('account_login')

            user = email_address.user # Get user from email address
            print(user)
            send_email_confirmation(request, user, signup=False) # Send confirmation email
            messages.success(request, "Verification email resent.")
            return render(request, 'allauth/account/verification_sent.html') # Render success message

        except EmailAddress.DoesNotExist:
            print('DoesNotExist')
            messages.error(request, "No user exists for that email address. Please register or contact support")
            return redirect('account_signup')

    return render(request, 'allauth/account/verified_email_required.html', {'email': email})


@login_required
def manage_details(request):
    user = request.user

    # Example: Load user's email addresses
    email_addresses = EmailAddress.objects.filter(user=user)


    return render(request, "users/details.html", {'email_addresses': email_addresses})  # New template

def manage_email(request):
    """Email management view"""
    form = CustomAddEmailForm(request)
    if request.method == "POST":
        if 'resend' in request.POST:  # Resend verification
            email_to_verify = request.POST.get('resend_email')
            try:
                email_address = EmailAddress.objects.get(user=request.user, email__iexact=email_to_verify)
                if email_address.verified:
                    messages.info(request, "Email is already verified")
                else:
                    send_email_confirmation(request, request.user, signup=False, email=email_address.email) # Resend verification email
                    messages.success(request, f"Verification email resent to {email_to_verify}")
            except EmailAddress.DoesNotExist:
                messages.error(request, "Email address not found")

        
        elif 'make_primary' in request.POST:
            email_to_primary = request.POST.get('email') # get the address
            try:
                email_address = EmailAddress.objects.get(user=request.user, email__iexact=email_to_primary) # add user to the query
                if email_address.verified: # check email is verified (removed == True for cleaner code)
                    email_address.set_as_primary() # Set as primary
                    messages.success(request, f"{email_to_primary} set as your primary email address.")
                else:
                    messages.warning(request, f"Please verify {email_to_primary} before attempting to set as your primary email address.")
            except EmailAddress.DoesNotExist:
                messages.error(request, "Email address not found")


        elif 'remove' in request.POST:
            email_to_remove = request.POST.get('email')
            try:
                email_address = EmailAddress.objects.get(user=request.user, email__iexact=email_to_remove)
                
                # Don't allow removing the primary email
                if email_address.primary:
                    messages.error(request, "You cannot remove your primary email address. Set another email as primary first.")
                else:
                    email_address.delete()
                    messages.success(request, f"{email_to_remove} has been removed.")
            except EmailAddress.DoesNotExist:
                messages.error(request, "Email address not found")

        else:  # Add email form submission - simplified condition
            if not request.user.is_authenticated:
                return redirect('account_login')
            
            form = CustomAddEmailForm(request, request.POST) # Create form with request and POST data
            if form.is_valid():
                try:
                    email_address = form.save(request) # Save the email address
                    
                    if account_settings.EMAIL_VERIFICATION == account_settings.EmailVerificationMethod.MANDATORY:
                        messages.info(request, f"Confirmation email sent to {form.cleaned_data['email']}. Please verify.")
                    else:
                        messages.success(request, f"{form.cleaned_data['email']} added.")
                    
                    # Create a new blank form
                    form = CustomAddEmailForm(request)
                except Exception as e:
                    messages.error(request, f"Error adding email address: {str(e)}")
            else:
                # Form validation errors will be displayed on the form itself
                messages.error(request, "Please correct the errors below.")


    # Get email addresses *after* form processing to ensure the data is fresh
    email_addresses = EmailAddress.objects.filter(user=request.user)
    
    return render(request, 'users/email.html', {
        'form': form, 
        'title': "Manage Email Addresses", 
        'email_addresses': email_addresses,
        'active_tab': 'email'  # Add active_tab for navigation highlighting
    })

@login_required
def manage_password(request):
    if request.method == "POST":
        form = CustomChangePasswordForm(data=request.POST, user=request.user) # Changed to correct form
        if form.is_valid():
            form.save()
            messages.success(request, "Your password has been changed successfully.") # Send success message for regular POST
            return render(request, 'users/password_change_done.html', {'active_tab': 'password'}) # Add active_tab for navigation highlighting

    else:
        form = CustomChangePasswordForm(request)  # Correct: request and user

    return render(request, 'users/password_change.html', {
        'form': form, 
        'title': "Change Password",
        'active_tab': 'password'  # Add active_tab for navigation highlighting
    })


@login_required
def manage_social(request):
    return render(request, 'users/social.html', {
        'title': "Manage Social Connections",
        'active_tab': 'social'  # Add active_tab for navigation highlighting
    })


@login_required
def manage_details_update(request):  # View to render the form
    form = UserForm(instance=request.user) #Instantiate with current user data
    if request.method == 'POST': # Check if the form has been submitted
        print(request.POST)
        form = UserForm(request.POST, instance=request.user) #Get data from POST
        if form.is_valid(): # Validate form
            print('Valid')
            form.save() # Save form
            messages.success(request, 'Your profile details have been updated successfully.')
            return redirect('manage_details') # Redirect to view details page
        elif request.headers.get('x-requested-with') == 'XMLHttpRequest':
            print('Ajax')
            errors = form.errors.as_json()
            return JsonResponse({'errors': errors, 'form': form.as_p()}, status=400)    
    return render(request, 'users/user_form.html', {'form': form})  # Render the form template


@login_required
def deactivate_account(request):
    if request.method == 'POST':
        request.user.is_active = False
        request.user.save()
        messages.success(request, "Your account has been deactivated.")

        logout(request) # Automatically log the user out after deactivation.


        return JsonResponse({'success': True, 'redirect_url': reverse('account_inactive_message')})
    return JsonResponse({'success': False, 'error': 'Invalid request.'})


@login_required
def delete_account(request):
    if request.method == 'DELETE': 
        request.user.delete()

        username = request.user.username #Get username before logging out
        logout(request)
        messages.success(request, f"Account '{username}' has been permanently deleted.")

        return JsonResponse({'messages': [{"message": m.message, "tags": m.tags}for m in messages.get_messages(request)], 'deleted': True})  # Indicates successful deletion

    return JsonResponse({'error': 'Invalid request'}, status=400)


def deleted_account(request):
    return render(request, 'users/account_deleted.html')


def account_inactive_message(request):
    messages.info(request, 'Your account is currently inactive. Please login or reactivate your account.')  # Or a custom message
    return render(request, 'allauth/account/account_inactive.html')


# --- New Profile Views ---

@login_required
def profile_dashboard(request):
    """ Display the main user profile dashboard. Creates profile if missing. """
    # Use get_or_create to handle users who might not have a profile yet
    user_profile, created = UserProfile.objects.get_or_create(user=request.user)

    if created:
        # Optional: Log or message if a profile was just created
        print(f"Created UserProfile for {request.user.username}")
        messages.info(request, "Your profile has been initialized.")

    context = {
        'profile': user_profile,
        'active_tab': 'dashboard' # For highlighting navigation
    }
    return render(request, 'users/profile_dashboard.html', context) # Ensure template path is correct


# --- Address Management Views ---

@login_required
def manage_addresses(request):
    """ Display and manage user's saved addresses """
    addresses = Address.objects.filter(user=request.user)
    # Also use get_or_create here for robustness, though dashboard might create it first
    user_profile, _ = UserProfile.objects.get_or_create(user=request.user)
    context = {
        'addresses': addresses,
        'default_address_id': user_profile.default_delivery_address.id if user_profile.default_delivery_address else None,
        'active_tab': 'addresses'
    }
    return render(request, 'users/address_list.html', context) # Ensure template path is correct

@login_required
def add_address(request):
    """ Handle adding a new address """
    user_profile, _ = UserProfile.objects.get_or_create(user=request.user) # Ensure profile exists

    if request.method == 'POST':
        form = AddressForm(request.POST)
        if form.is_valid():
            address = form.save(commit=False)
            address.user = request.user
            address.save()

            # Optionally set as default if it's the first address
            if not user_profile.default_delivery_address:
                 user_profile.default_delivery_address = address
                 user_profile.save()
                 messages.success(request, 'Address added and set as default.')
            else:
                messages.success(request, 'Address added successfully.')

            return redirect('users:manage_addresses') # Redirect to the address list
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = AddressForm()

    context = {
        'form': form,
        'form_title': 'Add New Address',
        'active_tab': 'addresses'
    }
    return render(request, 'users/address_form.html', context) # Ensure template path is correct

@login_required
def edit_address(request, address_id):
    """ Handle editing an existing address """
    address = get_object_or_404(Address, id=address_id, user=request.user) # Ensure user owns address

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
        'address': address, # Pass address for context if needed
        'active_tab': 'addresses'
    }
    return render(request, 'users/address_form.html', context) # Ensure template path is correct

@login_required
@require_POST # Ensure this view only accepts POST requests for safety
def delete_address(request, address_id):
    """ Delete an address """
    address = get_object_or_404(Address, id=address_id, user=request.user)
    user_profile, _ = UserProfile.objects.get_or_create(user=request.user) # Ensure profile exists

    # Check if it's the default address
    if user_profile.default_delivery_address == address:
         user_profile.default_delivery_address = None
         user_profile.save()
         # Optionally find and set another address as default if one exists
         # next_default = Address.objects.filter(user=request.user).exclude(id=address_id).first()
         # if next_default:
         #    request.user.userprofile.default_delivery_address = next_default
         #    request.user.userprofile.save()

    address_info = address.get_short_address() # Get info before deleting
    address.delete()

    # Use JSON response for AJAX calls, otherwise use messages + redirect
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
         return JsonResponse({'success': True, 'message': f'Address "{address_info}" deleted.'})
    else:
        messages.success(request, f'Address "{address_info}" deleted.')
        return redirect('users:manage_addresses')


@login_required
@require_POST # Ensure this view only accepts POST requests
def set_default_address(request, address_id):
    """ Set an address as the default delivery address """
    address = get_object_or_404(Address, id=address_id, user=request.user)
    user_profile, _ = UserProfile.objects.get_or_create(user=request.user) # Ensure profile exists
    user_profile.default_delivery_address = address
    user_profile.save()

    address_info = address.get_short_address()
    # Use JSON response for AJAX calls, otherwise use messages + redirect
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return JsonResponse({'success': True, 'message': f'Address "{address_info}" set as default.'})
    else:
        messages.success(request, f'Address "{address_info}" set as default.')
        return redirect('users:manage_addresses')


# --- Order History Views ---

@login_required
def order_history(request):
    """ Display the user's order history """
    orders = []
    user_profile, _ = UserProfile.objects.get_or_create(user=request.user) # Ensure profile exists

    if Order: # Check if Order model was imported successfully
        try:
            # Adjust the query based on your actual Order model structure
            orders = Order.objects.filter(user=request.user).order_by('-created_at') # Primary attempt
        except FieldError: # Handle cases where the field name is different
             try:
                 # Try linking through UserProfile if Order links there
                 orders = Order.objects.filter(user_profile=user_profile).order_by('-created_at') # Use the fetched user_profile
             except (AttributeError, FieldError):
                  messages.error(request, "Could not retrieve order history. Order model linkage mismatch.")
                  orders = [] # Ensure orders is an empty list on error
        except Exception as e:
             # Catch other potential errors during query
             messages.error(request, f"An error occurred retrieving order history: {e}")
             orders = []


    else:
        messages.warning(request, "Order history feature is not available.")

    context = {
        'orders': orders,
        'active_tab': 'orders'
    }
    return render(request, 'users/order_history.html', context) # Ensure template path is correct

@login_required
def order_detail(request, order_number):
    """ Display details for a specific order """
    order = None
    user_profile, _ = UserProfile.objects.get_or_create(user=request.user) # Ensure profile exists

    if Order:
        try:
            # Fetch the specific order
             order = get_object_or_404(Order, order_number=order_number)
             # Security check: Ensure the order belongs to the current user
             # Adjust the check based on how Order links to User/UserProfile
             if hasattr(order, 'user') and order.user == request.user:
                 pass # Order linked directly to user and matches
             elif hasattr(order, 'user_profile') and order.user_profile == user_profile:
                 pass # Order linked to user_profile and matches
             else:
                 # If neither matches, deny access
                 raise Http404("Order not found or access denied.")

        except Order.DoesNotExist:
             messages.error(request, "Order not found.")
             return redirect('users:order_history')
        except Http404: # Catch the explicit Http404 raised above
             messages.error(request, "Order not found or access denied.")
             return redirect('users:order_history')
        except Exception as e:
             messages.error(request, f"An error occurred retrieving the order: {e}")
             return redirect('users:order_history')
    else:
        messages.warning(request, "Order detail feature is not available.")
        return redirect('users:order_history')

    context = {
        'order': order,
        'active_tab': 'orders'
    }
    return render(request, 'users/order_detail.html', context) # Ensure template path is correct
