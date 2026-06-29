import math
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import CurrentUser, WorkerUser, get_db
from app.schemas.common import PaginatedResponse
from app.schemas.member import MemberCreate, MemberListResponse, MemberResponse, MemberUpdate
from app.services.member_service import MemberService

router = APIRouter(prefix="/members", tags=["Members"])


@router.get("", response_model=PaginatedResponse[MemberListResponse])
async def list_members(
    current_user: WorkerUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    q: str | None = Query(None, description="Search by name, email, or phone"),
    status: str | None = Query(None),
    discipleship_stage: str | None = Query(None),
    worker_status: bool | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    svc = MemberService(db)
    campus_id = current_user.campus_id
    members, total, total_pages = await svc.search(
        campus_id=campus_id,
        query=q,
        status=status,
        discipleship_stage=discipleship_stage,
        worker_status=worker_status,
        page=page,
        page_size=page_size,
    )
    return PaginatedResponse(
        items=[MemberListResponse.model_validate(m) for m in members],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
async def create_member(
    body: MemberCreate,
    current_user: WorkerUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    svc = MemberService(db)
    body.campus_id = current_user.campus_id
    member = await svc.create_member(body)
    return MemberResponse.model_validate(member)


@router.get("/me", response_model=MemberResponse)
async def get_my_profile(current_user: CurrentUser, db: Annotated[AsyncSession, Depends(get_db)]):
    svc = MemberService(db)
    member = await svc.get_by_user_id(current_user.id)
    if not member:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Member profile not found")
    return MemberResponse.model_validate(member)


@router.get("/{member_id}", response_model=MemberResponse)
async def get_member(member_id: UUID, current_user: WorkerUser, db: Annotated[AsyncSession, Depends(get_db)]):
    svc = MemberService(db)
    return MemberResponse.model_validate(await svc.get_by_id_or_404(member_id))


@router.patch("/{member_id}", response_model=MemberResponse)
async def update_member(
    member_id: UUID,
    body: MemberUpdate,
    current_user: WorkerUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    svc = MemberService(db)
    member = await svc.get_by_id_or_404(member_id)
    updated = await svc.update_member(member, body)
    return MemberResponse.model_validate(updated)


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_member(member_id: UUID, current_user: WorkerUser, db: Annotated[AsyncSession, Depends(get_db)]):
    svc = MemberService(db)
    member = await svc.get_by_id_or_404(member_id)
    await svc.soft_delete(member)
