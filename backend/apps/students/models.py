from django.conf import settings
from django.db import models

from academics.models import Section


class Student(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_profile"
    )

    roll_number = models.CharField(
        max_length=30,
        unique=True
    )

    section = models.ForeignKey(
        Section,
        on_delete=models.PROTECT,
        related_name="students"
    )

    admission_number = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        null=True
    )

    parent_name = models.CharField(
        max_length=150
    )

    parent_phone = models.CharField(
        max_length=15
    )

    parent_email = models.EmailField(
        blank=True,
        null=True
    )

    is_active_student = models.BooleanField(
        default=True
    )

    def __str__(self):
        return (
            f"{self.roll_number} - "
            f"{self.user.get_full_name() or self.user.username}"
        )