import os
from zoneinfo import ZoneInfo

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

# Allow private-network origins (any port) so LAN devices such as a phone on the
# same WiFi can reach the dev backend during local testing.
LAN_ORIGIN_REGEX = (
    r"http://(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+"
    r"|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?"
)


def get_cors_origins() -> list[str]:
    configured_origins = os.environ.get("CORS_ORIGINS", "")
    extra_origins = [
        origin.strip().rstrip("/")
        for origin in configured_origins.split(",")
        if origin.strip()
    ]
    return [*DEFAULT_CORS_ORIGINS, *extra_origins]
