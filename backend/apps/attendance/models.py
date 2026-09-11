from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class AttendanceSession(models.Model):

    PERIOD_CHOICES = (
        (1, "Period 1"),
        (2, "Period 2"),
        (3, "Period 3"),
        (4, "Period 4"),
        (5, "Period 5"),
        (6, "Period 6"),
        (7, "Period 7"),
        (8, "Period 8"),
    )

    teaching_assignment = models.ForeignKey(
        "academics.TeachingAssignment",
        on_delete=models.CASCADE,
        related_name="attendance_sessions"
    )

    date = models.DateField()

    period = models.PositiveSmallIntegerField(
        choices=PERIOD_CHOICES
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_attendance_sessions"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-date", "period"]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "teaching_assignment",
                    "date",
                    "period"
                ],
                name="unique_attendance_session"
            )
        ]

    def __str__(self):
        return (
            f"{self.teaching_assignment.subject.code} | "
            f"{self.date} | "
            f"Period {self.period}"
        )


class StudentAttendance(models.Model):

    STATUS_CHOICES = (
        ("PRESENT", "Present"),
        ("ABSENT", "Absent"),
        ("LATE", "Late"),
    )

    attendance_session = models.ForeignKey(
        AttendanceSession,
        on_delete=models.CASCADE,
        related_name="student_attendance"
    )

    student = models.ForeignKey(
        "students.Student",
        on_delete=models.CASCADE,
        related_name="attendance_records"
    )

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="PRESENT"
    )

    # Reason can be written by Faculty or Class Mentor
    absence_reason = models.TextField(
        blank=True,
        null=True
    )

    # Stores who last added or updated the reason
    reason_updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updated_absence_reasons"
    )

    reason_updated_at = models.DateTimeField(
        null=True,
        blank=True
    )

    # Faculty/member who marked attendance
    marked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="marked_attendance_records"
    )

    marked_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "attendance_session",
                    "student"
                ],
                name="unique_student_attendance"
            )
        ]

    def clean(self):

        # Reason should only exist for absent students
        if (
            self.status != "ABSENT"
            and self.absence_reason
        ):
            raise ValidationError(
                {
                    "absence_reason":
                    "Reason can only be added for an absent student."
                }
            )

        # Student must belong to the same section
        # as the attendance session
        if (
            self.student.section
            != self.attendance_session
            .teaching_assignment
            .subject
            .section
        ):
            raise ValidationError(
                "Student does not belong to this subject section."
            )

    def save(self, *args, **kwargs):

        self.full_clean()

        super().save(*args, **kwargs)

    def __str__(self):

        return (
            f"{self.student.roll_number} | "
            f"{self.status}"
        )