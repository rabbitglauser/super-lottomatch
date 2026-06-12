"""SQLAlchemy ORM Models for the Lottomatch application."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Numeric, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum
from zoneinfo import ZoneInfo

Base = declarative_base()
APP_TIMEZONE = ZoneInfo("Europe/Zurich")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    first_name = Column(String(255))
    last_name = Column(String(255))
    email = Column(String(255), unique=True, index=True)
    password_hash = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


class Guest(Base):
    __tablename__ = "guests"

    id = Column(Integer, primary_key=True)
    guest_code = Column(String(255), unique=True, index=True)
    first_name = Column(String(255))
    last_name = Column(String(255))
    email = Column(String(255), nullable=True)
    allow_email_marketing = Column(Boolean, default=False)
    allow_post_marketing = Column(Boolean, default=False)
    address_id = Column(Integer, ForeignKey("addresses.id"))
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    address = relationship("Address", back_populates="guests")
    checkins = relationship("CheckIn", back_populates="guest")


class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True)
    street = Column(String(255), nullable=True)
    city = Column(String(255))
    postal_code = Column(String(10), nullable=True)
    country = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    guests = relationship("Guest", back_populates="address")


class LottoEvent(Base):
    __tablename__ = "lotto_events"

    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    event_year = Column(Integer)
    location = Column(String(255), nullable=True)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.now)

    event_days = relationship("EventDay", back_populates="event")
    prizes = relationship("Prize", back_populates="event")


class EventDay(Base):
    __tablename__ = "event_days"

    id = Column(Integer, primary_key=True)
    event_id = Column(Integer, ForeignKey("lotto_events.id"))
    day_number = Column(Integer)
    event_date = Column(DateTime)
    checkin_open_at = Column(DateTime, nullable=True)
    checkin_close_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    event = relationship("LottoEvent", back_populates="event_days")
    checkins = relationship("CheckIn", back_populates="event_day")
    prizes = relationship("Prize", back_populates="event_day")


class CheckInMethod(str, enum.Enum):
    """Enumeration of check-in methods."""
    QR_CODE = "qr_code"
    MANUAL_FORM = "manual_form"
    GUEST_CODE = "guest_code"


class CheckIn(Base):
    __tablename__ = "checkins"

    id = Column(Integer, primary_key=True)
    event_day_id = Column(Integer, ForeignKey("event_days.id"))
    guest_id = Column(Integer, ForeignKey("guests.id"))
    method = Column(SQLEnum(CheckInMethod), default=CheckInMethod.MANUAL_FORM)
    is_new_guest = Column(Boolean, default=False)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    checked_in_at = Column(DateTime, default=datetime.now)
    created_at = Column(DateTime, default=datetime.now)

    event_day = relationship("EventDay", back_populates="checkins")
    guest = relationship("Guest", back_populates="checkins")


class Prize(Base):
    __tablename__ = "prizes"

    id = Column(Integer, primary_key=True)
    event_day_id = Column(Integer, ForeignKey("event_days.id"))
    event_id = Column(Integer, ForeignKey("lotto_events.id"), nullable=True)
    title = Column(String(255))
    description = Column(Text, nullable=True)
    value_chf = Column(Numeric(10, 2), nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    event_day = relationship("EventDay", back_populates="prizes")
    event = relationship("LottoEvent", back_populates="prizes")
    draws = relationship("Draw", back_populates="prize")


class Draw(Base):
    __tablename__ = "draws"

    id = Column(Integer, primary_key=True)
    prize_id = Column(Integer, ForeignKey("prizes.id"))
    guest_id = Column(Integer, ForeignKey("guests.id"), nullable=True)
    drawn_at = Column(DateTime, default=datetime.now)
    created_at = Column(DateTime, default=datetime.now)

    prize = relationship("Prize", back_populates="draws")
