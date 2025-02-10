# users/views.py

from django.shortcuts import render
from django.http import JsonResponse  
from allauth.account.models import EmailAddress
from django.contrib.auth.decorators import login_required


@login_required
def user_details(request):
    user = request.user

    # Example: Load user's email addresses
    email_addresses = EmailAddress.objects.filter(user=user)


    return render(request, "users/details.html", {'email_addresses': email_addresses})  # New template

@login_required
def manage_account(request):

    return render(request, 'users/manage.html')
