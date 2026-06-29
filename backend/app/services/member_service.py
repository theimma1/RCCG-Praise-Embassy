import math
from uuid import UUID

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.member import Member
from app.schemas.member import MemberCreate, MemberUpdate
from app.services.base_service import BaseService


class MemberService(BaseService[Member]):
    model = Member

    async def search(
        self,
        campus_id: UUID,
        query: str | None = None,
        status: str | None = None,
        discipleship_stage: str | None = None,
        worker_status: bool | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Member], int, int]:
        stmt = (
            select(Member)
            .where(Member.campus_id == campus_id, Member.is_deleted == False)  # noqa: E712
        )

        if query:
            search_term = f"%{query}%"
            stmt = stmt.where(
                or_(
                    Member.first_name.ilike(search_term),
                    Member.last_name.ilike(search_term),
                    Member.email.ilike(search_term),
                    Member.phone_primary.ilike(search_term),
                )
            )
        if status:
            stmt = stmt.where(Member.status == status)
        if discipleship_stage:
            stmt = stmt.where(Member.discipleship_stage == discipleship_stage)
        if worker_status is not None:
            stmt = stmt.where(Member.worker_status == worker_status)

        stmt = stmt.order_by(Member.first_name, Member.last_name)
        members, total = await self.paginate(stmt, page, page_size)
        total_pages = math.ceil(total / page_size)
        return members, total, total_pages

    async def create_member(self, data: MemberCreate) -> Member:
        return await self.create(**data.model_dump(exclude_unset=True))

    async def update_member(self, member: Member, data: MemberUpdate) -> Member:
        return await self.update(member, **data.model_dump(exclude_unset=True, exclude_none=True))

    async def get_by_user_id(self, user_id: UUID) -> Member | None:
        result = await self.db.execute(select(Member).where(Member.user_id == user_id))
        return result.scalar_one_or_none()
