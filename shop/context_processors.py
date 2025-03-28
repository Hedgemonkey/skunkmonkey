from .models import WishlistItem

def wishlist_processor(request):
    """
    Context processor that adds wishlist data to the context
    """
    context = {
        'wishlist_items': [],
        'wishlist_product_ids': [],
    }
    
    if request.user.is_authenticated:
        # Get the wishlist items for the user
        wishlist_items = WishlistItem.objects.filter(user=request.user).select_related('product')
        
        # Create a list of product IDs for easy checking
        product_ids = [item.product_id for item in wishlist_items]
        
        context['wishlist_items'] = wishlist_items
        context['wishlist_product_ids'] = product_ids
    
    return context
