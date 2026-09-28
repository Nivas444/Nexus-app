# Nexus ERP &bull; Master Expenses Module Backend

This is the FastAPI backend service for the **Master &bull; Expenses** module in Nexus ERP, integrating with the PostgreSQL database `company_expenses` table.

---

## 1. Prerequisites & Environment Setup

* **Python:** 3.10+ (Tested on Python 3.14)
* **PostgreSQL Database:** Running with `company_expenses` table.

### Configuration (`.env`)
The application reads database configuration from `.env` in the root workspace or `backend/` directory:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Nexus_Master DB
DB_USER=postgres
DB_PASSWORD=your_password_here
API_V1_STR=/api/v1
PROJECT_NAME=Nexus ERP - Master Expenses API
```

---

## 2. Installation & Running

### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Start the FastAPI Server
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

* **API Base URL:** `http://127.0.0.1:8000/api/v1/master/expenses`
* **Swagger Interactive UI:** `http://127.0.0.1:8000/docs`
* **Redoc Specification:** `http://127.0.0.1:8000/redoc`
* **Health Check:** `http://127.0.0.1:8000/health`

---

## 3. Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/master/expenses` | List all expenses with filtering & pagination |
| `GET` | `/api/v1/master/expenses/{expense_id}` | Fetch a single expense by ID |
| `POST` | `/api/v1/master/expenses` | Create a new expense record |
| `PUT` | `/api/v1/master/expenses/{expense_id}` | Update an existing expense record |
| `PATCH` | `/api/v1/master/expenses/{expense_id}/status` | Toggle expense Active/In-Active status |
| `DELETE` | `/api/v1/master/expenses/{expense_id}` | Delete an expense record |
| `POST` | `/api/v1/master/expenses/bulk-upload` | Bulk upload CSV file |
| `GET` | `/api/v1/master/expenses/template` | Download CSV template for bulk upload |

---

## 4. Running Automated Tests

```bash
cd backend
python -m pytest -v
```
