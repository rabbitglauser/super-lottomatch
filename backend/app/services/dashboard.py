from sqlalchemy import text
from sqlalchemy.orm import Session

from app.services.events import EventService
from app.utils import format_time, month_label


class DashboardService:
    def __init__(self, db: Session):
        self.db = db
        self.events = EventService(db)

    def get_dashboard(self) -> dict:
        event = self.events.latest_event()
        event_day = self.events.latest_event_day(event.id)

        total_guests = self.db.execute(
            text("select count(*) from guests where deleted_at is null")
        ).scalar_one()
        checked_in = self.db.execute(
            text("select count(*) from checkins where event_day_id = :event_day_id"),
            {"event_day_id": event_day.id},
        ).scalar_one()
        last_year_guests = self.db.execute(
            text(
                """
                select count(distinct c.guest_id)
                from checkins c
                join event_days ed on ed.id = c.event_day_id
                join lotto_events le on le.id = ed.event_id
                where le.event_year = :event_year
                """
            ),
            {"event_year": event.event_year - 1},
        ).scalar_one()
        current_event_guests = self.db.execute(
            text(
                """
                select count(distinct c.guest_id)
                from checkins c
                join event_days ed on ed.id = c.event_day_id
                where ed.event_id = :event_id
                """
            ),
            {"event_id": event.id},
        ).scalar_one()

        delta = 0
        if last_year_guests:
            delta = round(
                ((current_event_guests - last_year_guests) / last_year_guests) * 100
            )

        days = self.db.execute(
            text(
                """
                select
                  ed.id,
                  ed.day_number,
                  ed.event_date,
                  ed.checkin_open_at,
                  ed.checkin_close_at,
                  count(c.id) as checkins
                from event_days ed
                left join checkins c on c.event_day_id = ed.id
                where ed.event_id = :event_id
                group by ed.id
                order by ed.day_number
                """
            ),
            {"event_id": event.id},
        ).all()

        event_days = [
            {
                "id": str(day.id),
                "month": month_label(day.event_date),
                "day": day.event_date.strftime("%d"),
                "title": f"{event.name} - Tag {day.day_number}",
                "time": f"{format_time(day.checkin_open_at)} - {format_time(day.checkin_close_at)}",
                "guests": day.checkins,
                "active": day.id == event_day.id,
            }
            for day in days
        ]

        progress = round((checked_in / total_guests) * 100) if total_guests else 0

        return {
            "stats": [
                {
                    "variant": "delta",
                    "label": "Total Gäste",
                    "value": str(total_guests),
                    "delta": f"{delta:+d}%",
                },
                {
                    "variant": "progress",
                    "label": "Heutige Check-ins",
                    "value": str(checked_in),
                    "progress": progress,
                },
                {
                    "variant": "status",
                    "label": "Aktueller Status",
                    "value": event.name,
                    "subtitle": event.location or "Veranstaltungsort offen",
                },
            ],
            "eventDays": event_days,
            "liveUpdate": {
                "label": "Live Update",
                "message": f"{event.name}: {checked_in} Gäste für Tag {event_day.day_number} eingecheckt.",
            },
            "location": {
                "label": "Veranstaltungsort",
                "locationLabel": event.location or "Mehrzweckhalle Ennetbürgen",
                "coordinates": {"lat": 46.9842, "lng": 8.4109},
            },
        }
