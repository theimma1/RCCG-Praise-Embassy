import uuid
from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import BaseModel, SoftDeleteMixin


class Guest(SoftDeleteMixin, BaseModel):
    __tablename__ = "guests"

    campus_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("campuses.id"), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(20))
    address: Mapped[str | None] = mapped_column(Text)
    gender: Mapped[str | None] = mapped_column(String(30))
    how_they_heard: Mapped[str | None] = mapped_column(String(255))
    invited_by_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="SET NULL"))
    first_visit_date: Mapped[date] = mapped_column(Date, nullable=False)
    visit_count: Mapped[int] = mapped_column(Integer, default=1)
    follow_up_status: Mapped[str] = mapped_column(String(50), default="pending")
    converted_member_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="SET NULL"))
    notes: Mapped[str | None] = mapped_column(Text)
    metadata: Mapped[dict] = mapped_column(JSONB, default=dict)

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
