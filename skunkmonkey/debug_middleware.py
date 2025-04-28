import traceback
import sys
from django.conf import settings

class ErrorLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_exception(self, request, exception):
        """Log detailed exception information."""
        print(f"CRITICAL EXCEPTION: {exception}")
        print("".join(traceback.format_exception(*sys.exc_info())))
        # Don't return anything to let Django handle the exception
        return None
