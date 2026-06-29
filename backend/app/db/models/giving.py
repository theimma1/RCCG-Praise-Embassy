import uuid
from datetime import date

from sqlalchemy import CheckConstraint, Date, ForeignKey, Numeric, String, Text, Boolean
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import BaseModel


class GivingCategory(BaseModel):
    __tablename__ = "giving_categories"

    campus_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("campuses.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    gl_code: Mapped[str | None] = mapped_column(String(50))

    transactions: Mapped[list["GivingTransaction"]] = relationship("GivingTransaction", back_populates="category")


class GivingTransaction(BaseModel):
    __tablename__ = "giving_transactions"
    __table_args__ = (
        CheckConstraint("amount > 0", name="chk_giving_positive_amount"),
    )

    campus_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("campuses.id"), nullable=False, index=True)
    category_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("giving_categories.id"), nullable=False)
    member_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="SET NULL"), index=True)
    guest_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("guests.id", ondelete="SET NULL"))

    amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="NGN")
    channel: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="pending", index=True)

    provider: Mapped[str | None] = mapped_column(String(50))
    provider_ref: Mapped[str | None] = mapped_column(String(255), unique=True)
    provider_meta: Mapped[dict] = mapped_column(JSONB, default=dict)

    envelope_number: Mapped[str | None] = mapped_column(String(50))
    batch_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    is_recurring: Mapped[bool] = mapped_column(Boolean, default=False)
    recurrence_rule: Mapped[str | None] = mapped_column(Text)
    receipt_number: Mapped[str | None] = mapped_column(String(100), unique=True)
    notes: Mapped[str | None] = mapped_column(Text)
    recorded_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    transaction_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)

    category: Mapped[GivingCategory] = relationship("GivingCategory", back_populates="transactions")
    member: Mapped["Member"] = relationship("Member")  # type: ignore[name-defined]
