# Nexus ERP Application

Full-stack Enterprise Resource Planning (ERP) platform with a modern responsive frontend and a high-performance Python (FastAPI + PostgreSQL + SQLAlchemy) backend.

---

## 📁 Project Architecture

```text
Nexus-App/
├── backend/                       # Python FastAPI + PostgreSQL Backend
│   ├── app/
│   │   ├── api/v1/                # Versioned REST endpoints (Expenses, etc.)
│   │   ├── core/                  # Configuration & Environment settings
│   │   ├── db/                    # SQLAlchemy engine & session management
│   │   ├── models/                # Database models (company_expenses, etc.)
│   │   ├── repositories/          # Data Access Layer & queries
│   │   ├── schemas/               # Pydantic validation schemas
│   │   ├── services/              # Business logic layer
│   │   └── main.py                # FastAPI Application entry point
│   ├── tests/                     # Pytest automated test suite
│   ├── requirements.txt           # Python dependencies
│   ├── view_db.py                 # CLI database table viewer
│   └── README.md                  # Backend documentation
│
├── frontend/                      # Web Client Application
│   ├── assets/
│   │   ├── css/                   # Stylesheets (home.css, style.css)
│   │   ├── js/                    # JavaScript (api.js, home.js, app.js)
│   │   └── images/                # UI images
│   ├── icons/                     # SVG icon library
│   ├── bulk upload template/      # Excel/CSV upload templates
│   ├── home.html                  # Main ERP Application Dashboard
│   └── index.html                 # Landing / Login page
│
├── .env                           # Local environment variables
└── README.md                      # Project root documentation
```

---

## 🚀 Getting Started

### 1. Start the Backend API (FastAPI + PostgreSQL)

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* **API Documentation (Swagger UI):** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **Health Check:** [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

### 2. Start the Frontend Application

Open a new terminal window:

```bash
cd frontend
python -m http.server 5500
```

* **ERP Application URL:** [http://127.0.0.1:5500/home.html](http://127.0.0.1:5500/home.html)
* **Login / Landing Page:** [http://127.0.0.1:5500/index.html](http://127.0.0.1:5500/index.html)

---

### 3. Database Tools

To quickly inspect PostgreSQL records from the terminal:

```bash
cd backend
python view_db.py
```
