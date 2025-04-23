"""
Address-related views for the users app.
Handles address management, addition, editing, and deletion.
"""
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from ..forms import AddressForm
from ..models import Address, UserProfile


@login_required
def manage_addresses(request):
    """Display and manage user's saved addresses."""
    addresses = Address.objects.filter(user=request.user)
    user_profile, _ = UserProfile.objects.get_or_create(
        user=request.user
    )
    context = {
        'addresses': addresses,
        'default_address_id': (
            user_profile.default_delivery_address.id
            if user_profile.default_delivery_address else None
        ),
        'active_tab': 'addresses',
    }
    return render(request, 'users/address_list.html', context)


@login_required
def add_address(request):
    """Handle adding a new address."""
    user_profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if request.method == 'POST':
        form = AddressForm(request.POST)
        if form.is_valid():
            address = form.save(commit=False)
            address.user = request.user
            address.save()

            if not user_profile.default_delivery_address:
                user_profile.default_delivery_address = address
                user_profile.save()
                messages.success(
                    request, 'Address added and set as default.'
                )
            else:
                messages.success(request, 'Address added successfully.')

            return redirect('users:manage_addresses')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = AddressForm()

    context = {
        'form': form,
        'form_title': 'Add New Address',
        'active_tab': 'addresses',
    }
    return render(request, 'users/address_form.html', context)


@login_required
def edit_address(request, address_id):
    """Handle editing an existing address."""
    address = get_object_or_404(
        Address, id=address_id, user=request.user
    )

    if request.method == 'POST':
        form = AddressForm(request.POST, instance=address)
        if form.is_valid():
            form.save()
            messages.success(request, 'Address updated successfully.')
            return redirect('users:manage_addresses')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = AddressForm(instance=address)

    context = {
        'form': form,
        'form_title': 'Edit Address',
        'address': address,
        'active_tab': 'addresses'
    }
    return render(request, 'users/address_form.html', context)


@login_required
@require_POST
def delete_address(request, address_id):
    """Delete an address."""
    address = get_object_or_404(Address, id=address_id, user=request.user)
    user_profile, _ = UserProfile.objects.get_or_create(
        user=request.user
    )

    # Check if it's the default address
    if user_profile.default_delivery_address == address:
        user_profile.default_delivery_address = None
        user_profile.save()

    address_info = address.get_short_address()
    address.delete()

    # Use JSON response for AJAX calls, otherwise use messages + redirect
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return JsonResponse({
            'success': True,
            'message': f'Address "{address_info}" deleted.'
        })

    messages.success(request, f'Address "{address_info}" deleted.')
    return redirect('users:manage_addresses')


@login_required
@require_POST
def set_default_address(request, address_id):
    """Set an address as the default delivery address."""
    address = get_object_or_404(Address, id=address_id, user=request.user)
    user_profile, _ = UserProfile.objects.get_or_create(
        user=request.user
    )
    user_profile.default_delivery_address = address
    user_profile.save()

    address_info = address.get_short_address()

    # Use JSON response for AJAX calls, otherwise use messages + redirect
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return JsonResponse({
            'success': True,
            'message': f'Address "{address_info}" set as default.'
        })

    messages.success(request, f'Address "{address_info}" set as default.')
    return redirect('users:manage_addresses')
