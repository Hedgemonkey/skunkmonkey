"""
Message-related views for users to view and respond to their contact messages.
"""
import logging

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.views.generic import DetailView, ListView

from users.forms import ContactMessageReplyForm
from users.models import ContactMessage, MessageResponse
from users.utils.email import send_contact_email

logger = logging.getLogger('users')


class UserMessageListView(LoginRequiredMixin, ListView):
    """
    Display all contact messages sent by the current user.
    """
    model = ContactMessage
    template_name = 'users/messages/message_list.html'
    # Changed from 'messages' to avoid conflict
    context_object_name = 'contact_messages'
    paginate_by = 10

    def get_queryset(self):
        """Only show the current user's messages."""
        return ContactMessage.objects.filter(
            user=self.request.user
        ).order_by('-timestamp')


class UserMessageDetailView(LoginRequiredMixin, DetailView):
    """
    Display a specific contact message with its response history
    and provide a form to add additional comments.
    """
    model = ContactMessage
    template_name = 'users/messages/message_detail.html'
    context_object_name = 'message'

    def get_object(self):
        """
        Ensure users can only view their own messages.
        """
        obj = super().get_object()
        if obj.user != self.request.user:
            raise PermissionError(
                _("You do not have permission to view this message.")
            )
        # Mark as read when viewed
        if not obj.is_read:
            obj.mark_as_read()
        return obj

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        message = self.get_object()

        # Add reply form
        context['reply_form'] = ContactMessageReplyForm()

        # Get ALL responses that should be visible to the user
        responses = (
            message.responses.filter(is_visible_to_user=True)
            .order_by('created_at')
            .all()
        )

        # Process legacy responses only if we have that field populated
        # and there are no MessageResponse objects that would duplicate them
        # legacy_responses = []
        if message.response and not responses.exists():
            context['legacy_response'] = message.response
            # We'll still pass the legacy response for backwards compatibility
            # but won't need to process it in the template since we have proper
            # responses

        # Set responses in context
        context['responses'] = responses

        # Add a debug log to help trace issues
        logger.debug(
            (
                f"User message {message.id} has "
                f"{responses.count()} visible responses"
            )
        )

        return context


@login_required
def message_reply(request, pk):
    """
    Handle user replies to contact messages.
    """
    message = get_object_or_404(ContactMessage, pk=pk, user=request.user)

    if message.status == 'closed':
        messages.error(
            request,
            _("This conversation has been closed and cannot be replied to.")
        )
        return redirect('users:message_detail', pk=pk)

    if request.method == 'POST':
        form = ContactMessageReplyForm(request.POST)

        if form.is_valid():
            # Get the reply content
            reply_content = form.cleaned_data['message']

            # Format the user reply
            timestamp = timezone.now().strftime('%Y-%m-%d %H:%M')
            user_name = request.user.get_full_name() or request.user.username

            # Create a new MessageResponse object for the user reply
            MessageResponse.objects.create(
                contact_message=message,
                content=reply_content,
                response_type='user_reply',
                is_visible_to_user=True,
                created_by=request.user
            )

            # Legacy support - format and append to existing response field
            formatted_reply = f"[{timestamp}] USER REPLY: {reply_content}"

            # Store a copy in staff_notes for historical purposes
            staff_note = (
                f"[{timestamp}] USER REPLY - {user_name}: {reply_content}\n\n"
            )
            if message.staff_notes:
                message.staff_notes = staff_note + message.staff_notes
            else:
                message.staff_notes = staff_note

            # Append the user reply to the response or create new response
            # This ensures the full conversation is visible to the user
            if message.response:
                message.response = f"{message.response}\n\n{formatted_reply}"
            else:
                message.response = formatted_reply

            # Update response date to now
            message.response_date = timezone.now()

            # If the message was resolved or closed, reopen it
            if message.status in ['resolved', 'closed']:
                message.status = 'in_progress'

            message.save(update_fields=[
                'staff_notes', 'response', 'response_date', 'status'
            ])

            # Send notification email to staff
            try:
                # Customize the subject to indicate it's a reply
                subject = f"User Reply: {message.subject}"
                notification_message = (
                    f"User reply to message #{message.id}:\n\n"
                    f"{reply_content}"
                )

                email_sent = send_contact_email(
                    request_or_email=request.user.email,
                    subject=subject,
                    message=notification_message,
                    to_email=None,  # Will use the default admin email
                    phone_number=message.phone_number,
                    user=request.user
                )

                if email_sent:
                    logger.info(
                        f"User reply notification sent for message "
                        f"{message.id}"
                    )
                else:
                    logger.error(
                        f"Failed to send user reply notification for message "
                        f"{message.id}"
                    )
            except Exception as e:
                logger.error(f"Error sending reply notification: {str(e)}")

            messages.success(
                request,
                _("Your reply has been sent. Staff will be notified.")
            )

            return redirect('users:message_detail', pk=pk)
    else:
        form = ContactMessageReplyForm()

    return render(
        request,
        'users/messages/message_detail.html',
        {'message': message, 'reply_form': form}
    )
