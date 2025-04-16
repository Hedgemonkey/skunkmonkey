from django.db.models import Q
from django.utils import timezone

from ..models import RecentlyViewedItem


def track_product_view(request, product):
    """
    Track a product view and store it in recently viewed items.
    Works for both authenticated and anonymous users.

    Args:
        request: The HTTP request object
        product: The Product instance being viewed
    """
    if request.user.is_authenticated:
        # For authenticated users, store with user reference
        RecentlyViewedItem.objects.update_or_create(
            user=request.user,
            product=product,
            defaults={'viewed_at': timezone.now()}
        )

        # Limit to 10 most recent items
        if request.user.recently_viewed_items.count() > 10:
            oldest = request.user.recently_viewed_items.order_by(
                'viewed_at').first()
            if oldest:
                oldest.delete()
    else:
        # For anonymous users, store with session ID
        session_id = request.session.session_key
        if not session_id:
            request.session.create()
            session_id = request.session.session_key

        RecentlyViewedItem.objects.update_or_create(
            session_id=session_id,
            product=product,
            defaults={'viewed_at': timezone.now()}
        )

        # Limit to 10 most recent items
        if RecentlyViewedItem.objects.filter(
                session_id=session_id).count() > 10:
            oldest = RecentlyViewedItem.objects.filter(
                session_id=session_id
            ).order_by('viewed_at').first()
            if oldest:
                oldest.delete()


def apply_product_filters(queryset, category=None, search=None):
    """
    Apply category and search filters to a product queryset

    Args:
        queryset: The initial Product queryset
        category: Category ID or comma-separated list of category IDs
        search: Search query string

    Returns:
        Filtered queryset
    """
    # Apply category filter
    if category:
        # Check if we have multiple categories (comma-separated)
        if ',' in category:
            category_ids = [c for c in category.split(',') if c]
            if category_ids:
                # Filter products that have any of the selected categories
                queryset = queryset.filter(category_id__in=category_ids)
        else:
            # Single category case
            queryset = queryset.filter(category_id=category)

    # Apply search filter
    if search:
        queryset = queryset.filter(
            Q(name__icontains=search)
            | Q(description__icontains=search)
            | Q(category__name__icontains=search)
        )

    return queryset


def apply_product_sorting(queryset, sort='name-asc'):
    """
    Apply sorting to a product queryset

    Args:
        queryset: The Product queryset to sort
        sort: Sort parameter (
            name-asc,
            name-desc,
            price-asc,
            price-desc,
            newest
        )

    Returns:
        Sorted queryset
    """
    sort_mapping = {
        'name-asc': 'name',
        'name-desc': '-name',
        'price-asc': 'price',
        'price-desc': '-price',
        'newest': '-created_at',
    }
    return queryset.order_by(sort_mapping.get(sort, 'name'))


def get_sort_options():
    """
    Return a list of sort options for product filtering

    Returns:
        List of dictionaries with value and label keys
    """
    return [
        {'value': 'name-asc', 'label': 'Name (A-Z)'},
        {'value': 'name-desc', 'label': 'Name (Z-A)'},
        {'value': 'price-asc', 'label': 'Price (Low to High)'},
        {'value': 'price-desc', 'label': 'Price (High to Low)'},
        {'value': 'newest', 'label': 'Newest First'},
    ]
