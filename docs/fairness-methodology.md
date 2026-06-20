# Raffle Fairness Simulation — Methodology

Implements the **ai-automation / analytics** fairness story. The analysis lives
in `backend/core/fairness.py` and is exposed via `GET /raffle/fairness`.

## Goal

Detect whether the configured raffle would systematically advantage or
disadvantage any participant group, before the real draw happens.

## Inputs

- **Participants** — distinct checked-in guests of the latest event. Each
  carries a `group` (currently the guest's city as a stand-in ticket tier) and
  a `weight` (number of tickets; currently 1 per guest).
- **`winnerCount`** — how many winners the draw produces.
- **`runs`** — number of simulated draws (floored at **1000**).
- **`seed`** — optional, for reproducible results.

## Method

1. **Expected shares.** For each group, the expected win share is its total
   ticket weight divided by the overall ticket weight.
2. **Monte-Carlo simulation.** `runs` independent draws are simulated. Each draw
   selects `winnerCount` distinct winners via **weighted sampling without
   replacement** (a guest with more tickets is proportionally more likely to be
   picked, and cannot win twice in one draw).
3. **Observed shares.** Across all runs, the fraction of wins falling to each
   group is tallied.
4. **Deviation & flags.** `deviation = observed − expected`. A group is
   **flagged** when `|deviation| > 0.05` (5 percentage points).
5. **Fairness score.** `100 × (1 − TVD)`, where TVD is the total variation
   distance `½·Σ|observed − expected|`. A score of **100** means draws match
   ticket shares exactly; lower means some group is advantaged or disadvantaged.

## Interpreting the result

- **Score ≥ 95** — balanced; no action recommended.
- **Flagged group, negative deviation** — disadvantaged; consider more prizes or
  tickets for that group.
- **Flagged group, positive deviation** — advantaged; review the weighting.

`edgeCases` lists each flagged group with the direction and size of its
deviation. When AI is enabled, these findings are additionally summarised into
short actionable tips; otherwise deterministic tips are returned.

## Determinism & testing

With a fixed `seed`, the simulation is fully reproducible. Unit tests in
`backend/tests/test_fairness.py` cover proportional expected shares, perfect
fairness for a single group, seed determinism, the 1000-run floor, and
bias flagging when winners follow head-count rather than ticket weight.
