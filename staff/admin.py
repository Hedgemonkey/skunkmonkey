from django.contrib import admin

from staff.models import (
    OrderAction, OrderNote, StaffNotification, StaffProfile
)

# Register staff models
admin.site.register(StaffProfile)
admin.site.register(OrderNote)
admin.site.register(OrderAction)
admin.site.register(StaffNotification)
