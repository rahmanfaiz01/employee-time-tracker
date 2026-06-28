# Employee Time Tracker

A full-stack employee time tracking application inspired by Time Squared. Track clock in/out times, view timesheet history, summarize weekly and monthly hours, configure hourly pay, and see earnings on a dashboard with charts.

## Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | React, Material UI, Recharts, Vite  |
| Backend  | FastAPI, SQLAlchemy, JWT auth       |
| Database | SQLite                              |

## Project Structure

```
employee-time-tracker/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Settings / env vars
│   │   ├── database.py          # SQLAlchemy engine & session
│   │   ├── models.py            # Database models
│   │   ├── schemas.py           # Pydantic request/response schemas
│   │   ├── auth.py              # Password hashing & JWT helpers
│   │   ├── deps.py              # Auth dependency injection
│   │   ├── services.py          # Hours/earnings calculations
│   │   └── routers/
│   │       ├── auth.py          # Register, login, profile
│   │       ├── time_entries.py  # Clock in/out, history, summaries
│   │       └── dashboard.py     # Dashboard data & hourly rate settings
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/client.js        # Axios API client
│   │   ├── context/AuthContext.jsx
│   │   ├── components/
│   │   └── pages/               # Dashboard, Timesheet, Settings, Auth
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Database Schema

### `users`

| Column           | Type         | Notes                    |
| ---------------- | ------------ | ------------------------ |
| id               | INTEGER PK   | Auto-increment           |
| email            | VARCHAR(255) | Unique, indexed          |
| hashed_password  | VARCHAR(255) | bcrypt hash              |
| full_name        | VARCHAR(255) | Display name             |
| hourly_rate      | FLOAT        | Pay rate for earnings    |
| created_at       | DATETIME     | Registration timestamp   |

### `time_entries`

| Column     | Type         | Notes                              |
| ---------- | ------------ | ---------------------------------- |
| id         | INTEGER PK   | Auto-increment                     |
| user_id    | INTEGER FK   | References `users.id`              |
| clock_in   | DATETIME     | Shift start                        |
| clock_out  | DATETIME     | Shift end (NULL while active)      |
| notes      | TEXT         | Optional shift notes               |
| created_at | DATETIME     | Record creation timestamp          |

**Relationships:** One user has many time entries (cascade delete).

**Earnings:** `duration_hours × hourly_rate` (computed in the API).

## Features

- User registration and JWT login
- Clock in / clock out with optional notes
- Timesheet history table
- Weekly and monthly hour summaries
- Hourly pay configuration
- Automatic earnings calculation
- Dashboard with daily hours bar chart and weekly earnings line chart

## Getting Started

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

API docs: http://127.0.0.1:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

The Vite dev server proxies `/api` requests to the backend on port 8000.

## API Endpoints

| Method | Path                          | Description              |
| ------ | ----------------------------- | ------------------------ |
| POST   | `/api/auth/register`          | Create account           |
| POST   | `/api/auth/login/json`        | Login (JSON body)        |
| GET    | `/api/auth/me`                | Current user profile     |
| GET    | `/api/time-entries/active`    | Active clock-in status   |
| POST   | `/api/time-entries/clock-in`  | Start shift              |
| POST   | `/api/time-entries/clock-out` | End shift                |
| GET    | `/api/time-entries`           | Timesheet history        |
| GET    | `/api/time-entries/summary/weekly`  | Weekly summary     |
| GET    | `/api/time-entries/summary/monthly` | Monthly summary    |
| GET    | `/api/dashboard`              | Dashboard + chart data   |
| PUT    | `/api/settings/hourly-rate`   | Update hourly pay        |

## License

MIT
