from django.db import models


class ClassMentorAssignment(models.Model):

    section = models.OneToOneField(
        "academics.Section",
        on_delete=models.CASCADE,
        related_name="mentor_assignment"
    )

    mentor = models.ForeignKey(
        "academics.FacultyProfile",
        on_delete=models.PROTECT,
        related_name="mentor_assignments"
    )

    assigned_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )


    def __str__(self):

        return (
            f"{self.section} -> "
            f"{self.mentor}"
        )