"""
Views for product display and management
"""
from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import ListView, DetailView, View
from django.db.models import Q, F, Count
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.utils import timezone
from django.contrib import messages
import logging

from products.models import Product, Category
from ..models import RecentlyViewedItem
from ..forms import CartAddProductForm
from .mixins import CartAccessMixin

logger = logging.getLogger(__name__)


def product_list_ajax(request):
    """
    AJAX endpoint for dynamic product filtering
    """
    try:
        # Handle category filter
        category = request.GET.get('category')
        search = request.GET.get('search', '').lower()
        sort = request.GET.get('sort', 'name-asc')
        items_only = request.GET.get('items_only') == 'true'
        count_only = request.GET.get('count_only') == 'true'

        products = Product.objects.filter(is_active=True)

        # Apply filters
        if category:
            if ',' in category:
                category_ids = [c for c in category.split(',') if c]
                if category_ids:
                    products = products.filter(category_id__in=category_ids)
            else:
                products = products.filter(category_id=category)

        if search:
            products = products.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(category__name__icontains=search)
            )

        # Apply sorting
        sort_mapping = {
            'name-asc': 'name',
            'name-desc': '-name',
            'price-asc': 'price',
            'price-desc': '-price',
            'newest': '-created_at',
            'popularity': '-view_count',  # If you track view counts
        }
        products = products.order_by(sort_mapping.get(sort, 'name'))

        product_count = products.count()

        if count_only:
            return JsonResponse({
                'count': product_count,
                'total_count': Product.objects.filter(is_active=True).count()
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

            return JsonResponse({
                'html': html,
                'count': product_count,
                'total_count': Product.objects.filter(is_active=True).count()
            })

    except Exception as e:
        logger.error(f"Error in product_list_ajax: {e}")
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({
                'error': 'An error occurred while fetching products'
            }, status=500)

    return redirect('shop:product_list')


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

        # Category filtering
        category_slug = self.kwargs.get('category_slug')
        if category_slug:
            self.current_category = get_object_or_404(
                Category, slug=category_slug)
            queryset = queryset.filter(category=self.current_category)
        else:
            self.current_category = None

        # Search filtering
        search_query = self.request.GET.get('q')
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(category__name__icontains=search_query)
            )
        self.search_query = search_query

        # Sorting
        sort = self.request.GET.get('sort', 'name-asc')
        sort_mapping = {
            'name-asc': 'name',
            'name-desc': '-name',
            'price-asc': 'price',
            'price-desc': '-price',
            'newest': '-created_at',
            'popularity': '-view_count',  # If you track view counts
        }
        
        self.current_sort = sort
        return queryset.order_by(sort_mapping.get(sort, 'name'))

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Add categories for sidebar navigation
        context['categories'] = Category.objects.all()
        context['current_category'] = getattr(self, 'current_category', None)
        context['search_query'] = getattr(self, 'search_query', '')
        context['current_sort'] = getattr(self, 'current_sort', 'name-asc')
        
        # Fix: Add selected_categories for filter_controls.html
        context['selected_categories'] = self.request.GET.getlist('category') if self.request.GET.getlist('category') else []
        
        # Add sort options
        context['sort_options'] = [
            {'value': 'name-asc', 'text': 'Name (A-Z)'},
            {'value': 'name-desc', 'text': 'Name (Z-A)'},
            {'value': 'price-asc', 'text': 'Price (Low to High)'},
            {'value': 'price-desc', 'text': 'Price (High to Low)'},
            {'value': 'newest', 'text': 'Newest First'},
        ]
        
        # Ensure wishlist_items is always defined
        if self.request.user.is_authenticated:
            from ..models import WishlistItem
            context['wishlist_items'] = WishlistItem.objects.filter(user=self.request.user)
            context['wishlist_product_ids'] = list(context['wishlist_items'].values_list('product_id', flat=True))
        else:
            context['wishlist_items'] = []
            context['wishlist_product_ids'] = []
        
        # Initialize other potentially used context variables to avoid None references
        context['comparison_list'] = getattr(self, 'comparison_list', None)
        
        return context


class ProductDetailView(CartAccessMixin, DetailView):
    """
    View for displaying a single product with add to cart form
    """
    model = Product
    template_name = 'shop/product_detail.html'
    context_object_name = 'product'
    
    def get_queryset(self):
        # Only show active products
        return Product.objects.filter(is_active=True)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Add cart form
        context['cart_product_form'] = CartAddProductForm()
        
        # Add related products
        product = self.get_object()
        context['related_products'] = Product.objects.filter(
            category=product.category,
            is_active=True
        ).exclude(id=product.id)[:4]
        
        # Track view if user is authenticated
        if self.request.user.is_authenticated:
            # Add to recently viewed
            RecentlyViewedItem.objects.update_or_create(
                user=self.request.user,
                product=product,
                defaults={'viewed_at': timezone.now()}
            )
            
        return context


class ProductSearchView(ListView):
    """
    View for searching products
    """
    model = Product
    template_name = 'shop/product_search.html'
    context_object_name = 'products'
    paginate_by = 12
    
    def get_queryset(self):
        query = self.request.GET.get('q', '')
        self.query = query
        
        if query:
            return Product.objects.filter(
                Q(name__icontains=query) |
                Q(description__icontains=query) |
                Q(category__name__icontains=query),
                is_active=True
            )
        return Product.objects.none()
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['query'] = getattr(self, 'query', '')
        context['categories'] = Category.objects.all()
        return context
