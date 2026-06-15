from sqlalchemy import text
from sqlalchemy.orm import Session


class AuthRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_active_user_by_email(self, email: str):
        return self.db.execute(
            text(
                """
                select id, first_name, last_name, email, password_hash
                from users
                where lower(email) = :email and is_active = true
                """
            ),
            {"email": email},
        ).first()


class EventRepository:
    def __init__(self, db: Session):
        self.db = db

    def latest_event(self):
        return self.db.execute(
            text(
                """
                select id, name, event_year, location, start_date, end_date
                from lotto_events
                order by event_year desc, start_date desc
                limit 1
                """
            )
        ).first()

    def latest_event_day(self, event_id: int):
        return self.db.execute(
            text(
                """
                select id, event_id, day_number, event_date, checkin_open_at,
                  checkin_close_at
                from event_days
                where event_id = :event_id
                order by day_number desc
                limit 1
                """
            ),
            {"event_id": event_id},
        ).first()

    def event_days_with_checkins(self, event_id: int):
        return self.db.execute(
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
            {"event_id": event_id},
        ).all()


class GuestRepository:
    def __init__(self, db: Session):
        self.db = db

    def guest_code_exists(self, guest_code: str) -> bool:
        row = self.db.execute(
            text("select 1 from guests where guest_code = :guest_code"),
            {"guest_code": guest_code},
        ).first()
        return row is not None

    def total_active_guests(self) -> int:
        return self.db.execute(
            text("select count(*) from guests where deleted_at is null")
        ).scalar_one()

    def list_guest_rows(self):
        return self.db.execute(
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

    def export_rows(self):
        return self.db.execute(
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

    def insert_address(
        self,
        street: str,
        house_number: str,
        postal_code: str,
        city: str,
    ):
        return self.db.execute(
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

    def insert_guest(self, payload: dict[str, object]):
        return self.db.execute(
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
            payload,
        ).first()

    def search_rows(self, pattern: str, event_day_id: int):
        return self.db.execute(
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
                order by c.checked_in_at desc nulls last, g.last_name,
                  g.first_name
                limit 8
                """
            ),
            {"pattern": pattern, "event_day_id": event_day_id},
        ).all()

    def update_marketing(self, guest_id: int):
        return self.db.execute(
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


class CheckInRepository:
    def __init__(self, db: Session):
        self.db = db

    def count_for_event_day(self, event_day_id: int) -> int:
        return self.db.execute(
            text("select count(*) from checkins where event_day_id = :event_day_id"),
            {"event_day_id": event_day_id},
        ).scalar_one()

    def last_year_guest_count(self, event_year: int) -> int:
        return self.db.execute(
            text(
                """
                select count(distinct c.guest_id)
                from checkins c
                join event_days ed on ed.id = c.event_day_id
                join lotto_events le on le.id = ed.event_id
                where le.event_year = :event_year
                """
            ),
            {"event_year": event_year},
        ).scalar_one()

    def current_event_guest_count(self, event_id: int) -> int:
        return self.db.execute(
            text(
                """
                select count(distinct c.guest_id)
                from checkins c
                join event_days ed on ed.id = c.event_day_id
                where ed.event_id = :event_id
                """
            ),
            {"event_id": event_id},
        ).scalar_one()

    def find_event_day(self, event_day_id: int):
        return self.db.execute(
            text("select id, event_id, day_number, event_date from event_days where id = :id"),
            {"id": event_day_id},
        ).first()

    def guest_rows_for_day(self, event_day_id: int):
        return self.db.execute(
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
                left join checkins c
                  on c.guest_id = g.id and c.event_day_id = :event_day_id
                where g.deleted_at is null
                order by c.checked_in_at desc nulls last, g.last_name,
                  g.first_name
                """
            ),
            {"event_day_id": event_day_id},
        ).all()

    def get_guest_for_checkin(self, guest_code: str, event_day_id: int):
        return self.db.execute(
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

    def find_existing_checkin(self, event_day_id: int, guest_id: int):
        return self.db.execute(
            text(
                """
                select id, checked_in_at
                from checkins
                where event_day_id = :event_day_id and guest_id = :guest_id
                """
            ),
            {"event_day_id": event_day_id, "guest_id": guest_id},
        ).first()

    def insert_code_checkin(self, event_day_id: int, guest_id: int, method: str):
        return self.db.execute(
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
            {"event_day_id": event_day_id, "guest_id": guest_id, "method": method},
        ).first()

    def insert_manual_checkin(self, event_day_id: int, guest_id: int):
        return self.db.execute(
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
            {"event_day_id": event_day_id, "guest_id": guest_id},
        ).first()


class PrizeRepository:
    def __init__(self, db: Session):
        self.db = db

    def prize_rows_for_event(self, event_id: int):
        return self.db.execute(
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
            {"event_id": event_id},
        ).all()


class AnalyticsRepository:
    def __init__(self, db: Session):
        self.db = db

    def scalar(self, sql: str) -> int:
        return self.db.execute(text(sql)).scalar_one()

    def participant_rows(self):
        return self.db.execute(
            text(
                """
                select to_char(date_trunc('month', created_at), 'Mon') as month,
                  count(*) as participants
                from guests
                where deleted_at is null
                group by date_trunc('month', created_at)
                order by min(created_at)
                """
            )
        ).all()

    def method_rows(self):
        return self.db.execute(
            text(
                """
                select method::text as method, count(*) as total
                from checkins
                group by method
                """
            )
        ).all()

    def checkins_by_day_rows(self):
        return self.db.execute(
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

    def top_event_rows(self):
        return self.db.execute(
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

    def marketing_granted_count(self) -> int:
        return self.db.execute(
            text(
                """
                select count(*)
                from guests
                where deleted_at is null
                  and (
                    allow_email_marketing = true
                    or allow_post_marketing = true
                  )
                """
            )
        ).scalar_one()
