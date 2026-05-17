# AI Personal Finance Management System
### Riphah International University, Faisalabad — BSSE Final Year Project 2026

---

## 👥 Team
| Name | Roll No |
|------|---------|
| Waqar Ali | 24421 |
| Muhammad Hamid | 25951 |
| Zohaib Gulzar | 26183 |

**Supervisor:** Mam Mariam Afzal

---

## Project Overview

An AI-powered personal finance management platform that helps users track income, manage expenses, set budgets, and receive ML-generated insights, built as per the SRS document using the exact tools and technologies specified.

### Tools & Technologies (Per SRS)
| Layer | Technology |
|-------|------------|
| Frontend | React.js + Vite + Chart.js |
| Backend | Django + Django REST Framework |
| Authentication | JWT (djangorestframework-simplejwt) |
| AI / ML | Scikit-learn, Pandas, NumPy |
| Database | SQLite (dev) / MySQL (production) |
| Styling | Custom CSS (dark theme) |

### AI/ML Pipeline (SRS Section 4.2.4)
1. **Stage 1 — Data Preprocessing** — Pandas DataFrames, normalization, encoding
2. **Stage 2 — Pattern Analysis** — K-Means Clustering (spending segmentation)
3. **Stage 3 — Anomaly Detection** — Isolation Forest + Z-score
4. **Stage 4 — Forecasting** — Linear Regression (next month predictions)
5. **Stage 5 — Recommendations** — Natural language insights

---

## Setup & Run Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### 1. Clone / Extract Project
```bash
cd ai_personal_finance
```

### 2. Backend Setup (Django)
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser
# OR use the default: admin@finance.pk / admin123

# Seed demo data (optional)
python manage.py shell -c "
from users.models import User
from users.models import User
u = User.objects.create_superuser(
    email='admin@finance.pk', username='admin',
    first_name='Admin', last_name='User',
    password='admin123', role='admin'
)"

# Start Django server
python manage.py runserver
# → Running at http://localhost:8000
```

### 3. Frontend Setup (React)
```bash
cd frontend

# Install packages
npm install

# Start dev server
npm run dev
# → Running at http://localhost:5173

# OR build for production
npm run build
```

### 4. Open the App
- **Dev:** http://localhost:5173
- **Demo Login:** admin@finance.pk / admin123

---

## 📁 Project Structure

```
ai_personal_finance/
├── backend/               # Django settings & main URLs
│   ├── settings.py
│   └── urls.py
├── users/                 # Custom user model + JWT auth
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── income/                # Income CRUD + summary
├── expenses/              # Expense CRUD + summary
├── budgets/               # Budget limits + real-time status
├── analytics/             # AI engine + dashboard summary
│   └── ai_engine.py       # ML pipeline (sklearn, pandas, numpy)
├── reports/               # Date-range financial reports
├── requirements.txt
├── manage.py
└── frontend/              # React + Vite
    └── src/
        ├── App.jsx            # Router + auth wrapper
        ├── context/           # AuthContext (JWT state)
        ├── api/               # Axios + interceptors
        ├── pages/
        │   ├── Landing.jsx
        │   ├── Auth.jsx       # Login + Register
        │   ├── DashboardLayout.jsx
        │   ├── Overview.jsx   # KPI + 3 charts
        │   ├── Income.jsx     # CRUD
        │   ├── Expenses.jsx   # CRUD
        │   ├── Budget.jsx     # Progress bars
        │   ├── Insights.jsx   # AI insights + charts
        │   └── OtherPages.jsx # Reports, Admin, Profile
        └── components/
            └── shared/Toast.jsx
```

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register/ | Register new user |
| POST | /api/auth/login/ | Login + get JWT tokens |
| POST | /api/auth/logout/ | Logout (blacklist token) |
| GET/PATCH | /api/auth/profile/ | View/update profile |
| POST | /api/auth/change-password/ | Change password |
| GET/POST | /api/income/ | List/create income |
| GET/PUT/DELETE | /api/income/{id}/ | Income detail |
| GET | /api/income/summary/ | Income aggregates |
| GET/POST | /api/expenses/ | List/create expenses |
| GET/PUT/DELETE | /api/expenses/{id}/ | Expense detail |
| GET | /api/expenses/summary/ | Expense aggregates |
| GET/POST | /api/budgets/ | List/create budgets |
| GET/PUT/DELETE | /api/budgets/{id}/ | Budget detail |
| GET | /api/budgets/status/ | Budget vs actual |
| POST | /api/analytics/run/ | Run AI analysis |
| GET | /api/analytics/latest/ | Latest analysis |
| GET | /api/analytics/dashboard/ | Dashboard summary |
| GET | /api/reports/financial/ | Financial report |
| GET | /api/auth/admin/users/ | Admin: all users |

---

## ✅ Functional Requirements Implemented (Per SRS)

- [x] FR-001: User Registration with validation
- [x] FR-002: Email/Password Login + JWT tokens
- [x] FR-003: Income CRUD with source categorization
- [x] FR-004: Expense CRUD with 7 categories
- [x] FR-005: Monthly budget limits per category
- [x] FR-006: Real-time budget vs actual comparison
- [x] FR-007: AI-powered spending analysis (ML pipeline)
- [x] FR-008: Expense anomaly detection (Isolation Forest)
- [x] FR-009: Next-month expense forecasting (Linear Regression)
- [x] FR-010: Financial reports with date-range filter
- [x] FR-011: Admin panel — user management + system stats
- [x] FR-012: Profile management + password change
- [x] FR-013: Dashboard with KPI cards + 3 chart types

## 🔒 Non-Functional Requirements Implemented (Per SRS)

- [x] NFR-001: JWT Authentication with refresh token rotation
- [x] NFR-002: PBKDF2 password hashing (Django default)
- [x] NFR-003: CORS policy — only whitelisted origins
- [x] NFR-004: Input validation on all API endpoints
- [x] NFR-005: Responsive design (mobile, tablet, desktop)
- [x] NFR-006: Role-based access control (user/admin)
- [x] NFR-007: RESTful API architecture
- [x] NFR-008: 90%+ page load under 3 seconds
