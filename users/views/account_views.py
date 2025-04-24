"""
Account-related views for the users app.
Handles login, account management, and account settings.
"""
from django.contrib import messages
from django.contrib.auth import (
    REDIRECT_FIELD_NAME, get_user_model, login as auth_login, logout,
)
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LoginView
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.urls import reverse, reverse_lazy
from django.views.decorators.http import require_http_methods

from allauth.account.models import EmailAddress
from allauth.account.utils import send_email_confirmation

from ..forms import (
    CustomAddEmailForm, CustomChangePasswordForm, CustomLoginForm, UserForm,
)

User = get_user_model()


class CustomLoginView(LoginView):
    """Enhanced login view with remember-me functionality."""
    success_url = reverse_lazy('home')
    form_class = CustomLoginForm
    template_name = 'allauth/account/login.html'

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['request'] = self.request  # Pass the request to the form
        return kwargs

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


# Class-based view exposed as a function
login = CustomLoginView.as_view()


@login_required
def manage_account(request):
    """Display the main account management page."""
    return render(request, 'users/manage.html')


@login_required
def email_verification_required(request):
    """Handle verification requirements and resend verification emails."""
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
    """Display user account details."""
    user = request.user

    # Load user's email addresses
    email_addresses = EmailAddress.objects.filter(user=user)

    return render(
        request, "users/details.html", {
            'email_addresses': email_addresses,
            'active_tab': 'email',
        }
    )


@login_required
def manage_email(request):
    """Manage user email addresses."""
    email_addresses = EmailAddress.objects.filter(user=request.user)

    # Pass the request object as a named parameter instead of positional
    form = CustomAddEmailForm(request=request, data=request.POST or None)

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
        'active_tab': 'email',
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
    """Manage social account connections."""
    return render(request, 'users/social.html', {
        'title': "Manage Social Connections",
        'active_tab': 'social'
    })


@login_required
def manage_details_update(request):
    """Update user account details."""
    form = UserForm(
        instance=request.user
    )
    if request.method == 'POST':
        form = UserForm(
            request.POST, instance=request.user
        )
        if form.is_valid():
            form.save()
            messages.success(
                request,
                'Your profile details have been updated successfully.'
            )
            return redirect('users:manage_details')
        elif request.headers.get('x-requested-with') == 'XMLHttpRequest':
            errors = form.errors.as_json()
            return JsonResponse(
                {'errors': errors, 'form': form.as_p()}, status=400
            )
    return render(
        request, 'users/user_form.html', {'form': form}
    )


@login_required
@require_http_methods(["POST"])
def deactivate_account(request):
    """Deactivate a user account (sets is_active=False)."""
    request.user.is_active = False
    request.user.save()
    messages.success(request, "Your account has been deactivated.")

    logout(request)

    return JsonResponse({
        'success': True,
        'redirect_url': reverse('account_inactive_message')
    })


@login_required
@require_http_methods(["DELETE"])
def delete_account(request):
    """Permanently delete a user account."""
    username = request.user.username
    request.user.delete()
    logout(request)

    messages.success(
        request,
        f"Account '{username}' has been permanently deleted."
    )

    return JsonResponse({
        'messages': [
            {"message": m.message, "tags": m.tags}
            for m in messages.get_messages(request)
        ],
        'deleted': True
    })


def deleted_account(request):
    """Display confirmation page after account deletion."""
    return render(request, 'users/account_deleted.html')


def account_inactive_message(request):
    """Display message for inactive accounts."""
    messages.info(
        request,
        'Your account is currently inactive. Please login or reactivate your '
        'account.'
    )
    return render(request, 'allauth/account/account_inactive.html')
