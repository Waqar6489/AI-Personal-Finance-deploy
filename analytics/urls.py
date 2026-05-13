from django.urls import path
from . import views

urlpatterns = [
    path('run/', views.RunAnalysisView.as_view()),
    path('latest/', views.LatestAnalysisView.as_view()),
    path('dashboard/', views.DashboardSummaryView.as_view()),
    path('admin-stats/', views.AdminStatsView.as_view()),
]
