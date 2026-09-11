from django.contrib import admin

from .models import (
    Department,
    Program,
    AcademicYear,
    Semester,
    Section,
    Subject,
    FacultyProfile,
    TeachingAssignment,
)


admin.site.register(Department)
admin.site.register(Program)
admin.site.register(AcademicYear)
admin.site.register(Semester)
admin.site.register(Section)
admin.site.register(Subject)
admin.site.register(FacultyProfile)
admin.site.register(TeachingAssignment)