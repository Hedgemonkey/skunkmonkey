# staff/views/product_views.py
import base64
import json  # Add this import for JSON serialization
import logging
from decimal import Decimal

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.files.base import ContentFile
from django.core.paginator import Paginator  # noqa F401
from django.db import models, transaction  # noqa F401
from django.db.models import Avg, Count, Max, Min, Q, Sum
from django.http import HttpResponseBadRequest, JsonResponse  # noqa F401
from django.shortcuts import get_object_or_404, redirect, render  # noqa F401
from django.urls import reverse
from django.views.decorators.http import require_POST
from django.views.generic import CreateView, DetailView, ListView, UpdateView

from products.forms import CategoryForm, ProductForm
from products.models import Category, InventoryLog, Product
from staff.mixins import StaffAccessMixin

logger = logging.getLogger(__name__)


class ProductDashboardView(StaffAccessMixin, ListView):
    """Main product dashboard view for staff."""
    template_name = 'staff/product/dashboard.html'
    context_object_name = 'recent_products'
    model = Product
    paginate_by = 5

    def get_queryset(self):
        """Get the most recently added products."""
        return Product.objects.select_related('category').order_by(
            '-created_at')[:5]

    def get_context_data(self, **kwargs):
        """Add context data needed for the product dashboard."""
        context = super().get_context_data(**kwargs)

        # Product stats
        context['total_products'] = Product.objects.count()
        context['active_products'] = Product.objects.filter(
            is_active=True).count()
        context['out_of_stock'] = Product.objects.filter(
            stock_quantity=0).count()
        context['total_categories'] = Category.objects.count()

        # Category breakdown (for chart)
        category_breakdown = (
            Category.objects.annotate(product_count=Count('products'))
            .filter(product_count__gt=0)
            .order_by('-product_count')[:10]
        )
        context['category_breakdown'] = category_breakdown

        # Format category data for chart.js - ensure we have valid JSON
        # Add debug logging to trace values
        category_names = ([cat.name for cat in category_breakdown]
                          if category_breakdown else [])
        category_counts = ([cat.product_count for cat in category_breakdown]
                           if category_breakdown else [])

        # Log the actual values to trace what's happening
        logger.debug(f"Chart data (categories): {category_names}")
        logger.debug(f"Chart values (counts): {category_counts}")

        # Use single quotes for JSON data to avoid conflicts with HTML
        # attributes
        context['category_labels'] = json.dumps(category_names)
        context['category_values'] = json.dumps(category_counts)

        # Price statistics
        price_stats = Product.objects.aggregate(
            min_price=Min('price'),
            max_price=Max('price'),
            avg_price=Avg('price')
        )
        context['price_stats'] = price_stats

        # Generate price range data for chart
        price_ranges = [
            {'min': 0, 'max': 10, 'label': '$0-$10'},
            {'min': 10, 'max': 50, 'label': '$10-$50'},
            {'min': 50, 'max': 100, 'label': '$50-$100'},
            {'min': 100, 'max': 500, 'label': '$100-$500'},
            {'min': 500, 'max': 1000, 'label': '$500-$1000'},
            {'min': 1000, 'max': None, 'label': '$1000+'}
        ]

        price_range_data = []
        price_range_labels = []

        for price_range in price_ranges:
            query = Q(price__gte=price_range['min'])
            if price_range['max'] is not None:
                query &= Q(price__lt=price_range['max'])

            count = Product.objects.filter(query).count()
            price_range_data.append(count)
            price_range_labels.append(price_range['label'])

        # Log the price range data to trace what's happening
        logger.debug(f"Price range labels: {price_range_labels}")
        logger.debug(f"Price range data: {price_range_data}")

        # Use single quotes for JSON data
        context['price_range_labels'] = json.dumps(price_range_labels)
        context['price_range_values'] = json.dumps(price_range_data)

        # Calculate total stock value
        stock_value = Product.objects.aggregate(
            total=Sum(models.F('price') * models.F('stock_quantity'))
        )
        context['total_stock_value'] = stock_value['total'] or 0

        # Calculate low stock count for dashboard
        context['low_stock'] = Product.objects.filter(
            stock_quantity__gt=0, stock_quantity__lte=5).count()

        return context


class ProductListView(StaffAccessMixin, ListView):
    """Staff product list with filtering and pagination."""
    template_name = 'staff/product/product_list.html'
    context_object_name = 'products'
    model = Product
    paginate_by = 20

    def get_queryset(self):
        """Apply filters to the queryset."""
        queryset = Product.objects.select_related('category').all()

        # Apply search filter
        search_query = self.request.GET.get('search', '')
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query)
                | Q(description__icontains=search_query)
                | Q(slug__icontains=search_query)
            )

        # Apply category filter
        category = self.request.GET.get('category')
        if category:
            queryset = queryset.filter(category_id=category)

        # Apply stock status filter
        stock_status = self.request.GET.get('stock_status')
        if stock_status:
            if stock_status == 'out_of_stock':
                queryset = queryset.filter(stock_quantity=0)
            elif stock_status == 'low_stock':
                queryset = queryset.filter(
                    stock_quantity__gt=0,
                    stock_quantity__lte=5
                )
            elif stock_status == 'in_stock':
                queryset = queryset.filter(stock_quantity__gt=5)

        # Apply product status filter
        status = self.request.GET.get('status')
        if status:
            if status == 'active':
                queryset = queryset.filter(is_active=True)
            elif status == 'inactive':
                queryset = queryset.filter(is_active=False)

        # Apply sorting
        sort_option = self.request.GET.get('sort', 'name-asc')
        sort_mappings = {
            'name-asc': 'name',
            'name-desc': '-name',
            'price-asc': 'price',
            'price-desc': '-price',
            'stock-asc': 'stock_quantity',
            'stock-desc': '-stock_quantity',
            'category-asc': 'category__name',
            'category-desc': '-category__name',
            'newest': '-created_at',
            'oldest': 'created_at',
        }
        queryset = queryset.order_by(sort_mappings.get(sort_option, 'name'))

        return queryset

    def get_context_data(self, **kwargs):
        """Add additional context data."""
        context = super().get_context_data(**kwargs)

        # Add filter context
        context['search_query'] = self.request.GET.get('search', '')
        context['selected_category'] = self.request.GET.get('category')
        context['stock_status'] = self.request.GET.get('stock_status', '')
        context['status'] = self.request.GET.get('status', '')
        context['current_sort'] = self.request.GET.get('sort', 'name-asc')

        # Add status counts
        context['total_count'] = Product.objects.count()
        context['active_products'] = Product.objects.filter(
            is_active=True).count()
        context['inactive_products'] = Product.objects.filter(
            is_active=False).count()
        context['out_of_stock'] = Product.objects.filter(
            stock_quantity=0).count()
        context['low_stock'] = Product.objects.filter(
            stock_quantity__gt=0, stock_quantity__lte=5).count()

        # Add filter options for select fields
        context['categories'] = Category.objects.all().order_by('name')
        context['stock_status_options'] = [
            {'value': '', 'label': 'All Stock Statuses'},
            {'value': 'in_stock', 'label': 'In Stock'},
            {'value': 'low_stock', 'label': 'Low Stock (≤ 5)'},
            {'value': 'out_of_stock', 'label': 'Out of Stock'},
        ]
        context['status_options'] = [
            {'value': '', 'label': 'All Statuses'},
            {'value': 'active', 'label': 'Active'},
            {'value': 'inactive', 'label': 'Inactive'},
        ]
        context['sort_options'] = [
            {'value': 'name-asc', 'label': 'Name (A-Z)'},
            {'value': 'name-desc', 'label': 'Name (Z-A)'},
            {'value': 'price-asc', 'label': 'Price (Low to High)'},
            {'value': 'price-desc', 'label': 'Price (High to Low)'},
            {'value': 'stock-asc', 'label': 'Stock (Low to High)'},
            {'value': 'stock-desc', 'label': 'Stock (High to Low)'},
            {'value': 'category-asc', 'label': 'Category (A-Z)'},
            {'value': 'category-desc', 'label': 'Category (Z-A)'},
            {'value': 'newest', 'label': 'Newest First'},
            {'value': 'oldest', 'label': 'Oldest First'},
        ]

        # Calculate total stock value for the header stats
        stock_value = Product.objects.aggregate(
            total=Sum(models.F('price') * models.F('stock_quantity'))
        )
        context['total_stock_value'] = stock_value['total'] or 0

        return context


class ProductDetailView(StaffAccessMixin, DetailView):
    """Staff product detail view with additional product information."""
    model = Product
    template_name = 'staff/product/product_detail.html'
    context_object_name = 'product'

    def get_context_data(self, **kwargs):
        """Add additional context data for product details."""
        context = super().get_context_data(**kwargs)
        product = self.get_object()

        # Get inventory history
        inventory_logs = InventoryLog.objects.filter(
            product=product
        ).order_by('-created_at')[:10]
        context['inventory_logs'] = inventory_logs

        # Get related products
        context['related_products'] = (
            Product.objects.filter(category=product.category)
            .exclude(id=product.id)[:3]
        )

        # Check for product reviews
        context['review_count'] = product.reviews.count()

        # Get sales data if Shop app is available
        try:
            from shop.models import OrderItem

            # Total units sold
            order_items = OrderItem.objects.filter(
                product=product,
                order__status__in=['completed', 'shipped', 'delivered']
            )
            units_sold = order_items.aggregate(
                total=Sum('quantity')
            )['total'] or 0

            # Total revenue - fix aggregate computation
            # Using ExpressionWrapper to properly handle F() expressions in
            # arithmetic operations
            from django.db.models import ExpressionWrapper, FloatField
            revenue = order_items.aggregate(
                total=Sum(ExpressionWrapper(
                    models.F('price') * models.F('quantity'),
                    output_field=FloatField()))
            )['total'] or 0

            context['sales_data'] = {
                'total_units': units_sold,
                'total_revenue': revenue
            }

            # Monthly sales - last 6 months
            from datetime import timedelta

            from django.db.models.functions import TruncMonth
            from django.utils import timezone

            six_months_ago = timezone.now() - timedelta(days=180)
            monthly_sales = OrderItem.objects.filter(
                product=product,
                order__status__in=['completed', 'shipped', 'delivered'],
                order__created_at__gte=six_months_ago
            ).annotate(
                month=TruncMonth('order__created_at')
            ).values('month').annotate(
                quantity=Sum('quantity'),
                revenue=Sum(models.F('price') * models.F('quantity'))
            ).order_by('month')

            context['monthly_sales'] = monthly_sales

        except (ImportError, ModuleNotFoundError):
            # Shop module not available
            context['sales_data'] = {
                'total_units': 0,
                'total_revenue': 0
            }
            context['monthly_sales'] = []

        return context


class ProductCreateView(StaffAccessMixin, CreateView):
    """Staff product creation view."""
    model = Product
    form_class = ProductForm
    template_name = 'staff/product/product_form.html'

    def get_success_url(self):
        """Redirect to product list after successful creation."""
        messages.success(self.request, "Product created successfully.")
        return reverse('staff:product_detail', kwargs={'pk': self.object.pk})

    def form_valid(self, form):
        """Process the form if valid."""
        # Handle the cropped image if provided
        cropped_image_data = self.request.POST.get('cropped_image_data')

        if cropped_image_data:
            try:
                format, imgstr = cropped_image_data.split(';base64,')
                ext = format.split('/')[-1]
                image_data = ContentFile(
                    base64.b64decode(imgstr),
                    name=f'product_{form.instance.name}.{ext}'
                )
                form.instance.image = image_data
            except Exception as e:
                logger.error(f"Error processing cropped image: {e}")

        response = super().form_valid(form)

        # Create inventory log entry for initial stock
        InventoryLog.objects.create(
            product=self.object,
            change=form.cleaned_data['stock_quantity'],
            reason="Initial inventory"
        )

        return response

    def get_context_data(self, **kwargs):
        """Add additional context for the form."""
        context = super().get_context_data(**kwargs)
        context['title'] = 'Add New Product'
        context['submit_text'] = 'Create Product'
        context['is_update'] = False
        return context


class ProductUpdateView(StaffAccessMixin, UpdateView):
    """Staff product update view."""
    model = Product
    form_class = ProductForm
    template_name = 'staff/product/product_form.html'

    def get_success_url(self):
        """Redirect to product detail after successful update."""
        messages.success(self.request, "Product updated successfully.")
        return reverse('staff:product_detail', kwargs={'pk': self.object.pk})

    def form_valid(self, form):
        """Process the form if valid."""
        # Get original stock quantity for inventory log
        old_stock = self.get_object().stock_quantity
        new_stock = form.cleaned_data['stock_quantity']

        # Handle the cropped image if provided
        cropped_image_data = self.request.POST.get('cropped_image_data')

        if cropped_image_data:
            try:
                format, imgstr = cropped_image_data.split(';base64,')
                ext = format.split('/')[-1]
                image_data = ContentFile(
                    base64.b64decode(imgstr),
                    name=f'product_{form.instance.name}.{ext}'
                )
                form.instance.image = image_data
            except Exception as e:
                logger.error(f"Error processing cropped image: {e}")

        # Handle image removal
        if self.request.POST.get('remove_image') == 'true':
            form.instance.image = None

        response = super().form_valid(form)

        # Create inventory log entry if stock changed
        if old_stock != new_stock:
            stock_change = new_stock - old_stock
            InventoryLog.objects.create(
                product=self.object,
                change=stock_change,
                reason=(
                    f"Manual update via admin: "
                    f"{'-' if stock_change < 0 else '+'}{abs(stock_change)}"
                )
            )

        return response

    def get_context_data(self, **kwargs):
        """Add additional context for the form."""
        context = super().get_context_data(**kwargs)
        context['title'] = f'Edit Product: {self.object.name}'
        context['submit_text'] = 'Update Product'
        context['is_update'] = True

        # Get inventory logs for this product
        context['inventory_logs'] = InventoryLog.objects.filter(
            product=self.object
        ).order_by('-created_at')[:10]

        return context


class CategoryListView(StaffAccessMixin, ListView):
    """Staff category management view."""
    model = Category
    template_name = 'staff/product/category_list.html'
    context_object_name = 'categories'
    paginate_by = 20

    def get_queryset(self):
        """Get categories with product counts."""
        return Category.objects.annotate(
            product_count=Count('products')).order_by('name')

    def get_context_data(self, **kwargs):
        """Add additional context data for categories."""
        context = super().get_context_data(**kwargs)

        # Category statistics
        context['total_categories'] = Category.objects.count()
        context['active_categories'] = Category.objects.filter(
            is_active=True).count()
        context['categories_with_products'] = Category.objects.annotate(
            product_count=Count('products')
        ).filter(product_count__gt=0).count()
        context['empty_categories'] = Category.objects.annotate(
            product_count=Count('products')).filter(product_count=0).count()

        # Category data for chart visualization
        category_stats = Category.objects.annotate(
            product_count=Count('products')).filter(
                product_count__gt=0).order_by('-product_count')[:8]

        context['category_stats'] = category_stats

        # Calculate percentages for top categories
        total_products = Product.objects.count() or 1  # Avoid division by zero

        top_categories = []
        for category in category_stats:
            percentage = (category.product_count / total_products) * 100
            top_categories.append({
                'name': category.name,
                'product_count': category.product_count,
                'percentage': percentage
            })

        context['top_categories'] = top_categories

        return context


class CategoryCreateView(StaffAccessMixin, CreateView):
    """Staff category creation view."""
    model = Category
    form_class = CategoryForm
    template_name = 'staff/product/category_form.html'

    def get_success_url(self):
        """Redirect to category list after successful creation."""
        messages.success(self.request, "Category created successfully.")
        return reverse('staff:category_list')

    def get_context_data(self, **kwargs):
        """Add additional context for the form."""
        context = super().get_context_data(**kwargs)
        context['title'] = 'Add New Category'
        context['submit_text'] = 'Create Category'
        context['is_update'] = False
        return context


class CategoryUpdateView(StaffAccessMixin, UpdateView):
    """Staff category update view."""
    model = Category
    form_class = CategoryForm
    template_name = 'staff/product/category_form.html'

    def get_success_url(self):
        """Redirect to category list after successful update."""
        messages.success(self.request, "Category updated successfully.")
        return reverse('staff:category_list')

    def get_context_data(self, **kwargs):
        """Add additional context for the form."""
        context = super().get_context_data(**kwargs)
        context['title'] = f'Edit Category: {self.object.name}'
        context['submit_text'] = 'Update Category'
        context['is_update'] = True

        # Add product count
        context['product_count'] = self.object.products.count()

        return context


@login_required
@require_POST
def product_quick_edit(request, pk):
    """Update a single field of a product via AJAX."""
    if not request.user.is_staff:
        return JsonResponse(
            {'success': False, 'error': 'Unauthorized'},
            status=403
        )

    try:
        product = get_object_or_404(Product, pk=pk)
        field = request.POST.get('field')
        value = request.POST.get('value')

        valid_fields = ['price', 'stock_quantity', 'is_active']

        if field not in valid_fields:
            return JsonResponse({
                'success': False,
                'error': f'Invalid field: {field}'
            }, status=400)

        # Convert value based on field type
        if field == 'price':
            try:
                value = Decimal(value)
                if value < 0:
                    return JsonResponse({
                        'success': False,
                        'error': 'Price cannot be negative'
                    }, status=400)
            except Exception:
                return JsonResponse({
                    'success': False,
                    'error': 'Invalid price value'
                }, status=400)

        elif field == 'stock_quantity':
            try:
                old_stock = product.stock_quantity
                value = int(value)
                if value < 0:
                    return JsonResponse({
                        'success': False,
                        'error': 'Stock quantity cannot be negative'
                    }, status=400)
            except Exception:
                return JsonResponse({
                    'success': False,
                    'error': 'Invalid stock quantity'
                }, status=400)

        elif field == 'is_active':
            value = value.lower() in ['true', '1', 'on']

        # Update the field
        setattr(product, field, value)
        product.save(update_fields=[field])

        # Create inventory log for stock changes
        if field == 'stock_quantity':
            stock_change = value - old_stock
            InventoryLog.objects.create(
                product=product,
                change=stock_change,
                reason=(
                    f"Quick edit: "
                    f"{'-' if stock_change < 0 else '+'}{abs(stock_change)}"
                )
            )

        return JsonResponse({
            'success': True,
            'message': f'Updated {field} successfully'
        })

    except Exception as e:
        logger.error(f"Error updating product: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': f'Error updating product: {str(e)}'
        }, status=500)


@login_required
def category_ajax_list(request):
    """Get category list for AJAX requests."""
    try:
        categories = Category.objects.annotate(product_count=Count('products'))

        # Apply search filter if provided
        search = request.GET.get('search')
        if search:
            categories = categories.filter(name__icontains=search)

        # Apply active filter
        active_filter = request.GET.get('active')
        if active_filter in ['true', 'false']:
            is_active = active_filter == 'true'
            categories = categories.filter(is_active=is_active)

        # Apply sorting
        sort = request.GET.get('sort', 'name')
        if sort == 'name':
            categories = categories.order_by('name')
        elif sort == 'products':
            categories = categories.order_by('-product_count')

        # Format for JSON
        category_list = []
        for category in categories:
            category_list.append({
                'id': category.id,
                'name': category.name,
                'slug': category.slug,
                'product_count': category.product_count,
                'is_active': category.is_active,
                'parent_id': category.parent_id,
                'level': category.level,
            })

        return JsonResponse({
            'success': True,
            'categories': category_list
        })

    except Exception as e:
        logger.error(f"Error in category_ajax_list: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
