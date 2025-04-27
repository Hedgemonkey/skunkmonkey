"""
Tests for staff product API views
"""
import csv
import json
from decimal import Decimal
from io import StringIO

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import Client, TestCase
from django.urls import reverse

from products.models import Category, InventoryLog, Product
from staff.views.product_api_views import (
    export_products, export_template, get_low_stock_products, import_products,
    product_ajax_list, product_batch_action, product_stats,
)

User = get_user_model()


class StaffProductApiViewsTest(TestCase):
    """Test cases for staff product API views."""

    def setUp(self):
        """Set up test data for product API tests."""
        # Create test user with staff permissions
        self.staff_user = User.objects.create_user(
            username='staffuser',
            email='staff@example.com',
            password='password123',
            is_staff=True
        )

        # Create regular user (no staff permissions)
        self.regular_user = User.objects.create_user(
            username='regularuser',
            email='regular@example.com',
            password='password123'
        )

        # Create test categories
        self.category1 = Category.objects.create(
            name='Test Category 1',
            slug='test-category-1'
        )

        self.category2 = Category.objects.create(
            name='Test Category 2',
            slug='test-category-2'
        )

        # Create test products
        self.product1 = Product.objects.create(
            name='Test Product 1',
            slug='test-product-1',
            description='This is test product 1',
            price=Decimal('19.99'),
            stock_quantity=10,
            category=self.category1,
            is_active=True
        )

        self.product2 = Product.objects.create(
            name='Test Product 2',
            slug='test-product-2',
            description='This is test product 2',
            price=Decimal('29.99'),
            stock_quantity=5,  # Low stock
            category=self.category1,
            is_active=True
        )

        self.product3 = Product.objects.create(
            name='Test Product 3',
            slug='test-product-3',
            description='This is test product 3',
            price=Decimal('39.99'),
            stock_quantity=0,  # Out of stock
            category=self.category2,
            is_active=False
        )

        # Set up test clients
        self.client = Client()
        self.staff_client = Client()
        self.staff_client.login(username='staffuser', password='password123')
        self.regular_client = Client()
        self.regular_client.login(username='regularuser', password='password123')

    def test_product_ajax_list_authenticated_staff(self):
        """Test product_ajax_list view returns correct data for staff."""
        url = reverse('staff:product_ajax_list')
        response = self.staff_client.get(url)

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)

        self.assertTrue(data['success'])
        self.assertEqual(len(data['products']), 3)
        self.assertEqual(data['pagination']['total_items'], 3)

    def test_product_ajax_list_unauthenticated_redirect(self):
        """Test product_ajax_list redirects unauthenticated users."""
        url = reverse('staff:product_ajax_list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, 302)  # Redirect to login

    def test_product_ajax_list_non_staff_denied(self):
        """Test product_ajax_list denies access to non-staff users."""
        url = reverse('staff:product_ajax_list')
        response = self.regular_client.get(url)

        # Should redirect to login or access denied page
        self.assertNotEqual(response.status_code, 200)

    def test_product_ajax_list_with_filters(self):
        """Test product_ajax_list filtering functionality."""
        url = reverse('staff:product_ajax_list')

        # Test category filter
        response = self.staff_client.get(
            f"{url}?category={self.category1.id}"
        )
        data = json.loads(response.content)
        self.assertEqual(len(data['products']), 2)

        # Test search filter
        response = self.staff_client.get(f"{url}?search=Product 1")
        data = json.loads(response.content)
        self.assertEqual(len(data['products']), 1)
        self.assertEqual(data['products'][0]['name'], 'Test Product 1')

        # Test stock status filter
        response = self.staff_client.get(f"{url}?stock_status=out_of_stock")
        data = json.loads(response.content)
        self.assertEqual(len(data['products']), 1)
        self.assertEqual(data['products'][0]['name'], 'Test Product 3')

        # Test product status filter
        response = self.staff_client.get(f"{url}?status=inactive")
        data = json.loads(response.content)
        self.assertEqual(len(data['products']), 1)
        self.assertEqual(data['products'][0]['name'], 'Test Product 3')

    def test_product_stats_view(self):
        """Test product_stats view returns correct statistics."""
        url = reverse('staff:product_stats')
        response = self.staff_client.get(url)

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)

        self.assertTrue(data['success'])
        stats = data['stats']
        self.assertEqual(stats['total_products'], 3)
        self.assertEqual(stats['active_products'], 2)
        self.assertEqual(stats['out_of_stock'], 1)
        self.assertEqual(stats['low_stock'], 1)

        # Test total stock value
        expected_value = (
            self.product1.price * self.product1.stock_quantity
            + self.product2.price * self.product2.stock_quantity
            + self.product3.price * self.product3.stock_quantity
        )
        self.assertEqual(stats['total_stock_value'], float(expected_value))

    def test_get_low_stock_products(self):
        """Test get_low_stock_products returns products with low inventory."""
        url = reverse('staff:low_stock_products')
        response = self.staff_client.get(url)

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)

        self.assertTrue(data['success'])
        self.assertEqual(len(data['products']), 2)  # Low stock + out of stock

        # Low stock product should be first in the list (ordered by quantity)
        self.assertEqual(data['products'][0]['name'], 'Test Product 3')
        self.assertEqual(data['products'][1]['name'], 'Test Product 2')

    def test_product_batch_action_activate(self):
        """Test batch activation of products."""
        url = reverse('staff:product_batch_action')
        payload = {
            'action': 'activate',
            'product_ids': [self.product3.id]
        }

        response = self.staff_client.post(
            url,
            json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)

        self.assertTrue(data['success'])
        self.product3.refresh_from_db()
        self.assertTrue(self.product3.is_active)

    def test_product_batch_action_deactivate(self):
        """Test batch deactivation of products."""
        url = reverse('staff:product_batch_action')
        payload = {
            'action': 'deactivate',
            'product_ids': [self.product1.id, self.product2.id]
        }

        response = self.staff_client.post(
            url,
            json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)

        self.assertTrue(data['success'])
        self.product1.refresh_from_db()
        self.product2.refresh_from_db()
        self.assertFalse(self.product1.is_active)
        self.assertFalse(self.product2.is_active)

    def test_product_batch_action_delete(self):
        """Test batch deletion of products."""
        initial_count = Product.objects.count()
        url = reverse('staff:product_batch_action')
        payload = {
            'action': 'delete',
            'product_ids': [self.product1.id]
        }

        response = self.staff_client.post(
            url,
            json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)

        self.assertTrue(data['success'])
        self.assertEqual(Product.objects.count(), initial_count - 1)
        self.assertFalse(Product.objects.filter(id=self.product1.id).exists())

    def test_export_products(self):
        """Test exporting products to CSV."""
        url = reverse('staff:export_products')
        response = self.staff_client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response['Content-Type'], 'text/csv'
        )
        self.assertEqual(
            response['Content-Disposition'],
            'attachment; filename=products_export.csv'
        )

        # Check CSV content
        content = response.content.decode('utf-8')
        csv_reader = csv.reader(StringIO(content))
        rows = list(csv_reader)

        # Check header
        self.assertEqual(rows[0][0], 'ID')
        self.assertEqual(rows[0][1], 'Name')

        # Check data rows
        self.assertEqual(len(rows), 4)  # Header + 3 products

        # Check product data is included
        product_names = [row[1] for row in rows[1:]]
        self.assertIn(self.product1.name, product_names)
        self.assertIn(self.product2.name, product_names)
        self.assertIn(self.product3.name, product_names)

    def test_export_template(self):
        """Test exporting template CSV for imports."""
        url = reverse('staff:export_template')
        response = self.staff_client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response['Content-Type'], 'text/csv'
        )
        self.assertEqual(
            response['Content-Disposition'],
            'attachment; filename=products_import_template.csv'
        )

        # Check CSV content
        content = response.content.decode('utf-8')
        csv_reader = csv.reader(StringIO(content))
        rows = list(csv_reader)

        # Check header
        self.assertEqual(rows[0][0], 'Name*')

        # Check example row
        self.assertEqual(rows[1][0], 'Example Product')

    def test_import_products_success(self):
        """Test successful product import from CSV."""
        url = reverse('staff:import_products')

        # Create CSV data
        csv_data = StringIO()
        writer = csv.writer(csv_data)
        writer.writerow(['Name', 'Description', 'Price', 'Compare At Price',
                        'Stock Quantity', 'Category', 'Active'])
        writer.writerow(['Imported Product', 'Imported product description',
                        '49.99', '59.99', '15', 'Test Category 1', 'Yes'])

        # Create file for upload
        csv_file = SimpleUploadedFile(
            'products.csv',
            csv_data.getvalue().encode('utf-8'),
            content_type='text/csv'
        )

        initial_count = Product.objects.count()

        # Submit form
        response = self.staff_client.post(
            url,
            {'importFile': csv_file},
            format='multipart'
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)

        self.assertTrue(data['success'])
        self.assertEqual(Product.objects.count(), initial_count + 1)

        # Check the imported product
        imported_product = Product.objects.get(name='Imported Product')
        self.assertEqual(imported_product.price, Decimal('49.99'))
        self.assertEqual(imported_product.stock_quantity, 15)
        self.assertEqual(imported_product.category, self.category1)

        # Check if inventory log was created
        self.assertTrue(InventoryLog.objects.filter(
            product=imported_product,
            change=15,
            reason="Initial import"
        ).exists())

    def test_product_quick_edit(self):
        """Test quick edit functionality for products."""
        url = reverse('staff:product_quick_edit', kwargs={'pk': self.product1.id})

        # Test updating price
        response = self.staff_client.post(url, {
            'field': 'price',
            'value': '25.99'
        })

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)

        self.assertTrue(data['success'])
        self.product1.refresh_from_db()
        self.assertEqual(self.product1.price, Decimal('25.99'))

        # Test updating stock quantity
        old_stock = self.product1.stock_quantity
        response = self.staff_client.post(url, {
            'field': 'stock_quantity',
            'value': '20'
        })

        self.assertEqual(response.status_code, 200)
        self.product1.refresh_from_db()
        self.assertEqual(self.product1.stock_quantity, 20)

        # Check if inventory log was created
        stock_change = 20 - old_stock
        self.assertTrue(InventoryLog.objects.filter(
            product=self.product1,
            change=stock_change,
            reason__contains="Quick edit"
        ).exists())

        # Test toggling active status
        response = self.staff_client.post(url, {
            'field': 'is_active',
            'value': 'false'
        })

        self.assertEqual(response.status_code, 200)
        self.product1.refresh_from_db()
        self.assertFalse(self.product1.is_active)
