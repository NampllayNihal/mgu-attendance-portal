from django.urls import path

from .views import (
    AdminDepartmentListCreateView,
    AdminProgramListCreateView,
    AdminAcademicYearListCreateView,
    AdminSemesterListCreateView,
    AdminSectionListCreateView,

    AdminFacultyListCreateView,
    AdminFacultyDetailView,

    AdminSubjectListCreateView,
    AdminSubjectDetailView,

    AdminTeachingAssignmentListCreateView,
    AdminTeachingAssignmentDetailView,
)


urlpatterns = [

    # =====================================================
    # CLASSES
    # =====================================================

    path(
        "admin/departments/",
        AdminDepartmentListCreateView.as_view(),
        name="admin-departments"
    ),

    path(
        "admin/programs/",
        AdminProgramListCreateView.as_view(),
        name="admin-programs"
    ),

    path(
        "admin/academic-years/",
        AdminAcademicYearListCreateView.as_view(),
        name="admin-academic-years"
    ),

    path(
        "admin/semesters/",
        AdminSemesterListCreateView.as_view(),
        name="admin-semesters"
    ),

    path(
        "admin/sections/",
        AdminSectionListCreateView.as_view(),
        name="admin-sections"
    ),


    # =====================================================
    # FACULTY
    # =====================================================

    path(
        "admin/faculty/",
        AdminFacultyListCreateView.as_view(),
        name="admin-faculty"
    ),

    path(
        "admin/faculty/<int:faculty_id>/",
        AdminFacultyDetailView.as_view(),
        name="admin-faculty-detail"
    ),


    # =====================================================
    # SUBJECTS
    # =====================================================

    path(
        "admin/subjects/",
        AdminSubjectListCreateView.as_view(),
        name="admin-subjects"
    ),

    path(
        "admin/subjects/<int:subject_id>/",
        AdminSubjectDetailView.as_view(),
        name="admin-subject-detail"
    ),


    # =====================================================
    # FACULTY SUBJECT ASSIGNMENTS
    # =====================================================

    path(
        "admin/teaching-assignments/",
        AdminTeachingAssignmentListCreateView.as_view(),
        name="admin-teaching-assignments"
    ),

    path(
        "admin/teaching-assignments/<int:assignment_id>/",
        AdminTeachingAssignmentDetailView.as_view(),
        name="admin-teaching-assignment-detail"
    ),

]