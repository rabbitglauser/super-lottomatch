from pydantic import BaseModel, ConfigDict

class CreateGuest(BaseModel):
    guest_code: str
    first_name: str
    last_name: str
    address_id: int
    phone: str | None = None
    email: str | None = None
    notes: str | None = None


class ReadGuest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    guest_code: str
    first_name: str
    last_name: str
    address_id: int
    phone: str | None
    email: str | None
    notes: str | None