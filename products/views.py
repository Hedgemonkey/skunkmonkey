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
        return JsonResponse({'success': True, 'message': 'Product updated successfully.'})

    def form_invalid(self, form):
        return JsonResponse({'success': False, 'errors': form.errors})


@staff_member_required
def product_add_form(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        form = ProductForm()
        return render(request, 'products/manage/product_form_partial.html', {'form': form})
    return HttpResponseBadRequest("Invalid request.")  # Return a 400 error for non-AJAX


@staff_member_required
def product_add(request):
    if request.method == 'POST':
        form = ProductForm(request.POST, request.FILES) # Corrected form handling
        if form.is_valid():
            form.save() # Save the product (image will be saved as well)

            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({'message': 'Product added successfully.'}, status=201) # Correct AJAX response

            return redirect(reverse('products:product_management')) # Redirect after success

    else:  # GET request - handle it correctly and return the form
        form = ProductForm()
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return render(request, 'products/manage/product_form_partial.html', {'form': form}) # Corrected template name
        else:
            return HttpResponseBadRequest("Invalid request.")  # Correct handling for non-AJAX GET


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
                image_data = ContentFile(base64.b64decode(imgstr), name=f'cropped_image.{ext}')

                # Save the image to the product instance
                product.image.save(f'cropped_image.{ext}', image_data, save=False)

            product.save()
            return JsonResponse({'success': True, 'message': 'Product updated successfully.'}, status=200)
        else:
            return JsonResponse({'success': False, 'errors': form.errors}, status=400)
    else:
        form = ProductForm(instance=product)
        html = render_to_string('products/manage/product_update_form.html', {'form': form, 'product': product}, request=request)
        return JsonResponse({'html': html}, status=200)
    

@staff_member_required
def product_delete(request, slug):  # New view for handling AJAX product deletion
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        if request.method == 'POST':
            product = get_object_or_404(Product, slug=slug)
            product_name = product.name  # Get the product name before deleting
            product.delete()

            return JsonResponse({'message': f'Product "{product_name}" deleted successfully.'}, status=200)
        else:
            return JsonResponse({'error': 'Invalid request method.'}, status=405)  # Method Not Allowed
    return HttpResponseBadRequest('Invalid request.')


@staff_member_required
def product_management(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        template_name = 'products/manage/product_cards_partial.html'
    else:
        template_name = 'products/manage/product_manage.html'

    products = Product.objects.all()
    categories = Category.objects.all()

    return render(request, template_name, {'products': products, 'categories': categories})


@staff_member_required
def category_add(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        if request.method == 'POST':
            logger.debug("add_category view called via AJAX POST")  # Log entry point

            name = request.POST.get('name')
            logger.debug(f"Received category name: {name}") # Log received name

            if not name:
                logger.warning("Category name is missing.") # Log missing name
                return JsonResponse({'error': 'Category name is required.'}, status=400)

            try:
                category = Category.objects.create(name=name)
                logger.info(f"Created category: {category}") # Log successful creation
                return JsonResponse({'id': category.id, 'name': category.name, 'slug': category.slug}, status=201)

            except IntegrityError:
                logger.error(f"IntegrityError: Category with name '{name}' already exists.")
                return JsonResponse({'error': 'A category with this name already exists.'}, status=400)

            except Exception as e:
                logger.exception(f"An unexpected error occurred: {e}") # Log full exception traceback
                return JsonResponse({'error': f'An error occurred: {e}'}, status=500) # Return error details during development


        else:
            logger.warning("Invalid request method (not POST)")
            return JsonResponse({'error': 'Invalid request method. Use POST.'}, status=405)

    logger.warning("add_category view called outside of AJAX or not by staff")
    return redirect('products:product_management')


@staff_member_required
def get_category_cards(request):
    categories = Category.objects.all()  # Get all categories
    try:

        cards_html = render_to_string(
            'products/manage/category_cards_partial.html', {'categories': categories}
        )
        return JsonResponse({'html': cards_html}, status=200)

    except Exception as e: # Broad exception handling for debugging, replace with specific errors for production
        return JsonResponse({'error': str(e)}, status=500)


@staff_member_required
def get_category_products(request, category_slug):
    category = get_object_or_404(Category, slug=category_slug)
    product_names = list(category.products.values_list('name', flat=True)) 
    return JsonResponse({'products': product_names})


@staff_member_required
def category_update(request, slug):
    category = get_object_or_404(Category, slug=slug)

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':  # Only for AJAX requests
        if request.method == 'GET':  # Handle GET request to load the form
            form = CategoryForm(instance=category)  # Initialize form with category instance
            context = {'form': form, 'category': category}
            html = render_to_string('products/manage/category_update_form.html', context, request=request)
            return JsonResponse({'html': html})
        elif request.method == 'POST':  # Handle form submission
            form = CategoryForm(request.POST, instance=category)
            if form.is_valid():
                try:
                    form.save()
                    return JsonResponse({'success': True, 'message': 'Category updated successfully!'})
                except IntegrityError:  # Handle duplicate names
                    return JsonResponse({'success': False, 'error': 'A category with this name already exists.'}, status=400)
            else:  # Handle invalid form
                # Re-render the form with errors.
                context = {'form': form, 'category': category}
                html = render_to_string('products/manage/category_update_form.html', context, request=request)
                return JsonResponse({'html': html, 'error': form.errors}, status=400)
    return HttpResponseBadRequest("Invalid request.")


@staff_member_required
def category_delete(request, slug):
    try:
        category = get_object_or_404(Category, slug=slug)
    except Exception as e:
        logger.error(f"Error getting category for deletion: {e}")
        return JsonResponse({'error': 'Error getting category for deletion.'}, status=500)


    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        if request.method == 'POST':
            category_name = category.name
            try:
                category.delete()
                messages.success(request, f"Category '{category_name}' deleted successfully!") # Keep this line
                return JsonResponse({'message': f"Category '{category_name}' deleted successfully!"})
            except Exception as e:
                logger.error(f"Error deleting category: {e}") # More specific logging
                return JsonResponse({'error': 'Error deleting category.'}, status=500)
        else:
             return JsonResponse({'error': 'Invalid request method.'}, status=405) # Method not allowed
    return HttpResponseBadRequest("Invalid request.")  # Return a 400 error for non-AJAX
