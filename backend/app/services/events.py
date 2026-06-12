from typing import Any

from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session


class EventService:
    def __init__(self, db: Session):
        self.db = db

    def latest_event(self) -> Any:
        row = self.db.execute(
            text(
                """
                select id, name, event_year, location, start_date, end_date
                from lotto_events
                order by event_year desc, start_date desc
                limit 1
                """
            )
        ).first()

        if row is None:
            raise HTTPException(status_code=404, detail="No Lottomatch event found")

        return row

    def latest_event_day(self, event_id: int | None = None) -> Any:
        if event_id is None:
            event_id = self.latest_event().id

        row = self.db.execute(
            text(
                """
                select id, event_id, day_number, event_date, checkin_open_at, checkin_close_at
                from event_days
                where event_id = :event_id
                order by day_number desc
                limit 1
                """
            ),
            {"event_id": event_id},
        ).first()

        if row is None:
            raise HTTPException(status_code=404, detail="No event day found")

        return row
