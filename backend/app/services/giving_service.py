import math
import secrets
from datetime import date
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.giving import GivingCategory, GivingTransaction
from app.schemas.giving import GivingTransactionCreate
from app.services.base_service import BaseService


class GivingService(BaseService[GivingTransaction]):
    model = GivingTransaction

    async def record_transaction(self, campus_id: UUID, data: GivingTransactionCreate, recorded_by: UUID) -> GivingTransaction:
        receipt_number = f"RCP-{secrets.token_hex(5).upper()}"
        return await self.create(
            campus_id=campus_id,
            recorded_by=recorded_by,
            receipt_number=receipt_number,
            status="completed",
            **data.model_dump(exclude_unset=True),
        )

    async def get_summary(
        self,
        campus_id: UUID,
        date_from: date,
        date_to: date,
        currency: str = "NGN",
    ) -> dict:
        base_filter = [
            GivingTransaction.campus_id == campus_id,
            GivingTransaction.status == "completed",
            GivingTransaction.currency == currency,
            GivingTransaction.transaction_date >= date_from,
            GivingTransaction.transaction_date <= date_to,
        ]

        total_result = await self.db.execute(
            select(func.sum(GivingTransaction.amount), func.count()).where(*base_filter)
        )
        total_amount, count = total_result.one()

        by_category = await self.db.execute(
            select(GivingCategory.name, func.sum(GivingTransaction.amount))
            .join(GivingCategory, GivingTransaction.category_id == GivingCategory.id)
            .where(*base_filter)
            .group_by(GivingCategory.name)
        )

        by_channel = await self.db.execute(
            select(GivingTransaction.channel, func.sum(GivingTransaction.amount))
            .where(*base_filter)
            .group_by(GivingTransaction.channel)
        )

        return {
            "total_amount": float(total_amount or 0),
            "transaction_count": count,
            "currency": currency,
            "by_category": [{"name": r[0], "amount": float(r[1])} for r in by_category],
            "by_channel": [{"channel": r[0], "amount": float(r[1])} for r in by_channel],
        }

    async def list_for_member(self, member_id: UUID, page: int = 1, page_size: int = 20) -> tuple[list[GivingTransaction], int, int]:
        stmt = (
            select(GivingTransaction)
            .where(GivingTransaction.member_id == member_id)
            .order_by(GivingTransaction.transaction_date.desc())
        )
        items, total = await self.paginate(stmt, page, page_size)
        return items, total, math.ceil(total / page_size)
