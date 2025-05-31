"""
Profile-related views for the users app.
Handles user profile dashboard and profile management.
"""

from django.conf import settings
from django.contrib import messages
from django.contrib.auth.decorators import login_required
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

            # Verify the file was saved to S3 if enabled and profile has image
            if settings.USE_S3 and profile.profile_image:
                try:
                    from skunkmonkey.utils.s3_verification import (
                        verify_s3_file_exists,
                    )
                    verify_s3_file_exists(str(profile.profile_image))
                    # S3 verification completed (results logged internally)
                except Exception:
                    # S3 verification failed, but profile save was successful
                    pass

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
    clear_checkbox_name = (
        profile_form['profile_image'].field.widget.clear_checkbox_name
    )
    clear_image = request.POST.get(clear_checkbox_name)
    # Also check our custom checkbox
    remove_checkbox = request.POST.get('remove-image-checkbox')

    # If user wants to clear/remove the image
    if clear_image == 'on' or remove_checkbox == 'on':
        profile.profile_image = None
        return

    # Process cropped image data FIRST (prioritize over direct file upload)
    # This ensures that if user crops an image, the cropped version is used
    elif (
        cropped_image_data and cropped_image_data[0]
        and image_selected == '1'
    ):
        # Handle cropped image data processing
        try:
            # Validate cropped image data
            if not isinstance(cropped_image_data, list):
                return

            # Process the cropped data
            data = cropped_image_data[0]

            # Check if data looks like valid base64 image
            if not data or len(data) < 20:
                return

            # Check and fix base64 data format if needed
            if ';base64,' not in data:
                # Try to fix by detecting common image signatures
                if data.startswith('/9j/'):  # JPEG signature
                    data = "data:image/jpeg;base64," + data
                    cropped_image_data[0] = data
                elif data.startswith('iVBOR'):  # PNG signature
                    data = "data:image/png;base64," + data
                    cropped_image_data[0] = data
                elif data.startswith('R0lGOD'):  # GIF signature
                    data = "data:image/gif;base64," + data
                    cropped_image_data[0] = data
                elif data.startswith('UklGR'):  # WEBP signature
                    data = "data:image/webp;base64," + data
                    cropped_image_data[0] = data
                else:
                    # Try with a generic prefix as last resort
                    data = "data:image/jpeg;base64," + data
                    cropped_image_data[0] = data

            # Use the S3 utility function to handle base64 image uploads
            from skunkmonkey.utils.s3_utils import upload_base64_to_model_field

            try:
                result = upload_base64_to_model_field(
                    profile,
                    'profile_image',
                    cropped_image_data[0],
                    'profile_images',
                    f"user_{profile.user.id}"
                )

                # If upload failed and we have direct file, use it
                if (not result['success']
                        and 'profile-image-file' in request.FILES):
                    profile.profile_image = request.FILES['profile-image-file']

            except Exception:
                # Fall back to direct file upload if available
                if 'profile-image-file' in request.FILES:
                    profile.profile_image = request.FILES['profile-image-file']
                return

        except Exception:
            # Final fallback attempt
            if 'profile-image-file' in request.FILES:
                profile.profile_image = request.FILES['profile-image-file']

    # Fallback: handle direct file upload if no cropped data was processed
    elif (
        'profile-image-file' in request.FILES
        and image_selected == '1'
    ):
        file = request.FILES['profile-image-file']

        # If S3 is enabled, verify connection before proceeding
        if settings.USE_S3:
            try:
                from skunkmonkey.utils.s3_utils import get_s3_client
                s3 = get_s3_client()
                s3.list_objects_v2(
                    Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                    MaxKeys=1
                )
            except Exception:
                # S3 connection failed, but continue with upload
                pass

        # Set the file to the profile image field
        profile.profile_image = file
        return
