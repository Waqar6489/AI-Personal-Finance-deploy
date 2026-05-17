# Free Deployment Guide
## AI Personal Finance — Render (Backend) + Vercel (Frontend)

---

## Overview

| Service | Platform | Cost | URL format |
|---------|----------|------|------------|
| Django API | Render.com | FREE | `https://ai-personal-finance.onrender.com` |
| React App | Vercel.com | FREE | `https://ai-personal-finance-deploy.vercel.app/` |
| Database | Render PostgreSQL | FREE (90 days) | auto-configured |

---

## STEP 1 — Push Code to GitHub

1. Go to **github.com** → New repository → name it `ai-personal-finance`
2. In your project folder, run:

```bash
git init
git add .
git commit -m "Initial commit — AI Personal Finance FYP"
git remote add origin https://github.com/YOUR_USERNAME/ai-personal-finance.git
git push -u origin main
```

---

## STEP 2 — Deploy Backend on Render.com

### 2A. Create a Free Account
- Go to **render.com** → Sign up with GitHub (free, no credit card needed)

### 2B. Create PostgreSQL Database
1. Dashboard → **New +** → **PostgreSQL**
2. Settings:
   - **Name:** `ai-finance-db`
   - **Region:** Singapore (closest to Pakistan)
   - **Plan:** Free
3. Click **Create Database**
4. Wait for status: **Available**
5. Copy the **Internal Database URL** (starts with `postgres://...`)

### 2C. Deploy Django Web Service
1. Dashboard → **New +** → **Web Service**
2. Connect your GitHub repo → Select `ai-personal-finance`
3. Fill in settings:
   - **Name:** `ai-personal-finance`
   - **Language:** Python 3
   - **Branch:** main
   - **Root Directory:** *(leave blank)*
   - **Build Command:** `./build.sh`
   - **Start Command:** `gunicorn backend.wsgi:application --workers 2 --bind 0.0.0.0:$PORT`
   - **Plan:** Free

4. Click **Advanced** → Add **Environment Variables**:

| Key | Value |
|-----|-------|
| `DJANGO_SETTINGS_MODULE` | `backend.settings_prod` |
| `DATABASE_URL` | *(paste the Internal Database URL from Step 2B)* |
| `SECRET_KEY` | `riphah-fyp-ai-finance-secret-2026-waqar-hamid-zohaib` |
| `ADMIN_EMAIL` | `admin@finance.pk` |
| `ADMIN_PASSWORD` | `Admin@2026!` |
| `DEBUG` | `False` |

5. Click **Create Web Service**
6. Wait ~3 minutes for build to finish
7. Your API is live at: `https://ai-personal-finance.onrender.com`

### 2D. Test the API
Open in browser:
```
https://ai-personal-finance.onrender.com/api/auth/login/
```
You should see a JSON response (405 Method Not Allowed is normal — it's working!).

---

## STEP 3 — Deploy Frontend on Vercel.com

### 3A. Update the API URL
In `frontend/.env.production`, replace with your Render URL:
```
VITE_API_URL=https://ai-personal-finance.onrender.com/api
```
Commit and push this change to GitHub.

### 3B. Deploy on Vercel
1. Go to **vercel.com** → Sign up with GitHub (free)
2. **New Project** → Import `ai-personal-finance` repo
3. Settings:
   - **Framework:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Environment Variables** → Add:
   - `VITE_API_URL` = `https://ai-personal-finance.onrender.com/api`
5. Click **Deploy**
6. Your app is live at: `https://ai-personal-finance.vercel.app`

---

## STEP 4 — Final CORS Update

After Vercel gives you a URL, update your Render environment variable:

In Render Dashboard → Your Service → **Environment**:
```
FRONTEND_URL = https://ai-personal-finance-deploy.vercel.app/
```
Then **Manual Deploy** → **Deploy Latest Commit**.

---

## Test Your Live App

1. Open: `https://ai-personal-finance-deploy.vercel.app/`
2. Add income, expenses, run AI analysis!

---

## Important Free Tier Notes

| Limitation | Details |
|-----------|---------|
| **Cold Start** | First request after 15 min idle takes ~60 seconds. Normal! |
| **Database Expiry** | Free PostgreSQL expires after 90 days, recreate it then |
| **Hours Limit** | 750 free hours/month — enough for a demo/FYP |
| **Scikit-learn RAM** | May be slow on free tier (512MB RAM). Works fine. |

---

## Update Your Deployed App

Whenever you make changes:
```bash
git add .
git commit -m "your change description"
git push
```
Render and Vercel will **auto-redeploy** from GitHub.

---

## Support Links
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Django on Render: https://render.com/docs/deploy-django
