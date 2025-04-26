"""
Staff profile-related views for staff functionality
"""
import logging

from django.contrib import messages
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse_lazy
from django.views.generic import ListView, UpdateView, View

from staff.forms import StaffProfileForm
from staff.mixins import ManagerAccessMixin, StaffAccessMixin
from staff.models import StaffProfile

# Set up logger
logger = logging.getLogger(__name__)


class StaffProfileView(StaffAccessMixin, UpdateView):
    """
    View and update staff profile
    """
    model = StaffProfile
    form_class = StaffProfileForm
    template_name = 'staff/profile.html'
    success_url = reverse_lazy('staff:profile')

    def get_object(self):
        """Get or create staff profile for current user"""
        profile, created = StaffProfile.objects.get_or_create(
            user=self.request.user,
            defaults={
                'department': 'orders',
                'is_manager': False
            }
        )
        return profile

    def form_valid(self, form):
        """Handle valid form submission"""
        messages.success(
            self.request,
            'Your profile has been updated successfully.'
        )
        return super().form_valid(form)


class StaffListView(ManagerAccessMixin, ListView):
    """
    List view of staff members (for managers only)
    """
    model = User
    template_name = 'staff/staff_list.html'
    context_object_name = 'staff_members'

    def get_queryset(self):
        """Get all staff users"""
        return User.objects.filter(is_staff=True).order_by(
            '-is_superuser',
            'username'
        )

    def get_context_data(self, **kwargs):
        """Add staff profiles to context"""
        context = super().get_context_data(**kwargs)

        # Get all staff profiles as a dict for easy lookup
        staff_profiles = StaffProfile.objects.filter(
            user__in=context['staff_members']
        )

        # Create dict with user id as key and profile as value
        profiles_dict = {
            profile.user_id: profile
            for profile in staff_profiles
        }
        context['staff_profiles'] = profiles_dict

        return context


class ToggleManagerStatusView(ManagerAccessMixin, View):
    """
    Toggle manager status for a staff member
    """
    def get(self, request, pk):
        """Handle GET request to toggle manager status"""
        # Only superusers can change manager status
        if not request.user.is_superuser:
            messages.error(
                request,
                'Only administrators can change manager status.'
            )
            return redirect('staff:staff_list')

        user = get_object_or_404(User, pk=pk)

        # Cannot change superuser status
        if user.is_superuser:
            messages.error(
                request,
                'Cannot change status of administrator accounts.'
            )
            return redirect('staff:staff_list')

        # Get or create staff profile
        profile, created = StaffProfile.objects.get_or_create(
            user=user,
            defaults={
                'department': 'orders',
                'is_manager': False
            }
        )

        # Toggle manager status
        profile.is_manager = not profile.is_manager
        profile.save()

        action = 'granted' if profile.is_manager else 'revoked'
        messages.success(
            request,
            f'Manager privileges {action} for {user.username}.'
        )

        logger.info(
            "Manager privileges %s for %s by %s",
            action, user.username, request.user.username
        )

        return redirect('staff:staff_list')
