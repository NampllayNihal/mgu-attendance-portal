from django.contrib.auth import get_user_model
from rest_framework import serializers

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


User = get_user_model()


# =========================================================
# DEPARTMENT
# =========================================================

class DepartmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Department

        fields = [
            "id",
            "name",
            "code",
        ]


# =========================================================
# PROGRAM
# =========================================================

class ProgramSerializer(serializers.ModelSerializer):

    department_name = serializers.CharField(
        source="department.name",
        read_only=True
    )

    department_code = serializers.CharField(
        source="department.code",
        read_only=True
    )

    class Meta:
        model = Program

        fields = [
            "id",
            "department",
            "department_name",
            "department_code",
            "name",
            "code",
        ]


# =========================================================
# ACADEMIC YEAR
# =========================================================

class AcademicYearSerializer(serializers.ModelSerializer):

    class Meta:
        model = AcademicYear

        fields = [
            "id",
            "year",
            "is_current",
        ]


# =========================================================
# SEMESTER
# =========================================================

class SemesterSerializer(serializers.ModelSerializer):

    class Meta:
        model = Semester

        fields = [
            "id",
            "number",
            "name",
        ]


# =========================================================
# SECTION
# =========================================================

class SectionSerializer(serializers.ModelSerializer):

    program_name = serializers.CharField(
        source="program.name",
        read_only=True
    )

    program_code = serializers.CharField(
        source="program.code",
        read_only=True
    )

    academic_year_name = serializers.CharField(
        source="academic_year.year",
        read_only=True
    )

    semester_name = serializers.CharField(
        source="semester.name",
        read_only=True
    )

    class Meta:
        model = Section

        fields = [
            "id",
            "program",
            "program_name",
            "program_code",
            "academic_year",
            "academic_year_name",
            "semester",
            "semester_name",
            "name",
        ]


# =========================================================
# FACULTY
# =========================================================

class FacultySerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

    first_name = serializers.CharField(
        source="user.first_name",
        read_only=True
    )

    last_name = serializers.CharField(
        source="user.last_name",
        read_only=True
    )

    department_name = serializers.CharField(
        source="department.name",
        read_only=True,
        allow_null=True
    )

    department_code = serializers.CharField(
        source="department.code",
        read_only=True,
        allow_null=True
    )

    is_active = serializers.BooleanField(
        source="user.is_active",
        read_only=True
    )

    class Meta:
        model = FacultyProfile

        fields = [
            "id",
            "faculty_id",
            "username",
            "email",
            "first_name",
            "last_name",
            "department",
            "department_name",
            "department_code",
            "designation",
            "is_active",
        ]


# =========================================================
# CREATE FACULTY
# =========================================================

class CreateFacultySerializer(serializers.Serializer):

    username = serializers.CharField(
        max_length=150
    )

    password = serializers.CharField(
        write_only=True,
        min_length=6
    )

    email = serializers.EmailField()

    first_name = serializers.CharField(
        max_length=150
    )

    last_name = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True
    )

    faculty_id = serializers.CharField(
        max_length=30
    )

    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        required=False,
        allow_null=True
    )

    designation = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True
    )


    def validate_username(self, value):

        if User.objects.filter(
            username=value
        ).exists():

            raise serializers.ValidationError(
                "This username already exists."
            )

        return value


    def validate_email(self, value):

        if User.objects.filter(
            email=value
        ).exists():

            raise serializers.ValidationError(
                "This email is already registered."
            )

        return value


    def validate_faculty_id(self, value):

        if FacultyProfile.objects.filter(
            faculty_id=value
        ).exists():

            raise serializers.ValidationError(
                "This Faculty ID already exists."
            )

        return value


    def create(self, validated_data):

        username = validated_data.pop(
            "username"
        )

        password = validated_data.pop(
            "password"
        )

        email = validated_data.pop(
            "email"
        )

        first_name = validated_data.pop(
            "first_name"
        )

        last_name = validated_data.pop(
            "last_name",
            ""
        )


        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role="FACULTY"
        )


        faculty = FacultyProfile.objects.create(
            user=user,
            **validated_data
        )


        return faculty


# =========================================================
# SUBJECT
# =========================================================

class SubjectSerializer(serializers.ModelSerializer):

    section_name = serializers.CharField(
        source="section.name",
        read_only=True
    )

    program_name = serializers.CharField(
        source="section.program.name",
        read_only=True
    )

    program_code = serializers.CharField(
        source="section.program.code",
        read_only=True
    )

    academic_year = serializers.CharField(
        source="section.academic_year.year",
        read_only=True
    )

    semester_name = serializers.CharField(
        source="section.semester.name",
        read_only=True
    )

    class Meta:
        model = Subject

        fields = [
            "id",
            "section",
            "section_name",
            "program_name",
            "program_code",
            "academic_year",
            "semester_name",
            "name",
            "code",
            "credits",
            "total_periods",
        ]


# =========================================================
# TEACHING ASSIGNMENT
# =========================================================

class TeachingAssignmentSerializer(
    serializers.ModelSerializer
):

    faculty_name = serializers.SerializerMethodField()

    faculty_id = serializers.CharField(
        source="faculty.faculty_id",
        read_only=True
    )

    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True
    )

    subject_code = serializers.CharField(
        source="subject.code",
        read_only=True
    )

    section_name = serializers.CharField(
        source="subject.section.name",
        read_only=True
    )

    program_code = serializers.CharField(
        source="subject.section.program.code",
        read_only=True
    )

    class Meta:
        model = TeachingAssignment

        fields = [
            "id",

            "faculty",
            "faculty_id",
            "faculty_name",

            "subject",
            "subject_name",
            "subject_code",

            "section_name",
            "program_code",

            "is_active",
        ]


    def get_faculty_name(self, obj):

        return (
            obj.faculty.user.get_full_name()
            or obj.faculty.user.username
        )


# =========================================================
# CREATE SUBJECT
# =========================================================

class CreateSubjectSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = Subject

        fields = [
            "section",
            "name",
            "code",
            "credits",
            "total_periods",
        ]


# =========================================================
# CREATE TEACHING ASSIGNMENT
# =========================================================

class CreateTeachingAssignmentSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = TeachingAssignment

        fields = [
            "faculty",
            "subject",
            "is_active",
        ]

        extra_kwargs = {
            "is_active": {
                "default": True
            }
        }