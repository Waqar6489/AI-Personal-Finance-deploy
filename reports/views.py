from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg
from income.models import Income
from expenses.models import Expense

class FinancialReportView(APIView):
    def get(self, request):
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        income_qs = Income.objects.filter(user=request.user)
        expense_qs = Expense.objects.filter(user=request.user)
        
        if date_from: 
            income_qs = income_qs.filter(date__gte=date_from)
            expense_qs = expense_qs.filter(date__gte=date_from)
        if date_to: 
            income_qs = income_qs.filter(date__lte=date_to)
            expense_qs = expense_qs.filter(date__lte=date_to)

        total_income = float(income_qs.aggregate(t=Sum('amount'))['t'] or 0)
        total_expenses = float(expense_qs.aggregate(t=Sum('amount'))['t'] or 0)
        net_savings = total_income - total_expenses

        # By category
        by_category = {}
        for exp in expense_qs:
            if exp.category not in by_category:
                by_category[exp.category] = {'total': 0, 'count': 0, 'avg': 0, 'transactions': []}
            by_category[exp.category]['total'] += float(exp.amount)
            by_category[exp.category]['count'] += 1
            by_category[exp.category]['transactions'].append({
                'id': exp.id, 'amount': float(exp.amount),
                'date': str(exp.date), 'description': exp.description or ''
            })
        for cat in by_category:
            if by_category[cat]['count'] > 0:
                by_category[cat]['avg'] = by_category[cat]['total'] / by_category[cat]['count']
            by_category[cat]['percentage'] = round(by_category[cat]['total'] / total_expenses * 100, 1) if total_expenses > 0 else 0

        # By source (income)
        by_source = {}
        for inc in income_qs:
            by_source[inc.source] = float(by_source.get(inc.source, 0)) + float(inc.amount)

        return Response({
            'date_from': date_from,
            'date_to': date_to,
            'total_income': total_income,
            'total_expenses': total_expenses,
            'net_savings': net_savings,
            'savings_rate': round((net_savings / total_income * 100), 1) if total_income > 0 else 0,
            'income_transactions': income_qs.count(),
            'expense_transactions': expense_qs.count(),
            'by_category': by_category,
            'by_source': by_source,
        })
