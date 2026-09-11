from django.urls import path

from .views import (
    FacultyAssignmentListView,
    FacultyAttendanceStudentsView,
    FacultyMarkAttendanceView,
)
from .views import (
    FacultyAssignmentListView,
    FacultyAttendanceStudentsView,
    FacultyMarkAttendanceView,
    FacultyAttendanceHistoryView,
)


urlpatterns = [

    path(
        "faculty/assignments/",
        FacultyAssignmentListView.as_view(),
        name="faculty-assignments"
    ),

    path(
        "faculty/students/",
        FacultyAttendanceStudentsView.as_view(),
        name="faculty-attendance-students"
    ),

    path(
        "faculty/mark/",
        FacultyMarkAttendanceView.as_view(),
        name="faculty-mark-attendance"
    ),
    path(
    "faculty/history/",
    FacultyAttendanceHistoryView.as_view(),
    name="faculty-attendance-history"
),
]