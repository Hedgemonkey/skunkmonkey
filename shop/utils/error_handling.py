import logging

from django.contrib import messages

logger = logging.getLogger('shop')


class ErrorHandler:
    """
    A utility class for standardized error handling across the application.
    """

    @staticmethod
    def handle_form_errors(request, form, form_name="form"):
        """
        Handle form errors by logging them and adding messages to the user.

        Args:
            request: The HTTP request object
            form: The form instance with errors
            form_name: Name of the form for logging purposes
        """
        errors = form.errors.as_data()
        for field, error_list in errors.items():
            for error in error_list:
                if hasattr(error, 'message'):
                    error_message = error.message
                else:
                    error_message = str(error)

                logger.warning(
                    f"Form validation error in {form_name}: "
                    f"{field} - {error_message}"
                )

                # Format field name for display
                field_display = field
                if field != '__all__':
                    field_display = field.replace('_', ' ').title()
                    message_text = f"{field_display}: {error_message}"
                else:
                    message_text = error_message

                messages.error(request, message_text)

    @staticmethod
    def handle_validation_error(request, error, context="operation"):
        """
        Handle Django validation errors.

        Args:
            request: The HTTP request object
            error: The ValidationError instance
            context: Description of the context where the error occurred
        """
        if hasattr(error, 'message_dict'):
            # Handle multiple validation errors
            for field, messages_list in error.message_dict.items():
                for message in messages_list:
                    field_display = field.replace('_', ' ').title()
                    error_message = f"{field_display}: {message}"
                    logger.error(
                        f"Validation error during {context}: {error_message}"
                    )
                    messages.error(request, error_message)
        else:
            # Handle single validation error
            error_message = str(error)
            logger.error(f"Validation error during {context}: {error_message}")
            messages.error(request, error_message)

    @staticmethod
    def handle_exception(request, exception, operation="operation"):
        """
        Handle general exceptions.

        Args:
            request: The HTTP request object
            exception: The exception instance
            operation: Description of the operation that failed
        """
        error_message = f"An unexpected error occurred during {operation}."
        logger.exception(f"Exception during {operation}: {str(exception)}")
        messages.error(request, error_message)

        # Only show detailed error messages in debug mode
        from django.conf import settings
        if settings.DEBUG:
            messages.error(request, f"Error details: {str(exception)}")

    @staticmethod
    def log_action(action, user=None, data=None, success=True):
        """
        Log user actions for auditing purposes.

        Args:
            action: Description of the action
            user: User performing the action (optional)
            data: Additional data related to the action (optional)
            success: Whether the action was successful
        """
        status = "SUCCESS" if success else "FAILED"
        user_id = getattr(user, 'id', 'anonymous')
        username = getattr(user, 'username', 'anonymous')

        log_data = {
            'action': action,
            'user_id': user_id,
            'username': username,
            'status': status
        }

        if data:
            log_data['data'] = data

        if success:
            logger.info(f"User action: {log_data}")
        else:
            logger.warning(f"Failed user action: {log_data}")
