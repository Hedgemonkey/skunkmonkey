# users/views.py

from allauth.account.views import LoginView
from allauth.account.models import EmailAddress
from allauth.socialaccount.models import SocialAccount
from allauth.utils import get_form_class
from allauth.account.utils import send_email_confirmation
from allauth.account import app_settings as account_settings
from allauth.account.forms import AddEmailForm, ChangePasswordForm
from allauth.socialaccount.forms import DisconnectForm
from .forms import ContactForm
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

@login_required
def manage_email(request):
    """Email management view"""
    if request.method == "POST":
        form = AddEmailForm(request.POST, user=request.user)  # Use form directly
        if form.is_valid():
            # Check if email verification is necessary
            verification_required = account_settings.EMAIL_VERIFICATION == account_settings.EmailVerificationMethod.MANDATORY

            email_address = form.save(request) # Save the new email address
            if verification_required: # Check if verification is required
                send_email_confirmation(request, email_address, signup=False)
                return redirect("account_email_verification_sent")
                # redirect("account_email") # Original

            return redirect("account_email")


    else:

        form = AddEmailForm(user=request.user)  # Use form directly


    return render(request, 'users/email.html', {'form': form, 'title': "Manage Email Addresses"})

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
