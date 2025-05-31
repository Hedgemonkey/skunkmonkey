from django import template

from ..models import ComparisonList

register = template.Library()


@register.filter
def is_in_comparison(product, request):
    """
    Check if a product is in the user's comparison list

    Usage: {% if product|is_in_comparison:request %}
    """
    if request.user.is_authenticated:
        # For authenticated users, check database
        try:
            comparison_list = ComparisonList.objects.get(user=request.user)
            return comparison_list.products.filter(id=product.id).exists()
        except ComparisonList.DoesNotExist:
            return False
    else:
        # For anonymous users, check session
        comparison_list = request.session.get('comparison', [])
        return product.id in comparison_list


@register.simple_tag(takes_context=True)
def get_comparison_items(context):
    """
    Return the user's comparison items as a list of product IDs

    Usage: {% get_comparison_items as comparison_product_ids %}
    """
    request = context['request']

    if request.user.is_authenticated:
        # For authenticated users, get from database
        try:
            comparison_list = ComparisonList.objects.get(user=request.user)
            return list(comparison_list.products.values_list('id', flat=True))
        except ComparisonList.DoesNotExist:
            return []
    else:
        # For anonymous users, get from session
        return request.session.get('comparison', [])


@register.simple_tag(takes_context=True)
def get_comparison_count(context):
    """
    Get the count of items in the user's comparison list

    Usage: {% get_comparison_count as comparison_count %}
    """
    comparison_items = get_comparison_items(context)
    return len(comparison_items)
