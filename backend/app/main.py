from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, dashboard, time_entries

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Employee Time Tracker API",
    description="Time tracking API with clock in/out, timesheets, and earnings",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173","https://employee-time-tracker-production.up.railway.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(time_entries.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Employee Time Tracker API", "docs": "/docs"}
