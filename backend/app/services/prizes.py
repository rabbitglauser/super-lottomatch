from decimal import Decimal

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.services.events import EventService
from app.utils import format_chf, format_date


class PrizeService:
    def __init__(self, db: Session):
        self.db = db
        self.events = EventService(db)

    def get_prizes(self) -> dict:
        event = self.events.latest_event()
        rows = self.db.execute(
            text(
                """
                select
                  p.id,
                  p.title,
                  p.description,
                  p.value_chf,
                  p.event_day_id,
                  d.id as draw_id
                from prizes p
                join event_days ed on ed.id = p.event_day_id
                left join draws d on d.prize_id = p.id
                where ed.event_id = :event_id
                order by ed.day_number, p.id
                """
            ),
            {"event_id": event.id},
        ).all()

        prizes = []
        for row in rows:
            category = self.prize_category(row.title, row.description)
            prizes.append(
                {
                    "id": str(row.id),
                    "name": row.title,
                    "description": row.description or "Keine Beschreibung hinterlegt.",
                    "category": category,
                    "sponsor": "STV Ennetbürgen",
                    "value": format_chf(row.value_chf),
                    "status": "Reserviert" if row.draw_id else "Bereit",
                }
            )

        drawn = sum(1 for prize in prizes if prize["status"] == "Reserviert")
        main_prizes = sum(1 for prize in prizes if prize["category"] == "Hauptpreis")
        total_value = sum(Decimal(str(row.value_chf or 0)) for row in rows)

        return {
            "kpis": [
                {
                    "label": "Total Preise",
                    "value": str(len(prizes)),
                    "subtitle": "aus Datenbank",
                    "subtitleTone": "accent",
                },
                {
                    "label": "Gesamtwert",
                    "value": format_chf(total_value),
                    "subtitle": "erfasst",
                    "subtitleTone": "accent",
                },
                {
                    "label": "Hauptpreise",
                    "value": str(main_prizes),
                    "subtitle": "Top-Kategorie",
                    "subtitleTone": "muted",
                },
                {
                    "label": "Ausgelost",
                    "value": str(drawn),
                    "subtitle": f"{round((drawn / len(prizes)) * 100) if prizes else 0}%",
                    "subtitleTone": "accent",
                    "progress": round((drawn / len(prizes)) * 100) if prizes else 0,
                },
            ],
            "overview": {
                "currentEvent": event.name,
                "nextDraw": "Nächste Verlosung",
                "date": format_date(event.end_date),
                "time": "17:00",
                "drawn": drawn,
                "total": len(prizes),
            },
            "nextHighlight": prizes[0] if prizes else None,
            "prizes": prizes,
        }

    @staticmethod
    def prize_category(title: str, description: str | None) -> str:
        text_value = f"{title} {description or ''}".lower()
        if "hauptpreis" in text_value or "reise" in text_value or "e-bike" in text_value:
            return "Hauptpreis"
        if "sport" in text_value:
            return "Sport"
        if (
            "gutschein" in text_value
            or "ticket" in text_value
            or "eintritt" in text_value
        ):
            return "Gutschein"
        if "kaffee" in text_value or "brunch" in text_value or "korb" in text_value:
            return "Genuss"
        return "Sachpreis"
