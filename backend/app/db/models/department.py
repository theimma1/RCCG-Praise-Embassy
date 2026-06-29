import uuid
from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import BaseModel


class Department(BaseModel):
    __tablename__ = "departments"

    campus_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("campuses.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    leader_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="SET NULL"))
    parent_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="SET NULL"))
    color_hex: Mapped[str | None] = mapped_column(String(7))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    members: Mapped[list["DepartmentMember"]] = relationship("DepartmentMember", back_populates="department", cascade="all, delete-orphan")


class DepartmentMember(BaseModel):
    __tablename__ = "department_members"

    department_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    member_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    role: Mapped[str] = mapped_column(String(100), default="member")
    joined_at: Mapped[date | None] = mapped_column(Date)

    department: Mapped[Department] = relationship("Department", back_populates="members")
    member: Mapped["Member"] = relationship("Member", back_populates="department_memberships")  # type: ignore[name-defined]
