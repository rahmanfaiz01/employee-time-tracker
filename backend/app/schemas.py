from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_serializer

from app.time_utils import as_utc


def serialize_datetime(value: datetime | None) -> datetime | None:
    return as_utc(value)


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str = Field(min_length=1, max_length=255)
    hourly_rate: float = Field(default=0.0, ge=0)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    hourly_rate: float
    created_at: datetime

    @field_serializer("created_at")
    def serialize_created_at(self, value: datetime) -> datetime:
        return as_utc(value)


class HourlyRateUpdate(BaseModel):
    hourly_rate: float = Field(ge=0)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TimeEntryCreate(BaseModel):
    notes: str | None = None


class TimeEntryClockOut(BaseModel):
    notes: str | None = None


class TimeEntryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    clock_in: datetime
    clock_out: datetime | None
    notes: str | None
    created_at: datetime
    duration_hours: float | None = None
    earnings: float | None = None

    @field_serializer("clock_in", "clock_out", "created_at")
    def serialize_datetimes(self, value: datetime | None) -> datetime | None:
        return serialize_datetime(value)


class ActiveClockResponse(BaseModel):
    active: bool
    entry: TimeEntryResponse | None = None


class PeriodSummary(BaseModel):
    period_label: str
    start: datetime
    end: datetime
    total_hours: float
    total_earnings: float
    entry_count: int

    @field_serializer("start", "end")
    def serialize_period_datetimes(self, value: datetime) -> datetime:
        return as_utc(value)


class DashboardChartPoint(BaseModel):
    label: str
    hours: float
    earnings: float


class DashboardResponse(BaseModel):
    weekly_summary: PeriodSummary
    monthly_summary: PeriodSummary
    daily_chart: list[DashboardChartPoint]
    weekly_chart: list[DashboardChartPoint]
    active_entry: TimeEntryResponse | None
