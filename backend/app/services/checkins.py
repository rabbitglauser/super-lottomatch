from typing import Any

from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.models import GuestRecord
from app.schemas import CheckInByCodeRequest, CheckInByCodeResponse, GuestSearchResult
from app.services.events import EventService
from app.utils import (
    address_label,
    avatar_tone,
    format_time,
    initials,
    map_guest_search_result,
    normalize_guest_code,
)


class CheckInService:
    def __init__(self, db: Session):
        self.db = db
        self.events = EventService(db)

    def get_check_ins(self, event_day_id: int | None = None) -> dict:
        day = (
            self.events.latest_event_day()
            if event_day_id is None
            else self.db.execute(
                text(
                    "select id, event_id, day_number, event_date from event_days where id = :id"
                ),
                {"id": event_day_id},
            ).first()
        )

        if day is None:
            raise HTTPException(status_code=404, detail="Event day not found")

        rows = self.db.execute(
            text(
                """
                select
                  g.id,
                  g.first_name,
                  g.last_name,
                  g.email,
                  g.guest_code,
                  a.city,
                  c.id as checkin_id,
                  c.checked_in_at
                from guests g
                join addresses a on a.id = g.address_id
                left join checkins c on c.guest_id = g.id and c.event_day_id = :event_day_id
                where g.deleted_at is null
                order by c.checked_in_at desc nulls last, g.last_name, g.first_name
                """
            ),
            {"event_day_id": day.id},
        ).all()

        guests = []
        for row in rows:
            guest = GuestRecord.from_row(row)
            status_value = "checked-in" if row.checkin_id else "expected"
            guests.append(
                {
                    "id": str(guest.id),
                    "name": guest.name,
                    "email": row.email or "Keine E-Mail hinterlegt",
                    "initials": initials(guest.first_name, guest.last_name),
                    "ticket": guest.guest_code,
                    "group": row.city,
                    "code": guest.guest_code,
                    "city": row.city,
                    "status": status_value,
                    "checkedInAt": format_time(row.checked_in_at),
                    "time": format_time(row.checked_in_at),
                    "avatarTone": avatar_tone(guest.id),
                }
            )

        checked_in = sum(1 for guest in guests if guest["status"] == "checked-in")
        expected = len(guests) - checked_in

        return {
            "eventDayId": str(day.id),
            "summary": {
                "total": len(guests),
                "checkedIn": checked_in,
                "expected": expected,
                "noShow": 0,
            },
            "guests": guests,
        }

    def create_check_in_by_code(
        self,
        payload: CheckInByCodeRequest,
    ) -> CheckInByCodeResponse:
        day = self.events.latest_event_day()
        guest_code = normalize_guest_code(payload.code)
        guest = self.get_guest_for_checkin(guest_code, day.id)

        if guest is None:
            raise HTTPException(status_code=404, detail="Guest code not found")

        if guest.checkin_id is not None:
            guest_result = map_guest_search_result(guest)
            return CheckInByCodeResponse(
                status="already-checked-in",
                id=str(guest.checkin_id),
                checkedInAt=guest_result.checkedInAt,
                guest=guest_result,
            )

        checkin = self.db.execute(
            text(
                """
                insert into checkins (
                  event_day_id,
                  guest_id,
                  method,
                  is_new_guest,
                  created_by_user_id
                )
                values (
                  :event_day_id,
                  :guest_id,
                  cast(:method as checkin_method),
                  false,
                  1
                )
                returning id, checked_in_at
                """
            ),
            {
                "event_day_id": day.id,
                "guest_id": guest.id,
                "method": payload.method,
            },
        ).first()
        self.db.commit()

        if checkin is None:
            raise HTTPException(status_code=500, detail="Check-in could not be created")

        guest_record = GuestRecord.from_row(guest)
        guest_result = GuestSearchResult(
            id=str(guest_record.id),
            name=guest_record.name,
            code=guest_record.guest_code,
            address=address_label(guest),
            status="checked-in",
            checkedInAt=format_time(checkin.checked_in_at),
        )

        return CheckInByCodeResponse(
            status="checked-in",
            id=str(checkin.id),
            checkedInAt=guest_result.checkedInAt,
            guest=guest_result,
        )

    def create_check_in(
        self,
        guest_id: int,
        event_day_id: int | None = None,
    ) -> dict:
        day = (
            self.events.latest_event_day()
            if event_day_id is None
            else self.db.execute(
                text("select id from event_days where id = :id"),
                {"id": event_day_id},
            ).first()
        )

        if day is None:
            raise HTTPException(status_code=404, detail="Event day not found")

        existing = self.db.execute(
            text(
                """
                select id, checked_in_at
                from checkins
                where event_day_id = :event_day_id and guest_id = :guest_id
                """
            ),
            {"event_day_id": day.id, "guest_id": guest_id},
        ).first()

        if existing is not None:
            return {
                "id": str(existing.id),
                "checkedInAt": format_time(existing.checked_in_at),
            }

        row = self.db.execute(
            text(
                """
                insert into checkins (
                  event_day_id,
                  guest_id,
                  method,
                  is_new_guest,
                  created_by_user_id
                )
                values (:event_day_id, :guest_id, 'manual_form', false, 1)
                returning id, checked_in_at
                """
            ),
            {"event_day_id": day.id, "guest_id": guest_id},
        ).first()
        self.db.commit()

        return {"id": str(row.id), "checkedInAt": format_time(row.checked_in_at)}

    def get_guest_for_checkin(self, guest_code: str, event_day_id: int) -> Any:
        return self.db.execute(
            text(
                """
                select
                  g.id,
                  g.guest_code,
                  g.first_name,
                  g.last_name,
                  a.street,
                  a.house_number,
                  a.postal_code,
                  a.city,
                  c.id as checkin_id,
                  c.checked_in_at
                from guests g
                join addresses a on a.id = g.address_id
                left join checkins c
                  on c.guest_id = g.id and c.event_day_id = :event_day_id
                where upper(g.guest_code) = :guest_code and g.deleted_at is null
                """
            ),
            {"guest_code": guest_code, "event_day_id": event_day_id},
        ).first()
