"""
Views for order history and details
"""
import logging
from django.views.generic import ListView, DetailView
from django.shortcuts import redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import Http404

from ..models import Order

logger = logging.getLogger(__name__)

class OrderHistoryView(LoginRequiredMixin, ListView):
    """
    Display order history for a logged-in user
    """
    model = Order
    template_name = 'shop/order_history.html'
    context_object_name = 'orders'
    
    def get_queryset(self):
        """
        Get orders for current user, ordered by most recent first
        """
        return Order.objects.filter(user=self.request.user).order_by('-created_at')
    
    def get_context_data(self, **kwargs):
        """
        Add additional context data
        """
        context = super().get_context_data(**kwargs)
        context['order_count'] = context['orders'].count()
        return context


class OrderCompleteView(DetailView):
    """
    Display completed order details
    """
    model = Order
    template_name = 'shop/order_complete.html'
    context_object_name = 'order'
    pk_url_kwarg = 'order_id'
    
    def get_object(self, queryset=None):
        """
        Get the order object and ensure user has permission to view it
        """
        order = super().get_object(queryset)
        
        # Check if user has permission to view this order
        if self.request.user.is_authenticated:
            # Staff can view any order
            if self.request.user.is_staff:
                return order
            # Users can only view their own orders
            elif order.user == self.request.user:
                return order
        
        # Anonymous users can only view orders in their session
        elif 'order_id' in self.request.session and str(self.request.session['order_id']) == str(order.id):
            return order
        
        # No permission, raise 404
        logger.warning(f"Unauthorized access attempt to order {order.order_number}")
        raise Http404("Order not found")
    
    def get_context_data(self, **kwargs):
        """
        Add additional context data
        """
        context = super().get_context_data(**kwargs)
        order = context['order']
        
        # Add any additional data needed for the template
        context['items'] = order.items.all()
        
        # If viewing from session, clear the order from session
        if not self.request.user.is_authenticated and 'order_id' in self.request.session:
            if str(self.request.session['order_id']) == str(order.id):
                del self.request.session['order_id']
                
        return context