# products/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse_lazy, reverse
from django.views.generic import CreateView, UpdateView, DeleteView
from django.utils.decorators import method_decorator
from django.db.utils import IntegrityError
from django.db.models import Q, Count
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib import messages
from django.http import JsonResponse, HttpResponseBadRequest
from django.template.loader import render_to_string
from django.core.files.base import ContentFile
import base64
from .models import Product, Category
from .forms import ProductForm, CategoryForm
import logging

logger = logging.getLogger(__name__)


# Use Django's built-in StaffMemberRequiredMixin
@method_decorator(staff_member_required, name='dispatch')
class ProductCreateView(CreateView):
    model = Product
    form_class = ProductForm
    template_name = 'products/staff/product_form.html'
    success_url = reverse_lazy('products:product_management')

    def form_valid(self, form):
        messages.success(self.request, 'Product created successfully!')
        return super().form_valid(form)


@method_decorator(staff_member_required, name='dispatch')
class ProductUpdateView(UpdateView):
    model = Product
    form_class = ProductForm
    template_name = 'products/manage/product_update_form.html'
    success_url = reverse_lazy('products:product_management')

    def form_valid(self, form):
        self.object = form.save()
        return JsonResponse({'success': True,
                             'message': 'Product updated successfully.'})

    def form_invalid(self, form):
        return JsonResponse({'success': False, 'errors': form.errors})


@staff_member_required
def product_add_form(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        form = ProductForm()
        return render(request, 'products/manage/product_form_partial.html', {
            'form': form})
    return HttpResponseBadRequest("Invalid request.")


@staff_member_required
def product_add(request):
    """Handle product creation via AJAX."""
    if request.method != 'POST':
        return JsonResponse({'success': False,
                            'errors': 'Invalid request method'},
                            status=405)

    form = ProductForm(request.POST, request.FILES)
    if not form.is_valid():
        return JsonResponse({'success': False, 'errors': form.errors},
                            status=400)

    try:
        product = form.save(commit=False)
        cropped_image_data = request.POST.get('cropped_image_data')
        
        if cropped_image_data:
            try:
                format, imgstr = cropped_image_data.split(';base64,')
                ext = format.split('/')[-1]
                image_data = ContentFile(base64.b64decode(imgstr),
                                         name=f'cropped_image.{ext}')
                product.image.save(f'cropped_image.{ext}',
                                   image_data,
                                   save=False)
            except Exception as e:
                logger.error(f"Image processing error: {str(e)}")
                return JsonResponse({
                    'success': False,
                    'errors': f'Error processing image: {str(e)}'
                }, status=400)

        product.save()
        return JsonResponse({
            'success': True,
            'message': 'Product added successfully.'
        }, status=201)

    except Exception as e:
        logger.error(f"Product save error: {str(e)}")
        return JsonResponse({
            'success': False,
            'errors': f'Error saving product: {str(e)}'
        }, status=400)


@staff_member_required
def product_update(request, slug):
    """Handle product updates via AJAX."""
    product = get_object_or_404(Product, slug=slug)
    
    if request.method == 'POST':
        form = ProductForm(request.POST, request.FILES, instance=product)
        if form.is_valid():
            cropped_image_data = request.POST.get('cropped_image_data')
            if cropped_image_data:
                try:
                    format, imgstr = cropped_image_data.split(';base64,')
                    ext = format.split('/')[-1]
                    image_data = ContentFile(base64.b64decode(imgstr),
                                             name=f'cropped_image.{ext}')
                    product.image.save(f'cropped_image.{ext}',
                                       image_data,
                                       save=False)
                except Exception as e:
                    logger.error(f"Image processing error: {str(e)}")
                    return JsonResponse({
                        'success': False,
                        'errors': f'Error processing image: {str(e)}'
                    }, status=400)

            product.save()
            return JsonResponse({
                'success': True,
                'message': 'Product updated successfully.'
            }, status=200)
        return JsonResponse({'success': False, 'errors': form.errors},
                            status=400)

    form = ProductForm(instance=product)
    html = render_to_string(
        'products/manage/product_update_form.html',
        {'form': form, 'product': product},
        request=request
    )
    return JsonResponse({'html': html})
    

@staff_member_required
def product_delete(request, slug):
    """Handle product deletion via AJAX."""
    if not request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return HttpResponseBadRequest("Invalid request.")
        
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=405)

    product = get_object_or_404(Product, slug=slug)
    product_name = product.name
    product.delete()
    return JsonResponse({
        'message': f'Product "{product_name}" deleted successfully.'})


@staff_member_required
def product_management(request):
    """Main view for product management dashboard."""
    # Now this function only renders the template 
    # All data loading is handled by AJAX requests to get_product_cards and get_category_cards
    return render(request, 'products/manage/product_manage.html')


@staff_member_required
def category_add(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        if request.method == 'POST':
            name = request.POST.get('name')
            if not name:
                return JsonResponse({'error': 'Category name is required.'},
                                    status=400)
            try:
                category = Category.objects.create(name=name)
                return JsonResponse({
                    'success': True,
                    'message': 'Category added successfully.',
                    'id': category.id,
                    'name': category.name,
                    'slug': category.slug
                }, status=201)
            except IntegrityError:
                return JsonResponse({
                    'error': 'A category with this name already exists.'
                }, status=400)
    return HttpResponseBadRequest("Invalid request.")


@staff_member_required
def get_product_cards(request):
    """API endpoint for fetching product cards via AJAX."""
    search = request.GET.get('search', '').lower()
    category = request.GET.get('category')
    sort = request.GET.get('sort', 'name-asc')
    items_only = request.GET.get('items_only') == 'true'  # Check if we only want items

    products = Product.objects.all()

    # Apply filters
    if category:
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
        'category-asc': 'category__name',
        'category-desc': '-category__name',
        'newest': '-created_at',
        'oldest': 'created_at',
    }
    products = products.order_by(sort_mapping.get(sort, 'name'))

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        context = {
            'products': products,
            'search': search,  # Preserve search value
            'current_sort': sort,  # Preserve sort value
        }
        
        if items_only:
            # Return only the product cards html without the filter controls and without the row wrapper
            html = render_to_string(
                'products/manage/product_cards_only.html',
                context,
                request=request
            )
        else:
            # Return the full html including filter controls
            context.update({
                'categories': Category.objects.all(),
                'sort_options': [
                    {'value': 'name-asc', 'label': 'Name (A-Z)'},
                    {'value': 'name-desc', 'label': 'Name (Z-A)'},
                    {'value': 'category-asc', 'label': 'Category (A-Z)'},
                    {'value': 'category-desc', 'label': 'Category (Z-A)'},
                    {'value': 'newest', 'label': 'Newest First'},
                    {'value': 'oldest', 'label': 'Oldest First'},
                ],
                'show_category_filter': True,
                'item_type': 'products',
                'selected_categories': category.split(',') if category and ',' in category else [category] if category else []
            })
            
            html = render_to_string(
                'products/manage/product_cards_partial.html',
                context,
                request=request
            )
            
        return JsonResponse({'html': html})

    return HttpResponseBadRequest("Invalid request.")


@staff_member_required
def get_category_cards(request):
    """API endpoint for fetching category cards via AJAX."""
    search = request.GET.get('search', '').lower()
    sort = request.GET.get('sort', 'name-asc')
    items_only = request.GET.get('items_only') == 'true'  # Check if we only want items

    categories = Category.objects.all()

    # Apply search filter
    if search:
        categories = categories.filter(
            Q(name__icontains=search) |
            Q(products__name__icontains=search)
        ).distinct()

    # Apply sorting
    sort_mapping = {
        'name-asc': 'name',
        'name-desc': '-name',
        'products-asc': 'products__count',
        'products-desc': '-products__count',
        'newest': '-created_at',
        'oldest': 'created_at',
    }

    # Add annotation for product count if needed
    if sort.endswith('products-asc') or sort.endswith('products-desc'):
        categories = categories.annotate(Count('products'))

    categories = categories.order_by(sort_mapping.get(sort, 'name'))

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        context = {
            'categories': categories,
            'sort_options': [
                {'value': 'name-asc', 'label': 'Name (A-Z)'},
                {'value': 'name-desc', 'label': 'Name (Z-A)'},
                {'value': 'products-asc',
                 'label': 'Product Count (Low to High)'},
                {'value': 'products-desc',
                 'label': 'Product Count (High to Low)'},
                {'value': 'newest', 'label': 'Newest First'},
                {'value': 'oldest', 'label': 'Oldest First'},
            ],
            'show_category_filter': True,
            'item_type': 'categories',
            'search': search,
            'current_sort': sort
        }
        
        # Choose the appropriate template based on whether we want just the items
        template = 'products/manage/category_cards_only.html' if items_only else 'products/manage/category_cards_partial.html'
        
        html = render_to_string(
            template,
            context,
            request=request
        )
        return JsonResponse({'html': html})
    
    return HttpResponseBadRequest("Invalid request.")


@staff_member_required
def get_category_products(request, category_slug):
    category = get_object_or_404(Category, slug=category_slug)
    product_names = list(category.products.values_list('name', flat=True)) 
    return JsonResponse({'products': product_names})


@staff_member_required
def category_update(request, slug):
    category = get_object_or_404(Category, slug=slug)
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        if request.method == 'GET':
            form = CategoryForm(instance=category)
            html = render_to_string(
                'products/manage/category_update_form.html',
                {'form': form, 'category': category},
                request=request)
            return JsonResponse({'html': html})
        elif request.method == 'POST':
            form = CategoryForm(request.POST, instance=category)
            if form.is_valid():
                try:
                    form.save()
                    return JsonResponse({
                        'success': True, 
                        'message': 'Category updated successfully!'
                    })
                except IntegrityError:
                    return JsonResponse({
                        'success': False, 
                        'error': 'A category with this name already exists.'
                    }, status=400)
            return JsonResponse({
                'success': False, 
                'errors': form.errors
            }, status=400)
    return HttpResponseBadRequest("Invalid request.")


@staff_member_required
def category_delete(request, slug):
    try:
        category = get_object_or_404(Category, slug=slug)
    except Exception as e:
        logger.error(f"Error getting category for deletion: {e}")
        return JsonResponse({'error': 'Error getting category for deletion.'},
                            status=500)

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        if request.method == 'POST':
            category_name = category.name
            try:
                category.delete()
                messages.success(request,
                                 f"Category '{category_name}' deleted \
                                    successfully!")
                return JsonResponse({
                    'message': f"Category '{category_name}' deleted \
                        successfully!"})
            except Exception as e:
                logger.error(f"Error deleting category: {e}")
                return JsonResponse({'error': 'Error deleting category.'},
                                    status=500)
        else:
            return JsonResponse({'error': 'Invalid request method.'},
                                status=405)
    return HttpResponseBadRequest("Invalid request.")


@staff_member_required
def category_search(request):
    """API endpoint for category search autocomplete."""
    search = request.GET.get('search', '').lower()
    page = int(request.GET.get('page', 1))
    page_size = 10

    categories = Category.objects.filter(name__icontains=search)
    
    # Handle pagination
    start = (page - 1) * page_size
    end = start + page_size
    total = categories.count()
    
    categories_page = categories[start:end]
    
    return JsonResponse({
        'categories': [
            {'id': cat.id, 'name': cat.name}
            for cat in categories_page
        ],
        'has_more': total > end
    })
