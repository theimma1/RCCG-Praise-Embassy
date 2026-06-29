from fastapi import APIRouter

from app.api.v1.routes import auth, members, attendance, giving

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(members.router)
api_router.include_router(attendance.router)
api_router.include_router(giving.router)
