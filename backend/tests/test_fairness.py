from core.fairness import expected_shares, fairness_report, simulate


def participant(group="Standard", weight=1, pid=0):
    return {"id": pid, "group": group, "weight": weight}


def test_expected_shares_are_proportional_to_weight():
    participants = [
        participant(group="VIP", weight=3, pid=1),
        participant(group="Standard", weight=1, pid=2),
    ]
    shares = expected_shares(participants)
    assert shares["VIP"] == 0.75
    assert shares["Standard"] == 0.25


def test_single_group_is_perfectly_fair():
    participants = [participant(group="Alle", pid=i) for i in range(20)]
    report = fairness_report(participants, winner_count=3, runs=1000, seed=7)
    assert report["fairnessScore"] == 100
    assert report["edgeCases"] == []


def test_simulation_is_deterministic_under_seed():
    participants = [participant(group="A", pid=i) for i in range(10)] + [
        participant(group="B", pid=i + 100) for i in range(10)
    ]
    first = simulate(participants, winner_count=4, runs=1000, seed=42)
    second = simulate(participants, winner_count=4, runs=1000, seed=42)
    assert first == second


def test_runs_are_floored_at_minimum():
    report = fairness_report(
        [participant(pid=i) for i in range(5)], winner_count=1, runs=10, seed=1
    )
    assert report["runs"] >= 1000


def test_draw_all_winners_flags_weight_bias():
    # A single heavily-weighted VIP vs three standard guests. When everyone wins
    # every draw, observed shares follow head-count, not ticket weight, so the
    # VIP's huge ticket share is not realised — a detectable disadvantage.
    participants = [
        participant(group="VIP", weight=100, pid=1),
        participant(group="Standard", weight=1, pid=2),
        participant(group="Standard", weight=1, pid=3),
        participant(group="Standard", weight=1, pid=4),
    ]
    report = fairness_report(participants, winner_count=4, runs=1000, seed=3)
    assert report["fairnessScore"] < 100
    assert any(group["flagged"] for group in report["groups"])
    assert report["edgeCases"]
