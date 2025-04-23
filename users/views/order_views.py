"""
Order-related views for the users app.
Handles order history and order details.
"""
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.exceptions import FieldError
from django.http import Http404
from django.shortcuts import get_object_or_404, redirect, render

from shop.models import Order

from ..models import UserProfile


@login_required
def order_history(request):
    """Display the user's order history."""
    orders = []
    user_profile, _ = UserProfile.objects.get_or_create(
        user=request.user
    )

    if Order:  # Check if Order model was imported successfully
        try:
            # Primary attempt - orders linked directly to User
            orders = Order.objects.filter(
                user=request.user
            ).order_by('-created_at')
        except FieldError:
            try:
                # Alternative - orders linked through UserProfile
                orders = Order.objects.filter(
                    user_profile=user_profile
                ).order_by('-created_at')
            except (AttributeError, FieldError):
                messages.error(
                    request,
                    "Could not retrieve order history. Order model linkage "
                    "mismatch."
                )
                orders = []
        except Exception as e:
            messages.error(
                request,
                f"An error occurred retrieving order history: {e}"
            )
            orders = []
    else:
        messages.warning(request, "Order history feature is not available.")

    context = {
        'orders': orders,
        'active_tab': 'orders'
    }
    return render(request, 'users/order_history.html', context)


@login_required
def order_detail(request, order_number):
    """Display details for a specific order."""
    order = None
    user_profile, _ = UserProfile.objects.get_or_create(
        user=request.user
    )

    if Order:
        try:
            # Fetch the specific order
            order = get_object_or_404(Order, order_number=order_number)

            # Security check: Ensure the order belongs to the current user
            if hasattr(order, 'user') and order.user == request.user:
                pass  # Order linked directly to user and matches
            elif hasattr(order, 'user_profile') and (
                order.user_profile == user_profile
            ):
                pass  # Order linked to user_profile and matches
            else:
                # If neither matches, deny access
                raise Http404("Order not found or access denied.")

        except Order.DoesNotExist:
            messages.error(request, "Order not found.")
            return redirect('users:order_history')
        except Http404:
            messages.error(request, "Order not found or access denied.")
            return redirect('users:order_history')
        except Exception as e:
            messages.error(
                request,
                f"An error occurred retrieving the order: {e}"
            )
            return redirect('users:order_history')
    else:
        messages.warning(request, "Order detail feature is not available.")
        return redirect('users:order_history')

    context = {
        'order': order,
        'active_tab': 'orders'
    }
    return render(request, 'users/order_detail.html', context)
