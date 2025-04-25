"""
Custom mixins for use in views.
"""
from django.contrib.auth.mixins import UserPassesTestMixin
from django.contrib.auth.views import redirect_to_login
from django.shortcuts import render
from django.urls import reverse_lazy


class StaffMemberRequiredMixin(UserPassesTestMixin):
    """
    Mixin that requires a user to be a staff member to access the view.

    Similar to Django's built-in LoginRequiredMixin, but checks for is_staff.
    If the user is not authenticated, they are redirected to the login page.
    If they are authenticated but not staff, they are shown a
    permission denied page.
    """
    permission_denied_message = "Staff access required."
    login_url = reverse_lazy('account_login')
    permission_denied_template = '403.html'

    def test_func(self):
        """Check if the user is authenticated and is_staff is True."""
        return (
            self.request.user.is_authenticated
            and self.request.user.is_staff
        )

    def handle_no_permission(self):
        """
        Override to handle both unauthenticated users and non-staff users.

        - Unauthenticated users are redirected to the login page
        - Authenticated but non-staff users are shown a permission denied page
        """
        if not self.request.user.is_authenticated:
            return redirect_to_login(
                self.request.get_full_path(),
                self.get_login_url(),
                self.get_redirect_field_name()
            )
        else:
            # User is authenticated but not staff
            return render(
                self.request,
                self.permission_denied_template,
                {'message': self.permission_denied_message},
                status=403
            )
