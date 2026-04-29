VIOLATION_SCORES = {
    "tab_switch": 5,
    "no_face": 5,
    "multiple_faces": 5,
    "phone_detected": 5,
    "looking_away": 5,
}

AUTO_REJECT_THRESHOLD = 50


def calculate_score(violations):
    return sum(VIOLATION_SCORES.get(v, 5) for v in violations)


def should_auto_reject(score):
    return score >= AUTO_REJECT_THRESHOLD