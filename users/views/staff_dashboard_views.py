"""
Staff dashboard views for managing users, support tasks, etc.
"""
import logging

from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import get_user_model
from django.core.mail import EmailMessage
from django.shortcuts import get_object_or_404, redirect, render
from django.template.loader import render_to_string
from django.urls import reverse_lazy
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.views.generic import DetailView, ListView, TemplateView, UpdateView

from users.forms import StaffUserSearchForm
from users.mixins import StaffMemberRequiredMixin
from users.models import ContactMessage, MessageNote, MessageResponse
from users.utils.email import send_response_email

User = get_user_model()
logger = logging.getLogger('users')


class StaffDashboardView(StaffMemberRequiredMixin, TemplateView):
    """Staff dashboard home view."""
    template_name = 'users/staff/dashboard.html'

    def get_context_data(self, **kwargs):
        """Add additional context for the dashboard."""
        context = super().get_context_data(**kwargs)

        # Get latest messages
        context['recent_messages'] = ContactMessage.objects.order_by(
            '-timestamp'
        )[:5]

        # Get unread messages count
        context['unread_count'] = ContactMessage.objects.filter(
            is_read=False
        ).count()

        # Get urgent messages
        context['urgent_messages'] = ContactMessage.objects.filter(
            priority='urgent'
        ).order_by('-timestamp')[:5]

        # Messages needing attention (unassigned with status 'new')
        context['unassigned_new'] = ContactMessage.objects.filter(
            assigned_to=None,
            status='new'
        ).count()

        # Messages assigned to current user
        context['assigned_to_me'] = ContactMessage.objects.filter(
            assigned_to=self.request.user
        ).count()

        return context


class StaffUserListView(StaffMemberRequiredMixin, ListView):
    """List users for staff to manage."""
    model = User
    template_name = 'users/staff/user_list.html'
    context_object_name = 'users'
    paginate_by = 20

    def get_queryset(self):
        """Filter users based on search parameters."""
        queryset = super().get_queryset()

        search_query = self.request.GET.get('search', '')
        if search_query:
            queryset = queryset.filter(
                username__icontains=search_query
            ) | queryset.filter(
                email__icontains=search_query
            ) | queryset.filter(
                first_name__icontains=search_query
            ) | queryset.filter(
                last_name__icontains=search_query
            )

        # Filter by active status if specified
        status = self.request.GET.get('status', '')
        if status == 'active':
            queryset = queryset.filter(is_active=True)
        elif status == 'inactive':
            queryset = queryset.filter(is_active=False)

        # Filter by staff status if specified
        user_type = self.request.GET.get('user_type', '')
        if user_type == 'staff':
            queryset = queryset.filter(is_staff=True)
        elif user_type == 'customers':
            queryset = queryset.filter(is_staff=False)

        # Default sort by join date (newest first)
        sort_by = self.request.GET.get('sort', '-date_joined')
        return queryset.order_by(sort_by)

    def get_context_data(self, **kwargs):
        """Add search form to context."""
        context = super().get_context_data(**kwargs)
        context['form'] = StaffUserSearchForm(self.request.GET)
        # Add applied filters for display
        context['applied_filters'] = {
            'search': self.request.GET.get('search', ''),
            'status': self.request.GET.get('status', ''),
            'user_type': self.request.GET.get('user_type', ''),
            'sort': self.request.GET.get('sort', '-date_joined')
        }
        return context


class StaffUserUpdateView(StaffMemberRequiredMixin, UpdateView):
    """Update user information as staff."""
    model = User
    template_name = 'users/staff/user_detail.html'
    fields = [
        'username', 'email', 'first_name', 'last_name',
        'is_active', 'is_staff'
    ]
    success_url = reverse_lazy('users:staff_user_list')

    def form_valid(self, form):
        """Add success message when form is valid."""
        response = super().form_valid(form)
        messages.success(
            self.request,
            _("User information updated successfully.")
        )
        return response


class ContactMessageListView(StaffMemberRequiredMixin, ListView):
    """List view for staff to manage contact messages."""
    model = ContactMessage
    template_name = 'users/staff/contact_message_list.html'
    context_object_name = 'contact_messages'
    paginate_by = 20

    def get_queryset(self):
        """Filter and sort messages based on request parameters."""
        queryset = super().get_queryset()

        # Apply search filter if provided
        search_query = self.request.GET.get('search', '')
        if search_query:
            queryset = queryset.filter(
                subject__icontains=search_query
            ) | queryset.filter(
                email__icontains=search_query
            ) | queryset.filter(
                message__icontains=search_query
            )

        # Filter by status
        status_filter = self.request.GET.get('status', '')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by priority
        priority_filter = self.request.GET.get('priority', '')
        if priority_filter:
            queryset = queryset.filter(priority=priority_filter)

        # Filter by category
        category_filter = self.request.GET.get('category', '')
        if category_filter:
            queryset = queryset.filter(category=category_filter)

        # Filter by read status
        is_read_filter = self.request.GET.get('is_read', '')
        if is_read_filter == 'read':
            queryset = queryset.filter(is_read=True)
        elif is_read_filter == 'unread':
            queryset = queryset.filter(is_read=False)

        # Filter by assigned status
        assigned_filter = self.request.GET.get('assigned', '')
        if assigned_filter == 'me':
            queryset = queryset.filter(assigned_to=self.request.user)
        elif assigned_filter == 'none':
            queryset = queryset.filter(assigned_to=None)

        # Default sort by timestamp (newest first)
        order_by = self.request.GET.get('order_by', '-timestamp')
        return queryset.order_by(order_by)

    def get_context_data(self, **kwargs):
        """Add additional context for filtering options."""
        context = super().get_context_data(**kwargs)
        # Add filter choices
        context['status_choices'] = ContactMessage.STATUS_CHOICES
        context['priority_choices'] = ContactMessage.PRIORITY_CHOICES
        context['category_choices'] = ContactMessage.CATEGORY_CHOICES

        # Add current filter selections for UI
        context['search_query'] = self.request.GET.get('search', '')
        context['status_filter'] = self.request.GET.get('status', '')
        context['priority_filter'] = self.request.GET.get('priority', '')
        context['category_filter'] = self.request.GET.get('category', '')
        context['is_read_filter'] = self.request.GET.get('is_read', '')
        context['assigned_filter'] = self.request.GET.get('assigned', '')
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

        # Get responses and notes for this message with proper ordering
        responses = message.responses.all().order_by('created_at')
        notes = message.notes.all().order_by('created_at')
        context['responses'] = responses
        context['notes'] = notes

        # For debugging - confirm counts in logs
        logger.debug(
            f"Message {message.id} has {responses.count()} responses "
            f"and {notes.count()} notes"
        )

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
    if request.method != 'POST':
        return redirect('users:staff_message_list')

    action = request.POST.get('bulk_action', '')
    message_ids = request.POST.getlist('message_ids', [])

    if not action or not message_ids:
        messages.error(
            request,
            _("Please select both an action and at least one message.")
        )
        return redirect('users:staff_message_list')

    messages_to_process = ContactMessage.objects.filter(id__in=message_ids)
    message_count = messages_to_process.count()

    if action == 'mark_read':
        for message_obj in messages_to_process:
            message_obj.mark_as_read()
        messages.success(
            request, _(f"{message_count} messages marked as read.")
        )

    elif action == 'mark_unread':
        for message_obj in messages_to_process:
            message_obj.mark_as_unread()
        messages.success(
            request, _(f"{message_count} messages marked as unread.")
        )

    elif action == 'assign_to_me':
        for message_obj in messages_to_process:
            message_obj.assign_to(request.user)
        messages.success(
            request, _(f"{message_count} messages assigned to you.")
        )

    elif action == 'set_status':
        status = request.POST.get('status')
        for message_obj in messages_to_process:
            message_obj.update_status(status, request.user)
        status_choices_dict = dict(ContactMessage.STATUS_CHOICES)
        status_display = status_choices_dict.get(status, status)
        messages.success(
            request,
            _(f"{message_count} messages set to '{status_display}'.")
        )

    elif action == 'set_priority':
        priority = request.POST.get('priority')
        messages_to_process.update(priority=priority)
        priority_display = dict(ContactMessage.PRIORITY_CHOICES).get(
            priority, priority
        )
        messages.success(
            request,
            _(
                f"{message_count} messages set to "
                f"'{priority_display}' priority."
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

            messages.success(
                request,
                _("Your response has been sent.")
            )
        else:
            messages.error(
                request,
                _("Response cannot be empty.")
            )

        return redirect('users:staff_message_detail', pk=pk)

    return render(
        request,
        'users/staff/message_reply.html',
        {'message': message}
    )


@staff_member_required
def staff_message_mark_read(request, pk):
    """Mark a message as read."""
    message = get_object_or_404(ContactMessage, pk=pk)
    message.mark_as_read()
    messages.success(request, _("Message marked as read."))
    return redirect('users:staff_message_detail', pk=pk)


@staff_member_required
def staff_message_mark_unread(request, pk):
    """Mark a message as unread."""
    message = get_object_or_404(ContactMessage, pk=pk)
    message.mark_as_unread()
    messages.success(request, _("Message marked as unread."))
    return redirect('users:staff_message_detail', pk=pk)


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
        send_email_param = request.POST.get('send_email')
        send_email_requested = send_email_param == 'true'

        # Debug logging
        print(
            f"DEBUG: send_email param received: '{send_email_param}', "
            f"parsed as {send_email_requested}"
        )
        print(f"DEBUG: All POST data: {request.POST}")

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

            # Send email if explicitly requested
            if send_email_requested and message.email and '@' in message.email:
                print(f"DEBUG: Attempting to send email to {message.email}")
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
                print(
                    f"DEBUG: Not sending email. Conditions: "
                    f"send_email_requested={send_email_requested}, "
                    f"email={message.email}"
                )
                messages.success(request, _("Response saved."))

    return redirect('users:staff_message_detail', pk=pk)


@staff_member_required
def staff_message_update_status(request, pk):
    """Update status, priority, and category of a message."""
    message = get_object_or_404(ContactMessage, pk=pk)

    if request.method == 'POST':
        status = request.POST.get('status')
        priority = request.POST.get('priority')
        category = request.POST.get('category')

        if status:
            message.update_status(status, request.user)

        if priority:
            message.priority = priority

        if category:
            message.category = category

        message.save(update_fields=['priority', 'category'])
        messages.success(request, _("Message details updated successfully."))

    return redirect('users:staff_message_detail', pk=pk)


@staff_member_required
def staff_message_update_notes(request, pk):
    """Update staff notes for a message."""
    message = get_object_or_404(ContactMessage, pk=pk)

    if request.method == 'POST':
        notes = request.POST.get('staff_notes')
        if notes is not None:
            message.staff_notes = notes
            message.save(update_fields=['staff_notes'])
            messages.success(request, _("Staff notes updated successfully."))
        else:
            messages.error(request, _("No notes provided."))

    return redirect('users:staff_message_detail', pk=pk)


@staff_member_required
def staff_message_forward(request, pk):
    """Forward a message to another staff member."""
    message = get_object_or_404(ContactMessage, pk=pk)

    if request.method == 'POST':
        staff_id = request.POST.get('staff_id')
        note = request.POST.get('note')

        try:
            staff_user = User.objects.get(id=staff_id, is_staff=True)

            # Update message assignment
            message.assign_to(staff_user)

            # Add note about the transfer
            forward_note = (
                f"Message forwarded by "
                f"{request.user.get_full_name() or request.user.username} "
                f"to "
                f"{staff_user.get_full_name() or staff_user.username}."
            )
            if note:
                forward_note += f" Note: {note}"

            message.add_note(forward_note, request.user)

            # Send email notification to the staff member
            context = {
                'message': message,
                'forwarded_by': request.user,
                'note': note
            }
            email_body = render_to_string(
                'users/emails/staff_message_forward.html',
                context
            )
            email = EmailMessage(
                subject=f"Message Forwarded: {message.subject}",
                body=email_body,
                from_email=None,  # Use default
                to=[staff_user.email],
                reply_to=[request.user.email]
            )
            email.content_subtype = "html"
            email.send(fail_silently=True)

            messages.success(
                request,
                _(
                    f"Message forwarded to "
                    f"{staff_user.get_full_name() or staff_user.username}."
                )
            )

        except User.DoesNotExist:
            messages.error(request, _("Selected staff member not found."))

    return redirect('users:staff_message_detail', pk=pk)


@staff_member_required
def staff_message_assign(request, pk):
    """Assign a message to a specific staff member."""
    message = get_object_or_404(ContactMessage, pk=pk)

    if request.method == 'POST':
        staff_id = request.POST.get('staff_id')

        if staff_id:
            try:
                staff_user = User.objects.get(id=staff_id, is_staff=True)
                original_assignee = message.assigned_to

                # Add note about reassignment
                if original_assignee:
                    user_name = (
                        request.user.get_full_name()
                        or request.user.username
                    )
                    orig_name = (
                        original_assignee.get_full_name()
                        or original_assignee.username
                    )
                    staff_name = (
                        staff_user.get_full_name()
                        or staff_user.username
                    )
                    reassign_note = (
                        f"Message reassigned by {user_name} "
                        f"from {orig_name} to {staff_name}."
                    )
                else:
                    user_name = (
                        request.user.get_full_name()
                        or request.user.username
                    )
                    staff_name = (
                        staff_user.get_full_name()
                        or staff_user.username
                    )
                    reassign_note = (
                        f"Message assigned by {user_name} "
                        f"to {staff_name}."
                    )

                # Update assignment
                message.assign_to(staff_user)
                message.add_note(reassign_note, request.user)

                messages.success(
                    request,
                    _(
                        f"Message assigned to "
                        f"{staff_user.get_full_name() or staff_user.username}."
                    )
                )

            except User.DoesNotExist:
                messages.error(request, _("Selected staff member not found."))
        else:
            # Unassign
            if message.assigned_to:
                user_name = (
                    request.user.get_full_name() or request.user.username
                )
                assignee_name = (
                    message.assigned_to.get_full_name()
                    or message.assigned_to.username
                )
                unassign_note = (
                    f"Message unassigned by {user_name}. "
                    f"Previously assigned to {assignee_name}."
                )
                message.assigned_to = None
                message.save(update_fields=['assigned_to'])
                message.add_note(unassign_note, request.user)
                messages.success(request, _("Message unassigned."))
            else:
                messages.info(request, _("Message was already unassigned."))

    return redirect('users:staff_message_detail', pk=pk)
