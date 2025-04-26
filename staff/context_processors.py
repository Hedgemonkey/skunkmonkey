"""
Context processors for the staff app
"""
from staff.models import StaffNotification


def unread_notifications(request):
    """Add unread notifications count to the request user"""
    if request.user.is_authenticated and request.user.is_staff:
        unread_count = StaffNotification.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()

        # Add the count as a property to the user object
        request.user.unread_notifications_count = unread_count
    else:
        # Set to zero for non-staff users
        request.user.unread_notifications_count = 0

    return {}
