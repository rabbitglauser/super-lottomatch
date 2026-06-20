from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas.ai import FairnessResponse
from services.fairness_service import FairnessService

router = APIRouter()


@router.get("/raffle/fairness", response_model=FairnessResponse)
def get_fairness(
    winnerCount: int = 1,
    runs: int = 1000,
    seed: int | None = None,
    db: Session = Depends(get_db),
):
    return FairnessService(db).analyze(winnerCount, runs=runs, seed=seed)
