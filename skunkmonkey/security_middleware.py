"""
Custom security middleware for additional security headers
"""
import os


class SecurityHeadersMiddleware:
    """
    Middleware to add additional security headers that aren't covered
    by django-csp, and ensure proper cookie security
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

        # Add Content-Security-Policy if not already set by django-csp
        if 'Content-Security-Policy' not in response:
            self._add_csp_header(response)

        # Secure cookies by adding HttpOnly and Secure flags
        self._secure_cookies(response)

        return response

    def _add_csp_header(self, response):
        """Add Content-Security-Policy header manually if django-csp fails"""
        on_heroku = 'DATABASE_URL' in os.environ

        if on_heroku:
            # Production CSP - More restrictive, remove unsafe directives
            csp_policy = (
                "default-src 'self'; "
                "style-src 'self' 'unsafe-inline' "
                "https://fonts.googleapis.com "
                "https://*.cloudfront.net https://cdn.jsdelivr.net; "
                "img-src 'self' data: https://*.stripe.com "
                "https://source.unsplash.com https://*.cloudfront.net "
                "https://*.amazonaws.com; "
                "font-src 'self' data: https://fonts.gstatic.com "
                "https://use.fontawesome.com https://cdn.jsdelivr.net "
                "https://*.cloudfront.net; "
                "script-src 'self' 'unsafe-inline' "
                "https://js.stripe.com https://cdn.jsdelivr.net "
                "https://*.cloudfront.net; "
                "connect-src 'self' https://*.stripe.com "
                "https://*.amazonaws.com https://*.cloudfront.net; "
                "frame-src 'self' https://*.stripe.com; "
                "frame-ancestors 'self'; "
                "base-uri 'self'; "
                "form-action 'self'; "
                "upgrade-insecure-requests;"
            )
        else:
            # Development CSP - Still restrictive but allows dev tools
            csp_policy = (
                "default-src 'self'; "
                "style-src 'self' 'unsafe-inline' "
                "https://fonts.googleapis.com "
                "https://*.cloudfront.net https://cdn.jsdelivr.net; "
                "img-src 'self' data: https://*.stripe.com "
                "https://source.unsplash.com https://*.cloudfront.net "
                "https://*.amazonaws.com; "
                "font-src 'self' data: https://fonts.gstatic.com "
                "https://use.fontawesome.com https://cdn.jsdelivr.net "
                "https://*.cloudfront.net; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' "
                "https://js.stripe.com https://cdn.jsdelivr.net "
                "https://*.cloudfront.net "
                "http://hedgemonkey.ddns.net:5173; "
                "connect-src 'self' https://*.stripe.com "
                "https://*.amazonaws.com https://*.cloudfront.net "
                "http://hedgemonkey.ddns.net:5173 "
                "ws://hedgemonkey.ddns.net:5173; "
                "frame-src 'self' https://*.stripe.com; "
                "frame-ancestors 'self'; "
                "base-uri 'self'; "
                "form-action 'self';"
            )

        response['Content-Security-Policy'] = csp_policy

    def _secure_cookies(self, response):
        """Add security flags to cookies with improved enforcement"""
        # Check if we're in production (Heroku)
        on_heroku = 'DATABASE_URL' in os.environ

        if hasattr(response, 'cookies'):
            for cookie_name, cookie in response.cookies.items():
                # Always add HttpOnly flag for all cookies except CSRF token
                # CSRF token needs to be accessible to JavaScript for AJAX
                if cookie_name != 'csrftoken':
                    cookie['httponly'] = True

                # Add Secure flag in production for all cookies
                if on_heroku:
                    cookie['secure'] = True

                # Add SameSite attribute for CSRF protection
                if not cookie.get('samesite'):
                    # Use 'Strict' for session cookies, 'Lax' for others
                    if cookie_name == 'sessionid':
                        cookie['samesite'] = 'Strict'
                    else:
                        cookie['samesite'] = 'Lax'

        return response
