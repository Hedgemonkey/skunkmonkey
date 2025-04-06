from .models import WishlistItem

def wishlist_processor(request):
    """
    Context processor to make wishlist information available in all templates.
    """
    wishlist_items = []
    wishlist_product_ids = []
    
    if request.user.is_authenticated:
        # Get the user's wishlist items
        wishlist_items = WishlistItem.objects.filter(user=request.user).select_related('product')
        
        # Extract product IDs
        wishlist_product_ids = [item.product.id for item in wishlist_items if item.product]
    
    return {
        'wishlist_items': wishlist_items,
        'wishlist_product_ids': wishlist_product_ids,
    }
