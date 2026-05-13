from django.urls import path
from . import views

urlpatterns = [
    path('', views.IncomeListCreateView.as_view(), name='income_list_create'),
    path('<int:pk>/', views.IncomeDetailView.as_view(), name='income_detail'),
    path('summary/', views.IncomeSummaryView.as_view(), name='income_summary'),
]
