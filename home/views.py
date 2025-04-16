import logging

from django.conf import settings
from django.db.models import Count
from django.views.generic import TemplateView

from products.models import Category, Product

# Get logger for home app
logger = logging.getLogger('home')


class HomeView(TemplateView):
    template_name = 'home/index.html'

    def get_context_data(self, **kwargs):
        logger.info("HomeView.get_context_data called")
        context = super().get_context_data(**kwargs)
        context['request'] = self.request

        try:
            # Get featured categories
            logger.debug("Querying featured categories")
            context['categories'] = Category.objects.filter(
                is_active=True
            ).annotate(
                # Changed from 'product' to 'products'
                product_count=Count('products')
            ).order_by('-product_count')[:4]

            # Get featured products (newest products with image)
            logger.debug("Querying featured products")
            context['featured_products'] = Product.objects.filter(
                is_active=True,
                image__isnull=False
            ).order_by('-created_at')[:8]

            # Get sale products (products with compare_at_price > price)
            logger.debug("Querying sale products")
            context['sale_products'] = Product.objects.filter(
                is_active=True,
                compare_at_price__isnull=False
            ).exclude(
                compare_at_price__lte=0
            ).order_by('-created_at')[:4]

            # Get best-selling products
            # Note: This assumes you have a model that tracks product sales
            # If you don't have such functionality, you can comment this out
            """
            logger.debug("Querying bestseller products")
            context['bestsellers'] = Product.objects.filter(
                is_active=True
            ).annotate(
                order_count=Count('orderitem')
            ).order_by('-order_count')[:4]
            """

            # Add hero banners if configured
            if hasattr(settings, 'HOMEPAGE_HERO_BANNERS'):
                logger.debug("Using configured hero banners")
                context['hero_banners'] = settings.HOMEPAGE_HERO_BANNERS
            else:
                # Fallback hero content
                logger.debug("Using fallback hero banners")
                context['hero_banners'] = [{
                    'title': 'Welcome to SkunkMonkey',
                    'subtitle': 'Discover our premium products with secure \
                        checkout and fast delivery',
                    'image': None,
                    'button_text': 'Shop Now',
                    'button_url': '/products/'
                }]

        except Exception as e:
            logger.error(
                f"Error in HomeView.get_context_data: {
                    str(e)}", exc_info=True)
            # Return minimal context to avoid breaking the template
            context['categories'] = []
            context['featured_products'] = []
            context['sale_products'] = []
            context['hero_banners'] = [{
                'title': 'Welcome to SkunkMonkey',
                'subtitle': 'Discover our premium products with secure \
                    checkout and fast delivery',
                'image': None,
                'button_text': 'Shop Now',
                'button_url': '/products/'
            }]

        # Add cart item count to context
        cart = context['request'].cart
        context['item_count'] = cart.items.count()

        # Add comparison list to context
        # Handle the case of multiple ComparisonList objects
        try:
            if hasattr(context['request'], 'comparison_list'):
                # If request.comparison_list is a property that
                # performs a get(), we need to handle the case where
                # multiple objects exist
                try:
                    # Try to get the comparison list from the request
                    context['comparison_list'] = (
                        context['request'].comparison_list.product_ids)
                except Exception as e:
                    logger.warning(
                        f"Error accessing comparison_list: {
                            str(e)}")
                    # If it fails, try getting the most recent comparison list
                    from shop.models import ComparisonList

                    # Get the most recent comparison list for this user/session
                    latest_comparison = ComparisonList.objects.filter(
                        session_key=self.request.session.session_key
                    ).order_by('-created_at').first()

                    if latest_comparison:
                        context['comparison_list'] = (
                            latest_comparison.product_ids)
                    else:
                        context['comparison_list'] = []
            else:
                context['comparison_list'] = []
        except Exception as e:
            logger.error(
                f"Error handling comparison list: {
                    str(e)}", exc_info=True)
            context['comparison_list'] = []

        logger.info("HomeView.get_context_data completed")
        return context


home_view = HomeView.as_view()
