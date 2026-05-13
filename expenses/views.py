from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from .models import Expense
from .serializers import ExpenseSerializer

class ExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        qs = Expense.objects.filter(user=self.request.user)
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        category = self.request.query_params.get('category')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if month: qs = qs.filter(date__month=month)
        if year: qs = qs.filter(date__year=year)
        if category: qs = qs.filter(category=category)
        if date_from: qs = qs.filter(date__gte=date_from)
        if date_to: qs = qs.filter(date__lte=date_to)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)

class ExpenseSummaryView(APIView):
    def get(self, request):
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        qs = Expense.objects.filter(user=request.user)
        if month: qs = qs.filter(date__month=month)
        if year: qs = qs.filter(date__year=year)
        total = qs.aggregate(total=Sum('amount'))['total'] or 0
        by_category = {}
        for exp in qs:
            by_category[exp.category] = float(by_category.get(exp.category, 0)) + float(exp.amount)
        return Response({'total': float(total), 'by_category': by_category, 'count': qs.count()})
