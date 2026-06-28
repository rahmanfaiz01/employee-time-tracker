from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models import TimeEntry, User
from app.schemas import DashboardChartPoint, PeriodSummary, TimeEntryResponse
from app.time_utils import as_utc, day_bounds, local_now, month_bounds, utc_now, week_bounds


def entry_duration_hours(entry: TimeEntry, end: datetime | None = None) -> float | None:
    if entry.clock_out is None and end is None:
        return None
    clock_in = as_utc(entry.clock_in)
    end_time = as_utc(entry.clock_out or end or utc_now())
    delta = end_time - clock_in
    return max(delta.total_seconds() / 3600, 0)


def entry_earnings(entry: TimeEntry, hourly_rate: float, end: datetime | None = None) -> float | None:
    hours = entry_duration_hours(entry, end)
    if hours is None:
        return None
    return round(hours * hourly_rate, 2)


def serialize_entry(entry: TimeEntry, hourly_rate: float) -> TimeEntryResponse:
    return TimeEntryResponse(
        id=entry.id,
        user_id=entry.user_id,
        clock_in=as_utc(entry.clock_in),
        clock_out=as_utc(entry.clock_out),
        notes=entry.notes,
        created_at=as_utc(entry.created_at),
        duration_hours=entry_duration_hours(entry),
        earnings=entry_earnings(entry, hourly_rate),
    )


def get_active_entry(db: Session, user_id: int) -> TimeEntry | None:
    return (
        db.query(TimeEntry)
        .filter(TimeEntry.user_id == user_id, TimeEntry.clock_out.is_(None))
        .order_by(TimeEntry.clock_in.desc())
        .first()
    )


def completed_entries_in_range(
    db: Session, user: User, start: datetime, end: datetime
) -> list[TimeEntry]:
    start_naive = as_utc(start).replace(tzinfo=None)
    end_naive = as_utc(end).replace(tzinfo=None)
    return (
        db.query(TimeEntry)
        .filter(
            TimeEntry.user_id == user.id,
            TimeEntry.clock_out.isnot(None),
            TimeEntry.clock_out >= start_naive,
            TimeEntry.clock_in <= end_naive,
        )
        .order_by(TimeEntry.clock_in.desc())
        .all()
    )


def summarize_period(
    db: Session,
    user: User,
    start: datetime,
    end: datetime,
    period_label: str,
) -> PeriodSummary:
    entries = completed_entries_in_range(db, user, start, end)
    start_utc = as_utc(start)
    end_utc = as_utc(end)
    total_hours = 0.0
    for entry in entries:
        overlap_start = max(as_utc(entry.clock_in), start_utc)
        overlap_end = min(as_utc(entry.clock_out), end_utc)
        if overlap_end > overlap_start:
            overlap_hours = (overlap_end - overlap_start).total_seconds() / 3600
            total_hours += overlap_hours

    total_hours = round(total_hours, 2)
    total_earnings = round(total_hours * user.hourly_rate, 2)
    return PeriodSummary(
        period_label=period_label,
        start=start_utc,
        end=end_utc,
        total_hours=total_hours,
        total_earnings=total_earnings,
        entry_count=len(entries),
    )


def daily_chart_data(
    db: Session, user: User, days: int = 7, tz_name: str | None = None
) -> list[DashboardChartPoint]:
    now = local_now(tz_name)
    points: list[DashboardChartPoint] = []
    for offset in range(days - 1, -1, -1):
        day = now - timedelta(days=offset)
        day_start, day_end = day_bounds(day, tz_name)
        label = day.strftime("%a")
        summary = summarize_period(db, user, day_start, day_end, label)
        points.append(
            DashboardChartPoint(
                label=label,
                hours=summary.total_hours,
                earnings=summary.total_earnings,
            )
        )
    return points


def weekly_chart_data(
    db: Session, user: User, weeks: int = 4, tz_name: str | None = None
) -> list[DashboardChartPoint]:
    current_week_start, _ = week_bounds(tz_name=tz_name)
    points: list[DashboardChartPoint] = []
    for offset in range(weeks - 1, -1, -1):
        start = current_week_start - timedelta(weeks=offset)
        end = start + timedelta(days=7)
        start_local = as_utc(start).astimezone(local_now(tz_name).tzinfo)
        summary = summarize_period(
            db, user, start, end, f"Week of {start_local.strftime('%m/%d')}"
        )
        points.append(
            DashboardChartPoint(
                label=start_local.strftime("%m/%d"),
                hours=summary.total_hours,
                earnings=summary.total_earnings,
            )
        )
    return points
