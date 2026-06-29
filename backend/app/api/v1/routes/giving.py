from datetime import date
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import AdminUser, WorkerUser, get_db
from app.schemas.common import PaginatedResponse
from app.schemas.giving import (
    GivingCategoryCreate,
    GivingCategoryResponse,
    GivingSummary,
    GivingTransactionCreate,
    GivingTransactionResponse,
)
from app.services.giving_service import GivingService
from app.db.models.giving import GivingCategory

router = APIRouter(prefix="/giving", tags=["Giving"])


@router.get("/categories", response_model=list[GivingCategoryResponse])
async def list_categories(current_user: WorkerUser, db: Annotated[AsyncSession, Depends(get_db)]):
    from sqlalchemy import select
    result = await db.execute(
        select(GivingCategory).where(
            GivingCategory.campus_id == current_user.campus_id,
            GivingCategory.is_active == True,  # noqa: E712
        )
    )
    return [GivingCategoryResponse.model_validate(c) for c in result.scalars().all()]


@router.post("/categories", response_model=GivingCategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(body: GivingCategoryCreate, current_user: AdminUser, db: Annotated[AsyncSession, Depends(get_db)]):
    category = GivingCategory(campus_id=current_user.campus_id, **body.model_dump())
    db.add(category)
    await db.flush()
    await db.refresh(category)
    return GivingCategoryResponse.model_validate(category)


@router.post("/transactions", response_model=GivingTransactionResponse, status_code=status.HTTP_201_CREATED)
async def record_transaction(
    body: GivingTransactionCreate,
    current_user: WorkerUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    svc = GivingService(db)
    txn = await svc.record_transaction(current_user.campus_id, body, current_user.id)
    return GivingTransactionResponse.model_validate(txn)


@router.get("/transactions", response_model=PaginatedResponse[GivingTransactionResponse])
async def list_transactions(
    current_user: WorkerUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    member_id: UUID | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    svc = GivingService(db)
    if member_id:
        items, total, total_pages = await svc.list_for_member(member_id, page, page_size)
    else:
        from sqlalchemy import select
        from app.db.models.giving import GivingTransaction
        stmt = (
            select(GivingTransaction)
            .where(GivingTransaction.campus_id == current_user.campus_id)
            .order_by(GivingTransaction.transaction_date.desc())
        )
        items, total = await svc.paginate(stmt, page, page_size)
        import math
        total_pages = math.ceil(total / page_size) if total else 1

    return PaginatedResponse(
        items=[GivingTransactionResponse.model_validate(t) for t in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/summary", response_model=GivingSummary)
async def get_summary(
    current_user: AdminUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    date_from: date = Query(...),
    date_to: date = Query(...),
    currency: str = Query("NGN"),
):
    svc = GivingService(db)
    summary = await svc.get_summary(current_user.campus_id, date_from, date_to, currency)
    return GivingSummary(**summary)
