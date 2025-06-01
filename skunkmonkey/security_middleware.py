"""
Custom security middleware for additional security headers
"""


class SecurityHeadersMiddleware:
    """
    Middleware to add additional security headers that aren't covered
    by django-csp
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Add Permissions-Policy header
        # This controls which browser features and APIs can be used
        permissions_policy = (
            "camera=(), "
            "microphone=(), "
            "geolocation=(), "
            "interest-cohort=(), "
            "payment=(), "
            "usb=(), "
            "bluetooth=(), "
            "magnetometer=(), "
            "gyroscope=(), "
            "accelerometer=(), "
            "ambient-light-sensor=(), "
            "autoplay=(), "
            "encrypted-media=(self), "
            "fullscreen=(self), "
            "picture-in-picture=()"
        )
        response['Permissions-Policy'] = permissions_policy

        # Add Referrer-Policy header if not already set
        if 'Referrer-Policy' not in response:
            response['Referrer-Policy'] = 'strict-origin-when-cross-origin'

        # Add X-Content-Type-Options if not already set
        if 'X-Content-Type-Options' not in response:
            response['X-Content-Type-Options'] = 'nosniff'

        return response
