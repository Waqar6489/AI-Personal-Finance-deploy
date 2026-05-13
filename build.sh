#!/usr/bin/env bash
# =============================================
# Render Build Script for AI Personal Finance
# =============================================
set -o errexit  # Exit on any error

echo "=== Installing Python dependencies ==="
pip install -r requirements.txt

echo "=== Collecting static files ==="
python manage.py collectstatic --no-input --settings=backend.settings_prod

echo "=== Running database migrations ==="
python manage.py migrate --settings=backend.settings_prod

echo "=== Creating superuser if not exists ==="
python manage.py shell --settings=backend.settings_prod << 'EOF'
from users.models import User
import os
email = os.environ.get('ADMIN_EMAIL', 'admin@finance.pk')
password = os.environ.get('ADMIN_PASSWORD', 'admin123')
if not User.objects.filter(email=email).exists():
    User.objects.create_superuser(
        email=email, username='admin',
        first_name='Admin', last_name='User',
        password=password, role='admin'
    )
    print(f"Superuser created: {email}")
else:
    print(f"Superuser already exists: {email}")
EOF

echo "=== Build complete! ==="
