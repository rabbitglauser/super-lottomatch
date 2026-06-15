from urllib.parse import parse_qs, urlparse

from fastapi import HTTPException


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
