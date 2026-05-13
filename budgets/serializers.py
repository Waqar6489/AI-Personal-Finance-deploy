from rest_framework import serializers
from .models import Budget

class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = ['id','category','monthly_limit','month','year','created_at']
        read_only_fields = ['id','created_at']

    def validate(self, data):
        user = self.context['request'].user
        month = data.get('month', getattr(self.instance, 'month', None))
        year = data.get('year', getattr(self.instance, 'year', None))
        category = data.get('category', getattr(self.instance, 'category', None))
        qs = Budget.objects.filter(user=user, category=category, month=month, year=year)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(f'Budget for {category} in {month}/{year} already exists.')
        return data
