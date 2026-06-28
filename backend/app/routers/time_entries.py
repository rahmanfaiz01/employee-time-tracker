from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, get_timezone
from app.models import TimeEntry, User
from app.schemas import (
    ActiveClockResponse,
    PeriodSummary,
    TimeEntryClockOut,
    TimeEntryCreate,
    TimeEntryResponse,
)
from app.services import (
    get_active_entry,
    month_bounds,
    serialize_entry,
    summarize_period,
    week_bounds,
)
from app.time_utils import utc_naive

router = APIRouter(prefix="/time-entries", tags=["time-entries"])


@router.get("/active", response_model=ActiveClockResponse)
def active_clock(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    entry = get_active_entry(db, current_user.id)
    if not entry:
        return ActiveClockResponse(active=False, entry=None)
    return ActiveClockResponse(
        active=True,
        entry=serialize_entry(entry, current_user.hourly_rate),
    )


@router.post("/clock-in", response_model=TimeEntryResponse, status_code=status.HTTP_201_CREATED)
def clock_in(
    payload: TimeEntryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    active = get_active_entry(db, current_user.id)
    if active:
        raise HTTPException(status_code=400, detail="You are already clocked in")

    entry = TimeEntry(
        user_id=current_user.id,
        clock_in=utc_naive(),
        notes=payload.notes,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return serialize_entry(entry, current_user.hourly_rate)


@router.post("/clock-out", response_model=TimeEntryResponse)
def clock_out(
    payload: TimeEntryClockOut,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = get_active_entry(db, current_user.id)
    if not entry:
        raise HTTPException(status_code=400, detail="No active clock-in found")

    entry.clock_out = utc_naive()
    if payload.notes:
        entry.notes = payload.notes
    db.commit()
    db.refresh(entry)
    return serialize_entry(entry, current_user.hourly_rate)


@router.get("", response_model=list[TimeEntryResponse])
def list_entries(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entries = (
        db.query(TimeEntry)
        .filter(TimeEntry.user_id == current_user.id)
        .order_by(TimeEntry.clock_in.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [serialize_entry(entry, current_user.hourly_rate) for entry in entries]


@router.get("/summary/weekly", response_model=PeriodSummary)
def weekly_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    tz_name: str = Depends(get_timezone),
):
    start, end = week_bounds(tz_name=tz_name)
    return summarize_period(db, current_user, start, end, "This week")


@router.get("/summary/monthly", response_model=PeriodSummary)
def monthly_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    tz_name: str = Depends(get_timezone),
):
    start, end = month_bounds(tz_name=tz_name)
    return summarize_period(db, current_user, start, end, "This month")
