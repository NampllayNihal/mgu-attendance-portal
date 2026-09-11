from django.urls import path

from .views import (
    StudentDashboardView,
    StudentAttendanceView,
    StudentAttendanceSummaryView,
)

urlpatterns = [
    path(
        "dashboard/",
        StudentDashboardView.as_view(),
        name="student-dashboard"
    ),

    path(
        "attendance/",
        StudentAttendanceView.as_view(),
        name="student-attendance"
    ),

    path(
        "attendance/summary/",
        StudentAttendanceSummaryView.as_view(),
        name="student-attendance-summary"
    ),
]