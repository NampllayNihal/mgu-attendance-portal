from django.contrib import admin

from .models import (
    AttendanceSession,
    StudentAttendance,
)


class StudentAttendanceInline(admin.TabularInline):
    model = StudentAttendance
    extra = 0


@admin.register(AttendanceSession)
class AttendanceSessionAdmin(admin.ModelAdmin):

    list_display = (
        "date",
        "period",
        "teaching_assignment",
        "created_by",
    )

    list_filter = (
        "date",
        "period",
    )

    search_fields = (
        "teaching_assignment__subject__name",
        "teaching_assignment__subject__code",
    )

    inlines = [
        StudentAttendanceInline
    ]


@admin.register(StudentAttendance)
class StudentAttendanceAdmin(admin.ModelAdmin):

    list_display = (
        "student",
        "attendance_session",
        "status",
        "marked_by",
        "marked_at",
    )

    list_filter = (
        "status",
        "attendance_session__date",
    )

    search_fields = (
        "student__roll_number",
        "student__user__username",
    )