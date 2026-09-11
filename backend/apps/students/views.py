from django.db.models import Count, Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from attendance.models import StudentAttendance
from .models import Student
from .serializers import (
    StudentDashboardSerializer,
    StudentAttendanceSerializer,
    StudentAttendanceSummarySerializer,
)


class StudentDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "STUDENT":
            return Response(
                {"detail": "Student access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            student = Student.objects.select_related(
                "user",
                "section",
                "section__program",
                "section__program__department",
                "section__academic_year",
                "section__semester",
            ).get(user=request.user)

        except Student.DoesNotExist:
            return Response(
                {"detail": "Student profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        records = StudentAttendance.objects.filter(
            student=student
        )

        total = records.count()
        present = records.filter(status="PRESENT").count()
        absent = records.filter(status="ABSENT").count()
        late = records.filter(status="LATE").count()

        percentage = 0

        if total > 0:
            percentage = round(
                ((present + late) / total) * 100,
                2
            )

        student_data = StudentDashboardSerializer(student).data

        return Response({
            "student": student_data,
            "attendance": {
                "total_periods": total,
                "present": present,
                "absent": absent,
                "late": late,
                "attendance_percentage": percentage,
            }
        })


class StudentAttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "STUDENT":
            return Response(
                {"detail": "Student access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            student = Student.objects.get(user=request.user)

        except Student.DoesNotExist:
            return Response(
                {"detail": "Student profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        records = StudentAttendance.objects.filter(
            student=student
        ).select_related(
            "attendance_session",
            "attendance_session__teaching_assignment",
            "attendance_session__teaching_assignment__subject",
        ).order_by(
            "-attendance_session__date",
            "-attendance_session__period"
        )

        data = []

        for record in records:
            session = record.attendance_session
            subject = session.teaching_assignment.subject

            data.append({
                "id": record.id,
                "date": session.date,
                "period": session.period,
                "subject_code": subject.code,
                "subject_name": subject.name,
                "status": record.status,
                "absence_reason": record.absence_reason,
            })

        return Response(
            StudentAttendanceSerializer(data, many=True).data
        )


class StudentAttendanceSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "STUDENT":
            return Response(
                {"detail": "Student access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            student = Student.objects.get(user=request.user)

        except Student.DoesNotExist:
            return Response(
                {"detail": "Student profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        records = StudentAttendance.objects.filter(
            student=student
        ).values(
            "attendance_session__teaching_assignment__subject__code",
            "attendance_session__teaching_assignment__subject__name",
        ).annotate(
            total_periods=Count("id"),
            present=Count(
                "id",
                filter=Q(status="PRESENT")
            ),
            absent=Count(
                "id",
                filter=Q(status="ABSENT")
            ),
            late=Count(
                "id",
                filter=Q(status="LATE")
            ),
        ).order_by(
            "attendance_session__teaching_assignment__subject__code"
        )

        data = []

        for item in records:
            total = item["total_periods"]
            present = item["present"]
            late = item["late"]

            percentage = 0

            if total > 0:
                percentage = round(
                    ((present + late) / total) * 100,
                    2
                )

            data.append({
                "subject_code":
                    item[
                        "attendance_session__teaching_assignment__subject__code"
                    ],

                "subject_name":
                    item[
                        "attendance_session__teaching_assignment__subject__name"
                    ],

                "total_periods": total,
                "present": present,
                "absent": item["absent"],
                "late": late,
                "attendance_percentage": percentage,
            })

        return Response(
            StudentAttendanceSummarySerializer(
                data,
                many=True
            ).data
        )