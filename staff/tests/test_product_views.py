"""
Tests for staff product views
"""
import io
import tempfile
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import Client, TestCase
from django.urls import reverse

from PIL import Image

from products.models import Category, InventoryLog, Product

User = get_user_model()


class StaffProductViewsTest(TestCase):
    """Test cases for staff product views."""

    def setUp(self):
        """Set up test data for product views tests."""
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

        # Create image for testing
        self.temp_image = self._create_test_image()

        # Set up test clients
        self.client = Client()
        self.staff_client = Client()
        self.staff_client.login(username='staffuser', password='password123')
        self.regular_client = Client()
        self.regular_client.login(username='regularuser', password='password123')

    def _create_test_image(self):
        """Helper to create a test image"""
        # Create a test image
        with tempfile.NamedTemporaryFile(suffix='.jpg') as f:
            image = Image.new('RGB', (100, 100), 'white')
            image.save(f, format='JPEG')
            f.seek(0)
            return SimpleUploadedFile(
                name='test_image.jpg',
                content=f.read(),
                content_type='image/jpeg'
            )

    def test_product_dashboard_view(self):
        """Test ProductDashboardView displays correctly."""
        url = reverse('staff:product_dashboard')
        response = self.staff_client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'staff/product/dashboard.html')
        self.assertContains(response, 'Test Product 1')

        # Check context data exists
        self.assertEqual(response.context['total_products'], 3)
        self.assertEqual(response.context['active_products'], 2)
        self.assertEqual(response.context['out_of_stock'], 1)

    def test_product_dashboard_view_unauthorized(self):
        """Test ProductDashboardView restricts access properly."""
        url = reverse('staff:product_dashboard')

        # Test unauthenticated access
        response = self.client.get(url)
        self.assertEqual(response.status_code, 302)  # Redirect to login

        # Test non-staff access
        response = self.regular_client.get(url)
        self.assertEqual(response.status_code, 403)  # Forbidden

    def test_product_list_view(self):
        """Test ProductListView displays and filters correctly."""
        url = reverse('staff:product_list')
        response = self.staff_client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'staff/product/product_list.html')

        # Test with filters
        response = self.staff_client.get(f"{url}?search=product+1")
        self.assertEqual(len(response.context['products']), 1)
        self.assertEqual(response.context['products'][0], self.product1)

        response = self.staff_client.get(f"{url}?category={self.category1.id}")
        self.assertEqual(len(response.context['products']), 2)

        response = self.staff_client.get(f"{url}?stock_status=out_of_stock")
        self.assertEqual(len(response.context['products']), 1)
        self.assertEqual(response.context['products'][0], self.product3)

        response = self.staff_client.get(f"{url}?status=inactive")
        self.assertEqual(len(response.context['products']), 1)
        self.assertEqual(response.context['products'][0], self.product3)

        # Test sorting
        response = self.staff_client.get(f"{url}?sort=price-asc")
        self.assertEqual(list(response.context['products']), [self.product1, self.product2, self.product3])

        response = self.staff_client.get(f"{url}?sort=price-desc")
        self.assertEqual(list(response.context['products']), [self.product3, self.product2, self.product1])

    def test_product_detail_view(self):
        """Test ProductDetailView displays correctly."""
        url = reverse('staff:product_detail', kwargs={'pk': self.product1.id})
        response = self.staff_client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'staff/product/product_detail.html')
        self.assertEqual(response.context['product'], self.product1)

        # Check related data
        self.assertIn('inventory_logs', response.context)
        self.assertIn('related_products', response.context)
        self.assertIn('review_count', response.context)

    def test_product_create_view(self):
        """Test ProductCreateView creates products correctly."""
        url = reverse('staff:product_create')

        # Test GET request
        response = self.staff_client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'staff/product/product_form.html')

        # Test POST request
        initial_count = Product.objects.count()

        data = {
            'name': 'New Test Product',
            'description': 'New product description',
            'price': '49.99',
            'stock_quantity': 25,
            'category': self.category1.id,
            'is_active': True,
        }

        response = self.staff_client.post(url, data)

        # Should redirect to detail view on success
        self.assertEqual(response.status_code, 302)

        # Check product was created
        self.assertEqual(Product.objects.count(), initial_count + 1)

        # Check the new product
        new_product = Product.objects.get(name='New Test Product')
        self.assertEqual(new_product.price, Decimal('49.99'))
        self.assertEqual(new_product.stock_quantity, 25)
        self.assertEqual(new_product.category, self.category1)

        # Check inventory log created
        log = InventoryLog.objects.filter(product=new_product).first()
        self.assertIsNotNone(log)
        self.assertEqual(log.change, 25)

    def test_product_update_view(self):
        """Test ProductUpdateView updates products correctly."""
        url = reverse('staff:product_update', kwargs={'pk': self.product1.id})

        # Test GET request
        response = self.staff_client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'staff/product/product_form.html')

        # Test POST request with changes
        data = {
            'name': 'Updated Product 1',
            'description': 'Updated description',
            'price': '24.99',
            'stock_quantity': 15,  # Changed from 10
            'category': self.category2.id,  # Changed category
            'is_active': True,
        }

        response = self.staff_client.post(url, data)

        # Should redirect to detail view on success
        self.assertEqual(response.status_code, 302)

        # Check product was updated
        self.product1.refresh_from_db()
        self.assertEqual(self.product1.name, 'Updated Product 1')
        self.assertEqual(self.product1.price, Decimal('24.99'))
        self.assertEqual(self.product1.stock_quantity, 15)
        self.assertEqual(self.product1.category, self.category2)

        # Check inventory log created for stock change
        log = InventoryLog.objects.filter(
            product=self.product1,
            change=5  # 15 - 10 = 5
        ).first()
        self.assertIsNotNone(log)

    def test_category_list_view(self):
        """Test CategoryListView displays correctly."""
        url = reverse('staff:category_list')
        response = self.staff_client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'staff/product/category_list.html')

        # Check context
        self.assertEqual(response.context['total_categories'], 2)
        self.assertIn('category_stats', response.context)
        self.assertIn('top_categories', response.context)

    def test_category_create_view(self):
        """Test CategoryCreateView creates categories correctly."""
        url = reverse('staff:category_create')

        # Test GET request
        response = self.staff_client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'staff/product/category_form.html')

        # Test POST request
        initial_count = Category.objects.count()

        data = {
            'name': 'New Test Category',
            'is_active': True,
        }

        response = self.staff_client.post(url, data)

        # Should redirect to category list on success
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('staff:category_list'))

        # Check category was created
        self.assertEqual(Category.objects.count(), initial_count + 1)

        # Check the new category
        new_category = Category.objects.get(name='New Test Category')
        self.assertEqual(new_category.slug, 'new-test-category')
        self.assertTrue(new_category.is_active)

    def test_category_update_view(self):
        """Test CategoryUpdateView updates categories correctly."""
        url = reverse('staff:category_update', kwargs={'pk': self.category1.id})

        # Test GET request
        response = self.staff_client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'staff/product/category_form.html')

        # Test POST request with changes
        data = {
            'name': 'Updated Category 1',
            'is_active': False,
        }

        response = self.staff_client.post(url, data)

        # Should redirect to category list on success
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('staff:category_list'))

        # Check category was updated
        self.category1.refresh_from_db()
        self.assertEqual(self.category1.name, 'Updated Category 1')
        self.assertFalse(self.category1.is_active)
        self.assertEqual(self.category1.slug, 'updated-category-1')

    def test_product_quick_edit(self):
        """Test product_quick_edit updates individual fields."""
        url = reverse('staff:product_quick_edit', kwargs={'pk': self.product1.id})

        # Test updating price
        response = self.staff_client.post(url, {
            'field': 'price',
            'value': '25.99'
        })

        self.assertEqual(response.status_code, 200)
        self.product1.refresh_from_db()
        self.assertEqual(self.product1.price, Decimal('25.99'))

        # Test updating stock
        old_stock = self.product1.stock_quantity
        response = self.staff_client.post(url, {
            'field': 'stock_quantity',
            'value': '20'
        })

        self.assertEqual(response.status_code, 200)
        self.product1.refresh_from_db()
        self.assertEqual(self.product1.stock_quantity, 20)

        # Check log created
        log_created = InventoryLog.objects.filter(
            product=self.product1,
            change=20 - old_stock
        ).exists()
        self.assertTrue(log_created)

        # Test invalid field
        response = self.staff_client.post(url, {
            'field': 'invalid_field',
            'value': 'test'
        })
        self.assertEqual(response.status_code, 400)  # Bad request

    def test_category_ajax_list(self):
        """Test category_ajax_list returns JSON data."""
        url = reverse('staff:category_ajax_list')
        response = self.staff_client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/json')

        # Check response content
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(len(data['categories']), 2)

        # Test filtering
        response = self.staff_client.get(f"{url}?search=category+1")
        data = response.json()
        self.assertEqual(len(data['categories']), 1)
        self.assertEqual(data['categories'][0]['name'], 'Test Category 1')
