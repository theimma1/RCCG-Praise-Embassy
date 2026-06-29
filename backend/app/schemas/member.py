from datetime import date
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class MemberBase(BaseModel):
    first_name: str = Field(max_length=100)
    last_name: str = Field(max_length=100)
    middle_name: str | None = None
    preferred_name: str | None = None
    gender: str | None = None
    date_of_birth: date | None = None
    email: EmailStr | None = None
    phone_primary: str | None = None
    phone_secondary: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    status: str = "active"
    marital_status: str | None = None
    membership_date: date | None = None
    salvation_date: date | None = None
    baptism_date: date | None = None
    worker_status: bool = False
    discipleship_stage: str = "new_convert"
    occupation: str | None = None
    employer: str | None = None


class MemberCreate(MemberBase):
    campus_id: UUID
    user_id: UUID | None = None


class MemberUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    middle_name: str | None = None
    gender: str | None = None
    date_of_birth: date | None = None
    email: EmailStr | None = None
    phone_primary: str | None = None
    phone_secondary: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    status: str | None = None
    marital_status: str | None = None
    worker_status: bool | None = None
    discipleship_stage: str | None = None
    occupation: str | None = None
    employer: str | None = None
    assigned_pastor_id: UUID | None = None


class MemberResponse(MemberBase):
    id: UUID
    campus_id: UUID
    user_id: UUID | None
    profile_photo_url: str | None
    assigned_pastor_id: UUID | None
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


class MemberListResponse(BaseModel):
    id: UUID
    full_name: str
    email: str | None
    phone_primary: str | None
    status: str
    discipleship_stage: str
    worker_status: bool
    profile_photo_url: str | None
    created_at: str

    model_config = {"from_attributes": True}
