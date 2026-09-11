from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from academics.models import (
    Department,
    Program,
    AcademicYear,
    Semester,
    Section,
    Subject,
    FacultyProfile,
)

from students.models import Student


# =========================================================
# LOGIN SERIALIZER
# =========================================================

class LoginSerializer(TokenObtainPairSerializer):

    role = serializers.CharField(write_only=True)

    @classmethod
    def get_token(cls, user):

        token = super().get_token(user)

        token["username"] = user.username
        token["role"] = user.role
        token["email"] = user.email

        return token

    def validate(self, attrs):

        requested_role = attrs.pop("role")

        data = super().validate(attrs)

        # Check selected role against
        # the actual role stored in database.
        if self.user.role != requested_role:

            raise serializers.ValidationError(
                {
                    "detail": (
                        f"This account is registered as "
                        f"{self.user.get_role_display()}. "
                        f"Please use the correct login."
                    )
                }
            )

        data["user"] = {
            "id": self.user.id,
            "username": self.user.username,
            "email": self.user.email,
            "role": self.user.role,
            "first_name": self.user.first_name,
            "last_name": self.user.last_name,
        }

        return data


# =========================================================
# LOGIN VIEW
# =========================================================

class LoginView(TokenObtainPairView):

    serializer_class = LoginSerializer


# =========================================================
# ADMIN DASHBOARD STATISTICS
# =========================================================

class AdminDashboardStatsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        # Only ADMIN users can access this API.
        if request.user.role != "ADMIN":

            return Response(
                {
                    "detail": "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )


        # Count students
        total_students = Student.objects.filter(
            is_active_student=True
        ).count()


        # Count faculty
        total_faculty = FacultyProfile.objects.filter(
            user__role="FACULTY"
        ).count()


        # Count sections/classes
        total_classes = Section.objects.count()


        # Count subjects
        total_subjects = Subject.objects.count()


        # Count additional academic information
        total_departments = Department.objects.count()

        total_programs = Program.objects.count()

        total_academic_years = AcademicYear.objects.count()

        total_semesters = Semester.objects.count()


        return Response(
            {
                "total_students": total_students,
                "total_faculty": total_faculty,
                "total_classes": total_classes,
                "total_subjects": total_subjects,

                "total_departments": total_departments,
                "total_programs": total_programs,
                "total_academic_years": total_academic_years,
                "total_semesters": total_semesters,
            }
        )

    from academics.models import FacultyProfile


class FacultyProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "FACULTY":
            return Response(
                {"detail": "Faculty access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            profile = FacultyProfile.objects.select_related(
                "user",
                "department"
            ).get(
                user=request.user
            )
        except FacultyProfile.DoesNotExist:
            return Response(
                {"detail": "Faculty profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
            "name": (
                request.user.get_full_name()
                or request.user.username
            ),
            "email": request.user.email,
            "phone_number": request.user.phone_number,
            "faculty_id": profile.faculty_id,
            "designation": profile.designation,
            "department": (
                profile.department.name
                if profile.department
                else ""
            ),
            "department_code": (
                profile.department.code
                if profile.department
                else ""
            ),
        })