"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from enum import Enum


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    id: int
    name: str
    email: str


class GuestListResponse(BaseModel):
    id: str
    name: str
    email: str
    code: str
    city: str
    lastParticipation: str
    marketingActive: bool
    initials: str
    avatarTone: str


class CheckInStatus(str, Enum):
    """Status of a guest's check-in."""
    CHECKED_IN = "checked-in"
    EXPECTED = "expected"


class CheckInGuestResponse(BaseModel):
    id: str
    name: str
    email: str
    initials: str
    ticket: str
    group: str
    code: str
    city: str
    status: CheckInStatus
    checkedInAt: Optional[str]
    time: Optional[str]
    avatarTone: str


class CheckInSummaryResponse(BaseModel):
    total: int
    checkedIn: int
    expected: int
    noShow: int


class CheckInsResponse(BaseModel):
    eventDayId: str
    summary: CheckInSummaryResponse
    guests: list[CheckInGuestResponse]


class CheckInCreateResponse(BaseModel):
    id: str
    checkedInAt: Optional[str]


class EventDayResponse(BaseModel):
    id: str
    month: str
    day: str
    title: str
    time: str
    guests: int
    active: bool


class StatResponse(BaseModel):
    variant: str
    label: str
    value: str
    delta: Optional[str] = None
    progress: Optional[int] = None
    subtitle: Optional[str] = None


class LiveUpdateResponse(BaseModel):
    label: str
    message: str


class LocationResponse(BaseModel):
    label: str
    locationLabel: str
    coordinates: dict


class DashboardResponse(BaseModel):
    stats: list[StatResponse]
    eventDays: list[EventDayResponse]
    liveUpdate: LiveUpdateResponse
    location: LocationResponse


class PrizeResponse(BaseModel):
    id: str
    name: str
    description: str
    category: str
    sponsor: str
    value: str
    status: str


class KPIResponse(BaseModel):
    label: str
    value: str
    subtitle: str
    subtitleTone: str
    progress: Optional[int] = None


class PrizeOverviewResponse(BaseModel):
    currentEvent: str
    nextDraw: str
    date: str
    time: str
    drawn: int
    total: int


class PrizesResponse(BaseModel):
    kpis: list[KPIResponse]
    overview: PrizeOverviewResponse
    nextHighlight: Optional[PrizeResponse]
    prizes: list[PrizeResponse]


class ParticipantTrendResponse(BaseModel):
    month: str
    participants: int


class DeviceDistributionResponse(BaseModel):
    key: str
    label: str
    value: int


class CheckinsByDayResponse(BaseModel):
    label: str
    value: int


class TopEventResponse(BaseModel):
    name: str
    date: str
    guests: int
    checkIns: int
    conversion: float
    status: str


class LiveOverviewItemResponse(BaseModel):
    key: str
    label: str
    value: int


class MarketingConsentItemResponse(BaseModel):
    key: str
    label: str
    percentage: int
    count: int


class MarketingConsentResponse(BaseModel):
    totalGuests: int
    grantedPercentage: int
    grantedCount: int
    breakdown: list[MarketingConsentItemResponse]


class AnalyticsPeriodResponse(BaseModel):
    label: str
    value: str


class ReportActionResponse(BaseModel):
    key: str
    label: str


class AnalyticsSummaryResponse(BaseModel):
    totalGuests: int
    checkInRate: int
    activeEvents: int
    completedDrawings: int


class AnalyticsResponse(BaseModel):
    summary: AnalyticsSummaryResponse
    participantTrend: list[ParticipantTrendResponse]
    deviceDistribution: list[DeviceDistributionResponse]
    checkinsByDay: list[CheckinsByDayResponse]
    topEvents: list[TopEventResponse]
    liveOverview: list[LiveOverviewItemResponse]
    marketingConsent: MarketingConsentResponse
    analyticsPeriods: list[AnalyticsPeriodResponse]
    reportActions: list[ReportActionResponse]
