from django.urls import path
from . import views

urlpatterns = [
    path('financial/', views.FinancialReportView.as_view()),
]
