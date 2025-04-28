"""
Staff middleware to handle profile attribute naming
"""


class StaffProfileMiddleware:
    """
    Middleware to handle the staffprofile vs staff_profile naming
    inconsistency.

    This middleware adds a staffprofile attribute to User objects if they have
    a staff_profile attribute, ensuring templates can access either name.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Process the request
        if request.user.is_authenticated and hasattr(request.user,
                                                     'staff_profile'):
            # Add staffprofile attribute that points to the same object as
            # staff_profile
            setattr(request.user, 'staffprofile', request.user.staff_profile)

        response = self.get_response(request)
        return response
