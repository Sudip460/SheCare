import re
from datetime import datetime


BOOLEAN_TRUE = {"yes", "y", "1", "true"}
BOOLEAN_FALSE = {"no", "n", "0", "false"}

WORK_TYPE_MAP = {
    "desk": 0,
    "office": 0,
    "sitting": 0,
    "sedentary": 0,
    "mixed": 1,
    "hybrid": 1,
    "standing": 1,
    "active": 2,
    "manual": 2,
    "field": 2,
}


def to_float(value, default=None):
    try:
        cleaned = str(value).strip()
        if cleaned == "":
            return default
        return float(cleaned)
    except (TypeError, ValueError):
        return default


def to_int(value, default=0):
    result = to_float(value, default=None)
    if result is None:
        return default
    return int(round(result))


def to_binary(value, default=0):
    text = str(value or "").strip().lower()
    if text in BOOLEAN_TRUE:
        return 1
    if text in BOOLEAN_FALSE:
        return 0
    numeric = to_int(value, default=None)
    if numeric is None:
        return default
    return 1 if numeric > 0 else 0


def parse_work_type(value):
    text = str(value or "").strip().lower()
    if text in WORK_TYPE_MAP:
        return WORK_TYPE_MAP[text]
    numeric = to_int(value, default=None)
    if numeric is None:
        return 1
    return max(0, min(numeric, 2))


def parse_last_period(value):
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


def cycle_prediction_from_last_period(value):
    start = parse_last_period(value)
    if not start:
        return "Use a DD-MM-YYYY date, such as 02-05-2026, for a more precise estimate."
    return start.replace(hour=0, minute=0, second=0, microsecond=0).strftime("%B %d, %Y")


def map_answers_to_features(answers):
    symptoms_text = str(answers.get("symptoms", "")).lower()
    cycle_irregularity = to_float(answers.get("cycle_irregularity"))

    features = {
        "cycle_length": to_float(answers.get("cycle_length")),
        "cycle_irregularity": cycle_irregularity,
        "missed_periods": to_int(answers.get("missed_periods")),
        "period_duration": to_float(answers.get("period_duration")),
        "delay_max": to_float(answers.get("delay_max"), default=cycle_irregularity),
        "acne": to_binary(answers.get("acne")),
        "acne_severity": to_float(answers.get("acne_severity"), default=0),
        "hair_loss": to_binary(answers.get("hair_loss")),
        "hair_loss_severity": to_float(answers.get("hair_loss_severity"), default=0),
        "hirsutism": to_binary(answers.get("hirsutism")),
        "hirsutism_severity": to_float(answers.get("hirsutism_severity"), default=0),
        "weight_gain": to_binary(answers.get("weight_gain")),
        "weight_gain_recent": to_binary(answers.get("weight_gain_recent")),
        "dark_patches": to_binary(answers.get("dark_patches")),
        "BMI": to_float(answers.get("BMI")),
        "stress_level": to_float(answers.get("stress_level")),
        "sleep_hours": to_float(answers.get("sleep_hours")),
        "exercise_days": to_float(answers.get("exercise_days")),
        "activity_level": to_float(answers.get("activity_level")),
        "work_type": parse_work_type(answers.get("work_type")),
        "meal_regularity": to_float(answers.get("meal_regularity")),
        "meal_skipping": to_binary(answers.get("meal_skipping")),
        "TSH": to_float(answers.get("TSH")),
        "LH_FSH_ratio": to_float(answers.get("LH_FSH_ratio")),
        "glucose": to_float(answers.get("glucose")),
        "insulin": to_float(answers.get("insulin")),
        "hemoglobin": to_float(answers.get("hemoglobin")),
        "cholesterol": to_float(answers.get("cholesterol")),
    }

    # Backward-compatibility for older sessions that used one freeform symptoms field.
    if "acne" in symptoms_text and not answers.get("acne"):
        features["acne"] = 1
    if "hair" in symptoms_text and not answers.get("hair_loss"):
        features["hair_loss"] = 1
    if ("facial hair" in symptoms_text or "hair growth" in symptoms_text or "hirsutism" in symptoms_text) and not answers.get("hirsutism"):
        features["hirsutism"] = 1
    if "weight" in symptoms_text and not answers.get("weight_gain"):
        features["weight_gain"] = 1

    return features
