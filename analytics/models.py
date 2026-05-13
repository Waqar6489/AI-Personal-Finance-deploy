from django.db import models
from django.conf import settings

class Analysis(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='analyses')
    analysis_date = models.DateTimeField(auto_now_add=True)
    insights_json = models.JSONField(default=list)
    predictions_json = models.JSONField(null=True, blank=True)
    anomalies_json = models.JSONField(null=True, blank=True)
    spending_patterns_json = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = 'analysis'
        ordering = ['-analysis_date']

    def __str__(self):
        return f"Analysis for {self.user.full_name} on {self.analysis_date}"
