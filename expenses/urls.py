from django.urls import path
from . import views

urlpatterns = [
    path('', views.ExpenseListCreateView.as_view(), name='expense_list_create'),
    path('<int:pk>/', views.ExpenseDetailView.as_view(), name='expense_detail'),
    path('summary/', views.ExpenseSummaryView.as_view(), name='expense_summary'),
]
