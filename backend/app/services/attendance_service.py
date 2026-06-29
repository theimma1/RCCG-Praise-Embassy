from datetime import date, datetime, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.attendance import AttendanceRecord, AttendanceSession
from app.schemas.attendance import AttendanceSessionCreate, AttendanceSessionUpdate, CheckInRequest
from app.services.base_service import BaseService


class AttendanceService(BaseService[AttendanceSession]):
    model = AttendanceSession

    async def open_session(self, campus_id: UUID, data: AttendanceSessionCreate, created_by: UUID) -> AttendanceSession:
        existing = await self.db.execute(
            select(AttendanceSession).where(
                AttendanceSession.event_id == data.event_id,
                AttendanceSession.session_date == data.session_date,
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Attendance session already exists for this event/date")

        return await self.create(
            event_id=data.event_id,
            campus_id=campus_id,
            session_date=data.session_date,
            notes=data.notes,
            opened_at=datetime.now(timezone.utc),
            created_by=created_by,
        )

    async def close_session(self, session: AttendanceSession) -> AttendanceSession:
        session.check_in_open = False
        session.closed_at = datetime.now(timezone.utc)
        await self.db.flush()
        return session

    async def check_in(self, session: AttendanceSession, data: CheckInRequest) -> AttendanceRecord:
        if not session.check_in_open:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Check-in is closed for this session")

        if data.member_id:
            dup = await self.db.execute(
                select(AttendanceRecord).where(
                    AttendanceRecord.session_id == session.id,
                    AttendanceRecord.member_id == data.member_id,
                )
            )
            if dup.scalar_one_or_none():
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Member already checked in")

        record = AttendanceRecord(
            session_id=session.id,
            attendance_type=data.attendance_type,
            member_id=data.member_id,
            guest_id=data.guest_id,
            anonymous_name=data.anonymous_name,
            check_in_at=datetime.now(timezone.utc),
            check_in_method=data.check_in_method,
        )
        self.db.add(record)

        # Update session aggregate counts
        session.total_count += 1
        if data.attendance_type == "first_timer":
            session.first_timers += 1
        elif data.attendance_type == "guest":
            pass  # extend as needed

        await self.db.flush()
        await self.db.refresh(record)
        return record

    async def get_session_by_event_date(self, event_id: UUID, session_date: date) -> AttendanceSession | None:
        result = await self.db.execute(
            select(AttendanceSession).where(
                AttendanceSession.event_id == event_id,
                AttendanceSession.session_date == session_date,
            )
        )
        return result.scalar_one_or_none()
