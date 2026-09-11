from rest_framework import serializers

from academics.models import TeachingAssignment
from students.models import Student
from .models import AttendanceSession, StudentAttendance


class FacultyAssignmentSerializer(serializers.ModelSerializer):
    subject_id = serializers.IntegerField(
        source="subject.id",
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

    section_id = serializers.IntegerField(
        source="subject.section.id",
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

    program_name = serializers.CharField(
        source="subject.section.program.name",
        read_only=True
    )

    semester = serializers.CharField(
        source="subject.section.semester.name",
        read_only=True
    )

    academic_year = serializers.CharField(
        source="subject.section.academic_year.year",
        read_only=True
    )

    class Meta:
        model = TeachingAssignment

        fields = [
            "id",
            "subject_id",
            "subject_name",
            "subject_code",
            "section_id",
            "section_name",
            "program_code",
            "program_name",
            "semester",
            "academic_year",
        ]


class FacultyStudentAttendanceSerializer(serializers.ModelSerializer):

    student_id = serializers.IntegerField(
        source="student.id",
        read_only=True
    )

    roll_number = serializers.CharField(
        source="student.roll_number",
        read_only=True
    )

    student_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentAttendance

        fields = [
            "id",
            "student_id",
            "roll_number",
            "student_name",
            "status",
            "absence_reason",
        ]

    def get_student_name(self, obj):
        return (
            obj.student.user.get_full_name()
            or obj.student.user.username
        )


class MarkAttendanceStudentSerializer(serializers.Serializer):

    student_id = serializers.IntegerField()

    status = serializers.ChoiceField(
        choices=[
            "PRESENT",
            "ABSENT",
            "LATE",
        ]
    )

    absence_reason = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True
    )

    def validate(self, data):

        status_value = data["status"]
        reason = data.get("absence_reason")

        if status_value == "ABSENT":
            if reason:
                data["absence_reason"] = reason.strip()
            else:
                data["absence_reason"] = None

        else:
            data["absence_reason"] = None

        return data


class MarkAttendanceSerializer(serializers.Serializer):

    teaching_assignment_id = serializers.IntegerField()

    date = serializers.DateField()

    period = serializers.IntegerField(min_value=1, max_value=8)

    students = MarkAttendanceStudentSerializer(
        many=True
    )


class FacultyAttendanceHistorySerializer(serializers.ModelSerializer):
    subject_code = serializers.CharField(
        source="teaching_assignment.subject.code",
        read_only=True
    )

    subject_name = serializers.CharField(
        source="teaching_assignment.subject.name",
        read_only=True
    )

    section_name = serializers.CharField(
        source="teaching_assignment.subject.section.name",
        read_only=True
    )

    program_code = serializers.CharField(
        source="teaching_assignment.subject.section.program.code",
        read_only=True
    )

    total_students = serializers.SerializerMethodField()
    present_count = serializers.SerializerMethodField()
    absent_count = serializers.SerializerMethodField()
    late_count = serializers.SerializerMethodField()

    class Meta:
        model = AttendanceSession

        fields = [
            "id",
            "date",
            "period",
            "subject_code",
            "subject_name",
            "section_name",
            "program_code",
            "total_students",
            "present_count",
            "absent_count",
            "late_count",
            "created_at",
            "updated_at",
        ]

    def get_total_students(self, obj):
        return obj.student_attendance.count()

    def get_present_count(self, obj):
        return obj.student_attendance.filter(
            status="PRESENT"
        ).count()

    def get_absent_count(self, obj):
        return obj.student_attendance.filter(
            status="ABSENT"
        ).count()

    def get_late_count(self, obj):
        return obj.student_attendance.filter(
            status="LATE"
        ).count()