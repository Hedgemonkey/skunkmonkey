"""
Profile-related views for the users app.
Handles user profile dashboard and profile management.
"""
import base64
import uuid

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.files.base import ContentFile
from django.shortcuts import redirect, render

from shop.models import Order

from ..forms import ProfileForm, UserForm
from ..models import UserProfile


@login_required
def profile_dashboard(request):
    """
    Display the main user profile dashboard. Creates profile if missing.
    """
    # Use get_or_create to handle users who might not have a profile yet
    user_profile, created = UserProfile.objects.get_or_create(
        user=request.user
    )

    if created:
        messages.info(request, "Your profile has been initialized.")

    # Get in progress orders (created, paid or shipped status)
    in_progress_orders = Order.objects.filter(
        user=request.user,
        status__in=['created', 'paid', 'shipped']
    ).order_by('-created_at')[:5]

    # Get recent orders (all statuses, for quick access)
    recent_orders = Order.objects.filter(
        user=request.user
    ).order_by('-created_at')[:3]

    # Get wishlist items
    wishlist_items = (
        request.user.wishlist_items
        .select_related('product')
        .all()[:4]
    )

    # Get recently viewed products
    recently_viewed = (
        request.user.recently_viewed
        .select_related('product')
        .all()[:4]
    )

    context = {
        'profile': user_profile,
        'in_progress_orders': in_progress_orders,
        'recent_orders': recent_orders,
        'wishlist_items': wishlist_items,
        'recently_viewed': recently_viewed,
        'active_tab': 'dashboard'  # For highlighting navigation
    }

    return render(
        request, 'users/profile_dashboard.html', context
    )


@login_required
def manage_profile(request):
    """View for managing user profile information."""
    user = request.user
    user_profile, _ = UserProfile.objects.get_or_create(user=user)

    if request.method == 'POST':
        user_form = UserForm(request.POST, instance=user)
        profile_form = ProfileForm(
            request.POST,
            request.FILES,
            instance=user_profile
        )

        if user_form.is_valid() and profile_form.is_valid():
            user_form.save()
            profile = profile_form.save(commit=False)

            # Process profile image changes
            _handle_profile_image_update(request, profile, profile_form)

            # Save the profile with all changes
            profile.save()

            messages.success(
                request, 'Your profile has been updated successfully.'
            )
            return redirect('users:manage_profile')
    else:
        user_form = UserForm(instance=user)
        profile_form = ProfileForm(instance=user_profile)

    context = {
        'user_form': user_form,
        'profile_form': profile_form,
        'profile': user_profile,
        'active_tab': 'profile',
    }
    return render(request, 'users/manage_profile.html', context)


def _handle_profile_image_update(request, profile, profile_form):
    """
    Helper function to handle profile image updates.
    This includes processing cropped images, new uploads, or removal.
    """
    # Process cropped image data if provided
    cropped_image_data = request.POST.getlist('cropped_image_data')
    image_selected = request.POST.get('image_selected')

    # Check if the clear checkbox was checked
    clear_checkbox_name = profile_form['profile_image'].field.widget.\
        clear_checkbox_name
    clear_image = request.POST.get(clear_checkbox_name)
    # Also check our custom checkbox
    remove_checkbox = request.POST.get('remove-image-checkbox')

    # If user wants to clear/remove the image
    if clear_image == 'on' or remove_checkbox == 'on':
        profile.profile_image = None
    elif (
        'profile-image-file' in request.FILES
        and image_selected == '1'
    ):
        file = request.FILES['profile-image-file']
        profile.profile_image = file
    # If cropped image data was provided and user selected it
    elif (
        cropped_image_data and cropped_image_data[0]
        and image_selected == '1'
    ):
        # Parse the base64 image data
        format, imgstr = cropped_image_data[0].split(';base64,')
        ext = format.split('/')[-1]

        # Generate a unique filename
        filename = f"{uuid.uuid4()}.{ext}"

        # Convert base64 to file and save to profile
        data = ContentFile(base64.b64decode(imgstr), name=filename)
        profile.profile_image = data
