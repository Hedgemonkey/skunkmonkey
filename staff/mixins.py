"""
Mixins for staff functionality
"""
import logging

from django.contrib import messages
from django.contrib.auth.mixins import UserPassesTestMixin
from django.shortcuts import redirect
from django.urls import reverse_lazy

# Set up logger
logger = logging.getLogger(__name__)


class StaffAccessMixin(UserPassesTestMixin):
    """
    Verifies that the current user is authenticated and is staff
    """
    login_url = reverse_lazy('account_login')
    permission_denied_message = (
        "You do not have permission to access this page."
    )

    def test_func(self):
        """Check if user is staff"""
        if self.request.user.is_authenticated and self.request.user.is_staff:
            logger.debug(
                "Staff access granted to %s", self.request.user.username
            )
            return True
        if self.request.user.is_authenticated:
            logger.warning(
                "Non-staff user %s attempted to access staff area",
                self.request.user.username
            )
        else:
            logger.info("Unauthenticated user attempted to access staff area")
        return False

    def handle_no_permission(self):
        """Handle unauthorized access attempts"""
        if self.request.user.is_authenticated:
            messages.error(self.request, self.permission_denied_message)
            # If user is logged in but not staff, show 403
            return super().handle_no_permission()
        else:
            # If not logged in, redirect to login page
            return redirect(self.login_url)


class ManagerAccessMixin(StaffAccessMixin):
    """
    Verifies that the current user is a manager or admin
    """
    permission_denied_message = (
        "You need manager permissions to access this page."
    )

    def test_func(self):
        """Check if user is staff and a manager/admin"""
        is_staff = super().test_func()
        if not is_staff:
            return False

        # Check if user is superuser or has a staff profile with manager role
        is_manager = self.request.user.is_superuser
        if hasattr(self.request.user, 'staff_profile'):
            is_manager = is_manager or (
                self.request.user.staff_profile.is_manager
            )

        if not is_manager:
            logger.warning(
                "Non-manager staff %s attempted to access manager area",
                self.request.user.username
            )

        return is_manager


class DepartmentAccessMixin(StaffAccessMixin):
    """
    Checks that staff member has access to the specific department
    """
    department = None
    permission_denied_message = "You do not have access to this department."

    def test_func(self):
        """Check if user is staff with appropriate department access"""
        is_staff = super().test_func()
        if not is_staff:
            return False

        # Superusers and managers have access to all departments
        if (
            self.request.user.is_superuser
            or (
                hasattr(self.request.user, 'staff_profile')
                and self.request.user.staff_profile.is_manager
            )
        ):
            return True

        # Other staff are restricted by department
        if not hasattr(self.request.user, 'staff_profile'):
            logger.error(
                "Staff user %s has no staff profile",
                self.request.user.username
            )
            return False

        # If no department specified for the view, allow access
        if not self.department:
            return True

        # Check user's department
        user_dept = self.request.user.staff_profile.department
        has_access = user_dept == self.department

        if not has_access:
            logger.warning(
                "Staff %s from %s dept attempted to access %s dept",
                self.request.user.username, user_dept, self.department
            )

        return has_access
