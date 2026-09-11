from django.urls import path

from .views import (
    AdminMentorAssignmentListView,
    AdminMentorAssignmentDeleteView,
    MyMentorAssignmentView,
    MentorAbsenceListView,
    UpdateAbsenceReasonView,
)


urlpatterns = [

    # =====================================
    # ADMIN
    # =====================================

    path(
        "admin/assignments/",
        AdminMentorAssignmentListView.as_view(),
        name="admin-mentor-assignments"
    ),

    path(
        "admin/assignments/<int:assignment_id>/",
        AdminMentorAssignmentDeleteView.as_view(),
        name="admin-delete-mentor-assignment"
    ),

    # =====================================
    # MENTOR
    # =====================================

    path(
        "my-assignment/",
        MyMentorAssignmentView.as_view(),
        name="my-mentor-assignment"
    ),

    path(
        "absences/",
        MentorAbsenceListView.as_view(),
        name="mentor-absences"
    ),

    path(
        "absences/<int:attendance_id>/reason/",
        UpdateAbsenceReasonView.as_view(),
        name="update-absence-reason"
    ),
]