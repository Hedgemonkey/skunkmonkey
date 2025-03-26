import uuid
import decimal
from django.db import models
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404, redirect
from django.views.generic import ListView, DetailView
from django.db.models import Q
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.utils import timezone
from django.conf import settings
from django.utils.text import slugify
from django.urls import reverse

from products.models import Product, Category



class Cart(models.Model):
    """
    Shopping cart model
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    session_id = models.CharField(max_length=255, null=True, blank=True)
    
    class Meta:
        ordering = ('-created_at',)
        verbose_name = 'Cart'
        verbose_name_plural = 'Carts'
    
    def __str__(self):
        if self.user:
            return f"Cart for {self.user.username}"
        return f"Cart {self.id} (session: {self.session_id[:8]}...)"
    
    def __len__(self):
        """
        Return the number of items in the cart
        """
        return self.items.count()
    
    @property
    def total_price(self):
        """
        Calculate total price of all items in the cart
        """
        return sum(item.total_price for item in self.items.all())
    
    def add(self, product, quantity=1, update_quantity=False):
        """
        Add a product to the cart or update its quantity
        """
        cart_item, created = CartItem.objects.get_or_create(
            cart=self,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            if update_quantity:
                cart_item.quantity = quantity
            else:
                cart_item.quantity += quantity
            cart_item.save()
        
        return cart_item
    
    def remove(self, product):
        """
        Remove a product from the cart
        """
        try:
            item = CartItem.objects.get(cart=self, product=product)
            item.delete()
        except CartItem.DoesNotExist:
            pass
    
    def clear(self):
        """
        Remove all items from the cart
        """
        self.items.all().delete()
    
    def to_dict(self):
        """
        Convert cart to dictionary for serialization
        """
        return {
            'id': self.id,
            'user': self.user.username if self.user else None,
            'items': [
                {
                    'product_id': item.product.id,
                    'product_name': item.product.name,
                    'quantity': item.quantity,
                    'price': str(item.price),
                    'total_price': str(item.total_price)
                } for item in self.items.all()
            ],
            'total_price': str(self.total_price)
        }


class CartItem(models.Model):
    """
    Items in a shopping cart
    """
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ('-added_at',)
        verbose_name = 'Cart Item'
        verbose_name_plural = 'Cart Items'
        unique_together = ('cart', 'product')
    
    def __str__(self):
        return f"{self.quantity} x {self.product.name} in cart {self.cart.id}"
    
    @property
    def price(self):
        """
        Get the current price of the product
        """
        return self.product.price
    
    @property
    def total_price(self):
        """
        Calculate total price for this item
        """
        return self.price * self.quantity


class Order(models.Model):
    """
    Customer order model
    """
    STATUS_CHOICES = (
        ('created', 'Created'),
        ('paid', 'Paid'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )
    
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )
    
    order_number = models.CharField(max_length=32, unique=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    full_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20, blank=True)
    
    # Shipping address
    shipping_address1 = models.CharField(max_length=100)
    shipping_address2 = models.CharField(max_length=100, blank=True)
    shipping_city = models.CharField(max_length=100)
    shipping_state = models.CharField(max_length=100)
    shipping_zipcode = models.CharField(max_length=20)
    shipping_country = models.CharField(max_length=100)
    
    # Billing address
    billing_address1 = models.CharField(max_length=100)
    billing_address2 = models.CharField(max_length=100, blank=True)
    billing_city = models.CharField(max_length=100)
    billing_state = models.CharField(max_length=100)
    billing_zipcode = models.CharField(max_length=20)
    billing_country = models.CharField(max_length=100)
    
    # Order details
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='created')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    grand_total = models.DecimalField(max_digits=10, decimal_places=2, help_text="Total price including shipping")
    
    # Payment details
    stripe_pid = models.CharField(max_length=255, blank=True, null=True)
    stripe_client_secret = models.CharField(max_length=255, blank=True, null=True)
    original_cart = models.TextField(blank=True, null=True)
    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    # Shipping details
    shipped_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    tracking_number = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ('-created_at',)
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
    
    def __str__(self):
        return f"Order {self.order_number}"
    
    def save(self, *args, **kwargs):
        """
        Override save method to generate order number if it doesn't exist
        """
        if not self.order_number:
            self.order_number = self._generate_order_number()
        
        # Calculate grand total if not set
        if not self.grand_total and self.total_price is not None:
            self.grand_total = decimal.Decimal(self.total_price) + decimal.Decimal(self.shipping_cost)
            
        super().save(*args, **kwargs)
    
    def _generate_order_number(self):
        """
        Generate a random, unique order number using UUID
        """
        return uuid.uuid4().hex.upper()[:8]
    
    def mark_as_paid(self):
        """
        Mark the order as paid
        """
        self.is_paid = True
        self.status = 'paid'
        self.payment_status = 'completed'
        self.paid_at = timezone.now()
        self.save()
    
    def mark_as_shipped(self, tracking_number=None):
        """
        Mark the order as shipped
        """
        self.status = 'shipped'
        self.shipped_at = timezone.now()
        if tracking_number:
            self.tracking_number = tracking_number
        self.save()
    
    def mark_as_delivered(self):
        """
        Mark the order as delivered
        """
        self.status = 'delivered'
        self.delivered_at = timezone.now()
        self.save()
    
    def cancel(self):
        """
        Cancel the order
        """
        self.status = 'cancelled'
        self.save()
    
    def get_total_items(self):
        """
        Get the total number of items in the order
        """
        return sum(item.quantity for item in self.items.all())
    
    def get_absolute_url(self):
        """
        Get the absolute URL for this order
        """
        return reverse('shop:order_detail', args=[self.id])


class OrderItem(models.Model):
    """
    Items in a customer order
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Price at time of purchase")
    
    class Meta:
        verbose_name = 'Order Item'
        verbose_name_plural = 'Order Items'
    
    def __str__(self):
        return f"{self.quantity} x {self.product.name} in order {self.order.order_number}"
    
    @property
    def total_price(self):
        """
        Calculate total price for this item
        """
        return self.price * self.quantity


class WishlistItem(models.Model):
    """
    Products in a user's wishlist
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ('-added_at',)
        verbose_name = 'Wishlist Item'
        verbose_name_plural = 'Wishlist Items'
        unique_together = ('user', 'product')
    
    def __str__(self):
        return f"{self.product.name} in {self.user.username}'s wishlist"


class RecentlyViewedItem(models.Model):
    """
    Products recently viewed by a user
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recently_viewed')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    viewed_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ('-viewed_at',)
        verbose_name = 'Recently Viewed Item'
        verbose_name_plural = 'Recently Viewed Items'
        unique_together = ('user', 'product')
    
    def __str__(self):
        return f"{self.product.name} viewed by {self.user.username}"


class ComparisonList(models.Model):
    """
    Products in a user's comparison list
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comparison_lists')
    products = models.ManyToManyField(Product, related_name='in_comparisons')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length=100, default="My Comparison")
    
    class Meta:
        ordering = ('-updated_at',)
        verbose_name = 'Comparison List'
        verbose_name_plural = 'Comparison Lists'
    
    def __str__(self):
        return f"{self.name} for {self.user.username}"


class CartAccessMixin:
    """
    Mixin for views that require access to the cart.
    """
    def dispatch(self, request, *args, **kwargs):
        self.cart = request.cart
        return super().dispatch(request, *args, **kwargs)


def product_list_ajax(request):
    """
    AJAX endpoint for dynamic product filtering
    """
    category = request.GET.get('category')
    search = request.GET.get('search', '').lower()
    sort = request.GET.get('sort', 'name-asc')
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
    }
    products = products.order_by(sort_mapping.get(sort, 'name'))

    product_count = products.count()

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

        return JsonResponse({
            'html': html,
            'count': product_count,
            'total_count': product_count
        })

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

        category_slug = self.kwargs.get('category_slug')
        if category_slug:
            self.current_category = get_object_or_404(
                Category, slug=category_slug)
            queryset = queryset.filter(category=self.current_category)
        else:
            self.current_category = None

        search_query = self.request.GET.get('q')
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query)
            )
        self.search_query = search_query

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
            queryset = queryset.order_by('name')

        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categories'] = Category.objects.all()
        context['current_category'] = getattr(self, 'current_category', None)
        context['search_query'] = getattr(self, 'search_query', None)

        context['sort_options'] = [
            {'value': 'name-asc', 'label': 'Name (A-Z)'},
            {'value': 'name-desc', 'label': 'Name (Z-A)'},
            {'value': 'price-asc', 'label': 'Price (Low to High)'},
            {'value': 'price-desc', 'label': 'Price (High to Low)'},
            {'value': 'newest', 'label': 'Newest First'},
        ]

        return context


class ProductDetailView(CartAccessMixin, DetailView):
    """
    View for displaying product details
    """
    model = Product
    template_name = 'shop/product_detail.html'
    context_object_name = 'product'

    def get(self, request, *args, **kwargs):
        response = super().get(request, *args, **kwargs)

        product = self.object

        # Track this product view
