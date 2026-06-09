from datetime import date, datetime
from typing import Any
from zoneinfo import ZoneInfo

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import get_db

app = FastAPI()
APP_TIMEZONE = ZoneInfo("Europe/Zurich")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
    ],
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


def month_label(value: date) -> str:
    labels = ["JAN", "FEB", "MAR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DEZ"]
    return labels[value.month - 1]


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
    row = db.execute(
        text(
            """
            select id, first_name, last_name, email, password_hash
            from users
            where email = :email and is_active = true
            """
        ),
        {"email": payload.email},
    ).first()

    if row is None or row.password_hash != payload.password:
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
        delta = round(((current_event_guests - last_year_guests) / last_year_guests) * 100)

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
            "marketingActive": bool(row.allow_email_marketing or row.allow_post_marketing),
            "initials": initials(row.first_name, row.last_name),
            "avatarTone": avatar_tone(row.id),
        }
        for row in rows
    ]


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
    day = latest_event_day(db) if event_day_id is None else db.execute(
        text("select id, event_id, day_number, event_date from event_days where id = :id"),
        {"id": event_day_id},
    ).first()

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


@app.post("/check-ins/{guest_id}")
def create_check_in(
    guest_id: int,
    event_day_id: int | None = None,
    db: Session = Depends(get_db),
):
    day = latest_event_day(db) if event_day_id is None else db.execute(
        text("select id from event_days where id = :id"),
        {"id": event_day_id},
    ).first()

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
        return {"id": str(existing.id), "checkedInAt": format_time(existing.checked_in_at)}

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
                "value": "CHF -",
                "status": "Reserviert" if row.draw_id else "Bereit",
            }
        )

    drawn = sum(1 for prize in prizes if prize["status"] == "Reserviert")
    main_prizes = sum(1 for prize in prizes if prize["category"] == "Hauptpreis")

    return {
        "kpis": [
            {"label": "Total Preise", "value": str(len(prizes)), "subtitle": "aus Datenbank", "subtitleTone": "accent"},
            {"label": "Gesamtwert", "value": "CHF -", "subtitle": "nicht erfasst", "subtitleTone": "muted"},
            {"label": "Hauptpreise", "value": str(main_prizes), "subtitle": "Top-Kategorie", "subtitleTone": "muted"},
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
    checkin_rate = round((total_checkins / (total_guests * total_event_days)) * 100) if total_guests and total_event_days else 0

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
    manual_total = sum(row.total for row in method_rows if row.method in {"manual_form", "guest_code"})
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
            {"key": "mobile", "label": "QR-Code", "value": round((qr_total / method_total) * 100)},
            {"key": "desktop", "label": "Manuell", "value": round((manual_total / method_total) * 100)},
            {"key": "tablet", "label": "Andere", "value": round((other_total / method_total) * 100)},
        ],
        "checkinsByDay": [
            {"label": row.label, "value": row.value}
            for row in checkins_by_day_rows
        ],
        "topEvents": [
            {
                "name": row.name,
                "date": format_date(row.start_date),
                "guests": row.guests,
                "checkIns": row.checkins,
                "conversion": round((row.checkins / row.guests) * 100, 1) if row.guests else 0,
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
                {"key": "granted", "label": "Eingewilligt", "percentage": granted_percentage, "count": granted},
                {"key": "pending", "label": "Ausstehend", "percentage": 0, "count": 0},
                {"key": "rejected", "label": "Abgelehnt", "percentage": rejected_percentage, "count": rejected},
            ],
        },
        "analyticsPeriods": [{"label": "Datenbank gesamt", "value": "all"}],
        "reportActions": [
            {"key": "csv", "label": "CSV herunterladen"},
            {"key": "pdf", "label": "PDF Report"},
            {"key": "share", "label": "Dashboard teilen"},
        ],
    }
