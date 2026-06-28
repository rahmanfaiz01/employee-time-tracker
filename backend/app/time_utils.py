from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def as_utc(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def resolve_timezone(tz_name: str | None) -> ZoneInfo:
    if not tz_name:
        return ZoneInfo("UTC")
    try:
        return ZoneInfo(tz_name)
    except ZoneInfoNotFoundError:
        return ZoneInfo("UTC")


def local_now(tz_name: str | None = None) -> datetime:
    tz = resolve_timezone(tz_name)
    return utc_now().astimezone(tz)


def week_bounds(
    reference: datetime | None = None,
    tz_name: str | None = None,
) -> tuple[datetime, datetime]:
    tz = resolve_timezone(tz_name)
    ref = (reference or utc_now()).astimezone(tz)
    start = ref - timedelta(days=ref.weekday())
    start = start.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=7)
    return start.astimezone(timezone.utc), end.astimezone(timezone.utc)


def month_bounds(
    reference: datetime | None = None,
    tz_name: str | None = None,
) -> tuple[datetime, datetime]:
    tz = resolve_timezone(tz_name)
    ref = (reference or utc_now()).astimezone(tz)
    start = ref.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if start.month == 12:
        end = start.replace(year=start.year + 1, month=1)
    else:
        end = start.replace(month=start.month + 1)
    return start.astimezone(timezone.utc), end.astimezone(timezone.utc)


def utc_naive(value: datetime | None = None) -> datetime:
    dt = as_utc(value) if value is not None else utc_now()
    return dt.replace(tzinfo=None)


def day_bounds(
    day: datetime,
    tz_name: str | None = None,
) -> tuple[datetime, datetime]:
    tz = resolve_timezone(tz_name)
    local_day = day.astimezone(tz)
    start = local_day.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=1)
    return start.astimezone(timezone.utc), end.astimezone(timezone.utc)
