from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import WorkerUser, get_db
from app.schemas.attendance import (
    AttendanceSessionCreate,
    AttendanceSessionResponse,
    AttendanceSessionUpdate,
    CheckInRequest,
    CheckInResponse,
)
from app.schemas.common import MessageResponse
from app.services.attendance_service import AttendanceService

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.get("/sessions", response_model=list[AttendanceSessionResponse])
async def list_sessions(
    current_user: WorkerUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    check_in_open: bool | None = Query(None, description="Filter by check-in open status"),
):
    svc = AttendanceService(db)
    sessions = await svc.list_sessions(current_user.campus_id, check_in_open)
    return [AttendanceSessionResponse.model_validate(s) for s in sessions]


@router.post("/sessions", response_model=AttendanceSessionResponse, status_code=status.HTTP_201_CREATED)
async def open_session(
    body: AttendanceSessionCreate,
    current_user: WorkerUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    svc = AttendanceService(db)
    session = await svc.open_session(current_user.campus_id, body, current_user.id)
    return AttendanceSessionResponse.model_validate(session)


@router.get("/sessions/{session_id}", response_model=AttendanceSessionResponse)
async def get_session(session_id: UUID, current_user: WorkerUser, db: Annotated[AsyncSession, Depends(get_db)]):
    svc = AttendanceService(db)
    return AttendanceSessionResponse.model_validate(await svc.get_by_id_or_404(session_id))


@router.patch("/sessions/{session_id}", response_model=AttendanceSessionResponse)
async def update_session(
    session_id: UUID,
    body: AttendanceSessionUpdate,
    current_user: WorkerUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    svc = AttendanceService(db)
    session = await svc.get_by_id_or_404(session_id)
    updated = await svc.update(session, **body.model_dump(exclude_none=True))
    return AttendanceSessionResponse.model_validate(updated)


@router.post("/sessions/{session_id}/close", response_model=AttendanceSessionResponse)
async def close_session(session_id: UUID, current_user: WorkerUser, db: Annotated[AsyncSession, Depends(get_db)]):
    svc = AttendanceService(db)
    session = await svc.get_by_id_or_404(session_id)
    closed = await svc.close_session(session)
    return AttendanceSessionResponse.model_validate(closed)


@router.post("/sessions/{session_id}/check-in", response_model=CheckInResponse, status_code=status.HTTP_201_CREATED)
async def check_in(
    session_id: UUID,
    body: CheckInRequest,
    current_user: WorkerUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    svc = AttendanceService(db)
    session = await svc.get_by_id_or_404(session_id)
    record = await svc.check_in(session, body)
    return CheckInResponse.model_validate(record)
