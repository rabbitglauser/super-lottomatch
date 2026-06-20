"""Raffle fairness analysis service.

Builds the participant pool from checked-in guests of the latest event (grouped
by city as a stand-in ticket tier) and runs the Monte-Carlo simulation in
``core.fairness``. Recommendations are deterministic by default and optionally
augmented by the AI model when enabled.
"""

from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from core import ai_config
from core.fairness import fairness_report
from schemas.ai import FairnessGroup, FairnessResponse
from services.ai_client import AIClientError, generate_text


class FairnessService:
    def __init__(self, db: Session):
        self.db = db

    def _latest_event_id(self) -> int:
        row = self.db.execute(
            text(
                """
                select id from lotto_events
                order by event_year desc, start_date desc
                limit 1
                """
            )
        ).first()
        if row is None:
            raise HTTPException(status_code=404, detail="No Lottomatch event found")
        return row.id

    def _participants(self, event_id: int) -> list[dict[str, object]]:
        rows = self.db.execute(
            text(
                """
                select distinct g.id, a.city
                from checkins c
                join event_days ed on ed.id = c.event_day_id
                join guests g on g.id = c.guest_id
                join addresses a on a.id = g.address_id
                where ed.event_id = :event_id and g.deleted_at is null
                """
            ),
            {"event_id": event_id},
        ).all()
        return [
            {"id": row.id, "group": row.city or "Unbekannt", "weight": 1}
            for row in rows
        ]

    def analyze(
        self, winner_count: int, runs: int = 1000, seed: int | None = None
    ) -> FairnessResponse:
        if winner_count < 1:
            raise HTTPException(status_code=422, detail="winnerCount must be >= 1")

        event_id = self._latest_event_id()
        participants = self._participants(event_id)
        report = fairness_report(
            participants, winner_count=winner_count, runs=runs, seed=seed
        )

        recommendations = self._recommendations(report)

        return FairnessResponse(
            fairnessScore=report["fairnessScore"],
            runs=report["runs"],
            winnerCount=report["winnerCount"],
            participantCount=report["participantCount"],
            groups=[FairnessGroup(**group) for group in report["groups"]],
            edgeCases=report["edgeCases"],
            recommendations=recommendations,
        )

    @staticmethod
    def _deterministic_recommendations(report: dict[str, object]) -> list[str]:
        if report["fairnessScore"] >= 95:
            return ["Die Verlosung ist ausgewogen. Keine Anpassung nötig."]
        tips: list[str] = []
        for group in report["groups"]:
            if group["flagged"] and group["deviation"] < 0:
                tips.append(
                    f"Gruppe '{group['group']}' ist benachteiligt – mehr Preise "
                    "oder Lose für diese Gruppe erwägen."
                )
            elif group["flagged"] and group["deviation"] > 0:
                tips.append(
                    f"Gruppe '{group['group']}' ist bevorteilt – Gewichtung prüfen."
                )
        return tips or ["Kleinere Abweichungen erkannt, aber im normalen Bereich."]

    def _recommendations(self, report: dict[str, object]) -> list[str]:
        deterministic = self._deterministic_recommendations(report)
        if not ai_config.enrichment_enabled() or not report["edgeCases"]:
            return deterministic

        try:
            text_response = generate_text(
                system=(
                    "You are a raffle fairness advisor. Given fairness findings, "
                    "give up to 3 short, actionable German tips."
                ),
                prompt=(
                    f"Fairness score: {report['fairnessScore']}\n"
                    f"Edge cases: {report['edgeCases']}"
                ),
                max_tokens=512,
            )
        except AIClientError:
            return deterministic

        ai_tips = [line.strip("-• ").strip() for line in text_response.splitlines()]
        return [tip for tip in ai_tips if tip] or deterministic
