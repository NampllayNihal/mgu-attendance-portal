from rest_framework import serializers
from .models import Student


class StudentDashboardSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    email = serializers.CharField(source="user.email", read_only=True)
    department = serializers.CharField(
        source="section.program.department.name",
        read_only=True
    )
    program = serializers.CharField(
        source="section.program.name",
        read_only=True
    )
    program_code = serializers.CharField(
        source="section.program.code",
        read_only=True
    )
    section = serializers.CharField(
        source="section.name",
        read_only=True
    )
    semester = serializers.CharField(
        source="section.semester.name",
        read_only=True
    )
    academic_year = serializers.CharField(
        source="section.academic_year.year",
        read_only=True
    )

    class Meta:
        model = Student
        fields = [
            "id",
            "name",
            "email",
            "roll_number",
            "admission_number",
            "parent_name",
            "parent_phone",
            "department",
            "program",
            "program_code",
            "section",
            "semester",
            "academic_year",
        ]

    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class StudentAttendanceSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    date = serializers.DateField()
    period = serializers.IntegerField()
    subject_code = serializers.CharField()
    subject_name = serializers.CharField()
    status = serializers.CharField()
    absence_reason = serializers.CharField(
        allow_null=True,
        allow_blank=True
    )


class StudentAttendanceSummarySerializer(serializers.Serializer):
    subject_code = serializers.CharField()
    subject_name = serializers.CharField()
    total_periods = serializers.IntegerField()
    present = serializers.IntegerField()
    absent = serializers.IntegerField()
    late = serializers.IntegerField()
    attendance_percentage = serializers.FloatField()