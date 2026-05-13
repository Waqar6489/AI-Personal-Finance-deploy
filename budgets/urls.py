from django.urls import path
from . import views

urlpatterns = [
    path('', views.BudgetListCreateView.as_view()),
    path('<int:pk>/', views.BudgetDetailView.as_view()),
    path('status/', views.BudgetStatusView.as_view()),
]
