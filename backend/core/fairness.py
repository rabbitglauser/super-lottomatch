"""Monte-Carlo fairness analysis for raffle draws.

Given the participant pool and the number of winners, this runs many simulated
draws and measures whether any group (e.g. ticket tier) wins more or less often
than its ticket share predicts. Pure standard-library code so it is fully
deterministic under a fixed seed and unit-testable without a database or AI.
"""

import random

DEFAULT_RUNS = 1000
MIN_RUNS = 1000
# A group is flagged when its observed win share deviates from its expected
# share by more than this fraction (after accounting for sampling noise).
FLAG_TOLERANCE = 0.05


def _field(record: object, name: str, default: object = None) -> object:
    if isinstance(record, dict):
        return record.get(name, default)
    return getattr(record, name, default)


def _weight(participant: object) -> float:
    weight = _field(participant, "weight", 1) or 1
    return max(float(weight), 0.0)


def _group(participant: object) -> str:
    return str(_field(participant, "group", "Alle") or "Alle")


def _weighted_sample_without_replacement(
    participants: list[object], count: int, rng: random.Random
) -> list[object]:
    pool = list(participants)
    weights = [_weight(p) for p in pool]
    winners: list[object] = []

    for _ in range(min(count, len(pool))):
        total = sum(weights)
        if total <= 0:
            break
        pick = rng.uniform(0, total)
        cumulative = 0.0
        for index, weight in enumerate(weights):
            cumulative += weight
            if pick <= cumulative:
                winners.append(pool.pop(index))
                weights.pop(index)
                break

    return winners


def expected_shares(participants: list[object]) -> dict[str, float]:
    """Expected win share per group, proportional to total ticket weight."""
    totals: dict[str, float] = {}
    for participant in participants:
        totals[_group(participant)] = totals.get(_group(participant), 0.0) + _weight(
            participant
        )
    grand_total = sum(totals.values())
    if grand_total <= 0:
        return {}
    return {group: weight / grand_total for group, weight in totals.items()}


def simulate(
    participants: list[object],
    winner_count: int,
    runs: int = DEFAULT_RUNS,
    seed: int | None = None,
) -> dict[str, float]:
    """Return the observed win share per group across ``runs`` simulated draws."""
    runs = max(runs, MIN_RUNS)
    rng = random.Random(seed)
    wins: dict[str, int] = {}
    total_wins = 0

    for _ in range(runs):
        winners = _weighted_sample_without_replacement(participants, winner_count, rng)
        for winner in winners:
            group = _group(winner)
            wins[group] = wins.get(group, 0) + 1
            total_wins += 1

    if total_wins == 0:
        return {}
    return {group: count / total_wins for group, count in wins.items()}


def fairness_report(
    participants: list[object],
    winner_count: int,
    runs: int = DEFAULT_RUNS,
    seed: int | None = None,
) -> dict[str, object]:
    """Run the simulation and summarise fairness.

    The fairness score is ``100 * (1 - total variation distance)`` between the
    observed and expected win-share distributions: 100 means draws match ticket
    shares exactly, lower means some group is advantaged or disadvantaged.
    """
    expected = expected_shares(participants)
    observed = simulate(participants, winner_count, runs=runs, seed=seed)

    groups: list[dict[str, object]] = []
    total_variation = 0.0
    for group in sorted(set(expected) | set(observed)):
        expected_share = expected.get(group, 0.0)
        observed_share = observed.get(group, 0.0)
        deviation = observed_share - expected_share
        total_variation += abs(deviation)
        groups.append(
            {
                "group": group,
                "expectedShare": round(expected_share, 4),
                "observedShare": round(observed_share, 4),
                "deviation": round(deviation, 4),
                "flagged": abs(deviation) > FLAG_TOLERANCE,
            }
        )

    fairness_score = round(100 * (1 - total_variation / 2))
    edge_cases = [
        f"{group['group']}: "
        f"{'Vorteil' if group['deviation'] > 0 else 'Nachteil'} "
        f"{abs(group['deviation']) * 100:.1f}%"
        for group in groups
        if group["flagged"]
    ]

    return {
        "fairnessScore": max(0, min(100, fairness_score)),
        "runs": max(runs, MIN_RUNS),
        "winnerCount": winner_count,
        "participantCount": len(participants),
        "groups": groups,
        "edgeCases": edge_cases,
    }
