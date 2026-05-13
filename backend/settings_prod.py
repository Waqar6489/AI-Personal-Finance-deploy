"""
Production settings for Render.com deployment
"""
from .settings import *
import os
import dj_database_url

# SECURITY
SECRET_KEY = os.environ.get('SECRET_KEY', 'change-this-in-render-env-vars')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = ['*']  # Render provides HTTPS; restrict after testing

# DATABASE — Render PostgreSQL via DATABASE_URL env var
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            ssl_require=True,
        )
    }

# STATIC FILES — WhiteNoise for serving static files
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = []   # cleared; collectstatic gathers from apps
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Serve the React build as static files
WHITENOISE_ROOT = BASE_DIR / 'frontend' / 'dist'

# CORS — allow your Vercel frontend URL
CORS_ALLOWED_ORIGINS = [
    os.environ.get('FRONTEND_URL', 'http://localhost:5173'),
]
CORS_ALLOW_ALL_ORIGINS = True   # set to False and add your Vercel URL after deploy

# HTTPS
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
