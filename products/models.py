from django.contrib.auth import get_user_model
from django.db import models
from django.urls import reverse
from django.utils import timezone
from django.utils.text import slugify

User = get_user_model()


class Category(models.Model):

    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    # Allow blank for auto-generation
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True,
        related_name='children')
    level = models.PositiveIntegerField(default=0, editable=False)
    order = models.PositiveIntegerField(default=0)
    friendly_name = models.CharField(max_length=255, blank=True)
    image = models.ImageField(
        upload_to='category_images/', blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)

        # Calculate level based on parent
        if self.parent:
            self.level = self.parent.level + 1
        else:
            self.level = 0

        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse("products:category_detail", kwargs={"slug": self.slug})

    @property
    def get_ancestors(self):
        """Return list of ancestors from root to parent"""
        ancestors = []
        current = self.parent
        while current:
            ancestors.insert(0, current)
            current = current.parent
        return ancestors

    @property
    def get_descendants(self):
        """Return all descendants of this category"""
        descendants = []
        for child in self.children.all():
            descendants.append(child)
            descendants.extend(child.get_descendants)
        return descendants


class Product(models.Model):

    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    compare_at_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)
    stock_quantity = models.PositiveIntegerField(default=0)
    image = models.ImageField(
        upload_to='product_images/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse("shop:product_detail", kwargs={"slug": self.slug})

    @property
    def is_new(self):
        """Return True if product was created in the last 30 days"""
        return self.created_at >= (
            timezone.now() - timezone.timedelta(days=30))

    @property
    def is_sale(self):
        """Return True if product has a sale price"""
        return self.compare_at_price and self.compare_at_price > self.price

    @property
    def is_low_stock(self):
        """Return True if the product has low stock (5 or fewer items)"""
        return 0 < self.stock_quantity <= 5

    @property
    def is_out_of_stock(self):
        """Return True if the product is out of stock"""
        return self.stock_quantity == 0

    @property
    def discount_percentage(self):
        """Return the discount percentage if the product is on sale"""
        if self.is_sale:
            discount = (
                (self.compare_at_price - self.price)
                / self.compare_at_price
            ) * 100
            return int(discount)
        return 0


class Review(models.Model):

    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.user.username} on {self.product.name}"


class InventoryLog(models.Model):

    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name='inventory_logs')
    change = models.IntegerField()
    reason = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Inventory change for {self.product.name}: {self.change}"


class ProductAttributeType(models.Model):
    """Define types of attributes (e.g., Color, Size, Material)"""

    name = models.CharField(max_length=100, unique=True)
    display_name = models.CharField(max_length=100)

    def __str__(self):
        return self.display_name


class ProductAttributeValue(models.Model):
    """Define possible values for each attribute type"""

    attribute_type = models.ForeignKey(
        ProductAttributeType,
        on_delete=models.CASCADE,
        related_name='values'
    )
    value = models.CharField(max_length=100)

    class Meta:
        unique_together = ('attribute_type', 'value')

    def __str__(self):
        return f"{self.attribute_type.display_name}: {self.value}"


class ProductAttribute(models.Model):
    """Associate products with attribute values"""

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='attributes'
    )
    attribute_value = models.ForeignKey(
        ProductAttributeValue,
        on_delete=models.CASCADE
    )

    class Meta:
        unique_together = ('product', 'attribute_value')

    def __str__(self):
        return f"{self.product.name} - {self.attribute_value}"
