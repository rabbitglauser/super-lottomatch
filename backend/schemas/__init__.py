from typing import Literal

from pydantic import BaseModel


class EventDayCreateRequest(BaseModel):
    date: str


class EventCreateRequest(BaseModel):
    name: str
    year: int
    location: str | None = None
    days: list[EventDayCreateRequest]


class EventCreateResponse(BaseModel):
    id: str
    name: str
    year: int
    dayCount: int


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


class PrizeConfigRequest(BaseModel):
    eventDayId: int
    title: str
    description: str | None = None
    valueChf: float = 0
    winnerCount: int = 1
    eligibility: Literal["all", "checked_in"] = "checked_in"


class PrizeConfigResponse(BaseModel):
    id: str
    eventDayId: int
    title: str
    description: str | None
    valueChf: str
    winnerCount: int
    eligibility: Literal["all", "checked_in"]


class PublicPrizeView(BaseModel):
    id: str
    name: str
    description: str
    category: str
    value: str
    winnerCount: int
    eligibilityLabel: str


class PublicRaffleResponse(BaseModel):
    eventName: str
    prizes: list[PublicPrizeView]
    totalWinners: int
