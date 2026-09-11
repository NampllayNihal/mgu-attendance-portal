from django.contrib import admin
from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = (
        "roll_number",
        "user",
        "section",
        "parent_phone",
        "is_active_student",
    )

    search_fields = (
        "roll_number",
        "user__username",
        "user__first_name",
        "user__last_name",
    )

    list_filter = (
        "section",
        "is_active_student",
    )