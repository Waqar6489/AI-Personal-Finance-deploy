from django.contrib import admin
from .models import Analysis

@admin.register(Analysis)
class AnalysisAdmin(admin.ModelAdmin):
    list_display = ['user', 'analysis_date']
    list_filter = ['analysis_date']
