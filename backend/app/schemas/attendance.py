from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field


class AttendanceSessionCreate(BaseModel):
    event_id: UUID
    session_date: date
    notes: str | None = None


class AttendanceSessionUpdate(BaseModel):
    male_count: int | None = Field(None, ge=0)
    female_count: int | None = Field(None, ge=0)
    children_count: int | None = Field(None, ge=0)
    new_converts: int | None = Field(None, ge=0)
    first_timers: int | None = Field(None, ge=0)
    notes: str | None = None
    check_in_open: bool | None = None


class AttendanceSessionResponse(BaseModel):
    id: UUID
    event_id: UUID
    campus_id: UUID
    session_date: date
    total_count: int
    male_count: int
    female_count: int
    children_count: int
    new_converts: int
    first_timers: int
    check_in_open: bool
    opened_at: datetime
    closed_at: datetime | None
    notes: str | None

    model_config = {"from_attributes": True}


class CheckInRequest(BaseModel):
    attendance_type: str = Field(pattern="^(member|guest|first_timer)$")
    member_id: UUID | None = None
    guest_id: UUID | None = None
    anonymous_name: str | None = None
    check_in_method: str = "manual"


class CheckInResponse(BaseModel):
    id: UUID
    session_id: UUID
    attendance_type: str
    member_id: UUID | None
    guest_id: UUID | None
    anonymous_name: str | None
    check_in_at: datetime
    check_in_method: str

    model_config = {"from_attributes": True}
