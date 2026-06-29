from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, hash_token, verify_password
from app.db.models.user import RefreshToken, User
from app.services.base_service import BaseService


class UserService(BaseService[User]):
    model = User

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def create_user(self, email: str, password: str, role: str = "member", campus_id: UUID | None = None, phone: str | None = None) -> User:
        return await self.create(
            email=email,
            hashed_password=hash_password(password),
            role=role,
            campus_id=campus_id,
            phone=phone,
        )

    async def authenticate(self, email: str, password: str) -> User | None:
        user = await self.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user

    async def create_refresh_token(self, user_id: UUID, raw_token: str, device_info: dict, expire_days: int) -> RefreshToken:
        token = RefreshToken(
            user_id=user_id,
            token_hash=hash_token(raw_token),
            device_info=device_info,
            expires_at=datetime.now(timezone.utc) + timedelta(days=expire_days),
        )
        self.db.add(token)
        await self.db.flush()
        return token

    async def get_valid_refresh_token(self, raw_token: str) -> RefreshToken | None:
        token_hash = hash_token(raw_token)
        result = await self.db.execute(
            select(RefreshToken).where(
                RefreshToken.token_hash == token_hash,
                RefreshToken.revoked_at.is_(None),
                RefreshToken.expires_at > datetime.now(timezone.utc),
            )
        )
        return result.scalar_one_or_none()

    async def revoke_refresh_token(self, token: RefreshToken) -> None:
        token.revoked_at = datetime.now(timezone.utc)
        await self.db.flush()

    async def update_last_login(self, user: User) -> None:
        user.last_login_at = datetime.now(timezone.utc)
        await self.db.flush()

    async def update_push_token(self, user: User, push_token: str) -> None:
        user.push_token = push_token
        user.push_token_updated = datetime.now(timezone.utc)
        await self.db.flush()
