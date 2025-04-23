"""
Custom middleware for the skunkmonkey project.
"""
from django.http import HttpResponse


class SourceMapIgnoreMiddleware:
    """
    Middleware that handles requests for source map files (.map) and returns
    an empty response. This prevents 404 errors in logs when browsers request
    source maps that don't exist.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Check if the request is for a source map file
        if request.path.endswith('.map'):
            # Return empty response with 200 status to prevent 404 errors
            return HttpResponse('',
                                content_type='application/json',
                                status=200)

        # Otherwise, pass the request to the next middleware/view
        response = self.get_response(request)
        return response
