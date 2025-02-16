# products/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse_lazy
from django.views.generic import CreateView, UpdateView, DeleteView
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib import messages
from django.http import JsonResponse
from .models import Product, Category
from .forms import ProductForm
from django.utils.decorators import method_decorator


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
    template_name = 'products/staff/product_form.html'
    success_url = reverse_lazy('products:product_management')

    def form_valid(self, form):
        messages.info(self.request, 'Product updated successfully!')
        return super().form_valid(form)


@method_decorator(staff_member_required, name='dispatch')
class ProductDeleteView(DeleteView):
    model = Product
    template_name = 'products/staff/product_confirm_delete.html'
    success_url = reverse_lazy('products:product_management')

    def delete(self, request, *args, **kwargs):
        messages.success(self.request, 'Product deleted successfully!')
        return super().delete(request, *args, **kwargs)


@staff_member_required
def product_create_form(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        form = ProductForm()
        return render(request, 'products/manage/product_form_partial.html', {'form': form})
    return redirect('products:product_management') # Redirect if not AJAX



@staff_member_required
def product_management(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        template_name = 'products/manage/product_manage_partial.html'
    else:
        template_name = 'products/manage/product_manage.html'

    products = Product.objects.all()

    return render(request, template_name, {'products': products})

@staff_member_required
def add_category(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        if request.method == 'POST':
            name = request.POST.get('name')
            if name:
                try:
                    category = Category.objects.create(name=name)  # Create the category
                    return JsonResponse({'id': category.id, 'name': category.name, 'slug': category.slug}, status=201) # Return JSON response
                except Exception as e:  # Catch potential errors (e.g., unique constraint violation)
                    return JsonResponse({'error': str(e)}, status=400)
            return JsonResponse({'error': 'Category name is required.'}, status=400)

        return JsonResponse({'error': 'Invalid request method.'}, status=405) # Only POST allowed

    return redirect('products:product_management') # Redirect if not an AJAX request

