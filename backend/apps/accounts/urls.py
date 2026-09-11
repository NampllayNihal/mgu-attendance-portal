from django.urls import path

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

from .views import (
    LoginView,
    AdminDashboardStatsView,
)
from .views import (
    LoginView,
    AdminDashboardStatsView,
    FacultyProfileView,
)

urlpatterns = [

    path(
        "login/",
        LoginView.as_view(),
        name="login"
    ),

    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token-refresh"
    ),

    path(
        "admin/dashboard-stats/",
        AdminDashboardStatsView.as_view(),
        name="admin-dashboard-stats"
    ),
    path(
    "faculty/profile/",
    FacultyProfileView.as_view(),
    name="faculty-profile"
),

]