"""
Shop application views
This main views.py file acts as an entry point that imports views
from the views directory for backwards compatibility
"""

# Import necessary Django modules
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect
from django.template.loader import render_to_string
from django.utils import timezone
from django.views.generic import DetailView, ListView

# Import models and forms
from products.models import Product
from shop.forms import CartAddProductForm
from shop.models import Category, RecentlyViewedItem
# Import specific views from subdirectories
from shop.views.product_views import ProductSearchView

# For backwards compatibility, expose the main views at the module level
__all__ = [
    # Product views
    'ProductListView', 'ProductDetailView',
    'ProductSearchView', 'product_list_ajax',
]


def product_list_ajax(request):
    """
    AJAX endpoint for dynamic product filtering
    """
    # Handle category filter
    category = request.GET.get('category')
    search = request.GET.get('search', '').lower()
    sort = request.GET.get('sort', 'name-asc')
    # Get whether we only want count or items,
    # but don't store in unused variable
    count_only = request.GET.get('count_only') == 'true'

    products = Product.objects.filter(is_active=True)

    # Apply filters
    if category:
        # Check if we have multiple categories (comma-separated)
        if ',' in category:
            category_ids = [c for c in category.split(',') if c]
            if category_ids:
                # Filter products that have any of the selected categories
                products = products.filter(category_id__in=category_ids)
        else:
            # Single category case
            products = products.filter(category_id=category)

    if search:
        products = products.filter(
            Q(name__icontains=search)
            | Q(description__icontains=search)
            | Q(category__name__icontains=search)
        )

    # Apply sorting
    sort_mapping = {
        'name-asc': 'name',
        'name-desc': '-name',
        'price-asc': 'price',
        'price-desc': '-price',
        'newest': '-created_at',
    }
    products = products.order_by(sort_mapping.get(sort, 'name'))

    # Get the total count before any pagination
    product_count = products.count()

    # If we only want the count, return it immediately without rendering HTML
    if count_only:
        return JsonResponse({
            'count': product_count,
            'total_count': product_count
        })

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        context = {
            'products': products,
            'search': search,
            'current_sort': sort,
        }

        html = render_to_string(
            'shop/includes/product_grid.html',
            context,
            request=request
        )

        # Return both the HTML and the product count in the JSON response
        return JsonResponse({
            'html': html,
            'count': product_count,
            'total_count': product_count
        })

    # Fallback for non-AJAX requests
    return redirect('shop:product_list')


class ProductDetailView(DetailView):
    """
    View for displaying product details
    """
    model = Product
    template_name = 'shop/product_detail.html'
    context_object_name = 'product'

    def get(self, request, *args, **kwargs):
        response = super().get(request, *args, **kwargs)

        # Track this product view
        product = self.object

        # Store in recently viewed items
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

        return response

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        product = self.get_object()

        # Get related products (same category, excluding current product)
        related_products = Product.objects.filter(
            category=product.category,
            is_active=True
        ).exclude(id=product.id)[:4]

        context['related_products'] = related_products
        context['form'] = CartAddProductForm()

        return context


class ProductListView(ListView):
    """
    View for displaying products, with optional category filtering and search
    """
    model = Product
    template_name = 'shop/product_list.html'
    context_object_name = 'products'
    paginate_by = 12

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)

        # Apply category filter if provided
        category_slug = self.kwargs.get('category_slug')
        if category_slug:
            self.current_category = get_object_or_404(
                Category, slug=category_slug)
            queryset = queryset.filter(category=self.current_category)
        else:
            self.current_category = None

        # Apply search filter if provided
        search_query = self.request.GET.get('q')
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query)
                | Q(description__icontains=search_query)
            )
        self.search_query = search_query

        # Apply sorting if provided
        sort = self.request.GET.get('sort')
        if sort == 'name-asc':
            queryset = queryset.order_by('name')
        elif sort == 'name-desc':
            queryset = queryset.order_by('-name')
        elif sort == 'price-asc':
            queryset = queryset.order_by('price')
        elif sort == 'price-desc':
            queryset = queryset.order_by('-price')
        elif sort == 'newest':
            queryset = queryset.order_by('-created_at')
        else:
            # Default sorting
            queryset = queryset.order_by('name')

        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categories'] = Category.objects.all()
        context['current_category'] = getattr(self, 'current_category', None)
        context['search_query'] = getattr(self, 'search_query', None)

        # Add sort options for the filter controls
        context['sort_options'] = [
            {'value': 'name-asc', 'label': 'Name (A-Z)'},
            {'value': 'name-desc', 'label': 'Name (Z-A)'},
            {'value': 'price-asc', 'label': 'Price (Low to High)'},
            {'value': 'price-desc', 'label': 'Price (High to Low)'},
            {'value': 'newest', 'label': 'Newest First'},
        ]

        return context
