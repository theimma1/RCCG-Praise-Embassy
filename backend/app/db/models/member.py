import uuid
from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import BaseModel, SoftDeleteMixin


class Member(SoftDeleteMixin, BaseModel):
    __tablename__ = "members"

    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), unique=True, nullable=True)
    campus_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("campuses.id", ondelete="RESTRICT"), nullable=False, index=True)

    # Identity
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    middle_name: Mapped[str | None] = mapped_column(String(100))
    preferred_name: Mapped[str | None] = mapped_column(String(100))
    gender: Mapped[str | None] = mapped_column(String(30))
    date_of_birth: Mapped[date | None] = mapped_column(Date)
    profile_photo_url: Mapped[str | None] = mapped_column(Text)

    # Contact
    email: Mapped[str | None] = mapped_column(String(255))
    phone_primary: Mapped[str | None] = mapped_column(String(20))
    phone_secondary: Mapped[str | None] = mapped_column(String(20))
    address: Mapped[str | None] = mapped_column(Text)
    city: Mapped[str | None] = mapped_column(String(100))
    state: Mapped[str | None] = mapped_column(String(100))
    country: Mapped[str | None] = mapped_column(String(100))

    # Church Info
    status: Mapped[str] = mapped_column(String(30), default="active", index=True)
    marital_status: Mapped[str | None] = mapped_column(String(30))
    membership_date: Mapped[date | None] = mapped_column(Date)
    salvation_date: Mapped[date | None] = mapped_column(Date)
    baptism_date: Mapped[date | None] = mapped_column(Date)
    worker_status: Mapped[bool] = mapped_column(Boolean, default=False)

    # Discipleship
    discipleship_stage: Mapped[str] = mapped_column(String(30), default="new_convert")
    assigned_pastor_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="SET NULL"))

    # Professional
    occupation: Mapped[str | None] = mapped_column(String(255))
    employer: Mapped[str | None] = mapped_column(String(255))

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="member")  # type: ignore[name-defined]
    campus: Mapped["Campus"] = relationship("Campus", back_populates="members")  # type: ignore[name-defined]
    department_memberships: Mapped[list["DepartmentMember"]] = relationship("DepartmentMember", back_populates="member", cascade="all, delete-orphan")  # type: ignore[name-defined]

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
