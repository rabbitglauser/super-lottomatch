"""Main FastAPI application for Lottomatch."""
import os
from datetime import datetime
from decimal import Decimal
from typing import Any
from zoneinfo import ZoneInfo

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import get_db
from models import Guest, CheckIn, EventDay, LottoEvent, Prize
from schemas import (
    LoginRequest,
    LoginResponse,
    GuestListResponse,
    CheckInsResponse,
    CheckInSummaryResponse,
    CheckInGuestResponse,
    CheckInCreateResponse,
    CheckInStatus,
    EventDayResponse,
    StatResponse,
    LiveUpdateResponse,
    LocationResponse,
    DashboardResponse,
    PrizesResponse,
    PrizeResponse,
    KPIResponse,
    PrizeOverviewResponse,
    AnalyticsResponse,
    AnalyticsSummaryResponse,
    ParticipantTrendResponse,
    DeviceDistributionResponse,
    CheckinsByDayResponse,
    TopEventResponse,
    LiveOverviewItemResponse,
    MarketingConsentResponse,
    MarketingConsentItemResponse,
    AnalyticsPeriodResponse,
    ReportActionResponse,
)
from services import (
    EventService,
    GuestService,
    CheckInService,
    PrizeService,
    AnalyticsService,
)
from utils import (
    initials,
    avatar_tone,
    format_date,
    format_time,
    format_chf,
    month_label,
    prize_category,
    verify_password,
)

app = FastAPI()
APP_TIMEZONE = ZoneInfo("Europe/Zurich")

DEFAULT_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://superlottomatch.vercel.app",
]


def get_cors_origins() -> list[str]:
    """Get CORS origins from environment or use defaults."""
    configured_origins = os.environ.get("CORS_ORIGINS", "")
    extra_origins = [
        origin.strip().rstrip("/")
        for origin in configured_origins.split(",")
        if origin.strip()
    ]
    return [*DEFAULT_CORS_ORIGINS, *extra_origins]


app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "Backend is running"}


@app.post("/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    """Authenticate user with email and password."""
    normalized_email = payload.email.strip().lower()
    user = db.query(Guest).filter(
        Guest.email.ilike(normalized_email)
    ).first()

    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ungültige Zugangsdaten",
        )

    return LoginResponse(
        id=user.id,
        name=f"{user.first_name} {user.last_name}",
        email=user.email,
    )


@app.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    """Get dashboard with event overview and statistics."""
    event = EventService.get_latest_event(db)
    event_day = EventService.get_latest_event_day(db, event.id)

    total_guests = GuestService.get_total_active_guests(db)
    checked_in = CheckInService.get_checkins_for_event_day(db, event_day.id)
    last_year_guests = CheckInService.get_checkins_for_year(db, event.event_year - 1)
    current_event_guests = CheckInService.get_distinct_guests_for_event(db, event.id)

    delta = 0
    if last_year_guests:
        delta = round(
            ((current_event_guests - last_year_guests) / last_year_guests) * 100
        )

    # Get event days for the current event
    event_days_query = db.query(
        EventDay.id,
        EventDay.day_number,
        EventDay.event_date,
        EventDay.checkin_open_at,
        EventDay.checkin_close_at,
    ).filter(
        EventDay.event_id == event.id
    ).order_by(
        EventDay.day_number
    ).all()

    event_days_list = []
    for day in event_days_query:
        checkins_count = CheckInService.get_checkins_for_event_day(db, day.id)
        event_days_list.append(
            EventDayResponse(
                id=str(day.id),
                month=month_label(day.event_date),
                day=day.event_date.strftime("%d"),
                title=f"{event.name} - Tag {day.day_number}",
                time=f"{format_time(day.checkin_open_at)} - {format_time(day.checkin_close_at)}",
                guests=checkins_count,
                active=day.id == event_day.id,
            )
        )

    progress = round((checked_in / total_guests) * 100) if total_guests else 0

    stats = [
        StatResponse(
            variant="delta",
            label="Total Gäste",
            value=str(total_guests),
            delta=f"{delta:+d}%",
        ),
        StatResponse(
            variant="progress",
            label="Heutige Check-ins",
            value=str(checked_in),
            progress=progress,
        ),
        StatResponse(
            variant="status",
            label="Aktueller Status",
            value=event.name,
            subtitle=event.location or "Veranstaltungsort offen",
        ),
    ]

    return DashboardResponse(
        stats=stats,
        eventDays=event_days_list,
        liveUpdate=LiveUpdateResponse(
            label="Live Update",
            message=f"{event.name}: {checked_in} Gäste für Tag {event_day.day_number} eingecheckt.",
        ),
        location=LocationResponse(
            label="Veranstaltungsort",
            locationLabel=event.location or "Mehrzweckhalle Ennetbürgen",
            coordinates={"lat": 46.9842, "lng": 8.4109},
        ),
    )


@app.get("/guests", response_model=list[GuestListResponse])
def get_guests(db: Session = Depends(get_db)):
    """Get list of all active guests with participation history."""
    guests = GuestService.get_all_active_guests(db)

    guest_responses = []
    for guest in guests:
        # Get latest participation date
        latest_checkin = db.query(
            CheckIn.checked_in_at
        ).filter(
            CheckIn.guest_id == guest.id
        ).order_by(
            CheckIn.checked_in_at.desc()
        ).first()

        last_participation = latest_checkin.checked_in_at if latest_checkin else None

        guest_responses.append(
            GuestListResponse(
                id=str(guest.id),
                name=f"{guest.first_name} {guest.last_name}",
                email=guest.email or "Keine E-Mail hinterlegt",
                code=guest.guest_code,
                city=guest.address.city if guest.address else "Unbekannt",
                lastParticipation=format_date(last_participation),
                marketingActive=bool(
                    guest.allow_email_marketing or guest.allow_post_marketing
                ),
                initials=initials(guest.first_name, guest.last_name),
                avatarTone=avatar_tone(guest.id),
            )
        )

    return guest_responses


@app.patch("/guests/{guest_id}/marketing")
def update_guest_marketing(guest_id: int, db: Session = Depends(get_db)):
    """Toggle email marketing preference for a guest."""
    guest = GuestService.toggle_email_marketing(db, guest_id)
    return {"id": str(guest.id), "marketingActive": bool(guest.allow_email_marketing)}


@app.get("/check-ins", response_model=CheckInsResponse)
def get_check_ins(
    event_day_id: int | None = None,
    db: Session = Depends(get_db),
):
    """Get check-in status for all guests on a specific event day."""
    if event_day_id is None:
        day = EventService.get_latest_event_day(db)
    else:
        day = EventService.get_event_day_by_id(db, event_day_id)

    rows = CheckInService.get_checkins_for_event_day_detailed(db, day.id)

    guests = []
    checked_in_count = 0

    for row in rows:
        status_value = CheckInStatus.CHECKED_IN if row.checkin_id else CheckInStatus.EXPECTED
        if row.checkin_id:
            checked_in_count += 1

        guests.append(
            CheckInGuestResponse(
                id=str(row.id),
                name=f"{row.first_name} {row.last_name}",
                email=row.email or "Keine E-Mail hinterlegt",
                initials=initials(row.first_name, row.last_name),
                ticket=row.guest_code,
                group=row.city,
                code=row.guest_code,
                city=row.city,
                status=status_value,
                checkedInAt=format_time(row.checked_in_at),
                time=format_time(row.checked_in_at),
                avatarTone=avatar_tone(row.id),
            )
        )

    expected = len(guests) - checked_in_count

    return CheckInsResponse(
        eventDayId=str(day.id),
        summary=CheckInSummaryResponse(
            total=len(guests),
            checkedIn=checked_in_count,
            expected=expected,
            noShow=0,
        ),
        guests=guests,
    )


@app.post("/check-ins/{guest_id}", response_model=CheckInCreateResponse)
def create_check_in(
    guest_id: int,
    event_day_id: int | None = None,
    db: Session = Depends(get_db),
):
    """Create a check-in record for a guest."""
    if event_day_id is None:
        day = EventService.get_latest_event_day(db)
    else:
        day = EventService.get_event_day_by_id(db, event_day_id)

    # Check if already checked in
    existing = CheckInService.get_existing_checkin(db, day.id, guest_id)
    if existing is not None:
        return CheckInCreateResponse(
            id=str(existing.id),
            checkedInAt=format_time(existing.checked_in_at),
        )

    # Create new check-in
    checkin = CheckInService.create_checkin(db, day.id, guest_id)

    return CheckInCreateResponse(
        id=str(checkin.id),
        checkedInAt=format_time(checkin.checked_in_at),
    )


@app.get("/prizes", response_model=PrizesResponse)
def get_prizes(db: Session = Depends(get_db)):
    """Get prizes for the current event with statistics."""
    event = EventService.get_latest_event(db)
    prize_rows = PrizeService.get_prizes_for_event(db, event.id)

    prizes = []
    for row in prize_rows:
        category = prize_category(row.title, row.description)
        prizes.append(
            PrizeResponse(
                id=str(row.id),
                name=row.title,
                description=row.description or "Keine Beschreibung hinterlegt.",
                category=category,
                sponsor="STV Ennetbürgen",
                value=format_chf(row.value_chf),
                status="Reserviert" if row.draw_id else "Bereit",
            )
        )

    drawn = sum(1 for prize in prizes if prize.status == "Reserviert")
    main_prizes = sum(1 for prize in prizes if prize.category == "Hauptpreis")
    total_value = PrizeService.get_total_prize_value(db, event.id)

    kpis = [
        KPIResponse(
            label="Total Preise",
            value=str(len(prizes)),
            subtitle="aus Datenbank",
            subtitleTone="accent",
        ),
        KPIResponse(
            label="Gesamtwert",
            value=format_chf(total_value),
            subtitle="erfasst",
            subtitleTone="accent",
        ),
        KPIResponse(
            label="Hauptpreise",
            value=str(main_prizes),
            subtitle="Top-Kategorie",
            subtitleTone="muted",
        ),
        KPIResponse(
            label="Ausgelost",
            value=str(drawn),
            subtitle=f"{round((drawn / len(prizes)) * 100) if prizes else 0}%",
            subtitleTone="accent",
            progress=round((drawn / len(prizes)) * 100) if prizes else 0,
        ),
    ]

    return PrizesResponse(
        kpis=kpis,
        overview=PrizeOverviewResponse(
            currentEvent=event.name,
            nextDraw="Nächste Verlosung",
            date=format_date(event.end_date),
            time="17:00",
            drawn=drawn,
            total=len(prizes),
        ),
        nextHighlight=prizes[0] if prizes else None,
        prizes=prizes,
    )


@app.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    """Get comprehensive analytics and reporting data."""
    # Get counts
    total_guests = GuestService.get_total_active_guests(db)
    total_checkins = CheckInService.get_total_checkins(db)
    total_event_days = db.query(EventDay).count()
    completed_draws = db.query(Prize).count()  # Simplified; adjust as needed
    active_events = db.query(LottoEvent).count()

    checkin_rate = AnalyticsService.calculate_checkin_rate(
        total_checkins, total_guests, total_event_days
    )

    # Get trends and breakdowns
    participants = [
        ParticipantTrendResponse(month=month, participants=count)
        for month, count in AnalyticsService.get_participant_trend(db)
    ]

    checkins_by_method = CheckInService.get_checkins_by_method(db)
    method_total = sum(checkins_by_method.values()) or 1
    qr_total = checkins_by_method.get("qr_code", 0)
    manual_total = checkins_by_method.get("manual_form", 0) + checkins_by_method.get(
        "guest_code", 0
    )
    other_total = method_total - qr_total - manual_total

    device_distribution = [
        DeviceDistributionResponse(
            key="mobile",
            label="QR-Code",
            value=round((qr_total / method_total) * 100),
        ),
        DeviceDistributionResponse(
            key="desktop",
            label="Manuell",
            value=round((manual_total / method_total) * 100),
        ),
        DeviceDistributionResponse(
            key="tablet",
            label="Andere",
            value=round((other_total / method_total) * 100),
        ),
    ]

    checkins_by_day = [
        CheckinsByDayResponse(label=label, value=value)
        for label, value in CheckInService.get_checkins_by_day(db)
    ]

    top_event_rows = PrizeService.get_event_statistics(db)
    top_events = [
        TopEventResponse(
            name=row.name,
            date=format_date(row.start_date),
            guests=row.guests or 0,
            checkIns=row.checkins or 0,
            conversion=round((row.checkins / row.guests) * 100, 1)
            if row.guests
            else 0,
            status="Abgeschlossen",
        )
        for row in top_event_rows
    ]

    granted, total = GuestService.get_marketing_consent_stats(db)
    granted_percentage = round((granted / total_guests) * 100) if total_guests else 0
    rejected = total_guests - granted
    rejected_percentage = 100 - granted_percentage if total_guests else 0

    return AnalyticsResponse(
        summary=AnalyticsSummaryResponse(
            totalGuests=total_guests,
            checkInRate=checkin_rate,
            activeEvents=active_events,
            completedDrawings=completed_draws,
        ),
        participantTrend=participants,
        deviceDistribution=device_distribution,
        checkinsByDay=checkins_by_day,
        topEvents=top_events,
        liveOverview=[
            LiveOverviewItemResponse(
                key="visitors", label="Gäste gesamt", value=total_guests
            ),
            LiveOverviewItemResponse(
                key="devices", label="Event-Tage", value=total_event_days
            ),
            LiveOverviewItemResponse(
                key="scans", label="Check-ins", value=total_checkins
            ),
        ],
        marketingConsent=MarketingConsentResponse(
            totalGuests=total_guests,
            grantedPercentage=granted_percentage,
            grantedCount=granted,
            breakdown=[
                MarketingConsentItemResponse(
                    key="granted",
                    label="Eingewilligt",
                    percentage=granted_percentage,
                    count=granted,
                ),
                MarketingConsentItemResponse(
                    key="pending", label="Ausstehend", percentage=0, count=0
                ),
                MarketingConsentItemResponse(
                    key="rejected",
                    label="Abgelehnt",
                    percentage=rejected_percentage,
                    count=rejected,
                ),
            ],
        ),
        analyticsPeriods=[AnalyticsPeriodResponse(label="Datenbank gesamt", value="all")],
        reportActions=[
            ReportActionResponse(key="csv", label="CSV herunterladen"),
            ReportActionResponse(key="pdf", label="PDF Report"),
            ReportActionResponse(key="share", label="Dashboard teilen"),
        ],
    )
