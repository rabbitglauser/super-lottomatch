import csv
import io
import os
import secrets
from datetime import date, datetime
from decimal import Decimal
from typing import Any, Literal
from zoneinfo import ZoneInfo
from urllib.parse import parse_qs, urlparse

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import get_db

app = FastAPI()
APP_TIMEZONE = ZoneInfo("Europe/Zurich")
DEFAULT_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://superlottomatch.vercel.app",
]
GUEST_EXPORT_FILENAME = "superlottomatch-guests-export.csv"
GUEST_EXPORT_HEADERS = [
    "Gast-Code",
    "Vorname",
    "Nachname",
    "Strasse",
    "Hausnummer",
    "PLZ",
    "Ort",
    "Telefon",
    "E-Mail",
    "E-Mail Marketing",
    "Post Marketing",
    "Notizen",
    "Letzte Teilnahme",
    "Erstellt am",
]


def get_cors_origins() -> list[str]:
    configured_origins = os.environ.get("CORS_ORIGINS", "")
    extra_origins = [
        origin.strip().rstrip("/")
        for origin in configured_origins.split(",")
        if origin.strip()
    ]
    return [*DEFAULT_CORS_ORIGINS, *extra_origins]


# Allow private-network origins (any port) so LAN devices such as a phone on the
# same WiFi can reach the dev backend during local testing.
LAN_ORIGIN_REGEX = (
    r"http://(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+"
    r"|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_origin_regex=LAN_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    id: int
    name: str
    email: str


class GuestRegistrationRequest(BaseModel):
    firstName: str
    lastName: str
    street: str
    houseNumber: str
    postalCode: str
    city: str
    phone: str | None = None
    email: str | None = None
    allowEmailMarketing: bool = False
    allowPostMarketing: bool = True
    notes: str | None = None


class GuestRegistrationResponse(BaseModel):
    id: str
    guestCode: str
    name: str


class GuestSearchResult(BaseModel):
    id: str
    name: str
    code: str
    address: str
    status: Literal["checked-in", "expected"]
    checkedInAt: str | None


class CheckInByCodeRequest(BaseModel):
    code: str
    method: Literal["qr_code", "guest_code", "manual_form"] = "qr_code"


class CheckInByCodeResponse(BaseModel):
    status: Literal["checked-in", "already-checked-in"]
    id: str
    checkedInAt: str | None
    guest: GuestSearchResult


def verify_password(password: str, stored_password: str) -> bool:
    if stored_password.startswith(("$2a$", "$2b$", "$2y$")):
        try:
            import bcrypt
        except ImportError:
            return False

        return bcrypt.checkpw(
            password.encode("utf-8"),
            stored_password.encode("utf-8"),
        )

    return secrets.compare_digest(stored_password, password)


def row_to_dict(row: Any) -> dict[str, Any]:
    return dict(row._mapping)


def initials(first_name: str, last_name: str) -> str:
    return f"{first_name[:1]}{last_name[:1]}".upper()


def avatar_tone(value: int) -> str:
    return ["rose", "amber", "blue", "peach"][value % 4]


def format_date(value: date | datetime | None) -> str:
    if value is None:
        return "Noch keine Teilnahme"
    return value.strftime("%d.%m.%Y")


def format_time(value: datetime | None) -> str | None:
    if value is None:
        return None
    if value.tzinfo is not None:
        value = value.astimezone(APP_TIMEZONE)
    return value.strftime("%H:%M")


def format_chf(value: Decimal | int | float | str | None) -> str:
    if value is None:
        return "CHF -"
    amount = Decimal(str(value))
    if amount == amount.quantize(Decimal("1")):
        return f"CHF {amount:.0f}"
    return f"CHF {amount:.2f}"


def month_label(value: date) -> str:
    labels = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAI",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OKT",
        "NOV",
        "DEZ",
    ]
    return labels[value.month - 1]


def format_export_date(value: date | datetime | None) -> str:
    if value is None:
        return ""
    return value.strftime("%d.%m.%Y")


def format_export_bool(value: bool | None) -> str:
    return "Ja" if value else "Nein"


def csv_value(value: Any) -> str:
    if value is None:
        return ""
    return str(value)


def build_guest_export_csv(rows: list[Any]) -> str:
    output = io.StringIO()
    writer = csv.writer(output, delimiter=";", lineterminator="\n")
    writer.writerow(GUEST_EXPORT_HEADERS)

    for row in rows:
        writer.writerow(
            [
                csv_value(row.guest_code),
                csv_value(row.first_name),
                csv_value(row.last_name),
                csv_value(row.street),
                csv_value(row.house_number),
                csv_value(row.postal_code),
                csv_value(row.city),
                csv_value(row.phone),
                csv_value(row.email),
                format_export_bool(row.allow_email_marketing),
                format_export_bool(row.allow_post_marketing),
                csv_value(row.notes),
                format_export_date(row.last_participation),
                format_export_date(row.created_at),
            ]
        )

    return f"\ufeff{output.getvalue()}"


def clean_optional(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned if cleaned else None


def require_text(value: str, field_name: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise HTTPException(status_code=422, detail=f"{field_name} is required")
    return cleaned


def normalize_guest_code(value: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise HTTPException(status_code=422, detail="Guest code is required")

    if "://" in cleaned or cleaned.startswith("/"):
        parsed = urlparse(cleaned)
        query_code = parse_qs(parsed.query).get("code", [None])[0]
        if query_code:
            return query_code.strip().upper()
        path_code = parsed.path.rstrip("/").split("/")[-1]
        if path_code:
            return path_code.strip().upper()

    return cleaned.strip().upper()


def address_label(row: Any) -> str:
    return f"{row.street} {row.house_number}, {row.postal_code} {row.city}"


def map_guest_search_result(row: Any) -> GuestSearchResult:
    checked_in_at = format_time(row.checked_in_at)
    return GuestSearchResult(
        id=str(row.id),
        name=f"{row.first_name} {row.last_name}",
        code=row.guest_code,
        address=address_label(row),
        status="checked-in" if row.checkin_id else "expected",
        checkedInAt=checked_in_at,
    )


def generate_guest_code(db: Session) -> str:
    for _ in range(10):
        code = f"G-{secrets.randbelow(1_000_000):06d}"
        existing = db.execute(
            text("select 1 from guests where guest_code = :guest_code"),
            {"guest_code": code},
        ).first()
        if existing is None:
            return code

    raise HTTPException(status_code=500, detail="Guest code could not be generated")


def get_guest_for_checkin(db: Session, guest_code: str, event_day_id: int):
    return db.execute(
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


def latest_event(db: Session):
    row = db.execute(
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


def latest_event_day(db: Session, event_id: int | None = None):
    if event_id is None:
        event_id = latest_event(db).id

    row = db.execute(
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


@app.get("/")
async def root():
    return {"message": "Backend is running"}


@app.post("/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    normalized_email = payload.email.strip().lower()
    row = db.execute(
        text(
            """
            select id, first_name, last_name, email, password_hash
            from users
            where lower(email) = :email and is_active = true
            """
        ),
        {"email": normalized_email},
    ).first()

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


@app.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    event = latest_event(db)
    event_day = latest_event_day(db, event.id)

    total_guests = db.execute(
        text("select count(*) from guests where deleted_at is null")
    ).scalar_one()
    checked_in = db.execute(
        text("select count(*) from checkins where event_day_id = :event_day_id"),
        {"event_day_id": event_day.id},
    ).scalar_one()
    last_year_guests = db.execute(
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
    current_event_guests = db.execute(
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

    days = db.execute(
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

    event_days = []
    for day in days:
        event_days.append(
            {
                "id": str(day.id),
                "month": month_label(day.event_date),
                "day": day.event_date.strftime("%d"),
                "title": f"{event.name} - Tag {day.day_number}",
                "time": f"{format_time(day.checkin_open_at)} - {format_time(day.checkin_close_at)}",
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
            "message": f"{event.name}: {checked_in} Gäste für Tag {event_day.day_number} eingecheckt.",
        },
        "location": {
            "label": "Veranstaltungsort",
            "locationLabel": event.location or "Mehrzweckhalle Ennetbürgen",
            "coordinates": {"lat": 46.9842, "lng": 8.4109},
        },
    }


@app.get("/guests")
def get_guests(db: Session = Depends(get_db)):
    rows = db.execute(
        text(
            """
            select
              g.id,
              g.guest_code,
              g.first_name,
              g.last_name,
              g.email,
              g.allow_email_marketing,
              g.allow_post_marketing,
              a.city,
              max(c.checked_in_at) as last_participation
            from guests g
            join addresses a on a.id = g.address_id
            left join checkins c on c.guest_id = g.id
            where g.deleted_at is null
            group by g.id, a.city
            order by g.last_name, g.first_name
            """
        )
    ).all()

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
        for row in rows
    ]


@app.get("/guests/export")
def export_guests(db: Session = Depends(get_db)):
    rows = db.execute(
        text(
            """
            select
              g.guest_code,
              g.first_name,
              g.last_name,
              a.street,
              a.house_number,
              a.postal_code,
              a.city,
              g.phone,
              g.email,
              g.allow_email_marketing,
              g.allow_post_marketing,
              g.notes,
              max(c.checked_in_at) as last_participation,
              g.created_at
            from guests g
            join addresses a on a.id = g.address_id
            left join checkins c on c.guest_id = g.id
            where g.deleted_at is null
            group by g.id, a.street, a.house_number, a.postal_code, a.city
            order by g.last_name, g.first_name
            """
        )
    ).all()

    return Response(
        content=build_guest_export_csv(rows),
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": (f'attachment; filename="{GUEST_EXPORT_FILENAME}"')
        },
    )


@app.post("/guests", response_model=GuestRegistrationResponse)
def create_guest(
    payload: GuestRegistrationRequest,
    db: Session = Depends(get_db),
) -> GuestRegistrationResponse:
    first_name = require_text(payload.firstName, "firstName")
    last_name = require_text(payload.lastName, "lastName")
    street = require_text(payload.street, "street")
    house_number = require_text(payload.houseNumber, "houseNumber")
    postal_code = require_text(payload.postalCode, "postalCode")
    city = require_text(payload.city, "city")

    address = db.execute(
        text(
            """
            insert into addresses (street, house_number, postal_code, city)
            values (:street, :house_number, :postal_code, :city)
            on conflict (street, house_number, postal_code, city)
            do update set street = excluded.street
            returning id
            """
        ),
        {
            "street": street,
            "house_number": house_number,
            "postal_code": postal_code,
            "city": city,
        },
    ).first()

    if address is None:
        raise HTTPException(status_code=500, detail="Address could not be saved")

    guest_code = generate_guest_code(db)
    guest = db.execute(
        text(
            """
            insert into guests (
              guest_code,
              first_name,
              last_name,
              address_id,
              phone,
              email,
              allow_email_marketing,
              allow_post_marketing,
              notes
            )
            values (
              :guest_code,
              :first_name,
              :last_name,
              :address_id,
              :phone,
              :email,
              :allow_email_marketing,
              :allow_post_marketing,
              :notes
            )
            returning id, guest_code, first_name, last_name
            """
        ),
        {
            "guest_code": guest_code,
            "first_name": first_name,
            "last_name": last_name,
            "address_id": address.id,
            "phone": clean_optional(payload.phone),
            "email": clean_optional(payload.email),
            "allow_email_marketing": payload.allowEmailMarketing,
            "allow_post_marketing": payload.allowPostMarketing,
            "notes": clean_optional(payload.notes),
        },
    ).first()
    db.commit()

    if guest is None:
        raise HTTPException(status_code=500, detail="Guest could not be saved")

    return GuestRegistrationResponse(
        id=str(guest.id),
        guestCode=guest.guest_code,
        name=f"{guest.first_name} {guest.last_name}",
    )


@app.get("/guests/search", response_model=list[GuestSearchResult])
def search_guests(
    q: str = "", db: Session = Depends(get_db)
) -> list[GuestSearchResult]:
    query = q.strip()
    if len(query) < 2:
        return []

    day = latest_event_day(db)
    pattern = f"%{query}%"
    rows = db.execute(
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
            where g.deleted_at is null
              and (
                g.guest_code ilike :pattern
                or g.first_name ilike :pattern
                or g.last_name ilike :pattern
                or coalesce(g.email, '') ilike :pattern
                or a.city ilike :pattern
                or concat(g.first_name, ' ', g.last_name) ilike :pattern
              )
            order by c.checked_in_at desc nulls last, g.last_name, g.first_name
            limit 8
            """
        ),
        {"pattern": pattern, "event_day_id": day.id},
    ).all()

    return [map_guest_search_result(row) for row in rows]


@app.patch("/guests/{guest_id}/marketing")
def update_guest_marketing(guest_id: int, db: Session = Depends(get_db)):
    row = db.execute(
        text(
            """
            update guests
            set allow_email_marketing = not allow_email_marketing
            where id = :guest_id and deleted_at is null
            returning id, allow_email_marketing
            """
        ),
        {"guest_id": guest_id},
    ).first()
    db.commit()

    if row is None:
        raise HTTPException(status_code=404, detail="Guest not found")

    return {"id": str(row.id), "marketingActive": bool(row.allow_email_marketing)}


@app.get("/check-ins")
def get_check_ins(event_day_id: int | None = None, db: Session = Depends(get_db)):
    day = (
        latest_event_day(db)
        if event_day_id is None
        else db.execute(
            text(
                "select id, event_id, day_number, event_date from event_days where id = :id"
            ),
            {"id": event_day_id},
        ).first()
    )

    if day is None:
        raise HTTPException(status_code=404, detail="Event day not found")

    rows = db.execute(
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


@app.post("/check-ins/by-code", response_model=CheckInByCodeResponse)
def create_check_in_by_code(
    payload: CheckInByCodeRequest,
    db: Session = Depends(get_db),
) -> CheckInByCodeResponse:
    day = latest_event_day(db)
    guest_code = normalize_guest_code(payload.code)
    guest = get_guest_for_checkin(db, guest_code, day.id)

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

    checkin = db.execute(
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
    db.commit()

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


@app.post("/check-ins/{guest_id}")
def create_check_in(
    guest_id: int,
    event_day_id: int | None = None,
    db: Session = Depends(get_db),
):
    day = (
        latest_event_day(db)
        if event_day_id is None
        else db.execute(
            text("select id from event_days where id = :id"),
            {"id": event_day_id},
        ).first()
    )

    if day is None:
        raise HTTPException(status_code=404, detail="Event day not found")

    existing = db.execute(
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

    row = db.execute(
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
    db.commit()

    return {"id": str(row.id), "checkedInAt": format_time(row.checked_in_at)}


def prize_category(title: str, description: str | None) -> str:
    text_value = f"{title} {description or ''}".lower()
    if "hauptpreis" in text_value or "reise" in text_value or "e-bike" in text_value:
        return "Hauptpreis"
    if "sport" in text_value:
        return "Sport"
    if "gutschein" in text_value or "ticket" in text_value or "eintritt" in text_value:
        return "Gutschein"
    if "kaffee" in text_value or "brunch" in text_value or "korb" in text_value:
        return "Genuss"
    return "Sachpreis"


@app.get("/prizes")
def get_prizes(db: Session = Depends(get_db)):
    event = latest_event(db)
    rows = db.execute(
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
        category = prize_category(row.title, row.description)
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


@app.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    total_guests = db.execute(
        text("select count(*) from guests where deleted_at is null")
    ).scalar_one()
    total_checkins = db.execute(text("select count(*) from checkins")).scalar_one()
    total_event_days = db.execute(text("select count(*) from event_days")).scalar_one()
    completed_draws = db.execute(text("select count(*) from draws")).scalar_one()
    active_events = db.execute(text("select count(*) from lotto_events")).scalar_one()
    checkin_rate = (
        round((total_checkins / (total_guests * total_event_days)) * 100)
        if total_guests and total_event_days
        else 0
    )

    participant_rows = db.execute(
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

    method_rows = db.execute(
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

    checkins_by_day_rows = db.execute(
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

    top_event_rows = db.execute(
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

    granted = db.execute(
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
