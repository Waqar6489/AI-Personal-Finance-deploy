from rest_framework import serializers
from .models import Analysis

class AnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Analysis
        fields = ['id','analysis_date','insights_json','predictions_json','anomalies_json','spending_patterns_json']
        read_only_fields = ['id','analysis_date']
