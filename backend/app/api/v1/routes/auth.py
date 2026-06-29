from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.dependencies import CurrentUser, get_db
from app.core.security import create_access_token, create_refresh_token
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
)
from app.schemas.common import MessageResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    svc = UserService(db)
    if await svc.get_by_email(body.email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = await svc.create_user(email=body.email, password=body.password, phone=body.phone)

    access_token = create_access_token(str(user.id), user.role, str(user.campus_id) if user.campus_id else None)
    raw_refresh, _ = create_refresh_token()
    await svc.create_refresh_token(user.id, raw_refresh, {}, settings.REFRESH_TOKEN_EXPIRE_DAYS)

    return TokenResponse(
        access_token=access_token,
        refresh_token=raw_refresh,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, request: Request, db: Annotated[AsyncSession, Depends(get_db)]):
    svc = UserService(db)
    user = await svc.authenticate(body.email, body.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

    await svc.update_last_login(user)

    device_info = {
        "ip": request.client.host if request.client else None,
        "user_agent": request.headers.get("user-agent"),
    }
    access_token = create_access_token(str(user.id), user.role, str(user.campus_id) if user.campus_id else None)
    raw_refresh, _ = create_refresh_token()
    await svc.create_refresh_token(user.id, raw_refresh, device_info, settings.REFRESH_TOKEN_EXPIRE_DAYS)

    return TokenResponse(
        access_token=access_token,
        refresh_token=raw_refresh,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(body: RefreshRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    svc = UserService(db)
    token_obj = await svc.get_valid_refresh_token(body.refresh_token)
    if not token_obj:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    await svc.revoke_refresh_token(token_obj)

    user = await svc.get_by_id(token_obj.user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    access_token = create_access_token(str(user.id), user.role, str(user.campus_id) if user.campus_id else None)
    raw_refresh, _ = create_refresh_token()
    await svc.create_refresh_token(user.id, raw_refresh, token_obj.device_info, settings.REFRESH_TOKEN_EXPIRE_DAYS)

    return TokenResponse(
        access_token=access_token,
        refresh_token=raw_refresh,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/logout", response_model=MessageResponse)
async def logout(body: RefreshRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    svc = UserService(db)
    token_obj = await svc.get_valid_refresh_token(body.refresh_token)
    if token_obj:
        await svc.revoke_refresh_token(token_obj)
    return MessageResponse(message="Logged out successfully")


@router.post("/change-password", response_model=MessageResponse)
async def change_password(body: ChangePasswordRequest, current_user: CurrentUser, db: Annotated[AsyncSession, Depends(get_db)]):
    from app.core.security import hash_password, verify_password
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
    svc = UserService(db)
    await svc.update(current_user, hashed_password=hash_password(body.new_password))
    return MessageResponse(message="Password updated successfully")


@router.get("/me")
async def get_me(current_user: CurrentUser):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "role": current_user.role,
        "campus_id": str(current_user.campus_id) if current_user.campus_id else None,
        "is_verified": current_user.is_verified,
        "two_fa_enabled": current_user.two_fa_enabled,
    }
