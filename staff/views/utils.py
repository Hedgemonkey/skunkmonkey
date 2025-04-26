"""
Utility functions for staff views
"""
import logging

# Set up logger
logger = logging.getLogger(__name__)


def get_client_ip(request):
    """
    Extract client IP address from request.

    Args:
        request: The HTTP request object

    Returns:
        str: The client's IP address
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        # The request passed through a proxy/load balancer
        ip = x_forwarded_for.split(',')[0]
    else:
        # Direct connection
        ip = request.META.get('REMOTE_ADDR')
    return ip
