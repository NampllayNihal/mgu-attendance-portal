from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path


urlpatterns = [

    path(
        "admin/",
        admin.site.urls
    ),

    path(
        "api/attendance/",
        include("attendance.urls")
    ),

    path(
        "api/mentoring/",
        include("mentoring.urls")
    ),
path("api/accounts/", include("accounts.urls")),
path("api/students/", include("students.urls")),
path("api/academics/", include("academics.urls")),
path("api/attendance/", include("attendance.urls")),
path("api/students/", include("students.urls")),
]


if settings.DEBUG:

    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )