# staff/views/product_api_views.py
import csv
import io
import json
import logging
from decimal import Decimal, InvalidOperation  # Added InvalidOperation import

from django.contrib.auth.decorators import (  # noqa F401
    login_required, user_passes_test,
)
from django.core.paginator import Paginator
from django.db import models, transaction
from django.db.models import Q, Sum
from django.http import (  # noqa F401
    HttpResponse, HttpResponseBadRequest, HttpResponseForbidden, JsonResponse,
)
from django.shortcuts import get_object_or_404  # noqa F401
from django.urls import reverse  # noqa F401
from django.utils.text import slugify
from django.views.decorators.csrf import csrf_exempt  # noqa F401
from django.views.decorators.http import require_POST

from products.models import Category, InventoryLog, Product
from staff.mixins import staff_required

logger = logging.getLogger(__name__)


@login_required
@staff_required
def product_ajax_list(request):
    """Get products with filtering for AJAX requests."""
    try:
        # Extract filter parameters
        search = request.GET.get('search', '')
        category = request.GET.get('category')
        stock_status = request.GET.get('stock_status')
        status = request.GET.get('status')
        sort_option = request.GET.get('sort', 'name-asc')
        price_min = request.GET.get('price_min')
        price_max = request.GET.get('price_max')
        page = int(request.GET.get('page', 1))
        per_page = int(request.GET.get('per_page', 20))

        # Start with all products
        products = Product.objects.select_related('category').all()

        # Apply search filter
        if search:
            products = products.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
            )

        # Apply category filter
        if category:
            products = products.filter(category_id=category)

        # Apply stock status filter
        if stock_status:
            if stock_status == 'out_of_stock':
                products = products.filter(stock_quantity=0)
            elif stock_status == 'low_stock':
                products = products.filter(
                    stock_quantity__gt=0,
                    stock_quantity__lte=5
                )
            elif stock_status == 'in_stock':
                products = products.filter(stock_quantity__gt=5)

        # Apply product status filter
        if status:
            if status == 'active':
                products = products.filter(is_active=True)
            elif status == 'inactive':
                products = products.filter(is_active=False)

        # Apply price range filter
        if price_min:
            try:
                min_price = Decimal(price_min)
                products = products.filter(price__gte=min_price)
            except (ValueError, TypeError, InvalidOperation):
                pass

        if price_max:
            try:
                max_price = Decimal(price_max)
                products = products.filter(price__lte=max_price)
            except (ValueError, TypeError, InvalidOperation):
                pass

        # Apply sorting
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
        products = products.order_by(sort_mappings.get(sort_option, 'name'))

        # Paginate results
        paginator = Paginator(products, per_page)
        page_obj = paginator.get_page(page)

        # Format product data for JSON response
        product_list = []
        for product in page_obj:
            product_data = {
                'id': product.id,
                'name': product.name,
                'slug': product.slug,
                'description': (
                    product.description[:100] + '...'
                    if len(product.description) > 100
                    else product.description
                ),
                'price': str(product.price),
                'compare_at_price': (
                    str(product.compare_at_price)
                    if product.compare_at_price else None
                ),
                'stock_quantity': product.stock_quantity,
                'category_id': product.category_id,
                'category_name': product.category.name,
                'is_active': product.is_active,
                'is_sale': product.is_sale,
                'image_url': product.image.url if product.image else None,
            }
            product_list.append(product_data)

        return JsonResponse({
            'success': True,
            'products': product_list,
            'pagination': {
                'current_page': page_obj.number,
                'total_pages': paginator.num_pages,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
                'total_items': paginator.count
            }
        })

    except Exception as e:
        logger.error(f"Error in product_ajax_list: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'An error occurred while fetching products.'
        }, status=500)


@login_required
@staff_required
def product_stats(request):
    """Get product statistics for dashboard."""
    try:
        # Product stats
        stats = {
            'total_products': Product.objects.count(),
            'active_products': Product.objects.filter(is_active=True).count(),
            'out_of_stock': Product.objects.filter(stock_quantity=0).count(),
            'low_stock': Product.objects.filter(
                stock_quantity__gt=0,
                stock_quantity__lte=5
            ).count()
        }

        # Calculate total stock value
        stock_value = Product.objects.aggregate(
            total=Sum(models.F('price') * models.F('stock_quantity'))
        )
        stats['total_stock_value'] = float(stock_value['total'] or 0)

        return JsonResponse({
            'success': True,
            'stats': stats
        })
    except Exception as e:
        logger.error(f"Error fetching product stats: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
@staff_required
def get_low_stock_products(request):
    """Get list of low stock products for dashboard."""
    try:
        # Get products with low stock (5 or fewer) or out of stock
        products = Product.objects.select_related('category').filter(
            stock_quantity__lte=5
        ).order_by('stock_quantity')[:10]

        product_list = []
        for product in products:
            product_data = {
                'id': product.id,
                'name': product.name,
                'price': str(product.price),
                'stock_quantity': product.stock_quantity,
                'category_name': product.category.name,
                'image_url': product.image.url if product.image else None,
            }
            product_list.append(product_data)

        return JsonResponse({
            'success': True,
            'products': product_list
        })
    except Exception as e:
        logger.error(f"Error fetching low stock products: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
@staff_required
@require_POST
def product_batch_action(request):
    """Process batch actions on multiple products."""
    if not request.user.is_staff:
        return JsonResponse({
            'success': False,
            'error': 'Unauthorized access'
        }, status=403)

    try:
        # Parse the JSON data from the request body
        data = json.loads(request.body)
        action = data.get('action')
        product_ids = data.get('product_ids', [])

        if not action or not product_ids:
            return JsonResponse({
                'success': False,
                'error': 'Missing required parameters'
            }, status=400)

        # Get the products to operate on
        products = Product.objects.filter(id__in=product_ids)

        if not products.exists():
            return JsonResponse({
                'success': False,
                'error': 'No products found with the provided IDs'
            }, status=400)

        count = products.count()

        # Process based on action
        with transaction.atomic():
            if action == 'activate':
                products.update(is_active=True)
                message = f'Successfully activated {count} products'

            elif action == 'deactivate':
                products.update(is_active=False)
                message = f'Successfully deactivated {count} products'

            elif action == 'delete':
                # For safety, don't allow mass deletion if any product has
                # orders
                # This depends on your model relationships - modify as needed
                # for product in products:
                #     if product.has_orders():
                #         return JsonResponse({
                #             'success': False,
                #             'error': (
                #                 f'Cannot delete product "{product.name}" '
                #                 'as it has associated orders.'
                #             )
                #         }, status=400)

                # Delete the products
                products.delete()
                message = f'Successfully deleted {count} products'

            elif action == 'export':
                # This would normally trigger a background task to generate
                # the export
                # and notify the user when ready. For simplicity, we'll return
                # success here, and the actual export functionality would be
                # handled by a separate endpoint.
                message = f'Export of {count} products has been initiated'

            else:
                return JsonResponse({
                    'success': False,
                    'error': f'Unknown action: {action}'
                }, status=400)

        return JsonResponse({
            'success': True,
            'message': message,
            'count': count
        })

    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        logger.error(f"Error in product_batch_action: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
@staff_required
def export_products(request):
    """Export products to CSV file."""
    try:
        # Create a file-like buffer to receive CSV data
        buffer = io.StringIO()
        writer = csv.writer(buffer)

        # Write header row
        writer.writerow([
            'ID', 'Name', 'SKU', 'Description', 'Price', 'Compare At Price',
            'Stock Quantity', 'Category', 'Active', 'Created At', 'Updated At'
        ])

        # Get all products
        products = Product.objects.select_related('category').all()

        # Write product data
        for product in products:
            writer.writerow([
                product.id,
                product.name,
                product.slug,
                product.description,
                product.price,
                product.compare_at_price or '',
                product.stock_quantity,
                product.category.name,
                'Yes' if product.is_active else 'No',
                product.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                product.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            ])

        # Create the HTTP response with the appropriate CSV header
        buffer.seek(0)
        response = HttpResponse(buffer.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = (
            'attachment; filename=products_export.csv'
        )

        return response

    except Exception as e:
        logger.error(f"Error exporting products: {str(e)}")
        return HttpResponseBadRequest(f"Error exporting products: {str(e)}")


@login_required
@staff_required
def export_template(request):
    """Export a template CSV for product imports."""
    try:
        # Create a file-like buffer to receive CSV data
        buffer = io.StringIO()
        writer = csv.writer(buffer)

        # Write header row with explanations
        writer.writerow([
            'Name*', 'Description*', 'Price*', 'Compare At Price',
            'Stock Quantity*', 'Category*', 'Active'
        ])

        # Write example row
        writer.writerow([
            'Example Product',
            'This is an example product description.',
            '19.99',
            '24.99',
            '100',
            'Clothing',
            'Yes'
        ])

        # Add instructions for required fields
        writer.writerow([])
        writer.writerow(['* Required fields'])
        writer.writerow(['- Name: Product name (required)'])
        writer.writerow(['- Description: Product description (required)'])
        writer.writerow(['- Price: Decimal value like 19.99 (required)'])
        writer.writerow(['- Compare At Price: Optional decimal value for sale\
                          comparison'])
        writer.writerow(['- Stock Quantity: Integer value (required)'])
        writer.writerow(['- Category: Must match an existing category name\
                          (required)'])
        writer.writerow(['- Active: "Yes" or "No" (defaults to "Yes" if \
                         empty)'])

        # Create the HTTP response with the appropriate CSV header
        buffer.seek(0)
        response = HttpResponse(buffer.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = (
            'attachment; filename=products_import_template.csv'
        )

        return response

    except Exception as e:
        logger.error(f"Error creating template: {str(e)}")
        return HttpResponseBadRequest(f"Error creating template: {str(e)}")


@login_required
@staff_required
@require_POST
def import_products(request):
    """Import products from CSV file."""
    if not request.user.is_staff:
        return JsonResponse({
            'success': False,
            'error': 'Unauthorized access'
        }, status=403)

    try:
        csv_file = request.FILES.get('importFile')
        if not csv_file:
            return JsonResponse({
                'success': False,
                'error': 'No file uploaded'
            }, status=400)

        if not csv_file.name.endswith('.csv'):
            return JsonResponse({
                'success': False,
                'error': 'File is not a CSV'
            }, status=400)

        # Read and decode the file
        file_data = csv_file.read().decode('utf-8')
        csv_data = csv.reader(io.StringIO(file_data))

        # Extract header and data rows
        rows = list(csv_data)
        if len(rows) < 2:  # Header + at least one data row
            return JsonResponse({
                'success': False,
                'error': 'CSV file has insufficient data'
            }, status=400)

        header = rows[0]

        # Validate required columns
        required_columns = [
            'Name', 'Description', 'Price', 'Stock Quantity', 'Category'
        ]
        missing_columns = [
            col for col in required_columns if col not in header
        ]

        if missing_columns:
            return JsonResponse({
                'success': False,
                'error': (
                    'Missing required columns: '
                    f'{", ".join(missing_columns)}'
                )
            }, status=400)

        # Process rows
        success_count = 0
        error_count = 0
        errors = []

        with transaction.atomic():
            for i, row in enumerate(rows[1:], start=2):
                # Skip empty rows or instructional rows
                if not row or not row[0] or row[0].startswith('-'):
                    continue

                try:
                    # Map columns to values using dictionary comprehension
                    data = {
                        header[j]: val
                        for j, val in enumerate(row)
                        if j < len(header)
                    }

                    # Get or create category
                    category_name = data.get('Category')
                    if not category_name:
                        raise ValueError('Category is required')

                    category, _ = Category.objects.get_or_create(
                        name=category_name,
                        defaults={'slug': slugify(category_name)}
                    )

                    # Parse values
                    name = data.get('Name')
                    if not name:
                        raise ValueError('Name is required')

                    description = data.get('Description')
                    if not description:
                        raise ValueError('Description is required')

                    price_str = data.get('Price')
                    if not price_str:
                        raise ValueError('Price is required')
                    price = Decimal(price_str)

                    compare_price_str = data.get('Compare At Price')
                    compare_price = (
                        Decimal(compare_price_str)
                        if compare_price_str else None
                    )

                    stock_str = data.get('Stock Quantity')
                    if not stock_str:
                        raise ValueError('Stock Quantity is required')
                    stock = int(stock_str)

                    is_active_str = data.get('Active', 'Yes')
                    is_active = is_active_str.lower() != 'no'

                    # Create the product
                    slug = slugify(name)
                    product = Product(
                        name=name,
                        slug=slug,
                        description=description,
                        price=price,
                        compare_at_price=compare_price,
                        stock_quantity=stock,
                        category=category,
                        is_active=is_active
                    )

                    # Handle slug uniqueness
                    existing_count = Product.objects.filter(
                        slug__startswith=slug
                    ).count()
                    if existing_count > 0:
                        product.slug = f"{slug}-{existing_count + 1}"

                    product.save()

                    # Create inventory log entry for initial stock
                    InventoryLog.objects.create(
                        product=product,
                        change=stock,
                        reason="Initial import"
                    )

                    success_count += 1

                except Exception as e:
                    error_count += 1
                    errors.append(f"Row {i}: {str(e)}")
                    logger.error(
                        f"Error importing product at row {i}: {str(e)}"
                    )

        # Return response with results
        if error_count > 0:
            return JsonResponse({
                'success': True,
                'warning': True,
                'message': (
                    f'Import completed with {success_count} successful and '
                    f'{error_count} failed products.'
                ),
                'errors': errors[:10]  # Return first 10 errors
            })
        else:
            return JsonResponse({
                'success': True,
                'message': f'Successfully imported {success_count} products.'
            })

    except Exception as e:
        logger.error(f"Error in import_products: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': f'Import failed: {str(e)}'
        }, status=500)
