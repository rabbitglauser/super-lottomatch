import secrets

from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.schemas import (
    GuestRegistrationRequest,
    GuestRegistrationResponse,
    GuestSearchResult,
)
from app.models import GuestRecord
from app.services.events import EventService
from app.utils import (
    avatar_tone,
    clean_optional,
    format_date,
    initials,
    map_guest_search_result,
    require_text,
)


class GuestService:
    def __init__(self, db: Session):
        self.db = db
        self.events = EventService(db)

    def list_guests(self) -> list[dict]:
        rows = self.db.execute(
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
                "id": str(guest.id),
                "name": guest.name,
                "email": row.email or "Keine E-Mail hinterlegt",
                "code": guest.guest_code,
                "city": row.city,
                "lastParticipation": format_date(row.last_participation),
                "marketingActive": bool(
                    row.allow_email_marketing or row.allow_post_marketing
                ),
                "initials": initials(guest.first_name, guest.last_name),
                "avatarTone": avatar_tone(guest.id),
            }
            for row in rows
            for guest in [GuestRecord.from_row(row)]
        ]

    def create_guest(
        self,
        payload: GuestRegistrationRequest,
    ) -> GuestRegistrationResponse:
        first_name = require_text(payload.firstName, "firstName")
        last_name = require_text(payload.lastName, "lastName")
        street = require_text(payload.street, "street")
        house_number = require_text(payload.houseNumber, "houseNumber")
        postal_code = require_text(payload.postalCode, "postalCode")
        city = require_text(payload.city, "city")

        address = self.db.execute(
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

        guest_code = self.generate_guest_code()
        guest = self.db.execute(
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
        self.db.commit()

        if guest is None:
            raise HTTPException(status_code=500, detail="Guest could not be saved")

        return GuestRegistrationResponse(
            id=str(guest.id),
            guestCode=guest.guest_code,
            name=f"{guest.first_name} {guest.last_name}",
        )

    def search_guests(self, query: str) -> list[GuestSearchResult]:
        query = query.strip()
        if len(query) < 2:
            return []

        day = self.events.latest_event_day()
        pattern = f"%{query}%"
        rows = self.db.execute(
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

    def update_marketing(self, guest_id: int) -> dict:
        row = self.db.execute(
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
        self.db.commit()

        if row is None:
            raise HTTPException(status_code=404, detail="Guest not found")

        return {"id": str(row.id), "marketingActive": bool(row.allow_email_marketing)}

    def generate_guest_code(self) -> str:
        for _ in range(10):
            code = f"G-{secrets.randbelow(1_000_000):06d}"
            existing = self.db.execute(
                text("select 1 from guests where guest_code = :guest_code"),
                {"guest_code": code},
            ).first()
            if existing is None:
                return code

        raise HTTPException(status_code=500, detail="Guest code could not be generated")
