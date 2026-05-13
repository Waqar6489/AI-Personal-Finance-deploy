from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from .models import Budget
from .serializers import BudgetSerializer
from expenses.models import Expense
import datetime

class BudgetListCreateView(generics.ListCreateAPIView):
    serializer_class = BudgetSerializer

    def get_queryset(self):
        qs = Budget.objects.filter(user=self.request.user)
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        if month: qs = qs.filter(month=month)
        if year: qs = qs.filter(year=year)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class BudgetDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BudgetSerializer

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

class BudgetStatusView(APIView):
    def get(self, request):
        today = datetime.date.today()
        month = int(request.query_params.get('month', today.month))
        year = int(request.query_params.get('year', today.year))
        budgets = Budget.objects.filter(user=request.user, month=month, year=year)
        result = []
        for b in budgets:
            spent = Expense.objects.filter(
                user=request.user, category=b.category,
                date__month=month, date__year=year
            ).aggregate(total=Sum('amount'))['total'] or 0
            pct = round((float(spent) / float(b.monthly_limit)) * 100, 1) if b.monthly_limit > 0 else 0
            status = 'exceeded' if pct >= 100 else 'warning' if pct >= 80 else 'ok'
            result.append({
                'id': b.id, 'category': b.category,
                'monthly_limit': float(b.monthly_limit),
                'spent': float(spent),
                'percentage': pct,
                'remaining': max(0, float(b.monthly_limit) - float(spent)),
                'status': status,
            })
        return Response(result)
