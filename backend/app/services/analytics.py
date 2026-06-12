from sqlalchemy import text
from sqlalchemy.orm import Session

from app.utils import format_date


class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def get_analytics(self) -> dict:
        total_guests = self.db.execute(
            text("select count(*) from guests where deleted_at is null")
        ).scalar_one()
        total_checkins = self.db.execute(text("select count(*) from checkins")).scalar_one()
        total_event_days = self.db.execute(
            text("select count(*) from event_days")
        ).scalar_one()
        completed_draws = self.db.execute(text("select count(*) from draws")).scalar_one()
        active_events = self.db.execute(text("select count(*) from lotto_events")).scalar_one()
        checkin_rate = (
            round((total_checkins / (total_guests * total_event_days)) * 100)
            if total_guests and total_event_days
            else 0
        )

        participant_rows = self.db.execute(
            text(
                """
                select to_char(date_trunc('month', created_at), 'Mon') as month, count(*) as participants
                from guests
                where deleted_at is null
                group by date_trunc('month', created_at)
                order by min(created_at)
                """
            )
        ).all()
        participants = [
            {"month": row.month.strip(), "participants": row.participants}
            for row in participant_rows
        ]

        method_rows = self.db.execute(
            text(
                """
                select method::text as method, count(*) as total
                from checkins
                group by method
                """
            )
        ).all()
        method_total = sum(row.total for row in method_rows) or 1
        qr_total = sum(row.total for row in method_rows if row.method == "qr_code")
        manual_total = sum(
            row.total for row in method_rows if row.method in {"manual_form", "guest_code"}
        )
        other_total = method_total - qr_total - manual_total

        checkins_by_day_rows = self.db.execute(
            text(
                """
                select 'Tag ' || ed.day_number as label, count(c.id) as value
                from event_days ed
                left join checkins c on c.event_day_id = ed.id
                group by ed.id
                order by ed.event_date
                """
            )
        ).all()

        top_event_rows = self.db.execute(
            text(
                """
                select
                  le.name,
                  le.start_date,
                  count(distinct c.guest_id) as guests,
                  count(c.id) as checkins
                from lotto_events le
                join event_days ed on ed.event_id = le.id
                left join checkins c on c.event_day_id = ed.id
                group by le.id
                order by le.event_year desc
                """
            )
        ).all()

        granted = self.db.execute(
            text(
                """
                select count(*)
                from guests
                where deleted_at is null
                  and (allow_email_marketing = true or allow_post_marketing = true)
                """
            )
        ).scalar_one()
        rejected = total_guests - granted
        granted_percentage = round((granted / total_guests) * 100) if total_guests else 0
        rejected_percentage = 100 - granted_percentage if total_guests else 0

        return {
            "summary": {
                "totalGuests": total_guests,
                "checkInRate": checkin_rate,
                "activeEvents": active_events,
                "completedDrawings": completed_draws,
            },
            "participantTrend": participants,
            "deviceDistribution": [
                {
                    "key": "mobile",
                    "label": "QR-Code",
                    "value": round((qr_total / method_total) * 100),
                },
                {
                    "key": "desktop",
                    "label": "Manuell",
                    "value": round((manual_total / method_total) * 100),
                },
                {
                    "key": "tablet",
                    "label": "Andere",
                    "value": round((other_total / method_total) * 100),
                },
            ],
            "checkinsByDay": [
                {"label": row.label, "value": row.value} for row in checkins_by_day_rows
            ],
            "topEvents": [
                {
                    "name": row.name,
                    "date": format_date(row.start_date),
                    "guests": row.guests,
                    "checkIns": row.checkins,
                    "conversion": round((row.checkins / row.guests) * 100, 1)
                    if row.guests
                    else 0,
                    "status": "Abgeschlossen",
                }
                for row in top_event_rows
            ],
            "liveOverview": [
                {"key": "visitors", "label": "Gäste gesamt", "value": total_guests},
                {"key": "devices", "label": "Event-Tage", "value": total_event_days},
                {"key": "scans", "label": "Check-ins", "value": total_checkins},
            ],
            "marketingConsent": {
                "totalGuests": total_guests,
                "grantedPercentage": granted_percentage,
                "grantedCount": granted,
                "breakdown": [
                    {
                        "key": "granted",
                        "label": "Eingewilligt",
                        "percentage": granted_percentage,
                        "count": granted,
                    },
                    {"key": "pending", "label": "Ausstehend", "percentage": 0, "count": 0},
                    {
                        "key": "rejected",
                        "label": "Abgelehnt",
                        "percentage": rejected_percentage,
                        "count": rejected,
                    },
                ],
            },
            "analyticsPeriods": [{"label": "Datenbank gesamt", "value": "all"}],
            "reportActions": [
                {"key": "csv", "label": "CSV herunterladen"},
                {"key": "pdf", "label": "PDF Report"},
                {"key": "share", "label": "Dashboard teilen"},
            ],
        }
