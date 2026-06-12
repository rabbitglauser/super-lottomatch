"""Business logic and database service layer."""
from decimal import Decimal
from typing import Optional
from sqlalchemy import and_, func, text
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from models import (
    Guest, CheckIn, EventDay, LottoEvent, Prize, Draw,
    CheckInMethod, Address
)


class EventService:
    """Service for event-related operations."""

    @staticmethod
    def get_latest_event(db: Session) -> LottoEvent:
        """Get the most recent lotto event."""
        event = db.query(LottoEvent).order_by(
            LottoEvent.event_year.desc(),
            LottoEvent.start_date.desc()
        ).first()

        if event is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No Lottomatch event found"
            )
        return event

    @staticmethod
    def get_latest_event_day(db: Session, event_id: Optional[int] = None) -> EventDay:
        """Get the most recent event day, optionally for a specific event."""
        if event_id is None:
            event_id = EventService.get_latest_event(db).id

        day = db.query(EventDay).filter(
            EventDay.event_id == event_id
        ).order_by(
            EventDay.day_number.desc()
        ).first()

        if day is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No event day found"
            )
        return day

    @staticmethod
    def get_event_day_by_id(db: Session, event_day_id: int) -> EventDay:
        """Get an event day by ID."""
        day = db.query(EventDay).filter(
            EventDay.id == event_day_id
        ).first()

        if day is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event day not found"
            )
        return day


class GuestService:
    """Service for guest-related operations."""

    @staticmethod
    def get_total_active_guests(db: Session) -> int:
        """Get count of non-deleted guests."""
        return db.query(Guest).filter(Guest.deleted_at.is_(None)).count()

    @staticmethod
    def get_all_active_guests(db: Session) -> list[Guest]:
        """Get all non-deleted guests with their latest participation."""
        return db.query(Guest).filter(
            Guest.deleted_at.is_(None)
        ).order_by(
            Guest.last_name,
            Guest.first_name
        ).all()

    @staticmethod
    def get_guest_with_details(db: Session, guest_id: int) -> Guest:
        """Get a specific guest with all details."""
        guest = db.query(Guest).filter(
            and_(Guest.id == guest_id, Guest.deleted_at.is_(None))
        ).first()

        if guest is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Guest not found"
            )
        return guest

    @staticmethod
    def toggle_email_marketing(db: Session, guest_id: int) -> Guest:
        """Toggle email marketing preference for a guest."""
        guest = GuestService.get_guest_with_details(db, guest_id)
        guest.allow_email_marketing = not guest.allow_email_marketing
        db.commit()
        db.refresh(guest)
        return guest

    @staticmethod
    def get_marketing_consent_stats(db: Session) -> tuple[int, int]:
        """Get marketing consent statistics. Returns (granted_count, total_count)."""
        total = db.query(Guest).filter(Guest.deleted_at.is_(None)).count()
        granted = db.query(Guest).filter(
            and_(
                Guest.deleted_at.is_(None),
                (Guest.allow_email_marketing | Guest.allow_post_marketing)
            )
        ).count()
        return granted, total


class CheckInService:
    """Service for check-in related operations."""

    @staticmethod
    def get_total_checkins(db: Session) -> int:
        """Get total count of all check-ins."""
        return db.query(CheckIn).count()

    @staticmethod
    def get_checkins_for_event_day(db: Session, event_day_id: int) -> int:
        """Get count of check-ins for a specific event day."""
        return db.query(CheckIn).filter(
            CheckIn.event_day_id == event_day_id
        ).count()

    @staticmethod
    def get_distinct_guests_for_event(db: Session, event_id: int) -> int:
        """Get count of distinct guests who checked in for an event."""
        return db.query(CheckIn.guest_id).join(
            EventDay
        ).filter(
            EventDay.event_id == event_id
        ).distinct().count()

    @staticmethod
    def get_checkins_for_year(db: Session, event_year: int) -> int:
        """Get count of distinct guests checked in for a specific year."""
        return db.query(CheckIn.guest_id).join(
            EventDay
        ).join(
            LottoEvent
        ).filter(
            LottoEvent.event_year == event_year
        ).distinct().count()

    @staticmethod
    def get_checkins_by_method(db: Session) -> dict[str, int]:
        """Get breakdown of check-ins by method."""
        results = db.query(
            CheckIn.method,
            func.count(CheckIn.id).label('total')
        ).group_by(CheckIn.method).all()

        return {str(row.method): row.total for row in results}

    @staticmethod
    def get_checkins_by_day(db: Session) -> list[tuple[str, int]]:
        """Get check-in counts grouped by event day."""
        results = db.query(
            EventDay.day_number,
            func.count(CheckIn.id).label('count')
        ).outerjoin(
            CheckIn
        ).group_by(
            EventDay.id
        ).order_by(
            EventDay.event_date
        ).all()

        return [(f"Tag {row.day_number}", row.count) for row in results]

    @staticmethod
    def get_existing_checkin(db: Session, event_day_id: int, guest_id: int) -> Optional[CheckIn]:
        """Check if a guest has already checked in for an event day."""
        return db.query(CheckIn).filter(
            and_(
                CheckIn.event_day_id == event_day_id,
                CheckIn.guest_id == guest_id
            )
        ).first()

    @staticmethod
    def create_checkin(db: Session, event_day_id: int, guest_id: int) -> CheckIn:
        """Create a new check-in record."""
        checkin = CheckIn(
            event_day_id=event_day_id,
            guest_id=guest_id,
            method=CheckInMethod.MANUAL_FORM,
            is_new_guest=False,
            created_by_user_id=1
        )
        db.add(checkin)
        db.commit()
        db.refresh(checkin)
        return checkin

    @staticmethod
    def get_checkins_for_event_day_detailed(
        db: Session,
        event_day_id: int
    ) -> list:
        """Get all guests for an event day with their check-in status."""
        return db.query(
            Guest.id,
            Guest.first_name,
            Guest.last_name,
            Guest.email,
            Guest.guest_code,
            Address.city,
            CheckIn.id.label('checkin_id'),
            CheckIn.checked_in_at
        ).join(
            Address
        ).outerjoin(
            CheckIn,
            and_(
                CheckIn.guest_id == Guest.id,
                CheckIn.event_day_id == event_day_id
            )
        ).filter(
            Guest.deleted_at.is_(None)
        ).order_by(
            CheckIn.checked_in_at.desc().nullslast(),
            Guest.last_name,
            Guest.first_name
        ).all()


class PrizeService:
    """Service for prize-related operations."""

    @staticmethod
    def get_prizes_for_event(db: Session, event_id: int) -> list:
        """Get all prizes for an event with draw information."""
        return db.query(
            Prize.id,
            Prize.title,
            Prize.description,
            Prize.value_chf,
            Prize.event_day_id,
            Draw.id.label('draw_id')
        ).join(
            EventDay
        ).outerjoin(
            Draw
        ).filter(
            EventDay.event_id == event_id
        ).order_by(
            EventDay.day_number,
            Prize.id
        ).all()

    @staticmethod
    def get_total_prize_value(db: Session, event_id: int) -> Decimal:
        """Get total value of all prizes for an event."""
        result = db.query(
            func.sum(Prize.value_chf)
        ).join(
            EventDay
        ).filter(
            EventDay.event_id == event_id
        ).scalar()
        return Decimal(str(result or 0))

    @staticmethod
    def get_drawn_prizes_count(db: Session, event_id: int) -> int:
        """Get count of drawn prizes for an event."""
        return db.query(Draw).join(
            Prize
        ).join(
            EventDay
        ).filter(
            EventDay.event_id == event_id
        ).count()

    @staticmethod
    def get_event_statistics(db: Session) -> list:
        """Get statistics for all events."""
        return db.query(
            LottoEvent.name,
            LottoEvent.start_date,
            func.count(func.distinct(CheckIn.guest_id)).label('guests'),
            func.count(CheckIn.id).label('checkins')
        ).join(
            EventDay
        ).outerjoin(
            CheckIn
        ).group_by(
            LottoEvent.id
        ).order_by(
            LottoEvent.event_year.desc()
        ).all()


class AnalyticsService:
    """Service for analytics and reporting."""

    @staticmethod
    def get_participant_trend(db: Session) -> list[tuple[str, int]]:
        """Get participant count trend by month."""
        results = db.execute(text("""
            select to_char(date_trunc('month', created_at), 'Mon') as month, count(*) as participants
            from guests
            where deleted_at is null
            group by date_trunc('month', created_at)
            order by min(created_at)
        """)).all()
        return [(row.month.strip(), row.participants) for row in results]

    @staticmethod
    def calculate_checkin_rate(
        total_checkins: int,
        total_guests: int,
        total_event_days: int
    ) -> int:
        """Calculate check-in rate percentage."""
        if total_guests and total_event_days:
            return round((total_checkins / (total_guests * total_event_days)) * 100)
        return 0
