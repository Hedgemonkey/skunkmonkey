from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator
from django.db.models import Sum, F, DecimalField
from django.utils.text import slugify
from decimal import Decimal

from products.models import Product

class Cart(models.Model):
    """
    Shopping cart model that can be associated with a user (if logged in)
    or a session ID (for anonymous users)
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='cart', 
        null=True, 
        blank=True
    )
    session_id = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(user__isnull=False) | models.Q(session_id__isnull=False),
                name='cart_user_or_session_required'
            )
        ]

    def __str__(self):
        return f"Cart for {self.user.username if self.user else 'Anonymous'}"

    @property
    def total_price(self):
        """Calculate the total price of all items in the cart"""
        return self.items.aggregate(
            total=Sum(F('quantity') * F('product__price'), output_field=DecimalField())
        )['total'] or Decimal('0.00')

    @property
    def item_count(self):
        """Calculate the total number of items in the cart"""
        return self.items.aggregate(count=Sum('quantity'))['count'] or 0

    def add_item(self, product, quantity=1, update_quantity=False):
        """
        Add a product to the cart or update its quantity
        """
        item, created = self.items.get_or_create(
            product=product,
            defaults={'quantity': 0}
        )
        
        if update_quantity:
            item.quantity = quantity
        else:
            item.quantity += quantity
        
        # Ensure quantity doesn't exceed available stock
        if item.quantity > product.stock_quantity:
            item.quantity = product.stock_quantity
            
        item.save()
        return item

    def remove_item(self, product):
        """
        Remove a product from the cart
        """
        self.items.filter(product=product).delete()

    def clear(self):
        """
        Remove all items from the cart
        """
        self.items.all().delete()

    def transfer_cart_items_to_order(self, order):
        """
        Transfer all cart items to a new order and create OrderItem objects
        """
        for item in self.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price
            )
            
            # Update product stock
            product = item.product
            product.stock_quantity -= item.quantity
            product.save()
            
        # Clear the cart after creating the order
        self.clear()


class CartItem(models.Model):
    """
    Item in a shopping cart
    """
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='cart_items')
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('cart', 'product')

    def __str__(self):
        return f"{self.quantity} × {self.product.name}"

    @property
    def subtotal(self):
        """Calculate the cost of this many items"""
        return self.product.price * self.quantity


class Order(models.Model):
    """
    Order model to track customer purchases
    """
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        related_name='orders',
        null=True,
        blank=True
    )
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    shipping_address = models.TextField()
    
    # Order tracking fields
    order_number = models.CharField(max_length=32, unique=True, editable=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    tracking_number = models.CharField(max_length=255, blank=True, null=True)
    
    # Payment related fields (will be expanded with Stripe integration)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    stripe_pid = models.CharField(max_length=255, blank=True, null=True)
    is_paid = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        """
        Override the original save method to generate an order number if not already set
        """
        if not self.order_number:
            self.order_number = self._generate_order_number()
        super().save(*args, **kwargs)

    def _generate_order_number(self):
        """
        Generate a unique order number
        """
        from datetime import datetime
        import uuid
        
        date_string = datetime.now().strftime('%Y%m%d')
        unique_id = uuid.uuid4().hex[:8].upper()
        return f"SM-{date_string}-{unique_id}"

    def __str__(self):
        return f"Order #{self.order_number}"

    def update_total(self):
        """
        Update the total price of the order based on items
        """
        self.total_price = self.items.aggregate(
            total=Sum(F('quantity') * F('price'), output_field=DecimalField())
        )['total'] or Decimal('0.00')
        self.save()

    def get_status_display(self):
        """Return the human-readable status"""
        return dict(self.STATUS_CHOICES).get(self.status, self.status)


class OrderItem(models.Model):
    """
    Items within an order - with locked-in pricing at time of purchase
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(
        Product, 
        on_delete=models.SET_NULL, 
        related_name='order_items',
        null=True
    )
    # Store product name in case product is deleted
    product_name = models.CharField(max_length=255)
    # Store price at time of purchase
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    
    def save(self, *args, **kwargs):
        """
        Override save to store product name
        """
        if self.product and not self.product_name:
            self.product_name = self.product.name
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quantity} × {self.product_name} in {self.order.order_number}"

    @property
    def subtotal(self):
        """Calculate the cost of this many items"""
        return self.price * self.quantity


class WishList(models.Model):
    """
    Wishlist model for saved products
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wishlist'
    )
    products = models.ManyToManyField(
        Product,
        through='WishListItem',
        related_name='wishlists'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Wishlist for {self.user.username}"

    def add_product(self, product):
        """Add a product to the wishlist"""
        _, created = WishListItem.objects.get_or_create(
            wishlist=self,
            product=product
        )
        return created

    def remove_product(self, product):
        """Remove a product from the wishlist"""
        return WishListItem.objects.filter(
            wishlist=self,
            product=product
        ).delete()[0] > 0

    def has_product(self, product):
        """Check if a product is in the wishlist"""
        return WishListItem.objects.filter(
            wishlist=self,
            product=product
        ).exists()


class WishListItem(models.Model):
    """
    Intermediary model for WishList-Product relationship
    """
    wishlist = models.ForeignKey(WishList, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('wishlist', 'product')

    def __str__(self):
        return f"{self.product.name} in {self.wishlist}"


class ComparisonList(models.Model):
    """
    Model to track products being compared by a user
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='comparison_list',
        null=True,
        blank=True
    )
    session_id = models.CharField(max_length=255, null=True, blank=True)
    products = models.ManyToManyField(
        Product,
        related_name='comparison_lists'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(user__isnull=False) | models.Q(session_id__isnull=False),
                name='comparison_user_or_session_required'
            )
        ]
    
    def __str__(self):
        return f"Comparison list for {self.user.username if self.user else 'Anonymous'}"
    
    def add_product(self, product):
        """Add a product to the comparison list"""
        if self.products.count() >= 4:  # Limit to 4 products
            return False
        self.products.add(product)
        return True
    
    def remove_product(self, product):
        """Remove a product from the comparison list"""
        self.products.remove(product)
        return True
    
    def clear(self):
        """Remove all products from the comparison list"""
        self.products.clear()
        return True


class RecentlyViewedItem(models.Model):
    """
    Model to track recently viewed products by a user
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='recently_viewed_items',
        null=True,
        blank=True
    )
    session_id = models.CharField(max_length=255, null=True, blank=True)
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='recently_viewed_by'
    )
    viewed_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(user__isnull=False) | models.Q(session_id__isnull=False),
                name='recently_viewed_user_or_session_required'
            ),
            models.UniqueConstraint(
                fields=['user', 'product'],
                condition=models.Q(user__isnull=False),
                name='unique_user_product_view'
            ),
            models.UniqueConstraint(
                fields=['session_id', 'product'],
                condition=models.Q(session_id__isnull=False),
                name='unique_session_product_view'
            )
        ]
        ordering = ['-viewed_at']
    
    def __str__(self):
        viewer = self.user.username if self.user else f"Session {self.session_id[:8]}"
        return f"{viewer} viewed {self.product.name}"
