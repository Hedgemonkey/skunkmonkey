"""
Views for order history and details
"""
import logging
from django.views.generic import ListView, DetailView
from django.shortcuts import redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import Http404
from django.db.models import Prefetch
from django.core.exceptions import ValidationError

from ..models import Order, OrderItem
from ..utils.error_handling import ErrorHandler

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
        Get orders for current user, ordered by most recent first.
        Use prefetch_related to optimize database queries.
        """
        try:
            # Optimize queries with prefetch_related and select_related
            order_items = OrderItem.objects.select_related('product')
            
            # Prefetch related items with the optimized queryset
            return Order.objects.filter(user=self.request.user).prefetch_related(
                Prefetch('items', queryset=order_items)
            ).order_by('-created_at')
        except Exception as e:
            ErrorHandler.handle_exception(self.request, e, "retrieving order history")
            raise
    
    def get_context_data(self, **kwargs):
        """
        Add additional context data
        """
        try:
            context = super().get_context_data(**kwargs)
            context['order_count'] = context['orders'].count()
            return context
        except Exception as e:
            ErrorHandler.handle_exception(self.request, e, "preparing order history context")
            raise


class OrderDetailView(LoginRequiredMixin, DetailView):
    """
    View to display details of a specific order
    """
    model = Order
    template_name = 'shop/order_detail.html'
    context_object_name = 'order'
    
    def get_object(self, queryset=None):
        """
        Get the order object and ensure user has permission to view it
        """
        try:
            # Get the order ID from the URL
            order_id = self.kwargs.get('order_id')
            
            # Create a base queryset if none was provided
            if queryset is None:
                queryset = self.get_queryset()
            
            # Prefetch related items with select_related for products
            queryset = queryset.prefetch_related(
                Prefetch(
                    'items',
                    queryset=OrderItem.objects.select_related('product')
                )
            )
            
            # Get the order and make sure it belongs to the current user
            order = get_object_or_404(queryset, id=order_id, user=self.request.user)
            return order
            
        except Http404:
            logger.warning(f"Order not found: {self.kwargs.get('order_id')} for user {self.request.user.id}")
            raise
        except Exception as e:
            ErrorHandler.handle_exception(self.request, e, "retrieving order details")
            raise
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        try:
            # Add any additional context data if needed
            order = self.get_object()
            context['order_items'] = order.items.all()
            return context
        except Exception as e:
            ErrorHandler.handle_exception(self.request, e, "preparing order context")
            raise


class OrderCompleteView(DetailView):
    """
    Display completed order details
    """
    model = Order
    template_name = 'shop/order_complete.html'
    context_object_name = 'order'
    pk_url_kwarg = 'order_id'
    
    def get_queryset(self):
        """
        Get the queryset and prefetch related items with a restricted queryset
        """
        try:
            return super().get_queryset().prefetch_related(
                Prefetch(
                    'items',
                    queryset=OrderItem.objects.select_related('product')
                )
            )
        except Exception as e:
            ErrorHandler.handle_exception(self.request, e, "preparing order queryset")
            raise
    
    def get_object(self, queryset=None):
        """
        Get the order object and ensure user has permission to view it
        """
        try:
            if queryset is None:
                queryset = self.get_queryset()
                
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
            
        except Http404:
            logger.warning(f"Order not found or unauthorized access: {self.kwargs.get('order_id')}")
            raise
        except Exception as e:
            ErrorHandler.handle_exception(self.request, e, "retrieving order")
            raise
    
    def get_context_data(self, **kwargs):
        """
        Add additional context data
        """
        try:
            context = super().get_context_data(**kwargs)
            order = context['order']
            
            # Add any additional data needed for the template
            context['items'] = order.items.all()
            
            # If viewing from session, clear the order from session
            if not self.request.user.is_authenticated and 'order_id' in self.request.session:
                if str(self.request.session['order_id']) == str(order.id):
                    del self.request.session['order_id']
                    
            return context
        except Exception as e:
            ErrorHandler.handle_exception(self.request, e, "preparing order complete context")
            raise
