import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, CheckConstraint, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import BaseModel


class AttendanceSession(BaseModel):
    __tablename__ = "attendance_sessions"

    event_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    campus_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("campuses.id"), nullable=False)
    session_date: Mapped[date] = mapped_column(Date, nullable=False)
    total_count: Mapped[int] = mapped_column(Integer, default=0)
    male_count: Mapped[int] = mapped_column(Integer, default=0)
    female_count: Mapped[int] = mapped_column(Integer, default=0)
    children_count: Mapped[int] = mapped_column(Integer, default=0)
    new_converts: Mapped[int] = mapped_column(Integer, default=0)
    first_timers: Mapped[int] = mapped_column(Integer, default=0)
    check_in_open: Mapped[bool] = mapped_column(Boolean, default=True)
    opened_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    notes: Mapped[str | None] = mapped_column(Text)
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))

    event: Mapped["Event"] = relationship("Event", back_populates="attendance_sessions")  # type: ignore[name-defined]
    records: Mapped[list["AttendanceRecord"]] = relationship("AttendanceRecord", back_populates="session", cascade="all, delete-orphan")


class AttendanceRecord(BaseModel):
    __tablename__ = "attendance_records"
    __table_args__ = (
        CheckConstraint(
            "member_id IS NOT NULL OR guest_id IS NOT NULL OR anonymous_name IS NOT NULL",
            name="chk_attendance_identity",
        ),
    )

    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("attendance_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    attendance_type: Mapped[str] = mapped_column(String(30), nullable=False)
    member_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="SET NULL"), index=True)
    guest_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("guests.id", ondelete="SET NULL"))
    anonymous_name: Mapped[str | None] = mapped_column(String(200))
    check_in_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    check_in_method: Mapped[str] = mapped_column(String(50), default="manual")

    session: Mapped[AttendanceSession] = relationship("AttendanceSession", back_populates="records")
