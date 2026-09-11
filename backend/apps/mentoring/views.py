from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from attendance.models import StudentAttendance

from .models import ClassMentorAssignment
from .serializers import (
    MentorAssignmentSerializer,
    CreateMentorAssignmentSerializer,
    MentorAbsenceSerializer,
    MyMentorAssignmentSerializer,
    UpdateAbsenceReasonSerializer,
)


# =========================
# ADMIN - MENTOR ASSIGNMENTS
# =========================

class AdminMentorAssignmentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "ADMIN":
            return Response(
                {"detail": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        assignments = ClassMentorAssignment.objects.select_related(
            "section",
            "section__program",
            "section__academic_year",
            "section__semester",
            "mentor",
            "mentor__user",
        ).order_by(
            "section__program__code",
            "section__name"
        )

        serializer = MentorAssignmentSerializer(
            assignments,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):
        if request.user.role != "ADMIN":
            return Response(
                {"detail": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CreateMentorAssignmentSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        section = serializer.validated_data["section"]
        mentor = serializer.validated_data["mentor"]

        assignment, created = ClassMentorAssignment.objects.update_or_create(
            section=section,
            defaults={
                "mentor": mentor
            }
        )

        response_serializer = MentorAssignmentSerializer(
            assignment
        )

        return Response(
            {
                "message": (
                    "Mentor assigned successfully."
                    if created
                    else "Mentor assignment updated successfully."
                ),
                "assignment": response_serializer.data
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


class AdminMentorAssignmentDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, assignment_id):
        if request.user.role != "ADMIN":
            return Response(
                {"detail": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            assignment = ClassMentorAssignment.objects.get(
                id=assignment_id
            )
        except ClassMentorAssignment.DoesNotExist:
            return Response(
                {"detail": "Mentor assignment not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        assignment.delete()

        return Response(
            {"message": "Mentor assignment removed successfully."},
            status=status.HTTP_204_NO_CONTENT
        )


# =========================
# MENTOR - ABSENCES
# =========================

class MentorAbsenceListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "FACULTY":
            return Response(
                {"detail": "Faculty/mentor access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        queryset = StudentAttendance.objects.filter(
            status="ABSENT",
            student__section__mentor_assignment__mentor__user=request.user
        ).select_related(
            "student",
            "student__user",
            "student__section",
            "attendance_session",
            "attendance_session__teaching_assignment",
            "attendance_session__teaching_assignment__subject",
            "reason_updated_by",
        ).order_by(
            "-attendance_session__date",
            "student__roll_number"
        )

        serializer = MentorAbsenceSerializer(
            queryset,
            many=True
        )

        return Response(serializer.data)


class UpdateAbsenceReasonView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, attendance_id):

        try:
            attendance_record = StudentAttendance.objects.select_related(
                "student__section__mentor_assignment__mentor__user"
            ).get(
                id=attendance_id,
                status="ABSENT"
            )

        except StudentAttendance.DoesNotExist:
            return Response(
                {"detail": "Absent attendance record not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        mentor_assignment = (
            getattr(
                attendance_record.student.section,
                "mentor_assignment",
                None
            )
        )

        if (
            mentor_assignment is None
            or mentor_assignment.mentor.user != request.user
        ):
            return Response(
                {
                    "detail":
                    "You are not the assigned mentor for this class."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = UpdateAbsenceReasonSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        attendance_record.absence_reason = (
            serializer.validated_data["absence_reason"]
        )

        attendance_record.reason_updated_by = request.user
        attendance_record.reason_updated_at = timezone.now()

        attendance_record.save()

        return Response(
            {
                "message":
                "Absence reason updated successfully."
            }
        )


class MyMentorAssignmentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "FACULTY":
            return Response(
                {"detail": "Faculty/mentor access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            assignment = (
                ClassMentorAssignment.objects
                .select_related(
                    "section",
                    "section__program",
                    "section__academic_year",
                    "section__semester",
                    "mentor",
                    "mentor__user",
                )
                .get(
                    mentor__user=request.user
                )
            )

        except ClassMentorAssignment.DoesNotExist:

            return Response(
                {
                    "detail":
                    "You are not assigned as a class mentor."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            MyMentorAssignmentSerializer(
                assignment
            ).data
        )