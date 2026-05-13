from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from income.models import Income
from expenses.models import Expense
from .models import Analysis
from .ai_engine import run_full_analysis
import datetime

class RunAnalysisView(APIView):
    def post(self, request):
        user = request.user
        income_qs = Income.objects.filter(user=user)
        expense_qs = Expense.objects.filter(user=user)
        result = run_full_analysis(income_qs, expense_qs)
        analysis = Analysis.objects.create(
            user=user,
            insights_json=result['insights'],
            predictions_json=result['predictions'],
            anomalies_json=result['anomalies'],
            spending_patterns_json=result['patterns'],
        )
        return Response({
            'id': analysis.id,
            'analysis_date': analysis.analysis_date,
            'insights': result['insights'],
            'predictions': result['predictions'],
            'anomalies': result['anomalies'],
            'patterns': result['patterns'],
            'summary': result['summary'],
        })

class LatestAnalysisView(APIView):
    def get(self, request):
        analysis = Analysis.objects.filter(user=request.user).first()
        if not analysis:
            return Response({'message': 'No analysis found. Run analysis first.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({
            'id': analysis.id,
            'analysis_date': analysis.analysis_date,
            'insights': analysis.insights_json,
            'predictions': analysis.predictions_json,
            'anomalies': analysis.anomalies_json,
            'patterns': analysis.spending_patterns_json,
        })

class DashboardSummaryView(APIView):
    def get(self, request):
        today = datetime.date.today()
        month = int(request.query_params.get('month', today.month))
        year = int(request.query_params.get('year', today.year))

        from django.db.models import Sum
        from budgets.models import Budget

        incomes = Income.objects.filter(user=request.user, date__month=month, date__year=year)
        expenses = Expense.objects.filter(user=request.user, date__month=month, date__year=year)

        total_income = float(incomes.aggregate(t=Sum('amount'))['t'] or 0)
        total_expenses = float(expenses.aggregate(t=Sum('amount'))['t'] or 0)
        net_savings = total_income - total_expenses

        cat_totals = {}
        for exp in expenses:
            cat_totals[exp.category] = float(cat_totals.get(exp.category, 0)) + float(exp.amount)

        # Monthly trend last 6 months
        monthly_trend = []
        for i in range(5, -1, -1):
            d = datetime.date(today.year, today.month, 1)
            offset_month = today.month - i
            offset_year = today.year
            while offset_month <= 0:
                offset_month += 12
                offset_year -= 1
            while offset_month > 12:
                offset_month -= 12
                offset_year += 1
            m_inc = float(Income.objects.filter(user=request.user, date__month=offset_month, date__year=offset_year).aggregate(t=Sum('amount'))['t'] or 0)
            m_exp = float(Expense.objects.filter(user=request.user, date__month=offset_month, date__year=offset_year).aggregate(t=Sum('amount'))['t'] or 0)
            monthly_trend.append({
                'month': offset_month, 'year': offset_year,
                'income': m_inc, 'expenses': m_exp, 'savings': m_inc - m_exp
            })

        # Budget status
        budgets = Budget.objects.filter(user=request.user, month=month, year=year)
        total_budget = float(budgets.aggregate(t=Sum('monthly_limit'))['t'] or 0)
        budget_used_pct = round((total_expenses / total_budget * 100), 1) if total_budget > 0 else 0

        return Response({
            'month': month, 'year': year,
            'total_income': total_income,
            'total_expenses': total_expenses,
            'net_savings': net_savings,
            'savings_rate': round((net_savings / total_income * 100), 1) if total_income > 0 else 0,
            'by_category': cat_totals,
            'total_budget': total_budget,
            'budget_used_pct': budget_used_pct,
            'monthly_trend': monthly_trend,
        })

class AdminStatsView(APIView):
    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Admin only'}, status=status.HTTP_403_FORBIDDEN)
        from django.db.models import Sum, Count
        from users.models import User
        return Response({
            'total_users': User.objects.count(),
            'active_users': User.objects.filter(is_active=True).count(),
            'total_income': float(Income.objects.aggregate(t=Sum('amount'))['t'] or 0),
            'total_expenses': float(Expense.objects.aggregate(t=Sum('amount'))['t'] or 0),
            'total_transactions': Income.objects.count() + Expense.objects.count(),
            'total_analyses': Analysis.objects.count(),
        })
