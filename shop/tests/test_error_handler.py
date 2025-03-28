from django.test import TestCase, RequestFactory
from django.contrib.messages.storage.fallback import FallbackStorage
from django.contrib.messages import get_messages
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

from ..utils.error_handling import ErrorHandler
from ..forms import CartAddProductForm

User = get_user_model()

class ErrorHandlerTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        # Create a request
        self.request = self.factory.get('/')
        # Create a session
        middleware = SessionMiddleware(lambda x: x)
        middleware.process_request(self.request)
        self.request.session.save()
        # Create the message storage
        setattr(self.request, '_messages', FallbackStorage(self.request))
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser', 
            email='test@example.com', 
            password='testpass123'
        )
    
    def test_handle_form_errors(self):
        """Test handling form errors"""
        # Create a form with invalid data
        form = CartAddProductForm(data={'quantity': 'invalid'})
        # Form should not be valid
        self.assertFalse(form.is_valid())
        
        # Handle the form errors
        ErrorHandler.handle_form_errors(self.request, form, 'test_form')
        
        # Check that messages were added
        messages = list(get_messages(self.request))
        self.assertTrue(len(messages) > 0)
        # Check message content contains field name
        self.assertIn('Quantity', str(messages[0]))
    
    def test_handle_validation_error(self):
        """Test handling validation errors"""
        # Create a validation error
        error = ValidationError('Test validation error')
        
        # Handle the validation error
        ErrorHandler.handle_validation_error(self.request, error, 'test_operation')
        
        # Check that messages were added
        messages = list(get_messages(self.request))
        self.assertEqual(len(messages), 1)
        self.assertIn('Test validation error', str(messages[0]))
    
    def test_handle_multiple_validation_errors(self):
        """Test handling multiple validation errors"""
        # Create a validation error with multiple messages
        error = ValidationError({
            'field1': ['Error 1', 'Error 2'],
            'field2': ['Error 3']
        })
        
        # Handle the validation error
        ErrorHandler.handle_validation_error(self.request, error, 'test_operation')
        
        # Check that messages were added
        messages = list(get_messages(self.request))
        self.assertEqual(len(messages), 3)
        message_texts = [str(msg) for msg in messages]
        self.assertIn('Field1: Error 1', message_texts)
        self.assertIn('Field1: Error 2', message_texts)
        self.assertIn('Field2: Error 3', message_texts)
    
    def test_handle_exception(self):
        """Test handling general exceptions"""
        # Create an exception
        exception = Exception('Test exception')
        
        # Handle the exception
        ErrorHandler.handle_exception(self.request, exception, 'test_operation')
        
        # Check that messages were added
        messages = list(get_messages(self.request))
        self.assertEqual(len(messages), 1)
        self.assertIn('unexpected error', str(messages[0]))
    
    def test_log_action_success(self):
        """Test logging successful actions"""
        # Call log_action with success=True
        ErrorHandler.log_action(
            action='test_action',
            user=self.user,
            data={'test_key': 'test_value'},
            success=True
        )
        # We can't directly check the log output in a unit test,
        # but we can ensure the method doesn't raise exceptions
    
    def test_log_action_failure(self):
        """Test logging failed actions"""
        # Call log_action with success=False
        ErrorHandler.log_action(
            action='test_action',
            user=self.user,
            data={'test_key': 'test_value'},
            success=False
        )
        # We can't directly check the log output in a unit test,
        # but we can ensure the method doesn't raise exceptions