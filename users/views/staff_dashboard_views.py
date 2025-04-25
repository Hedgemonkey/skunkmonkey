"""
Staff dashboard view modules for the users app.
"""
from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import get_user_model
from django.contrib.auth.mixins import UserPassesTestMixin
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.views.generic import DetailView, ListView, View

from users.models import ContactMessage, MessageNote, MessageResponse
from users.utils.email import send_response_email

User = get_user_model()


class StaffMemberRequiredMixin(UserPassesTestMixin):
    """Mixin to ensure only staff members can access views."""

    def test_func(self):
        return self.request.user.is_staff


class StaffDashboardView(StaffMemberRequiredMixin, View):
    """Dashboard view for staff members to manage contact messages."""

    def get(self, request, *args, **kwargs):
        # Get message statistics
        messages_stats = {
            'total': ContactMessage.objects.count(),
            'unread': ContactMessage.objects.filter(is_read=False).count(),
            'urgent': ContactMessage.objects.filter(priority='urgent').count(),
            'high': ContactMessage.objects.filter(priority='high').count(),
            'new': ContactMessage.objects.filter(status='new').count(),
            'in_progress': ContactMessage.objects.filter(
                status='in_progress'
            ).count(),
            'resolved': ContactMessage.objects.filter(
                status='resolved'
            ).count(),
        }

        # Get category statistics
        category_stats = ContactMessage.objects.values('category').annotate(
            count=Count('id')
        ).order_by('-count')

        # Get urgent unread messages
        urgent_messages = ContactMessage.objects.filter(
            priority__in=['urgent', 'high'],
            is_read=False
        ).order_by('-timestamp')[:5]

        # Get messages assigned to current staff member
        assigned_messages = ContactMessage.objects.filter(
            assigned_to=request.user
        ).order_by('-timestamp')

        # Recent activity
        recent_activity = (
            ContactMessage.objects.all()
            .order_by('-timestamp')[:10]
        )

        context = {
            'messages_stats': messages_stats,
            'category_stats': category_stats,
            'urgent_messages': urgent_messages,
            'assigned_messages': assigned_messages,
            'recent_activity': recent_activity,
        }

        return render(request, 'users/staff/dashboard.html', context)


class ContactMessageListView(StaffMemberRequiredMixin, ListView):
    """
    List view for staff to see all contact messages with filtering options.
    """
    model = ContactMessage
    template_name = 'users/staff/contact_message_list.html'
    context_object_name = 'contact_messages'
    paginate_by = 20

    def get_queryset(self):
        queryset = ContactMessage.objects.all()

        # Apply filters
        status_filter = self.request.GET.get('status')
        priority_filter = self.request.GET.get('priority')
        category_filter = self.request.GET.get('category')
        is_read_filter = self.request.GET.get('is_read')
        assigned_filter = self.request.GET.get('assigned')
        search_query = self.request.GET.get('search')
        order_by = self.request.GET.get('order_by', '-timestamp')

        if status_filter:
            queryset = queryset.filter(status=status_filter)

        if priority_filter:
            queryset = queryset.filter(priority=priority_filter)

        if category_filter:
            queryset = queryset.filter(category=category_filter)

        if is_read_filter == 'true':
            queryset = queryset.filter(is_read=True)
        elif is_read_filter == 'false':
            queryset = queryset.filter(is_read=False)

        if assigned_filter == 'me':
            queryset = queryset.filter(assigned_to=self.request.user)
        elif assigned_filter == 'none':
            queryset = queryset.filter(assigned_to__isnull=True)

        if search_query:
            queryset = queryset.filter(
                Q(email__icontains=search_query)
                | Q(subject__icontains=search_query)
                | Q(message__icontains=search_query)
            )

        # Apply ordering
        return queryset.order_by(order_by)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # Get choices for filters
        context['status_choices'] = ContactMessage.STATUS_CHOICES
        context['priority_choices'] = ContactMessage.PRIORITY_CHOICES
        context['category_choices'] = ContactMessage.CATEGORY_CHOICES

        # Add current filter values to context
        context['status_filter'] = self.request.GET.get('status')
        context['priority_filter'] = self.request.GET.get('priority')
        context['category_filter'] = self.request.GET.get('category')
        context['is_read_filter'] = self.request.GET.get('is_read')
        context['assigned_filter'] = self.request.GET.get('assigned')
        context['search_query'] = self.request.GET.get('search')
        context['order_by'] = self.request.GET.get('order_by', '-timestamp')

        return context


class ContactMessageDetailView(StaffMemberRequiredMixin, DetailView):
    """Detail view for staff to view and respond to a contact message."""
    model = ContactMessage
    template_name = 'users/staff/contact_message_detail.html'
    context_object_name = 'message'

    def get_object(self):
        obj = super().get_object()
        # Mark as read when viewed
        if not obj.is_read:
            obj.is_read = True
            obj.save(update_fields=['is_read'])
        return obj

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['status_choices'] = ContactMessage.STATUS_CHOICES
        context['priority_choices'] = ContactMessage.PRIORITY_CHOICES
        context['category_choices'] = ContactMessage.CATEGORY_CHOICES

        # Get staff members for assignment
        context['staff_members'] = User.objects.filter(is_staff=True,
                                                       is_active=True)

        # Get previous messages from same user if they're registered
        message = self.get_object()
        if message.user:
            context['previous_messages'] = (
                ContactMessage.objects.filter(user=message.user)
                .exclude(id=message.id)
                .order_by('-timestamp')[:5]
            )

        # Add response type choices
        context['response_type_choices'] = [
            ('message', _('Email')),
            ('phone_call_user', _('Phone Call - Visible to User')),
            ('phone_call_internal', _('Phone Call - Internal Only')),
            ('note', _('Internal Note')),
        ]

        # Get responses and notes for this message
        context['responses'] = message.responses.order_by('created_at').all()
        context['notes'] = message.notes.order_by('-created_at').all()

        return context

    def post(self, request, *args, **kwargs):
        message = self.get_object()
        action = request.POST.get('action')

        if action == 'update_status':
            status = request.POST.get('status')
            message.update_status(status, user=request.user)
            messages.success(request, _("Status updated successfully."))

        elif action == 'update_priority':
            priority = request.POST.get('priority')
            message.priority = priority
            message.save(update_fields=['priority'])
            messages.success(request, _("Priority updated successfully."))

        elif action == 'update_category':
            category = request.POST.get('category')
            message.category = category
            message.save(update_fields=['category'])
            messages.success(request, _("Category updated successfully."))

        elif action == 'assign_to_me':
            message.assign_to(request.user)
            messages.success(request, _("Message assigned to you."))

        elif action == 'add_note':
            note_content = request.POST.get('note')
            if note_content:
                # Create a new MessageNote instead of modifying staff_notes
                MessageNote.objects.create(
                    contact_message=message,
                    content=note_content,
                    created_by=request.user
                )

                # Legacy support for staff_notes field
                timestamp = timezone.now().strftime('%Y-%m-%d %H:%M')
                staff_name = (
                    request.user.get_full_name() or request.user.username
                )
                formatted_note = (
                    f"[{timestamp}] {staff_name}: {note_content}\n\n"
                )

                # Prepend to existing notes (newest on top)
                if message.staff_notes:
                    message.staff_notes = formatted_note + message.staff_notes
                else:
                    message.staff_notes = formatted_note

                message.save(update_fields=['staff_notes'])
                messages.success(request, _("Note added successfully."))

        elif action == 'add_response':
            # This is handled by staff_message_response view
            pass

        elif action == 'mark_unread':
            message.mark_as_unread()
            messages.success(request, _("Message marked as unread."))

        return self.get(request, *args, **kwargs)


@staff_member_required
def message_bulk_action(request):
    """Handle bulk actions for contact messages."""
    if request.method == 'POST':
        action = request.POST.get('bulk_action')
        message_ids = request.POST.getlist('message_ids')

        if not message_ids:
            messages.warning(request, _("No messages selected."))
            return redirect('users:staff_message_list')

        messages_to_update = ContactMessage.objects.filter(id__in=message_ids)

        if action == 'mark_read':
            messages_to_update.update(is_read=True)
            messages.success(
                request, _(f"{len(message_ids)} messages marked as read.")
            )

        elif action == 'mark_unread':
            messages_to_update.update(is_read=False)
            messages.success(
                request, _(f"{len(message_ids)} messages marked as unread.")
            )

        elif action == 'assign_to_me':
            messages_to_update.update(assigned_to=request.user)
            messages.success(
                request, _(f"{len(message_ids)} messages assigned to you.")
            )

        elif action == 'set_status':
            status = request.POST.get('status')
            messages_to_update.update(status=status)
            messages.success(
                request, _(f"Status updated for {len(message_ids)} messages.")
            )

        elif action == 'set_priority':
            priority = request.POST.get('priority')
            messages_to_update.update(priority=priority)
            messages.success(
                request, _(
                    f"Priority updated for {len(message_ids)} messages."
                )
            )

    return redirect('users:staff_message_list')


@staff_member_required
def staff_message_reply(request, pk):
    """View for replying to a contact message."""
    message = get_object_or_404(ContactMessage, pk=pk)

    if request.method == 'POST':
        response = request.POST.get('response')
        status_after = request.POST.get('status_after', 'in_progress')

        # Determine if we should change status to resolved
        # based on user selection
        change_status_to_resolved = status_after == 'resolved'

        if response:
            # Update the message with the response,
            # passing the status preference
            message.add_response(
                response_text=response,
                user=request.user,
                change_status=change_status_to_resolved
            )

            # Note: The add_response method now creates a MessageResponse
            # object
            # and updates the legacy response field

            # If status is manually set to resolved and wasn't handled by
            # add_response
            if change_status_to_resolved and message.status != 'resolved':
                message.status = 'resolved'
                message.resolved_date = timezone.now()
                message.save(update_fields=['status', 'resolved_date'])

            # Email is now sent by add_response automatically
            messages.success(
                request, _("Response saved and email sent to user.")
            )

            return redirect('users:staff_message_detail', pk=pk)

    return render(
        request, 'users/staff/message_reply.html', {'message': message}
    )


@staff_member_required
def staff_message_mark_read(request, pk):
    """Mark a message as read."""
    message = get_object_or_404(ContactMessage, pk=pk)
    message.is_read = True
    message.save(update_fields=['is_read'])
    messages.success(request, _("Message marked as read."))
    return redirect('users:staff_message_detail', pk=pk)


@staff_member_required
def staff_message_mark_unread(request, pk):
    """Mark a message as unread."""
    message = get_object_or_404(ContactMessage, pk=pk)
    message.is_read = False
    message.save(update_fields=['is_read'])
    messages.success(request, _("Message marked as unread."))
    return redirect('users:staff_message_list')


@staff_member_required
def staff_message_delete(request, pk):
    """Delete a contact message."""
    message = get_object_or_404(ContactMessage, pk=pk)
    message.delete()
    messages.success(request, _("Message deleted successfully."))
    return redirect('users:staff_message_list')


@staff_member_required
def staff_message_response(request, pk):
    """Add a response to a contact message."""
    message = get_object_or_404(ContactMessage, pk=pk)

    if request.method == 'POST':
        content = request.POST.get('content')
        response_type = request.POST.get('response_type', 'message')
        send_email_requested = request.POST.get('send_email') == 'true'

        if not content:
            messages.error(request, _("Response content cannot be empty."))
            return redirect('users:staff_message_detail', pk=pk)

        # Assign to current staff user if not already assigned
        if not message.assigned_to:
            message.assigned_to = request.user
            message.save(update_fields=['assigned_to'])

        # Determine if response should be visible to user
        is_visible_to_user = response_type in ['message', 'phone_call_user']

        # Handle based on response type
        if response_type == 'note':
            # Create a MessageNote using the helper method
            message.add_note(
                note_content=content,
                user=request.user
            )
            messages.success(request, _("Internal note added successfully."))

            # Update status from 'new' to 'in_progress' if applicable
            if message.status == 'new':
                message.status = 'in_progress'
                message.save(update_fields=['status'])

        else:
            # Create a MessageResponse
            response_obj = MessageResponse.objects.create(
                contact_message=message,
                content=content,
                created_by=request.user,
                response_type=response_type,
                is_visible_to_user=is_visible_to_user,
                # Will be updated if email is sent successfully
                email_sent=False
            )

            # Update status
            if message.status == 'new':
                message.status = 'in_progress'
                message.save(update_fields=['status'])

            # Send email if requested
            if (
                send_email_requested
                and is_visible_to_user
                and message.email
                and '@' in message.email
            ):
                try:
                    send_response_email(
                        contact_message=message,
                        response_text=content,
                        sender=request.user
                    )
                    response_obj.email_sent = True
                    response_obj.save(update_fields=['email_sent'])
                    messages.success(
                        request, _("Response sent by email and saved.")
                    )
                except Exception as e:
                    msg = (
                        f"Failed to send email: {str(e)}. "
                        "Response was saved."
                    )
                    messages.error(request, _(msg))
            else:
                if response_type == 'message':
                    messages.success(
                        request, _("Response saved without sending email.")
                    )
                elif response_type == 'phone_call_user':
                    messages.success(
                        request,
                        _("Phone call record saved (visible to user).")
                    )
                elif response_type == 'phone_call_internal':
                    messages.success(
                        request, _("Internal phone call record saved.")
                    )

        return redirect('users:staff_message_detail', pk=pk)

    # If GET request, redirect to detail page
    return redirect('users:staff_message_detail', pk=pk)


@staff_member_required
def staff_message_update_status(request, pk):
    """Update status, priority, and category of a message."""
    message = get_object_or_404(ContactMessage, pk=pk)

    if request.method == 'POST':
        # Update status, priority and category
        message.status = request.POST.get('status', message.status)
        message.priority = request.POST.get('priority', message.priority)
        message.category = request.POST.get('category', message.category)
        message.save()

        messages.success(request, _("Message details updated successfully."))

    return redirect('users:staff_message_detail', pk=pk)


@staff_member_required
def staff_message_update_notes(request, pk):
    """Update staff notes for a message."""
    message = get_object_or_404(ContactMessage, pk=pk)

    if request.method == 'POST':
        notes = request.POST.get('notes', '')
        message.staff_notes = notes
        message.save(update_fields=['staff_notes'])

        messages.success(request, _("Notes updated successfully."))

    return redirect('users:staff_message_detail', pk=pk)


@staff_member_required
def staff_message_forward(request, pk):
    """Forward message to another staff member."""
    message = get_object_or_404(ContactMessage, pk=pk)

    if request.method == 'POST':
        staff_id = request.POST.get('staff_id')
        note = request.POST.get('note', '')

        try:
            staff_member = User.objects.get(id=staff_id, is_staff=True)

            # Update assigned_to
            message.assigned_to = staff_member

            # Add forwarding note
            timestamp = timezone.now().strftime('%Y-%m-%d %H:%M')
            current_staff = (
                request.user.get_full_name() or request.user.username
            )

            forwarding_note = (
                f"[{timestamp}] {current_staff} forwarded to "
                f"{staff_member.get_full_name() or staff_member.username}"
            )

            if note:
                forwarding_note += f": {note}"

            forwarding_note += "\n\n"

            # Append to existing notes
            if message.staff_notes:
                message.staff_notes = forwarding_note + message.staff_notes
            else:
                message.staff_notes = forwarding_note

            message.save()

            messages.success(
                request,
                _("Message forwarded to {}.").format(
                    staff_member.get_full_name() or staff_member.username
                )
            )

        except User.DoesNotExist:
            messages.error(request, _("Selected staff member not found."))

    return redirect('users:staff_message_detail', pk=pk)


@staff_member_required
def staff_message_assign(request, pk):
    """Assign message to a staff member."""
    message = get_object_or_404(ContactMessage, pk=pk)

    if request.method == 'POST':
        staff_id = request.POST.get('staff_id')

        if staff_id:
            try:
                staff_member = User.objects.get(id=staff_id, is_staff=True)
                message.assigned_to = staff_member
                message.save(update_fields=['assigned_to'])

                messages.success(
                    request,
                    _("Message assigned to {}.").format(
                        staff_member.get_full_name() or staff_member.username
                    )
                )
            except User.DoesNotExist:
                messages.error(request, _("Selected staff member not found."))
        else:
            # Unassign
            message.assigned_to = None
            message.save(update_fields=['assigned_to'])
            messages.success(request, _("Message unassigned."))

    return redirect('users:staff_message_detail', pk=pk)
