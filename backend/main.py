from app import create_app
from app.utils import normalize_guest_code

app = create_app()

__all__ = ["app", "normalize_guest_code"]
