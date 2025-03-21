from .models import Cart
import uuid

class CartMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Get or create cart for the current user/session
        if request.user.is_authenticated:
            cart, created = Cart.objects.get_or_create(user=request.user)
        else:
            session_id = request.session.get('cart_id')
            if not session_id:
                # If no session ID exists, create a new cart with a new session ID
                session_id = str(uuid.uuid4())
                request.session['cart_id'] = session_id
                cart = Cart.objects.create(session_id=session_id)
            else:
                cart, created = Cart.objects.get_or_create(session_id=session_id)
        
        # Attach the cart to the request
        request.cart = cart
        
        response = self.get_response(request)
        return response