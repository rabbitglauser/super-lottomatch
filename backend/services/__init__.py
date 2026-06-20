import secrets
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from core.csv_export import build_guest_export_csv
from core.formatting import (
    avatar_tone,
    format_chf,
    format_date,
    format_time,
    initials,
    month_label,
)
from core.guest_codes import normalize_guest_code
from core.raffle_rules import ELIGIBILITY_LABELS, validate_prize_config
from core.security import verify_password
from core.validation import clean_optional, require_text
from repositories import (
    AnalyticsRepository,
    AuthRepository,
    CheckInRepository,
    EventRepository,
    GuestRepository,
    PrizeRepository,
)
from schemas import (
    CheckInByCodeRequest,
    CheckInByCodeResponse,
    EventCreateRequest,
    EventCreateResponse,
    GuestRegistrationRequest,
    GuestRegistrationResponse,
    GuestSearchResult,
    LoginRequest,
    LoginResponse,
    PrizeConfigRequest,
    PrizeConfigResponse,
    PublicPrizeView,
    PublicRaffleResponse,
)


def address_label(row) -> str:
    return f"{row.street} {row.house_number}, {row.postal_code} {row.city}"


def map_guest_search_result(row) -> GuestSearchResult:
    checked_in_at = format_time(row.checked_in_at)
    return GuestSearchResult(
        id=str(row.id),
        name=f"{row.first_name} {row.last_name}",
        code=row.guest_code,
        address=address_label(row),
        status="checked-in" if row.checkin_id else "expected",
        checkedInAt=checked_in_at,
    )


def latest_event_or_404(repository: EventRepository):
    event = repository.latest_event()
    if event is None:
        raise HTTPException(status_code=404, detail="No Lottomatch event found")
    return event


def latest_event_day_or_404(repository: EventRepository, event_id: int):
    day = repository.latest_event_day(event_id)
    if day is None:
        raise HTTPException(status_code=404, detail="No event day found")
    return day


class AuthService:
    def __init__(self, db: Session):
        self.repository = AuthRepository(db)

    def login(self, payload: LoginRequest) -> LoginResponse:
        normalized_email = payload.email.strip().lower()
        row = self.repository.find_active_user_by_email(normalized_email)

        if row is None or not verify_password(payload.password, row.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Ungültige Zugangsdaten",
            )

        return LoginResponse(
            id=row.id,
            name=f"{row.first_name} {row.last_name}",
            email=row.email,
        )


class DashboardService:
    def __init__(self, db: Session):
        self.events = EventRepository(db)
        self.guests = GuestRepository(db)
        self.checkins = CheckInRepository(db)

    def get_dashboard(self) -> dict[str, object]:
        event = latest_event_or_404(self.events)
        event_day = latest_event_day_or_404(self.events, event.id)
        total_guests = self.guests.total_active_guests()
        checked_in = self.checkins.count_for_event_day(event_day.id)
        last_year_guests = self.checkins.last_year_guest_count(event.event_year - 1)
        current_event_guests = self.checkins.current_event_guest_count(event.id)

        delta = 0
        if last_year_guests:
            delta = round(
                ((current_event_guests - last_year_guests) / last_year_guests) * 100
            )

        event_days = []
        for day in self.events.event_days_with_checkins(event.id):
            event_days.append(
                {
                    "id": str(day.id),
                    "month": month_label(day.event_date),
                    "day": day.event_date.strftime("%d"),
                    "title": f"{event.name} - Tag {day.day_number}",
                    "time": (
                        f"{format_time(day.checkin_open_at)} - "
                        f"{format_time(day.checkin_close_at)}"
                    ),
                    "guests": day.checkins,
                    "active": day.id == event_day.id,
                }
            )

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
                "message": (
                    f"{event.name}: {checked_in} Gäste für Tag "
                    f"{event_day.day_number} eingecheckt."
                ),
            },
            "location": {
                "label": "Veranstaltungsort",
                "locationLabel": event.location or "Mehrzweckhalle Ennetbürgen",
                "coordinates": {"lat": 46.9842, "lng": 8.4109},
            },
        }


class GuestService:
    def __init__(self, db: Session):
        self.db = db
        self.guests = GuestRepository(db)
        self.events = EventRepository(db)

    def list_guests(self) -> list[dict[str, object]]:
        return [
            {
                "id": str(row.id),
                "name": f"{row.first_name} {row.last_name}",
                "email": row.email or "Keine E-Mail hinterlegt",
                "code": row.guest_code,
                "city": row.city,
                "lastParticipation": format_date(row.last_participation),
                "marketingActive": bool(
                    row.allow_email_marketing or row.allow_post_marketing
                ),
                "initials": initials(row.first_name, row.last_name),
                "avatarTone": avatar_tone(row.id),
            }
            for row in self.guests.list_guest_rows()
        ]

    def export_csv(self) -> str:
        return build_guest_export_csv(self.guests.export_rows())

    def create_guest(
        self, payload: GuestRegistrationRequest
    ) -> GuestRegistrationResponse:
        first_name = require_text(payload.firstName, "firstName")
        last_name = require_text(payload.lastName, "lastName")
        street = require_text(payload.street, "street")
        house_number = require_text(payload.houseNumber, "houseNumber")
        postal_code = require_text(payload.postalCode, "postalCode")
        city = require_text(payload.city, "city")

        address = self.guests.insert_address(
            street=street,
            house_number=house_number,
            postal_code=postal_code,
            city=city,
        )

        if address is None:
            raise HTTPException(status_code=500, detail="Address could not be saved")

        guest = self.guests.insert_guest(
            {
                "guest_code": self.generate_guest_code(),
                "first_name": first_name,
                "last_name": last_name,
                "address_id": address.id,
                "phone": clean_optional(payload.phone),
                "email": clean_optional(payload.email),
                "allow_email_marketing": payload.allowEmailMarketing,
                "allow_post_marketing": payload.allowPostMarketing,
                "notes": clean_optional(payload.notes),
            }
        )
        self.db.commit()

        if guest is None:
            raise HTTPException(status_code=500, detail="Guest could not be saved")

        return GuestRegistrationResponse(
            id=str(guest.id),
            guestCode=guest.guest_code,
            name=f"{guest.first_name} {guest.last_name}",
        )

    def generate_guest_code(self) -> str:
        for _ in range(10):
            code = f"G-{secrets.randbelow(1_000_000):06d}"
            if not self.guests.guest_code_exists(code):
                return code

        raise HTTPException(status_code=500, detail="Guest code could not be generated")

    def search_guests(self, q: str = "") -> list[GuestSearchResult]:
        query = q.strip()
        if len(query) < 2:
            return []

        event = latest_event_or_404(self.events)
        day = latest_event_day_or_404(self.events, event.id)
        rows = self.guests.search_rows(f"%{query}%", day.id)
        return [map_guest_search_result(row) for row in rows]

    def update_marketing(self, guest_id: int) -> dict[str, object]:
        row = self.guests.update_marketing(guest_id)
        self.db.commit()

        if row is None:
            raise HTTPException(status_code=404, detail="Guest not found")

        return {"id": str(row.id), "marketingActive": bool(row.allow_email_marketing)}

    def delete_guest(self, guest_id: int) -> None:
        row = self.guests.soft_delete(guest_id)
        self.db.commit()

        if row is None:
            raise HTTPException(status_code=404, detail="Guest not found")


class EventService:
    def __init__(self, db: Session):
        self.db = db
        self.events = EventRepository(db)

    def create_event(self, payload: EventCreateRequest) -> EventCreateResponse:
        name = require_text(payload.name, "name")
        sorted_dates = sorted(
            {day.date.strip() for day in payload.days if day.date.strip()}
        )

        if not sorted_dates:
            raise HTTPException(
                status_code=422,
                detail="Mindestens ein Event-Tag mit Datum ist erforderlich.",
            )

        if payload.year < 2000:
            raise HTTPException(status_code=422, detail="Invalid event year")

        event = self.events.insert_event(
            {
                "name": name,
                "event_year": payload.year,
                "location": clean_optional(payload.location),
                "start_date": sorted_dates[0],
                "end_date": sorted_dates[-1],
            }
        )

        if event is None:
            self.db.rollback()
            raise HTTPException(status_code=500, detail="Event could not be saved")

        self.events.insert_event_days(event.id, sorted_dates)
        self.db.commit()

        return EventCreateResponse(
            id=str(event.id),
            name=event.name,
            year=event.event_year,
            dayCount=len(sorted_dates),
        )


class CheckInService:
    def __init__(self, db: Session):
        self.db = db
        self.events = EventRepository(db)
        self.checkins = CheckInRepository(db)

    def get_check_ins(self, event_day_id: int | None = None) -> dict[str, object]:
        if event_day_id is None:
            event = latest_event_or_404(self.events)
            day = latest_event_day_or_404(self.events, event.id)
        else:
            day = self.checkins.find_event_day(event_day_id)

        if day is None:
            raise HTTPException(status_code=404, detail="Event day not found")

        guests = []
        for row in self.checkins.guest_rows_for_day(day.id):
            status_value = "checked-in" if row.checkin_id else "expected"
            guests.append(
                {
                    "id": str(row.id),
                    "name": f"{row.first_name} {row.last_name}",
                    "email": row.email or "Keine E-Mail hinterlegt",
                    "initials": initials(row.first_name, row.last_name),
                    "ticket": row.guest_code,
                    "group": row.city,
                    "code": row.guest_code,
                    "city": row.city,
                    "status": status_value,
                    "checkedInAt": format_time(row.checked_in_at),
                    "time": format_time(row.checked_in_at),
                    "avatarTone": avatar_tone(row.id),
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

    def create_by_code(self, payload: CheckInByCodeRequest) -> CheckInByCodeResponse:
        event = latest_event_or_404(self.events)
        day = latest_event_day_or_404(self.events, event.id)
        guest_code = normalize_guest_code(payload.code)
        guest = self.checkins.get_guest_for_checkin(guest_code, day.id)

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

        checkin = self.checkins.insert_code_checkin(
            event_day_id=day.id,
            guest_id=guest.id,
            method=payload.method,
        )
        self.db.commit()

        if checkin is None:
            raise HTTPException(status_code=500, detail="Check-in could not be created")

        guest_result = GuestSearchResult(
            id=str(guest.id),
            name=f"{guest.first_name} {guest.last_name}",
            code=guest.guest_code,
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
        self, guest_id: int, event_day_id: int | None = None
    ) -> dict[str, str]:
        if event_day_id is None:
            event = latest_event_or_404(self.events)
            day = latest_event_day_or_404(self.events, event.id)
        else:
            day = self.checkins.find_event_day(event_day_id)

        if day is None:
            raise HTTPException(status_code=404, detail="Event day not found")

        existing = self.checkins.find_existing_checkin(day.id, guest_id)
        if existing is not None:
            return {
                "id": str(existing.id),
                "checkedInAt": format_time(existing.checked_in_at),
            }

        row = self.checkins.insert_manual_checkin(day.id, guest_id)
        self.db.commit()

        return {"id": str(row.id), "checkedInAt": format_time(row.checked_in_at)}


class PrizeService:
    def __init__(self, db: Session):
        self.db = db
        self.events = EventRepository(db)
        self.prizes = PrizeRepository(db)

    def _event_capacity(self, event_id: int) -> int:
        row = self.prizes.event_capacity(event_id)
        return int(row.capacity) if row and row.capacity is not None else 0

    @staticmethod
    def _clean_config(payload: PrizeConfigRequest, capacity: int) -> dict[str, object]:
        try:
            return validate_prize_config(
                title=payload.title,
                winner_count=payload.winnerCount,
                eligibility=payload.eligibility,
                value_chf=payload.valueChf,
                capacity=capacity,
            )
        except ValueError as error:
            raise HTTPException(status_code=422, detail=str(error)) from error

    @staticmethod
    def _to_config_response(row) -> PrizeConfigResponse:
        return PrizeConfigResponse(
            id=str(row.id),
            eventDayId=int(row.event_day_id),
            title=row.title,
            description=row.description,
            valueChf=str(row.value_chf),
            winnerCount=int(row.winner_count),
            eligibility=row.eligibility,
        )

    def create_prize(self, payload: PrizeConfigRequest) -> PrizeConfigResponse:
        event = latest_event_or_404(self.events)
        if self.prizes.event_day_belongs_to_event(payload.eventDayId, event.id) is None:
            raise HTTPException(
                status_code=404, detail="Event day not found for current event"
            )

        cleaned = self._clean_config(payload, self._event_capacity(event.id))
        row = self.prizes.insert_prize(
            {
                "event_day_id": payload.eventDayId,
                "title": cleaned["title"],
                "description": clean_optional(payload.description),
                "value_chf": cleaned["value_chf"],
                "winner_count": cleaned["winner_count"],
                "eligibility": cleaned["eligibility"],
            }
        )
        self.db.commit()

        if row is None:
            raise HTTPException(status_code=500, detail="Prize could not be saved")

        return self._to_config_response(row)

    def update_prize(
        self, prize_id: int, payload: PrizeConfigRequest
    ) -> PrizeConfigResponse:
        event = latest_event_or_404(self.events)
        cleaned = self._clean_config(payload, self._event_capacity(event.id))
        row = self.prizes.update_prize(
            prize_id,
            {
                "title": cleaned["title"],
                "description": clean_optional(payload.description),
                "value_chf": cleaned["value_chf"],
                "winner_count": cleaned["winner_count"],
                "eligibility": cleaned["eligibility"],
            },
        )
        self.db.commit()

        if row is None:
            raise HTTPException(status_code=404, detail="Prize not found")

        return self._to_config_response(row)

    def delete_prize(self, prize_id: int) -> None:
        if self.prizes.draw_for_prize(prize_id) is not None:
            raise HTTPException(
                status_code=409,
                detail="Prize has already been drawn and cannot be deleted",
            )

        row = self.prizes.delete_prize(prize_id)
        self.db.commit()

        if row is None:
            raise HTTPException(status_code=404, detail="Prize not found")

    def get_public_raffle(self) -> PublicRaffleResponse:
        event = latest_event_or_404(self.events)
        rows = self.prizes.prize_rows_for_event(event.id)

        prizes: list[PublicPrizeView] = []
        total_winners = 0
        for row in rows:
            winner_count = int(getattr(row, "winner_count", 1) or 1)
            total_winners += winner_count
            eligibility = getattr(row, "eligibility", "checked_in")
            prizes.append(
                PublicPrizeView(
                    id=str(row.id),
                    name=row.title,
                    description=row.description or "Keine Beschreibung hinterlegt.",
                    category=self.prize_category(row.title, row.description),
                    value=format_chf(row.value_chf),
                    winnerCount=winner_count,
                    eligibilityLabel=ELIGIBILITY_LABELS.get(
                        eligibility, ELIGIBILITY_LABELS["checked_in"]
                    ),
                )
            )

        return PublicRaffleResponse(
            eventName=event.name,
            prizes=prizes,
            totalWinners=total_winners,
        )

    def get_prizes(self) -> dict[str, object]:
        event = latest_event_or_404(self.events)
        rows = self.prizes.prize_rows_for_event(event.id)

        prizes = []
        for row in rows:
            category = self.prize_category(row.title, row.description)
            prizes.append(
                {
                    "id": str(row.id),
                    "eventDayId": row.event_day_id,
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
        if (
            "hauptpreis" in text_value
            or "reise" in text_value
            or "e-bike" in text_value
        ):
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


class AnalyticsService:
    def __init__(self, db: Session):
        self.repository = AnalyticsRepository(db)

    def get_analytics(self) -> dict[str, object]:
        total_guests = self.repository.scalar(
            "select count(*) from guests where deleted_at is null"
        )
        total_checkins = self.repository.scalar("select count(*) from checkins")
        total_event_days = self.repository.scalar("select count(*) from event_days")
        completed_draws = self.repository.scalar("select count(*) from draws")
        active_events = self.repository.scalar("select count(*) from lotto_events")
        checkin_rate = (
            round((total_checkins / (total_guests * total_event_days)) * 100)
            if total_guests and total_event_days
            else 0
        )

        participants = [
            {"month": row.month.strip(), "participants": row.participants}
            for row in self.repository.participant_rows()
        ]

        method_rows = self.repository.method_rows()
        method_total = sum(row.total for row in method_rows) or 1
        qr_total = sum(row.total for row in method_rows if row.method == "qr_code")
        manual_total = sum(
            row.total
            for row in method_rows
            if row.method in {"manual_form", "guest_code"}
        )
        other_total = method_total - qr_total - manual_total

        top_events = []
        for row in self.repository.top_event_rows():
            top_events.append(
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
            )

        granted = self.repository.marketing_granted_count()
        rejected = total_guests - granted
        granted_percentage = (
            round((granted / total_guests) * 100) if total_guests else 0
        )
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
                {"label": row.label, "value": row.value}
                for row in self.repository.checkins_by_day_rows()
            ],
            "topEvents": top_events,
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
                    {
                        "key": "pending",
                        "label": "Ausstehend",
                        "percentage": 0,
                        "count": 0,
                    },
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
