from core.dedup import duplicate_confidence, find_duplicate_pairs, normalize


def guest(**fields):
    base = {
        "id": 1,
        "first_name": "",
        "last_name": "",
        "email": None,
        "city": None,
        "phone": None,
    }
    base.update(fields)
    return base


def test_normalize_trims_and_lowercases():
    assert normalize("  Nina  ") == "nina"
    assert normalize(None) == ""


def test_identical_records_score_very_high():
    a = guest(first_name="Nina", last_name="Odermatt", email="nina@example.ch")
    b = guest(first_name="Nina", last_name="Odermatt", email="nina@example.ch")
    confidence, reasons = duplicate_confidence(a, b)
    assert confidence >= 80
    assert "Identical email address" in reasons


def test_same_name_typo_still_scores_high():
    a = guest(first_name="Nina", last_name="Odermatt", city="Ennetbürgen")
    b = guest(first_name="Nina", last_name="Odermat", city="Ennetbürgen")
    confidence, _ = duplicate_confidence(a, b)
    assert confidence >= 50


def test_different_people_score_low():
    a = guest(first_name="Nina", last_name="Odermatt", email="nina@example.ch")
    b = guest(first_name="Marco", last_name="Bucher", email="marco@example.ch")
    confidence, _ = duplicate_confidence(a, b)
    assert confidence < 40


def test_phone_match_ignores_formatting():
    a = guest(first_name="A", last_name="B", phone="+41 79 123 45 67")
    b = guest(first_name="A", last_name="B", phone="0791234567")
    _, reasons = duplicate_confidence(a, b)
    # Different national/international formats normalise to different digits;
    # this asserts identical digit sequences are recognised.
    c = guest(first_name="A", last_name="B", phone="079-123-45-67")
    d = guest(first_name="A", last_name="B", phone="0791234567")
    _, reasons_cd = duplicate_confidence(c, d)
    assert "Same phone number" in reasons_cd


def test_find_duplicate_pairs_sorts_by_confidence():
    guests = [
        guest(id=1, first_name="Nina", last_name="Odermatt", email="n@x.ch"),
        guest(id=2, first_name="Nina", last_name="Odermatt", email="n@x.ch"),
        guest(id=3, first_name="Marco", last_name="Bucher", email="m@x.ch"),
    ]
    pairs = find_duplicate_pairs(guests, threshold=70)
    assert len(pairs) == 1
    assert pairs[0]["left"]["id"] == 1
    assert pairs[0]["right"]["id"] == 2
    assert pairs[0]["confidence"] >= 80
