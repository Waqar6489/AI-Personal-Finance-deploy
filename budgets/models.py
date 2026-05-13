from django.db import models
from django.conf import settings

class Budget(models.Model):
    CATEGORY_CHOICES = [
        ('Food','Food'), ('Transport','Transport'), ('Utilities','Utilities'),
        ('Healthcare','Healthcare'), ('Entertainment','Entertainment'),
        ('Education','Education'), ('Other','Other'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='budgets')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    monthly_limit = models.DecimalField(max_digits=12, decimal_places=2)
    month = models.IntegerField()
    year = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'budgets'
        unique_together = ['user', 'category', 'month', 'year']
        ordering = ['category']

    def __str__(self):
        return f"{self.user.full_name} - {self.category} Rs.{self.monthly_limit} ({self.month}/{self.year})"
