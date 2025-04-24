from django import template

register = template.Library()


@register.filter
def split(value, arg):
    """
    Split the value by the argument and return a list.
    Used for displaying conversation threads in templates.

    Usage: {{ value|split:"delimiter" }}
    """
    if value:
        return value.split(arg)
    return []


@register.filter
def is_user_reply(value):
    """
    Check if a message note is from a user reply.

    Usage: {{ value|is_user_reply }}
    """
    if value and isinstance(value, str):
        return "USER REPLY" in value
    return False


@register.filter
def is_staff_message(value):
    """
    Check if a message note is from staff.

    Usage: {{ value|is_staff_message }}
    """
    if value and isinstance(value, str):
        return "sent email:" in value or "STAFF:" in value
    return False


@register.filter
def extract_message_content(value):
    """
    Extract just the message content from a staff_notes entry.

    For staff messages: Returns content after "sent email:"
    For user replies: Returns content after username and colon

    Usage: {{ value|extract_message_content }}
    """
    if not value or not isinstance(value, str):
        return ""

    # Get timestamp
    # timestamp = value[:20] if len(value) >= 20 else ""

    # Extract content based on type
    if "sent email:" in value:
        # Staff message - extract content after "sent email:"
        parts = value.split("sent email:", 1)
        if len(parts) > 1:
            return parts[1].strip()
    elif "STAFF:" in value:
        # Staff message with STAFF prefix
        parts = value.split("STAFF:", 1)
        if len(parts) > 1:
            return parts[1].strip()
    elif "USER REPLY -" in value:
        # User reply - extract content after the username and colon
        try:
            # Find position of colon after "USER REPLY -"
            start_pos = value.find("USER REPLY -")
            if start_pos >= 0:
                colon_pos = value.find(":", start_pos)
                if colon_pos >= 0:
                    return value[colon_pos + 1:].strip()
        except Exception:
            pass

    return value  # Return original if extraction failed


@register.filter
def get_message_sender(value):
    """
    Get the sender info from a message note.

    For staff messages: Returns the staff name
    For user replies: Returns 'You'

    Usage: {{ value|get_message_sender }}
    """
    if not value or not isinstance(value, str):
        return ""

    if "USER REPLY" in value:
        return "You"
    elif "sent email:" in value:
        # Try to extract staff name between timestamp and "sent email:"
        try:
            timestamp_end = value.find("]")
            if timestamp_end >= 0:
                email_start = value.find("sent email:")
                if email_start >= 0:
                    return value[timestamp_end + 1:email_start].strip()
        except Exception:
            pass
        return "Support Team"
    elif "STAFF:" in value:
        return "Support Team"

    return "Unknown"
