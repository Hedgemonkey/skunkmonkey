# users/views.py

from allauth.account.views import LoginView
from allauth.account.models import EmailAddress
from allauth.socialaccount.models import SocialAccount
from allauth.account.utils import send_email_confirmation
from allauth.account import app_settings as account_settings
from allauth.socialaccount.forms import DisconnectForm
from .forms import ContactForm, CustomAddEmailForm, CustomChangePasswordForm, UserForm, CustomLoginForm
from django.shortcuts import render, redirect, reverse
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout, REDIRECT_FIELD_NAME
from django.contrib import messages
from django.urls import reverse_lazy
from django.http import JsonResponse



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
    form = CustomAddEmailForm()
    if request.method == "POST":
        if 'resend' in request.POST:  # Resend verification
            email_to_verify = request.POST.get('resend_email')
            try:
                email_address = EmailAddress.objects.get(user=request.user, email__iexact=email_to_verify)
                if email_address.verified:
                    messages.info(request, "Email is already verified")
                else:
                    send_email_confirmation(request, email_address, signup=False) # Resend verification email. email_address.verified = False done automatically.
                    messages.success(request, f"Verification email resent to {email_to_verify}")
            except EmailAddress.DoesNotExist:
                messages.error(request, "Email address not found")

        
        elif 'make_primary' in request.POST:
            email_to_primary = request.POST.get('email') # get the address
            try:
                email_address = EmailAddress.objects.get(user=request.user, email__iexact=email_to_primary) # add user to the query
                if email_address.verified == True: # check email is verified
                    email_address.set_as_primary() # Set as primary
                    messages.success(request, f"{email_to_primary} set as your primary email address.")
                else:
                    messages.warning(request, f"Please verify {email_to_primary} before attempting to set as your primary email address.")
            except EmailAddress.DoesNotExist:
                messages.error(request, "Email address not found")


        elif 'remove' in request.POST:
            # ... (remove logic)
            pass

        elif 'email' in request.POST: # Add email form submission
            if not request.user.is_authenticated: #check if user is authenticated
                return redirect('account_login')
            
            form = CustomAddEmailForm(request, request.POST) # Create form with request and initial data
            if form.is_valid():
                email_address = form.save(request) # Save the email address

                if account_settings.EMAIL_VERIFICATION == account_settings.EmailVerificationMethod.MANDATORY:
                    # send_email_confirmation(request, request.user, signup=False)
                    messages.info(request, f"Confirmation email sent to {email_address}. Please verify.")

                else:
                    messages.success(request, f"{email_address} added.")

                form = CustomAddEmailForm(request) # Create a new blank form
            else:
                messages.error(request, "Error adding email address")


    else:  # GET request (initial load)
        form = CustomAddEmailForm(request)


    email_addresses = EmailAddress.objects.filter(user=request.user) # Get email addresses *after* form processing
    return render(request, 'users/email.html', {'form': form, 'title': "Manage Email Addresses", 'email_addresses': email_addresses})  # Pass email_addresses to template

@login_required
def manage_password(request):
    if request.method == "POST":
        form = CustomChangePasswordForm(data=request.POST, user=request.user) # Changed to correct form
        if form.is_valid():
            form.save()
            messages.success(request, "Your password has been changed successfully.") # Send success message for regular POST
            return render(request, 'users/password_change_done.html') # Redirect after success


    else:
        form = CustomChangePasswordForm(request)  # Correct: request and user

    return render(request, 'users/password_change.html', {'form': form, 'title': "Change Password"})



@login_required
def manage_social(request):
    return render(request, 'users/social.html', {'title': "Manage Social Connections"})  # Correct template


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
