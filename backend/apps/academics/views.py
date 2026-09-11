from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Department,
    Program,
    AcademicYear,
    Semester,
    Section,
    Subject,
    FacultyProfile,
    TeachingAssignment,
)

from .serializers import (
    DepartmentSerializer,
    ProgramSerializer,
    AcademicYearSerializer,
    SemesterSerializer,
    SectionSerializer,
    FacultySerializer,
    CreateFacultySerializer,
    SubjectSerializer,
    CreateSubjectSerializer,
    TeachingAssignmentSerializer,
    CreateTeachingAssignmentSerializer,
)

def is_admin(request):
    return request.user.is_authenticated and request.user.role == "ADMIN"


class AdminDepartmentListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if not is_admin(request):
            return Response(
                {"detail": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        departments = Department.objects.all().order_by("code")

        serializer = DepartmentSerializer(
            departments,
            many=True
        )

        return Response(serializer.data)


    def post(self, request):

        if not is_admin(request):
            return Response(
                {"detail": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = DepartmentSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        department = serializer.save()

        return Response(
            DepartmentSerializer(department).data,
            status=status.HTTP_201_CREATED
        )


class AdminProgramListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if not is_admin(request):
            return Response(
                {"detail": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        programs = Program.objects.select_related(
            "department"
        ).order_by(
            "department__code",
            "code"
        )

        serializer = ProgramSerializer(
            programs,
            many=True
        )

        return Response(serializer.data)


    def post(self, request):

        if not is_admin(request):
            return Response(
                {"detail": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ProgramSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        program = serializer.save()

        return Response(
            ProgramSerializer(program).data,
            status=status.HTTP_201_CREATED
        )


class AdminAcademicYearListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if not is_admin(request):
            return Response(
                {"detail": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        years = AcademicYear.objects.all().order_by(
            "-year"
        )

        serializer = AcademicYearSerializer(
            years,
            many=True
        )

        return Response(serializer.data)


    def post(self, request):

        if not is_admin(request):
            return Response(
                {"detail": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = AcademicYearSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        academic_year = serializer.save()

        return Response(
            AcademicYearSerializer(
                academic_year
            ).data,
            status=status.HTTP_201_CREATED
        )


class AdminSemesterListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if not is_admin(request):
            return Response(
                {"detail": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        semesters = Semester.objects.all().order_by(
            "number"
        )

        serializer = SemesterSerializer(
            semesters,
            many=True
        )

        return Response(serializer.data)


    def post(self, request):

        if not is_admin(request):
            return Response(
                {"detail": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = SemesterSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        semester = serializer.save()

        return Response(
            SemesterSerializer(
                semester
            ).data,
            status=status.HTTP_201_CREATED
        )


class AdminSectionListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if not is_admin(request):
            return Response(
                {"detail": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        sections = Section.objects.select_related(
            "program",
            "academic_year",
            "semester",
        ).order_by(
            "program__code",
            "academic_year__year",
            "semester__number",
            "name"
        )

        serializer = SectionSerializer(
            sections,
            many=True
        )

        return Response(serializer.data)


    def post(self, request):

        if not is_admin(request):
            return Response(
                {"detail": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = SectionSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        section = serializer.save()

        return Response(
            SectionSerializer(section).data,
            status=status.HTTP_201_CREATED
        )


    # =========================================================
# FACULTY MANAGEMENT
# =========================================================

from django.contrib.auth import get_user_model

User = get_user_model()


class AdminFacultyListCreateView(APIView):

    permission_classes = [IsAuthenticated]


    def get(self, request):

        if not is_admin(request):

            return Response(
                {
                    "detail": "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )


        faculty = FacultyProfile.objects.select_related(
            "user",
            "department"
        ).order_by(
            "user__first_name",
            "user__last_name"
        )


        serializer = FacultySerializer(
            faculty,
            many=True
        )


        return Response(
            serializer.data
        )


    def post(self, request):

        if not is_admin(request):

            return Response(
                {
                    "detail": "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )


        serializer = CreateFacultySerializer(
            data=request.data
        )


        serializer.is_valid(
            raise_exception=True
        )


        faculty = serializer.save()


        return Response(
            FacultySerializer(
                faculty
            ).data,
            status=status.HTTP_201_CREATED
        )


class AdminFacultyDetailView(APIView):

    permission_classes = [IsAuthenticated]


    def get_object(self, faculty_id):

        try:

            return FacultyProfile.objects.select_related(
                "user",
                "department"
            ).get(
                id=faculty_id
            )

        except FacultyProfile.DoesNotExist:

            return None


    def get(self, request, faculty_id):

        if not is_admin(request):

            return Response(
                {
                    "detail": "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )


        faculty = self.get_object(
            faculty_id
        )


        if not faculty:

            return Response(
                {
                    "detail": "Faculty not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )


        serializer = FacultySerializer(
            faculty
        )


        return Response(
            serializer.data
        )


    def patch(self, request, faculty_id):

        if not is_admin(request):

            return Response(
                {
                    "detail": "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )


        faculty = self.get_object(
            faculty_id
        )


        if not faculty:

            return Response(
                {
                    "detail": "Faculty not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )


        if "is_active" in request.data:

            faculty.user.is_active = (
                request.data["is_active"]
            )

            faculty.user.save(
                update_fields=[
                    "is_active"
                ]
            )


        if "designation" in request.data:

            faculty.designation = (
                request.data["designation"]
            )

            faculty.save(
                update_fields=[
                    "designation"
                ]
            )


        if "department" in request.data:

            department_id = (
                request.data["department"]
            )

            if department_id in [
                None,
                "",
            ]:

                faculty.department = None

            else:

                try:

                    faculty.department = (
                        Department.objects.get(
                            id=department_id
                        )
                    )

                except Department.DoesNotExist:

                    return Response(
                        {
                            "detail":
                            "Department not found."
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )


            faculty.save(
                update_fields=[
                    "department"
                ]
            )


        return Response(
            FacultySerializer(
                faculty
            ).data
        )

    # =========================================================
# SUBJECT MANAGEMENT
# =========================================================

class AdminSubjectListCreateView(APIView):

    permission_classes = [IsAuthenticated]


    def get(self, request):

        if not is_admin(request):

            return Response(
                {
                    "detail": "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )


        subjects = Subject.objects.select_related(
            "section",
            "section__program",
            "section__academic_year",
            "section__semester",
        ).order_by(
            "section__program__code",
            "code"
        )


        serializer = SubjectSerializer(
            subjects,
            many=True
        )


        return Response(
            serializer.data
        )


    def post(self, request):

        if not is_admin(request):

            return Response(
                {
                    "detail": "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )


        serializer = CreateSubjectSerializer(
            data=request.data
        )


        serializer.is_valid(
            raise_exception=True
        )


        subject = serializer.save()


        return Response(
            SubjectSerializer(
                subject
            ).data,
            status=status.HTTP_201_CREATED
        )


# =========================================================
# SUBJECT DETAIL
# =========================================================

class AdminSubjectDetailView(APIView):

    permission_classes = [IsAuthenticated]


    def get_object(self, subject_id):

        try:

            return Subject.objects.select_related(
                "section",
                "section__program",
                "section__academic_year",
                "section__semester",
            ).get(
                id=subject_id
            )

        except Subject.DoesNotExist:

            return None


    def patch(self, request, subject_id):

        if not is_admin(request):

            return Response(
                {
                    "detail": "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )


        subject = self.get_object(
            subject_id
        )


        if not subject:

            return Response(
                {
                    "detail": "Subject not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )


        allowed_fields = [
            "name",
            "code",
            "credits",
            "total_periods",
            "section",
        ]


        for field in allowed_fields:

            if field in request.data:

                setattr(
                    subject,
                    field,
                    request.data[field]
                )


        subject.save()


        return Response(
            SubjectSerializer(
                subject
            ).data
        )


# =========================================================
# TEACHING ASSIGNMENTS
# =========================================================

class AdminTeachingAssignmentListCreateView(
    APIView
):

    permission_classes = [IsAuthenticated]


    def get(self, request):

        if not is_admin(request):

            return Response(
                {
                    "detail": "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )


        assignments = TeachingAssignment.objects.select_related(
            "faculty",
            "faculty__user",
            "subject",
            "subject__section",
            "subject__section__program",
        ).order_by(
            "subject__code",
            "faculty__user__first_name"
        )


        serializer = TeachingAssignmentSerializer(
            assignments,
            many=True
        )


        return Response(
            serializer.data
        )


    def post(self, request):

        if not is_admin(request):

            return Response(
                {
                    "detail": "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )


        serializer = CreateTeachingAssignmentSerializer(
            data=request.data
        )


        serializer.is_valid(
            raise_exception=True
        )


        assignment = serializer.save()


        return Response(
            TeachingAssignmentSerializer(
                assignment
            ).data,
            status=status.HTTP_201_CREATED
        )


# =========================================================
# TEACHING ASSIGNMENT DETAIL
# =========================================================

class AdminTeachingAssignmentDetailView(
    APIView
):

    permission_classes = [IsAuthenticated]


    def delete(self, request, assignment_id):

        if not is_admin(request):

            return Response(
                {
                    "detail": "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )


        try:

            assignment = TeachingAssignment.objects.get(
                id=assignment_id
            )

        except TeachingAssignment.DoesNotExist:

            return Response(
                {
                    "detail": "Assignment not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )


        assignment.delete()


        return Response(
            {
                "message":
                "Faculty assignment removed successfully."
            },
            status=status.HTTP_204_NO_CONTENT
        )