import re
from datetime import datetime, timedelta


SYMPTOM_WEIGHTS = {
    "acne": 1,
    "pain": 1,
    "pelvic": 1,
    "weight": 2,
    "hair": 2,
    "fatigue": 1,
}


def _contains(value, keywords):
    text = str(value or "").lower()
    return any(keyword in text for keyword in keywords)


def _to_int(value, default=0):
    try:
        return int(float(str(value).strip()))
    except (TypeError, ValueError):
        return default


def _parse_day_month_year(value):
    parts = re.split(r"\D+", str(value or "").strip())
    parts = [part for part in parts if part]
    if len(parts) != 3:
        return None

    day, month, year = parts
    if len(year) == 2:
        year = f"20{year}"

    try:
        return datetime(int(year), int(month), int(day))
    except ValueError:
        return None


def _predict_cycle(last_period):
    start = _parse_day_month_year(last_period)
    if start:
        return (start + timedelta(days=28)).strftime("%B %d, %Y")
    return "Use a DD-MM-YYYY date, such as 02-05-2026, for a more precise estimate."


def analyze_answers(answers):
    score = 0
    regularity = str(answers.get("cycle_regularity", "")).lower()
    symptoms = str(answers.get("symptoms", "")).lower()
    stress_level = _to_int(answers.get("stress_level"))
    sleep_hours = _to_int(answers.get("sleep_hours"), default=7)

    if _contains(regularity, ["no", "irregular", "sometimes"]):
        score += 3

    for keyword, weight in SYMPTOM_WEIGHTS.items():
        if keyword in symptoms:
            score += weight

    if stress_level >= 7:
        score += 1
    if sleep_hours and sleep_hours < 6:
        score += 1

    if score >= 6:
        risk_level = "High"
    elif score >= 3:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    recommendations = [
        "Track cycle dates and symptoms consistently for the next three cycles.",
        "Prioritize balanced meals with protein, fiber-rich carbohydrates, and healthy fats.",
        "Aim for 150 minutes of moderate activity weekly, including two strength sessions.",
    ]

    if risk_level in ["Medium", "High"]:
        recommendations.append("Book a clinician review for hormone testing, ultrasound guidance, and diagnosis.")
    if _contains(symptoms, ["pain", "pelvic"]):
        recommendations.append("Seek medical care promptly if pelvic pain is severe, sudden, or worsening.")

    mental_tips = [
        "Use a short daily stress check-in and note triggers alongside cycle symptoms.",
        "Keep a consistent sleep window and reduce screens for 30 minutes before bed.",
    ]
    if stress_level >= 7:
        mental_tips.append("Consider speaking with a mental health professional if stress feels persistent or unmanageable.")

    return {
        "riskLevel": risk_level,
        "score": score,
        "cyclePrediction": _predict_cycle(answers.get("last_period")),
        "recommendations": recommendations,
        "mentalTips": mental_tips,
        "disclaimer": "This report is educational and is not a diagnosis. Consult a qualified clinician for medical decisions.",
    }
