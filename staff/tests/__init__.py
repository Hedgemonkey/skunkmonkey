"""
Test package for staff app
Contains tests for models, views, and other functionality of the staff app.
"""
# The following imports ensure that Django's test discovery finds all tests
from staff.tests.test_integration import *  # noqa
from staff.tests.test_models import *  # noqa
from staff.tests.test_user_views import *  # noqa
from staff.tests.test_views import *  # noqa
