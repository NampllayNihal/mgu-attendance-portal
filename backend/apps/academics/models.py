from django.conf import settings
from django.db import models


class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return f"{self.code} - {self.name}"


class Program(models.Model):
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name="programs"
    )
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=30)

    class Meta:
        unique_together = ("department", "code")

    def __str__(self):
        return f"{self.code} - {self.name}"


class AcademicYear(models.Model):
    year = models.CharField(
        max_length=20,
        unique=True,
        help_text="Example: 2026-2027"
    )
    is_current = models.BooleanField(default=False)

    def __str__(self):
        return self.year


class Semester(models.Model):
    number = models.PositiveSmallIntegerField(unique=True)
    name = models.CharField(max_length=30)

    def __str__(self):
        return self.name


class Section(models.Model):
    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name="sections"
    )
    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name="sections"
    )
    semester = models.ForeignKey(
        Semester,
        on_delete=models.CASCADE,
        related_name="sections"
    )
    name = models.CharField(
        max_length=20,
        default="A"
    )

    class Meta:
        unique_together = (
            "program",
            "academic_year",
            "semester",
            "name"
        )

    def __str__(self):
        return (
            f"{self.program.code} | "
            f"{self.academic_year.year} | "
            f"{self.semester.name} | "
            f"Section {self.name}"
        )


class Subject(models.Model):
    section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        related_name="subjects"
    )
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=30)
    credits = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        default=0
    )
    total_periods = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("section", "code")

    def __str__(self):
        return f"{self.code} - {self.name}"


class FacultyProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="faculty_profile"
    )

    faculty_id = models.CharField(
        max_length=30,
        unique=True
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="faculty_members"
    )

    designation = models.CharField(
        max_length=100,
        blank=True
    )

    def __str__(self):
        return f"{self.faculty_id} - {self.user.get_full_name() or self.user.username}"


class TeachingAssignment(models.Model):
    faculty = models.ForeignKey(
        FacultyProfile,
        on_delete=models.CASCADE,
        related_name="teaching_assignments"
    )

    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name="faculty_assignments"
    )

    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("faculty", "subject")

    def __str__(self):
        return f"{self.faculty} -> {self.subject}"