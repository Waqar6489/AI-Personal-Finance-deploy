from django.db import models
from django.conf import settings

class Income(models.Model):
    SOURCE_CHOICES = [
        ('Salary','Salary'), ('Freelance','Freelance'), ('Business','Business'),
        ('Investment','Investment'), ('Rental','Rental'), ('Other','Other'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='incomes')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    source = models.CharField(max_length=100, choices=SOURCE_CHOICES)
    description = models.TextField(blank=True, null=True)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'income'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.user.full_name} - Rs.{self.amount} ({self.source}) on {self.date}"
