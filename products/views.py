# products/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse_lazy, reverse
from django.views.generic import CreateView, UpdateView, DeleteView
from django.utils.decorators import method_decorator
from django.db.utils import IntegrityError
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
    if request.method == 'POST':
        form = ProductForm(request.POST, request.FILES)
        if form.is_valid():
            product = form.save(commit=False)
            cropped_image_data = request.POST.get('cropped_image_data')
            if cropped_image_data:
                try:
                    format, imgstr = cropped_image_data.split(';base64,')
                    ext = format.split('/')[-1]
                    image_data = ContentFile(base64.b64decode(imgstr), name=f'cropped_image.{ext}')
                    product.image.save(f'cropped_image.{ext}', image_data, save=False)
                except Exception as e:
                    logger.error(f"Image processing error: {str(e)}")
                    return JsonResponse({
                        'success': False,
                        'errors': f'Error processing image: {str(e)}'
                    }, status=400)

            try:
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
        else:
            logger.error(f"Form validation errors: {form.errors}")
            return JsonResponse({
                'success': False,
                'errors': form.errors
            }, status=400)
    
    return JsonResponse({
        'success': False,
        'errors': 'Invalid request method'
    }, status=405)


@staff_member_required
def product_update(request, slug):
    product = get_object_or_404(Product, slug=slug)
    if request.method == 'POST':
        form = ProductForm(request.POST, request.FILES, instance=product)
        if form.is_valid():
            # Handle the cropped image data
            cropped_image_data = request.POST.get('cropped_image_data')
            if cropped_image_data:
                # Decode the base64 image data
                format, imgstr = cropped_image_data.split(';base64,')
                ext = format.split('/')[-1]
                image_data = ContentFile(base64.b64decode(imgstr), 
                                         name=f'cropped_image.{ext}')

                # Save the image to the product instance
                product.image.save(f'cropped_image.{ext}',
                                   image_data,
                                   save=False)

            product.save()
            return JsonResponse({'success': True,
                                 'message': 'Product updated successfully.'},
                                status=200)
        else:
            return JsonResponse({'success': False,
                                 'errors': form.errors},
                                status=400)
    else:
        form = ProductForm(instance=product)
        html = render_to_string('products/manage/product_update_form.html',
                                {'form': form,
                                 'product': product
                                 },
                                request=request)
        return JsonResponse({'html': html}, status=200)
    

@staff_member_required
def product_delete(request, slug):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        if request.method == 'POST':
            product = get_object_or_404(Product, slug=slug)
            product_name = product.name 
            product.delete()

            return JsonResponse({
                'message': f'Product "{product_name}" deleted successfully.'},
                status=200)
        else:
            return JsonResponse({
                'error': 'Invalid request method.'},
                status=405) 
    return HttpResponseBadRequest('Invalid request.')


@staff_member_required
def product_management(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        template_name = 'products/manage/product_cards_partial.html'
    else:
        template_name = 'products/manage/product_manage.html'

    products = Product.objects.all()
    categories = Category.objects.all()

    return render(request,
                  template_name,
                  {'products': products,
                   'categories': categories
                   })


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
def get_category_cards(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        categories = Category.objects.all()
        html = render_to_string('products/manage/category_cards_partial.html', 
                                {'categories': categories})
        return JsonResponse({'html': html}, status=200)
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
