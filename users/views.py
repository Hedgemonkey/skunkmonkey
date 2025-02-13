# users/views.py

from allauth.account.views import LoginView
from allauth.account.models import EmailAddress
from allauth.socialaccount.models import SocialAccount
from allauth.account.utils import send_email_confirmation
from allauth.account import app_settings as account_settings
from allauth.account.forms import ChangePasswordForm
from allauth.socialaccount.forms import DisconnectForm
from .forms import ContactForm, ConfirmAddEmailForm
from django.shortcuts import render, redirect, reverse
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.urls import reverse_lazy



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
    success_url = reverse_lazy('home')  # Or your desired post-login URL

    def form_valid(self, form):
        user = form.user

        if user and not user.emailaddress_set.filter(verified=True, primary=True).exists():
            messages.info(self.request, "Please verify your email address to log in.")  # User message
            return redirect(reverse('account_email_verification_required') + f'?email={user.email}')  # Redirect

        self.request.session.flush()  # Clear any stale session data
        return super().form_valid(form)  # Continue the login process


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
    form = ConfirmAddEmailForm()
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
            
            form = ConfirmAddEmailForm(request, request.POST) # Create form with request and initial data
            if form.is_valid():
                email_address = form.save(request) # Save the email address

                if account_settings.EMAIL_VERIFICATION == account_settings.EmailVerificationMethod.MANDATORY:
                    # send_email_confirmation(request, request.user, signup=False)
                    messages.info(request, f"Confirmation email sent to {email_address}. Please verify.")

                else:
                    messages.success(request, f"{email_address} added.")

                form = ConfirmAddEmailForm(request) # Create a new blank form
            else:
                messages.error(request, "Error adding email address")


    else:  # GET request (initial load)
        form = ConfirmAddEmailForm(request)


    email_addresses = EmailAddress.objects.filter(user=request.user) # Get email addresses *after* form processing
    return render(request, 'users/email.html', {'form': form, 'title': "Manage Email Addresses", 'email_addresses': email_addresses})  # Pass email_addresses to template

@login_required
def manage_password(request):
    if request.method == "POST":
        form = ChangePasswordForm(data=request.POST, user=request.user) # Changed to correct form
        if form.is_valid():
            form.save()
            messages.success(request, "Password changed successfully.")
            return redirect(reverse_lazy('users_manage'))

    else:
        form = ChangePasswordForm(user=request.user) # Changed to correct form


    return render(request, 'users/password_change.html', {'form': form, 'title': "Change Password"})



@login_required
def manage_social(request):
    if request.method == "POST":
        form = DisconnectForm(request.POST, user=request.user) # changed to correct form

        if form.is_valid():

            messages.success(request, "Successfully disconnected")
            data = form.cleaned_data
            account_id = data.get("account")

            if account_id:
                account = SocialAccount.objects.get(id=account_id)
                account.delete()
            return redirect("users_social") # Reload page

    else:
        form = DisconnectForm(user=request.user)


    return render(request, 'users/social.html', {'form': form, 'title': "Manage Social Connections"})  # Correct template
