from datetime import date
from uuid import UUID

from pydantic import BaseModel, Field


class GivingCategoryCreate(BaseModel):
    name: str = Field(max_length=255)
    type: str
    description: str | None = None
    gl_code: str | None = None


class GivingCategoryResponse(BaseModel):
    id: UUID
    campus_id: UUID
    name: str
    type: str
    description: str | None
    is_active: bool
    gl_code: str | None

    model_config = {"from_attributes": True}


class GivingTransactionCreate(BaseModel):
    category_id: UUID
    member_id: UUID | None = None
    guest_id: UUID | None = None
    amount: float = Field(gt=0)
    currency: str = "NGN"
    channel: str
    provider: str | None = None
    provider_ref: str | None = None
    envelope_number: str | None = None
    notes: str | None = None
    transaction_date: date


class GivingTransactionResponse(BaseModel):
    id: UUID
    campus_id: UUID
    category_id: UUID
    member_id: UUID | None
    amount: float
    currency: str
    channel: str
    status: str
    provider: str | None
    provider_ref: str | None
    receipt_number: str | None
    transaction_date: date
    created_at: str

    model_config = {"from_attributes": True}


class GivingSummary(BaseModel):
    total_amount: float
    transaction_count: int
    currency: str
    by_category: list[dict]
    by_channel: list[dict]
