from .models import Cart, ComparisonList, RecentlyViewedItem
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


class ComparisonMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Get or create comparison list for the current user/session
        if request.user.is_authenticated:
            comparison_list, created = ComparisonList.objects.get_or_create(
                user=request.user
            )
        else:
            session_id = request.session.get('comparison_id')
            if not session_id:
                # If no session ID exists, create a new comparison list with a new session ID
                session_id = str(uuid.uuid4())
                request.session['comparison_id'] = session_id
                comparison_list = ComparisonList.objects.create(session_id=session_id)
            else:
                comparison_list, created = ComparisonList.objects.get_or_create(
                    session_id=session_id
                )
        
        # Attach the comparison list to the request
        request.comparison_list = comparison_list
        request.comparison_list.product_ids = [
            product.id for product in comparison_list.products.all()
        ]
        
        response = self.get_response(request)
        return response