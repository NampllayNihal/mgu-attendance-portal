from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from academics.models import TeachingAssignment
from students.models import Student

from .models import AttendanceSession, StudentAttendance
from .serializers import (
    FacultyAssignmentSerializer,
    MarkAttendanceSerializer,
)
from .serializers import (
    FacultyAssignmentSerializer,
    MarkAttendanceSerializer,
    FacultyAttendanceHistorySerializer,
)


class FacultyAssignmentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "FACULTY":
            return Response(
                {"detail": "Faculty access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        assignments = TeachingAssignment.objects.filter(
            faculty__user=request.user,
            faculty__user__is_active=True,
            is_active=True
        ).select_related(
            "subject",
            "subject__section",
            "subject__section__program",
            "subject__section__semester",
            "subject__section__academic_year",
        )

        serializer = FacultyAssignmentSerializer(
            assignments,
            many=True
        )

        return Response(serializer.data)


class FacultyAttendanceStudentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "FACULTY":
            return Response(
                {"detail": "Faculty access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        assignment_id = request.query_params.get(
            "assignment_id"
        )

        date = request.query_params.get("date")

        period = request.query_params.get("period")

        if not assignment_id or not date or not period:
            return Response(
                {
                    "detail":
                    "assignment_id, date and period are required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            assignment = TeachingAssignment.objects.select_related(
                "subject",
                "subject__section"
            ).get(
                id=assignment_id,
                faculty__user=request.user,
                is_active=True
            )
        except TeachingAssignment.DoesNotExist:
            return Response(
                {"detail": "Teaching assignment not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        students = Student.objects.filter(
            section=assignment.subject.section,
            is_active_student=True
        ).select_related(
            "user"
        ).order_by(
            "roll_number"
        )

        try:
            session = AttendanceSession.objects.get(
                teaching_assignment=assignment,
                date=date,
                period=period
            )
        except AttendanceSession.DoesNotExist:
            session = None

        result = []

        existing_records = {}

        if session:
            records = StudentAttendance.objects.filter(
                attendance_session=session
            ).select_related(
                "student",
                "student__user"
            )

            existing_records = {
                record.student_id: record
                for record in records
            }

        for student in students:

            record = existing_records.get(student.id)

            result.append(
                {
                    "student_id": student.id,
                    "roll_number": student.roll_number,
                    "student_name": (
                        student.user.get_full_name()
                        or student.user.username
                    ),
                    "status": (
                        record.status
                        if record
                        else "PRESENT"
                    ),
                    "absence_reason": (
                        record.absence_reason
                        if record
                        else ""
                    ),
                    "attendance_id": (
                        record.id
                        if record
                        else None
                    ),
                }
            )

        return Response(result)


class FacultyMarkAttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        if request.user.role != "FACULTY":
            return Response(
                {"detail": "Faculty access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = MarkAttendanceSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        assignment_id = serializer.validated_data[
            "teaching_assignment_id"
        ]

        date = serializer.validated_data["date"]

        period = serializer.validated_data["period"]

        students_data = serializer.validated_data[
            "students"
        ]

        try:
            assignment = TeachingAssignment.objects.select_related(
                "subject",
                "subject__section"
            ).get(
                id=assignment_id,
                faculty__user=request.user,
                is_active=True
            )

        except TeachingAssignment.DoesNotExist:
            return Response(
                {
                    "detail":
                    "You are not assigned to this subject."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        section = assignment.subject.section

        valid_student_ids = set(
            Student.objects.filter(
                section=section,
                is_active_student=True
            ).values_list(
                "id",
                flat=True
            )
        )

        for item in students_data:

            if item["student_id"] not in valid_student_ids:
                return Response(
                    {
                        "detail":
                        f"Student {item['student_id']} does not belong to this class."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        session, created = AttendanceSession.objects.get_or_create(
            teaching_assignment=assignment,
            date=date,
            period=period,
            defaults={
                "created_by": request.user
            }
        )

        for item in students_data:

            student = Student.objects.get(
                id=item["student_id"]
            )

            record, record_created = (
                StudentAttendance.objects.get_or_create(
                    attendance_session=session,
                    student=student,
                    defaults={
                        "status": item["status"],
                        "absence_reason": (
                            item.get("absence_reason")
                            if item["status"] == "ABSENT"
                            else None
                        ),
                        "marked_by": request.user,
                    }
                )
            )

            if not record_created:

                old_reason = record.absence_reason

                record.status = item["status"]

                if item["status"] == "ABSENT":
                    record.absence_reason = (
                        item.get("absence_reason")
                    )
                else:
                    record.absence_reason = None
                    record.reason_updated_by = None
                    record.reason_updated_at = None

                record.marked_by = request.user

                if (
                    item["status"] == "ABSENT"
                    and old_reason != record.absence_reason
                ):
                    record.reason_updated_by = request.user
                    record.reason_updated_at = timezone.now()

                record.save()

        return Response(
            {
                "message":
                "Attendance saved successfully.",
                "session_id": session.id,
                "created": created,
            },
            status=status.HTTP_200_OK
        )


class FacultyAttendanceHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "FACULTY":
            return Response(
                {"detail": "Faculty access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        sessions = AttendanceSession.objects.filter(
            teaching_assignment__faculty__user=request.user
        ).select_related(
            "teaching_assignment",
            "teaching_assignment__subject",
            "teaching_assignment__subject__section",
            "teaching_assignment__subject__section__program",
        ).prefetch_related(
            "student_attendance"
        ).order_by(
            "-date",
            "-period"
        )

        serializer = FacultyAttendanceHistorySerializer(
            sessions,
            many=True
        )

        return Response(serializer.data)