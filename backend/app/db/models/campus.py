from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import BaseModel


class Campus(BaseModel):
    __tablename__ = "campuses"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    address: Mapped[str | None] = mapped_column(Text)
    city: Mapped[str | None] = mapped_column(String(100))
    state: Mapped[str | None] = mapped_column(String(100))
    country: Mapped[str] = mapped_column(String(100), default="Nigeria")
    timezone: Mapped[str] = mapped_column(String(50), default="Africa/Lagos")
    phone: Mapped[str | None] = mapped_column(String(20))
    email: Mapped[str | None] = mapped_column(String(255))
    logo_url: Mapped[str | None] = mapped_column(Text)
    is_headquarters: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    users: Mapped[list["User"]] = relationship("User", back_populates="campus")  # type: ignore[name-defined]
    members: Mapped[list["Member"]] = relationship("Member", back_populates="campus")  # type: ignore[name-defined]
    events: Mapped[list["Event"]] = relationship("Event", back_populates="campus")  # type: ignore[name-defined]
