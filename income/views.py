from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum
from .models import Income
from .serializers import IncomeSerializer

class IncomeListCreateView(generics.ListCreateAPIView):
    serializer_class = IncomeSerializer

    def get_queryset(self):
        qs = Income.objects.filter(user=self.request.user)
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        source = self.request.query_params.get('source')
        if month: qs = qs.filter(date__month=month)
        if year: qs = qs.filter(date__year=year)
        if source: qs = qs.filter(source=source)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class IncomeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = IncomeSerializer

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)

class IncomeSummaryView(APIView):
    def get(self, request):
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        qs = Income.objects.filter(user=request.user)
        if month: qs = qs.filter(date__month=month)
        if year: qs = qs.filter(date__year=year)
        total = qs.aggregate(total=Sum('amount'))['total'] or 0
        by_source = {}
        for inc in qs:
            by_source[inc.source] = float(by_source.get(inc.source, 0)) + float(inc.amount)
        return Response({'total': float(total), 'by_source': by_source, 'count': qs.count()})
