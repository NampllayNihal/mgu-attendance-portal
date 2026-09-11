from rest_framework import serializers

from academics.models import Section, FacultyProfile
from attendance.models import StudentAttendance
from .models import ClassMentorAssignment


class MentorAssignmentSerializer(serializers.ModelSerializer):
    section_name = serializers.CharField(
        source="section.name",
        read_only=True
    )

    program_code = serializers.CharField(
        source="section.program.code",
        read_only=True
    )

    program_name = serializers.CharField(
        source="section.program.name",
        read_only=True
    )

    academic_year = serializers.CharField(
        source="section.academic_year.year",
        read_only=True
    )

    semester = serializers.CharField(
        source="section.semester.name",
        read_only=True
    )

    mentor_faculty_id = serializers.CharField(
        source="mentor.faculty_id",
        read_only=True
    )

    mentor_name = serializers.SerializerMethodField()

    class Meta:
        model = ClassMentorAssignment

        fields = [
            "id",
            "section",
            "section_name",
            "program_code",
            "program_name",
            "academic_year",
            "semester",
            "mentor",
            "mentor_faculty_id",
            "mentor_name",
            "assigned_at",
            "updated_at",
        ]

    def get_mentor_name(self, obj):
        return (
            obj.mentor.user.get_full_name()
            or obj.mentor.user.username
        )


# =========================================
# MENTOR'S OWN ASSIGNED CLASS
# =========================================

class MyMentorAssignmentSerializer(
    serializers.ModelSerializer
):
    section_name = serializers.CharField(
        source="section.name",
        read_only=True
    )

    program_code = serializers.CharField(
        source="section.program.code",
        read_only=True
    )

    program_name = serializers.CharField(
        source="section.program.name",
        read_only=True
    )

    academic_year = serializers.CharField(
        source="section.academic_year.year",
        read_only=True
    )

    semester = serializers.CharField(
        source="section.semester.name",
        read_only=True
    )

    class Meta:
        model = ClassMentorAssignment

        fields = [
            "id",
            "section",
            "section_name",
            "program_code",
            "program_name",
            "academic_year",
            "semester",
        ]


# =========================================
# CREATE / UPDATE MENTOR ASSIGNMENT
# =========================================

class CreateMentorAssignmentSerializer(serializers.Serializer):

    section = serializers.PrimaryKeyRelatedField(
        queryset=Section.objects.all()
    )

    mentor = serializers.PrimaryKeyRelatedField(
        queryset=FacultyProfile.objects.filter(
            user__role="FACULTY",
            user__is_active=True
        )
    )

    def validate_mentor(self, value):

        if value.user.role != "FACULTY":
            raise serializers.ValidationError(
                "Only faculty members can be assigned as class mentors."
            )

        return value


# =========================================
# MENTOR ABSENCE
# =========================================

class MentorAbsenceSerializer(
    serializers.ModelSerializer
):

    student_id = serializers.IntegerField(
        source="student.id",
        read_only=True
    )

    roll_number = serializers.CharField(
        source="student.roll_number",
        read_only=True
    )

    student_name = serializers.SerializerMethodField()

    subject_name = serializers.CharField(
        source="attendance_session.teaching_assignment.subject.name",
        read_only=True
    )

    subject_code = serializers.CharField(
        source="attendance_session.teaching_assignment.subject.code",
        read_only=True
    )

    section = serializers.SerializerMethodField()

    attendance_date = serializers.DateField(
        source="attendance_session.date",
        read_only=True
    )

    period = serializers.IntegerField(
        source="attendance_session.period",
        read_only=True
    )

    reason_updated_by_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentAttendance

        fields = [
            "id",
            "student_id",
            "roll_number",
            "student_name",
            "subject_name",
            "subject_code",
            "section",
            "attendance_date",
            "period",
            "status",
            "absence_reason",
            "reason_updated_by_name",
            "reason_updated_at",
        ]

    def get_student_name(self, obj):
        return (
            obj.student.user.get_full_name()
            or obj.student.user.username
        )

    def get_section(self, obj):
        return str(obj.student.section)

    def get_reason_updated_by_name(self, obj):

        if not obj.reason_updated_by:
            return None

        return (
            obj.reason_updated_by.get_full_name()
            or obj.reason_updated_by.username
        )


# =========================================
# UPDATE ABSENCE REASON
# =========================================

class UpdateAbsenceReasonSerializer(
    serializers.Serializer
):

    absence_reason = serializers.CharField()

    def validate_absence_reason(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Reason cannot be empty."
            )

        return value