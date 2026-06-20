from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from database import get_db
from schemas import PrizeConfigRequest, PrizeConfigResponse, PublicRaffleResponse
from services import PrizeService

router = APIRouter()


@router.get("/prizes")
def get_prizes(db: Session = Depends(get_db)):
    return PrizeService(db).get_prizes()


@router.get("/prizes/public", response_model=PublicRaffleResponse)
def get_public_raffle(db: Session = Depends(get_db)) -> PublicRaffleResponse:
    return PrizeService(db).get_public_raffle()


@router.post("/prizes", response_model=PrizeConfigResponse, status_code=201)
def create_prize(
    payload: PrizeConfigRequest,
    db: Session = Depends(get_db),
) -> PrizeConfigResponse:
    return PrizeService(db).create_prize(payload)


@router.put("/prizes/{prize_id}", response_model=PrizeConfigResponse)
def update_prize(
    prize_id: int,
    payload: PrizeConfigRequest,
    db: Session = Depends(get_db),
) -> PrizeConfigResponse:
    return PrizeService(db).update_prize(prize_id, payload)


@router.delete("/prizes/{prize_id}", status_code=204)
def delete_prize(prize_id: int, db: Session = Depends(get_db)) -> Response:
    PrizeService(db).delete_prize(prize_id)
    return Response(status_code=204)
