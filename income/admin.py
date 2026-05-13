from django.contrib import admin
from .models import Income

@admin.register(Income)
class IncomeAdmin(admin.ModelAdmin):
    list_display = ['user', 'amount', 'source', 'date']
    list_filter = ['source', 'date']
    search_fields = ['user__email', 'description']
