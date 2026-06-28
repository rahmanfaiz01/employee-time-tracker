from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, get_timezone
from app.models import User
from app.schemas import DashboardResponse, HourlyRateUpdate, UserResponse
from app.services import (
    daily_chart_data,
    get_active_entry,
    month_bounds,
    serialize_entry,
    summarize_period,
    week_bounds,
    weekly_chart_data,
)

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardResponse)
def dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    tz_name: str = Depends(get_timezone),
):
    week_start, week_end = week_bounds(tz_name=tz_name)
    month_start, month_end = month_bounds(tz_name=tz_name)
    active = get_active_entry(db, current_user.id)

    return DashboardResponse(
        weekly_summary=summarize_period(db, current_user, week_start, week_end, "This week"),
        monthly_summary=summarize_period(db, current_user, month_start, month_end, "This month"),
        daily_chart=daily_chart_data(db, current_user, days=7, tz_name=tz_name),
        weekly_chart=weekly_chart_data(db, current_user, weeks=4, tz_name=tz_name),
        active_entry=serialize_entry(active, current_user.hourly_rate) if active else None,
    )


@router.put("/settings/hourly-rate", response_model=UserResponse)
def update_hourly_rate(
    payload: HourlyRateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.hourly_rate = payload.hourly_rate
    db.commit()
    db.refresh(current_user)
    return current_user
