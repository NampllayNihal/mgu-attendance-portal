from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    ROLE_CHOICES = (
        ("ADMIN", "Admin"),
        ("FACULTY", "Faculty"),
        ("MENTOR", "Class Mentor"),
        ("STUDENT", "Student"),
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="STUDENT"
    )

    email = models.EmailField(unique=True)

    phone_number = models.CharField(
        max_length=15,
        blank=True,
        null=True
    )

    profile_photo = models.ImageField(
        upload_to="profile_photos/",
        blank=True,
        null=True
    )

    REQUIRED_FIELDS = ["email"]

    def __str__(self):
        return f"{self.username} ({self.role})"