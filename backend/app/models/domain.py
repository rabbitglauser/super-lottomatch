from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class GuestRecord:
    id: int
    guest_code: str
    first_name: str
    last_name: str

    @classmethod
    def from_row(cls, row: Any) -> "GuestRecord":
        return cls(
            id=row.id,
            guest_code=row.guest_code,
            first_name=row.first_name,
            last_name=row.last_name,
        )

    @property
    def name(self) -> str:
        return f"{self.first_name} {self.last_name}"
