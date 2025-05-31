"""
Mixins for staff functionality
"""
import logging
import traceback

from django.conf import settings
from django.contrib import messages
from django.contrib.auth.decorators import user_passes_test
from django.contrib.auth.mixins import UserPassesTestMixin
from django.http import HttpResponse
from django.shortcuts import redirect
from django.urls import reverse_lazy
from django.utils.html import format_html

# Set up logger
logger = logging.getLogger(__name__)


# Decorator for function-based views to check if user is staff
def staff_required(view_func):
    """
    Decorator for views that checks that the user is a staff member.
    """
    def check_staff(user):
        if user.is_authenticated and user.is_staff:
            logger.debug("Staff access granted to %s", user.username)
            return True
        if user.is_authenticated:
            logger.warning(
                "Non-staff user %s attempted to access staff area",
                user.username
            )
        else:
            logger.info("Unauthenticated user attempted to access staff area")
        return False

    decorated_view_func = user_passes_test(
        check_staff,
        login_url=reverse_lazy('account_login')
    )(view_func)
    return decorated_view_func


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
        try:
            # Check if the request has a user attribute (it should)
            if not hasattr(self.request, 'user'):
                logger.error("Request object has no 'user' attribute")
                return False

            # Check authentication
            if not self.request.user.is_authenticated:
                logger.info(
                    "Unauthenticated user attempted to access staff area"
                )
                return False

            # Check staff status
            if not self.request.user.is_staff:
                logger.warning(
                    "Non-staff user %s attempted to access staff area",
                    self.request.user.username
                )
                return False

            # Check if user is active
            if not self.request.user.is_active:
                logger.warning(
                    "Inactive staff user %s attempted to access staff area",
                    self.request.user.username
                )
                return False

            # Log staff access granted
            logger.debug(
                "Staff access granted to %s", self.request.user.username
            )

            # Verify that the user has a staff_profile
            # This can be a common issue on DirectAdmin deployments
            if not hasattr(self.request.user, 'staff_profile') and \
                    not hasattr(self.request.user, 'staffprofile'):
                logger.error(
                    "Staff user %s has no staff_profile - this could "
                    "cause issues",
                    self.request.user.username
                )
                # We'll still allow access, but log the warning for debugging

            return True

        except Exception as e:
            # Catch any exceptions in the permission check and log them
            logger.error(
                "Exception in staff permission check for user %s: %s\n%s",
                getattr(self.request, 'user', 'Unknown'),
                str(e),
                traceback.format_exc()
            )

            # In debug mode, raise for detailed error page
            # In production, fail closed (deny access) if there's an exception
            if settings.DEBUG:
                raise
            return False

    def handle_no_permission(self):
        """Handle unauthorized access attempts"""
        try:
            if self.request.user.is_authenticated:
                # Add visually distinctive error message
                messages.error(
                    self.request,
                    format_html(
                        '<strong>Staff Access Error:</strong> {}',
                        self.permission_denied_message
                    )
                )
                # If user is logged in but not staff, show 403
                return super().handle_no_permission()
            else:
                # If not logged in, redirect to login page
                return redirect(self.login_url)
        except Exception as e:
            # Log any exceptions that occur during permission handling
            logger.error(
                "Exception in handle_no_permission for user %s: %s\n%s",
                getattr(self.request, 'user', 'Unknown'),
                str(e),
                traceback.format_exc()
            )
            # Simple fallback response if everything else fails
            if settings.DEBUG:
                return HttpResponse(
                    f"Critical error in permission handling: {str(e)}",
                    status=500
                )
            # In production, redirect to home page
            return redirect('home')


class ManagerAccessMixin(StaffAccessMixin):
    """
    Verifies that the current user is a manager or admin
    """
    permission_denied_message = (
        "You need manager permissions to access this page."
    )

    def test_func(self):
        """Check if user is staff and a manager/admin"""
        try:
            # First check basic staff access
            is_staff = super().test_func()
            if not is_staff:
                return False

            # Check if user is superuser (always has manager access)
            if self.request.user.is_superuser:
                logger.debug(
                    "Superuser %s granted manager access",
                    self.request.user.username
                )
                return True

            # Check for staff profile with manager role
            has_manager_role = False

            # Check both attribute names due to middleware handling
            if hasattr(self.request.user, 'staff_profile'):
                has_manager_role = self.request.user.staff_profile.is_manager
            elif hasattr(self.request.user, 'staffprofile'):
                has_manager_role = self.request.user.staffprofile.is_manager

            if not has_manager_role:
                logger.warning(
                    "Non-manager staff %s attempted to access manager area",
                    self.request.user.username
                )

            return has_manager_role

        except Exception as e:
            # Log any exceptions in the manager permission check
            logger.error(
                "Exception in manager permission check for user %s: %s\n%s",
                getattr(self.request, 'user', 'Unknown'),
                str(e),
                traceback.format_exc()
            )
            # In debug mode, raise for detailed error page
            # In production, fail closed (deny access) if there's an exception
            if settings.DEBUG:
                raise
            return False


class DepartmentAccessMixin(StaffAccessMixin):
    """
    Checks that staff member has access to the specific department
    """
    department = None
    permission_denied_message = "You do not have access to this department."

    def test_func(self):
        """Check if user is staff with appropriate department access"""
        try:
            # First check basic staff access
            is_staff = super().test_func()
            if not is_staff:
                return False

            # Superusers have access to all departments
            if self.request.user.is_superuser:
                logger.debug(
                    "Superuser %s granted access to department %s",
                    self.request.user.username,
                    self.department
                )
                return True

            # Check if user has a staff profile
            has_profile = False
            user_dept = None
            is_manager = False

            # Check both attribute names due to middleware handling
            if hasattr(self.request.user, 'staff_profile'):
                has_profile = True
                profile = self.request.user.staff_profile
                user_dept = profile.department
                is_manager = profile.is_manager
            elif hasattr(self.request.user, 'staffprofile'):
                has_profile = True
                profile = self.request.user.staffprofile
                user_dept = profile.department
                is_manager = profile.is_manager

            if not has_profile:
                logger.error(
                    "Staff user %s has no staff profile",
                    self.request.user.username
                )
                return False

            # Managers have access to all departments
            if is_manager:
                logger.debug(
                    "Manager %s granted access to department %s",
                    self.request.user.username,
                    self.department
                )
                return True

            # If no department specified for the view, allow access
            if not self.department:
                return True

            # Check user's department
            has_access = user_dept == self.department

            if not has_access:
                logger.warning(
                    "Staff %s from %s dept attempted to access %s dept",
                    self.request.user.username, user_dept, self.department
                )

            return has_access

        except Exception as e:
            # Log any exceptions in the department permission check
            logger.error(
                "Exception in department permission check for user %s: %s\n%s",
                getattr(self.request, 'user', 'Unknown'),
                str(e),
                traceback.format_exc()
            )
            # In debug mode, raise for detailed error page
            # In production, fail closed (deny access) if there's an exception
            if settings.DEBUG:
                raise
            return False
