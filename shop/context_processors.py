from .models import ComparisonList, WishlistItem


def wishlist_processor(request):
    """
    Context processor to make wishlist information available in all templates.
    """
    wishlist_items = []
    wishlist_product_ids = []

    if request.user.is_authenticated:
        # Get the user's wishlist items
        wishlist_items = WishlistItem.objects.filter(
            user=request.user).select_related('product')

        # Extract product IDs
        wishlist_product_ids = [
            item.product.id for item in wishlist_items if item.product]

    return {
        'wishlist_items': wishlist_items,
        'wishlist_product_ids': wishlist_product_ids,
    }


def comparison_processor(request):
    """
    Context processor to make comparison information available in all
    templates.
    """
    comparison_product_ids = []
    comparison_count = 0

    if request.user.is_authenticated:
        # Get the user's comparison list
        try:
            comparison_list = ComparisonList.objects.get(user=request.user)
            comparison_product_ids = list(
                comparison_list.products.values_list('id', flat=True)
            )
            comparison_count = len(comparison_product_ids)
        except ComparisonList.DoesNotExist:
            pass
    else:
        # Get from session for anonymous users
        comparison_list = request.session.get('comparison', [])
        comparison_product_ids = comparison_list
        comparison_count = len(comparison_list)

    return {
        'comparison_product_ids': comparison_product_ids,
        'comparison_count': comparison_count,
    }
