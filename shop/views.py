from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import ListView, DetailView, View, TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from django.db.models import Q
from django.http import JsonResponse, HttpResponseBadRequest
from django.urls import reverse
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.template.loader import render_to_string

from products.models import Product, Category
from .models import Cart, CartItem, Order, OrderItem, WishList
from .forms import CartAddProductForm, CheckoutForm


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
            self.current_category = get_object_or_404(Category, slug=category_slug)
            queryset = queryset.filter(category=self.current_category)
        else:
            self.current_category = None
        
        # Apply search filter if provided
        search_query = self.request.GET.get('q')
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query)
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


def product_list_ajax(request):
    """
    AJAX endpoint for dynamic product filtering
    """
    # Handle category filter
    category = request.GET.get('category')
    search = request.GET.get('search', '').lower()
    sort = request.GET.get('sort', 'name-asc')
    items_only = request.GET.get('items_only') == 'true'
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
        
        # Add wishlist state for the product
        if self.request.user.is_authenticated:
            try:
                wishlist = WishList.objects.get(user=self.request.user)
                context['in_wishlist'] = wishlist.has_product(product)
            except WishList.DoesNotExist:
                context['in_wishlist'] = False
        
        return context


class CartView(View):
    """
    View for displaying and managing shopping cart
    """
    template_name = 'shop/cart.html'
    
    def get(self, request):
        cart = request.cart
        return render(request, self.template_name, {'cart': cart})


def cart_add(request, product_id):
    """
    Add a product to the cart
    """
    product = get_object_or_404(Product, id=product_id, is_active=True)
    cart = request.cart
    
    if request.method == 'POST':
        form = CartAddProductForm(request.POST)
        if form.is_valid():
            quantity = form.cleaned_data['quantity']
            update = form.cleaned_data['update']
            
            # Don't allow more than available stock
            if quantity > product.stock_quantity:
                quantity = product.stock_quantity
                messages.warning(
                    request, 
                    f"Only {product.stock_quantity} units of this product are available."
                )
            
            cart.add_item(product, quantity, update_quantity=update)
            
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'cart_count': cart.item_count,
                    'cart_total': cart.total_price
                })
            
            messages.success(request, f"{product.name} has been added to your cart.")
            
            # Redirect back to product detail page
            if 'next' in request.POST:
                return redirect(request.POST.get('next'))
            
            return redirect('shop:cart')
    
    # If not a POST request or form invalid, redirect to product detail
    return redirect('shop:product_detail', slug=product.slug)


def cart_remove(request, product_id):
    """
    Remove a product from the cart
    """
    product = get_object_or_404(Product, id=product_id)
    cart = request.cart
    cart.remove_item(product)
    
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return JsonResponse({
            'success': True,
            'cart_count': cart.item_count,
            'cart_total': cart.total_price
        })
    
    messages.success(request, f"{product.name} has been removed from your cart.")
    return redirect('shop:cart')


def cart_update(request, product_id):
    """
    Update the quantity of a product in the cart
    """
    product = get_object_or_404(Product, id=product_id, is_active=True)
    cart = request.cart
    
    if request.method == 'POST':
        form = CartAddProductForm(request.POST)
        if form.is_valid():
            quantity = form.cleaned_data['quantity']
            
            # Don't allow more than available stock
            if quantity > product.stock_quantity:
                quantity = product.stock_quantity
                messages.warning(
                    request, 
                    f"Only {product.stock_quantity} units of this product are available."
                )
            
            cart_item = cart.add_item(product, quantity, update_quantity=True)
            
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'cart_count': cart.item_count,
                    'cart_total': cart.total_price,
                    'item_subtotal': cart_item.subtotal
                })
    
    # If not a POST request or form invalid, redirect to cart
    return redirect('shop:cart')


class CheckoutView(View):
    """
    View for processing checkout
    """
    template_name = 'shop/checkout.html'
    
    def get(self, request):
        cart = request.cart
        
        # Redirect to shop if cart is empty
        if cart.items.count() == 0:
            messages.warning(request, "Your cart is empty. Please add some products first.")
            return redirect('shop:product_list')
        
        # Pre-fill form with user info if available
        initial_data = {}
        if request.user.is_authenticated:
            initial_data = {
                'full_name': request.user.get_full_name(),
                'email': request.user.email
            }
        
        form = CheckoutForm(initial=initial_data)
        return render(request, self.template_name, {
            'cart': cart,
            'form': form
        })
    
    def post(self, request):
        cart = request.cart
        
        # Redirect to shop if cart is empty
        if cart.items.count() == 0:
            messages.warning(request, "Your cart is empty. Please add some products first.")
            return redirect('shop:product_list')
        
        form = CheckoutForm(request.POST)
        if form.is_valid():
            # Create the order
            order = form.save(commit=False)
            if request.user.is_authenticated:
                order.user = request.user
            
            # Set the total price
            order.total_price = cart.total_price
            order.save()
            
            # Create order items from cart
            cart.transfer_cart_items_to_order(order)
            
            # TODO: Process payment with Stripe
            
            # For now, we just mark the order as paid
            order.is_paid = True
            order.save()
            
            return redirect('shop:order_complete', order_id=order.id)
        
        return render(request, self.template_name, {
            'cart': cart,
            'form': form
        })


class OrderCompleteView(TemplateView):
    """
    View for displaying order completion page
    """
    template_name = 'shop/order_complete.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        order_id = kwargs.get('order_id')
        
        # Get the order
        if self.request.user.is_authenticated:
            # If user is logged in, check that order belongs to user
            order = get_object_or_404(
                Order, 
                id=order_id, 
                user=self.request.user
            )
        else:
            # Otherwise just get the order (should implement order session tracking for better security)
            order = get_object_or_404(Order, id=order_id)
        
        context['order'] = order
        return context


class OrderHistoryView(LoginRequiredMixin, ListView):
    """
    View for displaying a user's order history
    """
    model = Order
    template_name = 'shop/order_history.html'
    context_object_name = 'orders'
    paginate_by = 10
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')


# Additional views for future implementation

@login_required
def add_to_wishlist(request, product_id):
    """
    Add a product to the user's wishlist
    """
    product = get_object_or_404(Product, id=product_id, is_active=True)
    
    # Check if the user has a wishlist, create one if not
    try:
        wishlist = WishList.objects.get(user=request.user)
    except WishList.DoesNotExist:
        wishlist = WishList.objects.create(user=request.user)
    
    added = wishlist.add_product(product)
    
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return JsonResponse({
            'success': True,
            'added': added,
            'wishlist_count': wishlist.products.count()
        })
    
    if added:
        messages.success(request, f"{product.name} has been added to your wishlist.")
    else:
        messages.info(request, f"{product.name} is already in your wishlist.")
    
    # Redirect back to product detail page
    return redirect('shop:product_detail', slug=product.slug)


@login_required
def remove_from_wishlist(request, product_id):
    """
    Remove a product from the user's wishlist
    """
    product = get_object_or_404(Product, id=product_id)
    
    # Check if the user has a wishlist
    try:
        wishlist = WishList.objects.get(user=request.user)
        removed = wishlist.remove_product(product)
        
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({
                'success': True,
                'removed': removed,
                'wishlist_count': wishlist.products.count()
            })
        
        if removed:
            messages.success(request, f"{product.name} has been removed from your wishlist.")
        else:
            messages.info(request, f"{product.name} was not in your wishlist.")
            
    except WishList.DoesNotExist:
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({
                'success': False,
                'error': 'Wishlist not found'
            })
        messages.error(request, "You don't have a wishlist yet.")
    
    # Redirect back to product detail page or wishlist page
    if 'next' in request.GET:
        return redirect(request.GET.get('next'))
    
    return redirect('shop:product_detail', slug=product.slug)


class WishlistView(LoginRequiredMixin, ListView):
    """
    View for displaying a user's wishlist
    """
    template_name = 'shop/wishlist.html'
    context_object_name = 'wishlist_items'
    
    def get_queryset(self):
        try:
            wishlist = WishList.objects.get(user=self.request.user)
            return wishlist.products.all()
        except WishList.DoesNotExist:
            return Product.objects.none()
