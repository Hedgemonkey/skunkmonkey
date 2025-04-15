from django.contrib.auth import get_user_model
from django.test import Client, TestCase
from django.test.client import RequestFactory
from django.urls import reverse

from products.models import Category, Product

from ..models import Cart

User = get_user_model()


class CartViewsTest(TestCase):
    """Tests for cart views"""

    def setUp(self):
        """Set up test data"""
        # Create user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

        # Create test client and log in
        self.client = Client()
        self.client.login(username='testuser', password='testpass123')

        # Create category
        self.category = Category.objects.create(
            name='test-category',
            friendly_name='Test Category'
        )

        # Create product
        self.product = Product.objects.create(
            name='Test Product',
            description='Test description',
            price=19.99,
            category=self.category
        )

        # Create another product
        self.product2 = Product.objects.create(
            name='Test Product 2',
            description='Test description 2',
            price=29.99,
            category=self.category
        )

        # Create a request factory for testing
        self.factory = RequestFactory()

    def test_cart_detail_view(self):
        """Test cart detail view"""
        response = self.client.get(reverse('shop:cart'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'shop/cart.html')

    def test_add_to_cart(self):
        """Test adding a product to the cart"""
        # Add product to cart
        response = self.client.post(
            reverse('shop:cart_add', args=[self.product.id]),
            {'quantity': 2, 'update': False}
        )

        # Check redirect
        self.assertEqual(response.status_code, 302)

        # Check cart contains the product
        cart = Cart.objects.get(user=self.user)
        self.assertEqual(cart.items.count(), 1)

        # Check quantity
        cart_item = cart.items.first()
        self.assertEqual(cart_item.product, self.product)
        self.assertEqual(cart_item.quantity, 2)

    def test_add_to_cart_ajax(self):
        """Test adding a product to the cart via AJAX"""
        # Add product to cart via AJAX
        response = self.client.post(
            reverse('shop:cart_add', args=[self.product.id]),
            {'quantity': 1, 'update': False},
            HTTP_X_REQUESTED_WITH='XMLHttpRequest'
        )

        # Check response
        self.assertEqual(response.status_code, 200)
        self.assertIn('success', response.json())
        self.assertTrue(response.json()['success'])

        # Check cart contains the product
        cart = Cart.objects.get(user=self.user)
        self.assertEqual(cart.items.count(), 1)

    def test_remove_from_cart(self):
        """Test removing a product from the cart"""
        # First add product to cart
        response = self.client.post(
            reverse('shop:cart_add', args=[self.product.id]),
            {'quantity': 1, 'update': False}
        )

        # Now remove it
        response = self.client.get(
            reverse('shop:cart_remove', args=[self.product.id])
        )

        # Check redirect
        self.assertEqual(response.status_code, 302)

        # Check cart is empty
        cart = Cart.objects.get(user=self.user)
        self.assertEqual(cart.items.count(), 0)

    def test_update_cart_quantity(self):
        """Test updating a product quantity in the cart"""
        # First add product to cart
        self.client.post(
            reverse('shop:cart_add', args=[self.product.id]),
            {'quantity': 1, 'update': False}
        )

        # Now update quantity
        response = self.client.post(
            reverse('shop:cart_update_quantity', args=[self.product.id]),
            {'quantity': 3},
            HTTP_X_REQUESTED_WITH='XMLHttpRequest'
        )

        # Check response
        self.assertEqual(response.status_code, 200)
        json_response = response.json()
        self.assertTrue(json_response['success'])

        # Check quantity updated
        cart = Cart.objects.get(user=self.user)
        cart_item = cart.items.get(product=self.product)
        self.assertEqual(cart_item.quantity, 3)

    def test_update_cart_quantity_to_zero(self):
        """Test updating a product quantity to zero (should remove it)"""
        # First add product to cart
        self.client.post(
            reverse('shop:cart_add', args=[self.product.id]),
            {'quantity': 1, 'update': False}
        )

        # Now update quantity to zero
        response = self.client.post(
            reverse('shop:cart_update_quantity', args=[self.product.id]),
            {'quantity': 0},
            HTTP_X_REQUESTED_WITH='XMLHttpRequest'
        )

        # Check response
        self.assertEqual(response.status_code, 200)
        json_response = response.json()
        self.assertTrue(json_response['success'])

        # Check item removed
        cart = Cart.objects.get(user=self.user)
        self.assertEqual(cart.items.count(), 0)

    def test_invalid_quantity(self):
        """Test adding a product with invalid quantity"""
        # Try to add product with negative quantity
        response = self.client.post(
            reverse('shop:cart_add', args=[self.product.id]),
            {'quantity': -1, 'update': False},
            HTTP_X_REQUESTED_WITH='XMLHttpRequest'
        )

        # Check response
        self.assertEqual(response.status_code, 400)
        json_response = response.json()
        self.assertFalse(json_response['success'])

        # Check cart is empty
        cart = Cart.objects.get(user=self.user)
        self.assertEqual(cart.items.count(), 0)

    def test_product_not_found(self):
        """Test adding a non-existent product"""
        # Try to add non-existent product
        non_existent_id = 999
        response = self.client.post(
            reverse('shop:cart_add', args=[non_existent_id]),
            {'quantity': 1, 'update': False}
        )

        # Check response (should be 404 Not Found)
        self.assertEqual(response.status_code, 404)
